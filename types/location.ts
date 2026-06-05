import type { Language } from "./enums";

// Location entities mirror the GraphQL shapes in ekoru-users
// (src/location/entities/*). The hierarchy is Country → Region → City → County.

export type CountryTranslation = {
  id: number;
  countryId: number;
  language: Language;
  name: string;
};

export type Country = {
  id: number;
  /** Resolved name in the requested language. */
  country?: string;
  createdAt?: string;
  updatedAt?: string;
  translation?: CountryTranslation[];
};

export type Region = {
  id: number;
  region: string;
  countryId: number;
};

export type City = {
  id: number;
  city: string;
  regionId: number;
};

export type County = {
  id: number;
  county: string;
  cityId: number;
};
