export type Country = {
  id: number;
  name: string;
  code?: string;
};

export type Region = {
  id: number;
  name: string;
  countryId?: number;
};

export type City = {
  id: number;
  name: string;
  regionId?: number;
};

export type County = {
  id: number;
  name: string;
  cityId?: number;
};
