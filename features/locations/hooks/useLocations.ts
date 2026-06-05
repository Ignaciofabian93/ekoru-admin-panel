"use client";

import { useQuery } from "@apollo/client/react";
import {
  GET_CITIES,
  GET_COUNTIES,
  GET_COUNTRIES,
  GET_REGIONS,
} from "@/graphql/location/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type {
  CitiesResult,
  CountiesResult,
  CountriesResult,
  RegionsResult,
} from "../types";

export function useCountries() {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<CountriesResult>(GET_COUNTRIES, {
    variables: { language },
    notifyOnNetworkStatusChange: true,
  });
  return { countries: data?.countries ?? [], loading, error, refetch };
}

/** Regions for a country. Skips while `countryId` is undefined. */
export function useRegions(countryId?: number) {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<RegionsResult>(GET_REGIONS, {
    variables: { countryId, language },
    skip: countryId == null,
    notifyOnNetworkStatusChange: true,
  });
  return { regions: data?.regionsByCountryId ?? [], loading, error, refetch };
}

/** Cities for a region. Skips while `regionId` is undefined. */
export function useCities(regionId?: number) {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<CitiesResult>(GET_CITIES, {
    variables: { regionId, language },
    skip: regionId == null,
    notifyOnNetworkStatusChange: true,
  });
  return { cities: data?.citiesByRegionId ?? [], loading, error, refetch };
}

/** Counties for a city. Skips while `cityId` is undefined. */
export function useCounties(cityId?: number) {
  const language = useGqlLanguage();
  const { data, loading, error, refetch } = useQuery<CountiesResult>(GET_COUNTIES, {
    variables: { cityId, language },
    skip: cityId == null,
    notifyOnNetworkStatusChange: true,
  });
  return { counties: data?.countiesByCityId ?? [], loading, error, refetch };
}
