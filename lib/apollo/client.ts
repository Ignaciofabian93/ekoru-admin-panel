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
    const isUnauthorized = error.errors.some(
      (e) =>
        e.message === "No autorizado" ||
        e.extensions?.code === "UNAUTHENTICATED" ||
        (e.extensions?.code as number) === 401,
    );

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
