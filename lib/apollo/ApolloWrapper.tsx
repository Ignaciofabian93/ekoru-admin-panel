"use client";

import { ApolloProvider } from "@apollo/client/react";
import { getApolloClient } from "./client";
import AuthHydrator from "./AuthHydrator";

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={getApolloClient()}>
      <AuthHydrator />
      {children}
    </ApolloProvider>
  );
}
