"use client";

import { createContext, useContext } from "react";

type DictionaryShape = Record<string, unknown>;

const DictionaryContext = createContext<DictionaryShape>({});

export function DictionaryProvider({
  children,
  dictionary,
}: {
  children: React.ReactNode;
  dictionary: DictionaryShape;
}) {
  const parent = useContext(DictionaryContext);
  return (
    <DictionaryContext.Provider value={{ ...parent, ...dictionary }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useTranslation(namespace?: string) {
  const dict = useContext(DictionaryContext);
  const scope = namespace ? ((dict[namespace] as DictionaryShape) ?? {}) : dict;

  function t(key: string, params?: Record<string, string>): string {
    const parts = key.split(".");
    let result: unknown = scope;
    for (const part of parts) {
      result = (result as DictionaryShape)?.[part];
    }
    let text = typeof result === "string" ? result : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{{${k}}}`, v);
      }
    }
    return text;
  }

  return { t };
}
