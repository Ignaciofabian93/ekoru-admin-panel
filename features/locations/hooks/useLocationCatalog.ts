"use client";

import { useApolloClient } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import {
  GET_RAW_COUNTRIES,
  GET_RAW_COUNTRY_TRANSLATIONS,
  GET_RAW_REGIONS,
  GET_RAW_CITIES,
  GET_RAW_COUNTIES,
} from "@/graphql/location/queries";
import {
  BULK_UPSERT_COUNTRIES,
  BULK_UPSERT_COUNTRY_TRANSLATIONS,
  BULK_UPSERT_REGIONS,
  BULK_UPSERT_CITIES,
  BULK_UPSERT_COUNTIES,
} from "@/graphql/location/mutations";
import { useMutation } from "@apollo/client/react";
import type { BulkResult } from "@/components/BulkImportDialog/BulkImportDialog";
import type {
  CityUpsertRow,
  CountryTranslationUpsertRow,
  CountryUpsertRow,
  CountyUpsertRow,
  LocationExport,
  RawCity,
  RawCountry,
  RawCountryTranslation,
  RawCounty,
  RawRegion,
  RegionUpsertRow,
} from "../xlsx";

const EXPORT_PAGE_SIZE = 500;

type PageInfo = { hasNextPage: boolean };
type Conn<T> = { nodes: T[]; pageInfo: PageInfo };

/** Reads the whole location tree via the raw admin queries + the bulk mutations. */
export function useLocationCatalog() {
  const client = useApolloClient();

  const [countriesM] = useMutation<{ bulkUpsertCountries: BulkResult }>(
    BULK_UPSERT_COUNTRIES,
  );
  const [countryTranslationsM] = useMutation<{
    bulkUpsertCountryTranslations: BulkResult;
  }>(BULK_UPSERT_COUNTRY_TRANSLATIONS);
  const [regionsM] = useMutation<{ bulkUpsertRegions: BulkResult }>(BULK_UPSERT_REGIONS);
  const [citiesM] = useMutation<{ bulkUpsertCities: BulkResult }>(BULK_UPSERT_CITIES);
  const [countiesM] = useMutation<{ bulkUpsertCounties: BulkResult }>(
    BULK_UPSERT_COUNTIES,
  );

  /** Walks every page of a raw query, reading `field` off the connection. */
  const fetchAllPages = async <T>(query: DocumentNode, field: string): Promise<T[]> => {
    const all: T[] = [];
    for (let page = 1; page < 2000; page += 1) {
      const result = await client.query<Record<string, Conn<T>>>({
        query,
        variables: { page, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const conn = result.data?.[field];
      if (!conn) break;
      all.push(...conn.nodes);
      if (!conn.pageInfo.hasNextPage) break;
    }
    return all;
  };

  const fetchAll = async (): Promise<LocationExport> => {
    const [countries, countryTranslations, regions, cities, counties] = await Promise.all(
      [
        fetchAllPages<RawCountry>(GET_RAW_COUNTRIES, "rawCountries"),
        fetchAllPages<RawCountryTranslation>(
          GET_RAW_COUNTRY_TRANSLATIONS,
          "rawCountryTranslations",
        ),
        fetchAllPages<RawRegion>(GET_RAW_REGIONS, "rawRegions"),
        fetchAllPages<RawCity>(GET_RAW_CITIES, "rawCities"),
        fetchAllPages<RawCounty>(GET_RAW_COUNTIES, "rawCounties"),
      ],
    );
    return { countries, countryTranslations, regions, cities, counties };
  };

  const commit =
    <T>(
      run: (rows: T[]) => Promise<{ data?: Record<string, BulkResult> | null }>,
      field: string,
    ) =>
    async (rows: T[]): Promise<BulkResult | null> => {
      try {
        const { data } = await run(rows);
        return data?.[field] ?? null;
      } catch {
        return null;
      }
    };

  return {
    fetchAll,
    upsertCountries: commit<CountryUpsertRow>(
      (rows) => countriesM({ variables: { rows } }),
      "bulkUpsertCountries",
    ),
    upsertCountryTranslations: commit<CountryTranslationUpsertRow>(
      (rows) => countryTranslationsM({ variables: { rows } }),
      "bulkUpsertCountryTranslations",
    ),
    upsertRegions: commit<RegionUpsertRow>(
      (rows) => regionsM({ variables: { rows } }),
      "bulkUpsertRegions",
    ),
    upsertCities: commit<CityUpsertRow>(
      (rows) => citiesM({ variables: { rows } }),
      "bulkUpsertCities",
    ),
    upsertCounties: commit<CountyUpsertRow>(
      (rows) => countiesM({ variables: { rows } }),
      "bulkUpsertCounties",
    ),
  };
}
