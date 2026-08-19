import {
  ApolloClient,
  CombinedGraphQLErrors,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { from, switchMap } from "rxjs";

const httpLink = new HttpLink({ uri: "/api/graphql", credentials: "same-origin" });

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    // `UNAUTHORIZED` is what every subgraph actually raises (its own
    // `UnAuthorizedError`, message "Debe iniciar sesión"). It was absent here,
    // so an expired 15-minute access token never triggered the silent refresh
    // below — the query simply failed. It went unnoticed while the gateway
    // still accepted the refresh token as a fallback credential for ordinary
    // requests; once that stopped, every expiry surfaced as a hard error.
    //
    // `FORBIDDEN` is deliberately excluded: it means "signed in, but not
    // allowed", which a new token cannot change.
    const isUnauthorized = error.errors.some((e) => {
      const code = e.extensions?.code;
      return (
        code === "UNAUTHORIZED" ||
        code === "UNAUTHENTICATED" ||
        (code as number) === 401 ||
        e.message === "No autorizado" ||
        e.message === "Debe iniciar sesión"
      );
    });

    if (isUnauthorized && !operation.getContext().refreshAttempted) {
      return from(
        fetch("/api/auth/refresh", { method: "POST", credentials: "include" }).then(
          (res) => {
            if (!res.ok) throw new Error("Refresh failed");
          },
        ),
      ).pipe(
        switchMap(() => {
          operation.setContext({ refreshAttempted: true });
          return forward(operation);
        }),
      );
    }

    for (const e of error.errors) {
      console.error(`[Apollo error] Operation: ${operation.operationName}`, e);
    }
  } else if (error) {
    console.error(`[Apollo network error] Operation: ${operation.operationName}`, error);
  }
});

let browserClient: ApolloClient | undefined;

function makeClient() {
  return new ApolloClient({
    link: errorLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: "cache-and-network" },
    },
  });
}

export function getApolloClient() {
  if (typeof window === "undefined") {
    return makeClient();
  }
  if (!browserClient) {
    browserClient = makeClient();
  }
  return browserClient;
}
