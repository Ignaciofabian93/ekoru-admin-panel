#!/usr/bin/env node
/*
 * GraphQL document check (INF-6). Validates every operation this app sends
 * against the composed API, so a query the API no longer accepts fails the
 * pipeline instead of the screen (it would have caught MOB-1).
 *
 * Reads every gql`…` template in the source tree. An interpolation is either a
 * plain string of fields (`const FIELDS = \`id name\``), which is spliced in,
 * or a fragment document, which is dropped: each operation is validated
 * together with the fragments it spreads, wherever they are defined.
 *
 * The schema comes from the gateway's introspection (staging keeps it on):
 *   node scripts/check-graphql.mjs https://staging-api.ekoru.cl/graphql
 * or GRAPHQL_SCHEMA_URL. Exits 1 on any invalid operation.
 */
import fs from "node:fs";
import path from "node:path";
import {
  buildClientSchema,
  getIntrospectionQuery,
  Kind,
  NoUnusedFragmentsRule,
  parse,
  print,
  specifiedRules,
  validate,
  visit,
} from "graphql";

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  ".expo",
  "coverage",
  ".git",
  ".claude",
]);
const url = process.argv[2] || process.env.GRAPHQL_SCHEMA_URL;
if (!url) {
  console.error("Usage: node scripts/check-graphql.mjs <gateway graphql url>");
  process.exit(2);
}

function* sourceFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name))
      yield full;
  }
}

/** Plain (untagged) template-literal constants, by file and name: the strings spliced into queries. */
const strings = new Map();
function collectStrings(file, text) {
  const re = /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*`([^`]*)`/g;
  let m;
  while ((m = re.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 10), m.index);
    if (/gql\s*$/.test(before)) continue;
    if (!strings.has(m[1])) strings.set(m[1], new Map());
    strings.get(m[1]).set(file, m[2]);
  }
}

/** `import { A, B as C } from "x"` in a file: local name → the file it comes from. */
function importsOf(file, text) {
  const map = new Map();
  const re = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    const target = resolveModule(file, m[2]);
    if (!target) continue;
    for (const part of m[1].split(",")) {
      const [orig, alias] = part.trim().split(/\s+as\s+/);
      if (orig) map.set((alias || orig).trim(), { file: target, name: orig.trim() });
    }
  }
  return map;
}

function resolveModule(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(process.cwd(), spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    path.join(base, "index.ts"),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const importCache = new Map();
/** A spliced string constant's text, found where TypeScript would find it, its own splices resolved. */
function resolveString(name, file, depth = 0) {
  if (depth > 5) return null;
  const local = strings.get(name)?.get(file);
  if (local !== undefined) {
    return local.replace(
      /\$\{\s*([A-Za-z_$][\w$]*)\s*\}/g,
      (_, inner) => resolveString(inner, file, depth + 1) ?? "",
    );
  }
  if (!importCache.has(file))
    importCache.set(file, importsOf(file, fs.readFileSync(file, "utf8")));
  const imported = importCache.get(file).get(name);
  return imported ? resolveString(imported.name, imported.file, depth + 1) : null;
}

/** The body of every gql`…` template: string splices resolved, fragment imports dropped. */
function plucked(file) {
  const text = fs.readFileSync(file, "utf8");
  const out = [];
  const re = /\bgql\s*`/g;
  while (re.exec(text)) {
    let i = re.lastIndex;
    let body = "";
    while (i < text.length && text[i] !== "`") {
      if (text[i] === "\\") {
        body += text[i + 1];
        i += 2;
      } else if (text[i] === "$" && text[i + 1] === "{") {
        let depth = 1;
        const start = i + 2;
        i += 2;
        while (i < text.length && depth > 0) {
          if (text[i] === "{") depth++;
          else if (text[i] === "}") depth--;
          i++;
        }
        const expr = text.slice(start, i - 1).trim();
        if (/^[A-Za-z_$][\w$]*$/.test(expr)) body += resolveString(expr, file) ?? "";
      } else {
        body += text[i++];
      }
    }
    re.lastIndex = i + 1;
    out.push(body);
  }
  return out;
}

const res = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query: getIntrospectionQuery() }),
});
const introspection = await res.json();
if (!introspection.data) {
  console.error(
    `No introspection from ${url}: ${JSON.stringify(introspection.errors ?? introspection).slice(0, 300)}`,
  );
  process.exit(2);
}
const schema = buildClientSchema(introspection.data);

const files = [...sourceFiles(process.cwd())];
for (const file of files) collectStrings(file, fs.readFileSync(file, "utf8"));

const operations = [];
const fragments = new Map();
let parseErrors = 0;
let clashes = 0;
for (const file of files) {
  for (const body of plucked(file)) {
    if (!body.trim()) continue;
    let doc;
    try {
      doc = parse(body);
    } catch (error) {
      parseErrors++;
      console.error(`${path.relative(process.cwd(), file)}: ${error.message}`);
      continue;
    }
    for (const def of doc.definitions) {
      if (def.kind === Kind.FRAGMENT_DEFINITION) {
        const seen = fragments.get(def.name.value);
        if (!seen) fragments.set(def.name.value, { def, file });
        else if (print(seen.def) !== print(def)) {
          // Two different fragments under one name: which one an operation
          // gets depends on scan order, so the check could pass the wrong one.
          clashes++;
          console.error(
            `fragment ${def.name.value} is defined differently in ${path.relative(process.cwd(), seen.file)} and ${path.relative(process.cwd(), file)}`,
          );
        }
      } else if (def.kind === Kind.OPERATION_DEFINITION) {
        operations.push({ def, file });
      }
    }
  }
}

/** The fragments an operation needs, transitively. */
function fragmentsFor(def) {
  const needed = new Map();
  const queue = [def];
  while (queue.length) {
    visit(queue.pop(), {
      FragmentSpread(node) {
        const name = node.name.value;
        if (needed.has(name)) return;
        const found = fragments.get(name);
        if (found) {
          needed.set(name, found.def);
          queue.push(found.def);
        }
      },
    });
  }
  return [...needed.values()];
}

const rules = specifiedRules.filter((rule) => rule !== NoUnusedFragmentsRule);
let invalid = 0;
for (const { def, file } of operations) {
  const doc = { kind: Kind.DOCUMENT, definitions: [def, ...fragmentsFor(def)] };
  const errors = validate(schema, doc, rules);
  if (errors.length) {
    invalid++;
    const name = def.name?.value ?? "(anonymous)";
    console.error(`\n${path.relative(process.cwd(), file)} — ${def.operation} ${name}`);
    for (const error of errors) console.error(`  ${error.message}`);
  }
}

console.log(
  `\nGraphQL check against ${url}: ${operations.length} operations, ${fragments.size} fragments, ${invalid} invalid, ${parseErrors} unparsable, ${clashes} fragment name clashes.`,
);
process.exit(invalid || parseErrors || clashes ? 1 : 0);
