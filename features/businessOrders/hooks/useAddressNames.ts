"use client";

import { useQuery } from "@apollo/client/react";
import { GET_CITIES, GET_COUNTIES, GET_REGIONS } from "@/graphql/location/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { BusinessOrderAddress } from "../types";

/**
 * The region, city and county names of an order's address, which stores only
 * their ids (as the web's `useAddressNames` does).
 */
export function useAddressNames(address: BusinessOrderAddress | null | undefined) {
  const language = useGqlLanguage();
  const skip = !address;
  const regions = useQuery<{ regionsByCountryId: { id: number; region: string }[] }>(
    GET_REGIONS,
    { variables: { countryId: address?.countryId, language }, skip },
  );
  const cities = useQuery<{ citiesByRegionId: { id: number; city: string }[] }>(
    GET_CITIES,
    { variables: { regionId: address?.regionId, language }, skip },
  );
  const counties = useQuery<{ countiesByCityId: { id: number; county: string }[] }>(
    GET_COUNTIES,
    { variables: { cityId: address?.cityId, language }, skip },
  );

  if (!address) return null;
  return [
    counties.data?.countiesByCityId.find((c) => c.id === address.countyId)?.county,
    cities.data?.citiesByRegionId.find((c) => c.id === address.cityId)?.city,
    regions.data?.regionsByCountryId.find((r) => r.id === address.regionId)?.region,
  ].filter(Boolean) as string[];
}
