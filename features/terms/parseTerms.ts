/**
 * The panel's preview of a terms text, read with the same rules as the API
 * (ekoru-users `src/legal/terms-blocks.ts`): "## " clause title, "### "
 * sub-clause title, "- " list item, blank line between paragraphs.
 */
export type TermsBlockKind = "HEADING" | "SUBHEADING" | "PARAGRAPH" | "LIST_ITEM";
export interface TermsBlock {
  kind: TermsBlockKind;
  text: string;
}

export function parseTerms(content: string): TermsBlock[] {
  const blocks: TermsBlock[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "PARAGRAPH", text: paragraph.join(" ") });
    paragraph = [];
  };
  const push = (kind: TermsBlockKind, text: string) => {
    flush();
    if (text) blocks.push({ kind, text });
  };

  for (const raw of content.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) flush();
    else if (line.startsWith("### ")) push("SUBHEADING", line.slice(4).trim());
    else if (line.startsWith("## ")) push("HEADING", line.slice(3).trim());
    else if (line.startsWith("# ")) push("HEADING", line.slice(2).trim());
    else if (line.startsWith("- ") || line.startsWith("* "))
      push("LIST_ITEM", line.slice(2).trim());
    else paragraph.push(line);
  }
  flush();
  return blocks;
}

/** A text the API accepts: at least one clause title. */
export const hasClauseTitle = (content: string) =>
  parseTerms(content).some((b) => b.kind === "HEADING");
