"use client";

import { useMutation } from "@apollo/client/react";
import {
  CREATE_CITY,
  CREATE_COUNTRY,
  CREATE_COUNTY,
  CREATE_REGION,
  DELETE_CITY,
  DELETE_COUNTRY,
  DELETE_COUNTY,
  DELETE_REGION,
  UPDATE_CITY,
  UPDATE_COUNTRY,
  UPDATE_COUNTY,
  UPDATE_REGION,
} from "@/graphql/location/mutations";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  CreateCityInput,
  CreateCountryInput,
  CreateCountyInput,
  CreateRegionInput,
} from "../types";

/** Create / update / delete mutations for every location level. */
export function useLocationMutations() {
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation("locations");

  const [createCountryM, c1] = useMutation(CREATE_COUNTRY);
  const [updateCountryM, c2] = useMutation(UPDATE_COUNTRY);
  const [deleteCountryM, c3] = useMutation(DELETE_COUNTRY);
  const [createRegionM, c4] = useMutation(CREATE_REGION);
  const [updateRegionM, c5] = useMutation(UPDATE_REGION);
  const [deleteRegionM, c6] = useMutation(DELETE_REGION);
  const [createCityM, c7] = useMutation(CREATE_CITY);
  const [updateCityM, c8] = useMutation(UPDATE_CITY);
  const [deleteCityM, c9] = useMutation(DELETE_CITY);
  const [createCountyM, c10] = useMutation(CREATE_COUNTY);
  const [updateCountyM, c11] = useMutation(UPDATE_COUNTY);
  const [deleteCountyM, c12] = useMutation(DELETE_COUNTY);

  const run = async (action: () => Promise<unknown>, successKey: string) => {
    try {
      await action();
      toast.success(t(successKey));
      return true;
    } catch {
      toast.error(t("feedback.error"));
      return false;
    }
  };

  return {
    // Countries
    createCountry: (input: CreateCountryInput) =>
      run(() => createCountryM({ variables: { input, language } }), "feedback.created"),
    updateCountry: (countryId: number, input: CreateCountryInput) =>
      run(
        () => updateCountryM({ variables: { countryId, input, language } }),
        "feedback.updated",
      ),
    deleteCountry: (countryId: number) =>
      run(
        () => deleteCountryM({ variables: { countryId, language } }),
        "feedback.deleted",
      ),

    // Regions
    createRegion: (input: CreateRegionInput) =>
      run(() => createRegionM({ variables: { input, language } }), "feedback.created"),
    updateRegion: (regionId: number, input: CreateRegionInput) =>
      run(
        () => updateRegionM({ variables: { regionId, input, language } }),
        "feedback.updated",
      ),
    deleteRegion: (regionId: number) =>
      run(() => deleteRegionM({ variables: { regionId, language } }), "feedback.deleted"),

    // Cities
    createCity: (input: CreateCityInput) =>
      run(() => createCityM({ variables: { input, language } }), "feedback.created"),
    updateCity: (cityId: number, input: CreateCityInput) =>
      run(
        () => updateCityM({ variables: { cityId, input, language } }),
        "feedback.updated",
      ),
    deleteCity: (cityId: number) =>
      run(() => deleteCityM({ variables: { cityId, language } }), "feedback.deleted"),

    // Counties
    createCounty: (input: CreateCountyInput) =>
      run(() => createCountyM({ variables: { input, language } }), "feedback.created"),
    updateCounty: (countyId: number, input: CreateCountyInput) =>
      run(
        () => updateCountyM({ variables: { countyId, input, language } }),
        "feedback.updated",
      ),
    deleteCounty: (countyId: number) =>
      run(() => deleteCountyM({ variables: { countyId, language } }), "feedback.deleted"),

    loading:
      c1.loading ||
      c2.loading ||
      c3.loading ||
      c4.loading ||
      c5.loading ||
      c6.loading ||
      c7.loading ||
      c8.loading ||
      c9.loading ||
      c10.loading ||
      c11.loading ||
      c12.loading,
  };
}
