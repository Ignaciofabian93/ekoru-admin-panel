import { ENVIRONMENT } from "./environment";

const getEndpoints = () => {
  switch (ENVIRONMENT) {
    case "production":
      return {
        base: "https://api.ekoru.cl",
        graphql: "https://api.ekoru.cl/graphql",
        rest: "https://api.ekoru.cl/session",
        images: "https://images.ekoru.cl",
      };
    case "staging":
      return {
        base: "https://staging-api.ekoru.cl",
        graphql: "https://staging-api.ekoru.cl/graphql",
        rest: "https://staging-api.ekoru.cl/session",
        images: "https://staging-images.ekoru.cl",
      };
    default: {
      const devBase = "https://staging-api.ekoru.cl";
      return {
        base: devBase,
        graphql: `${devBase}/graphql`,
        rest: `${devBase}/session`,
        // In dev the browser still hits the staging CDN; only the gateway is local.
        images: "https://staging-images.ekoru.cl",
      };
    }
  }
};

const endpoints = getEndpoints();

export const GATEWAY_BASE_URL = endpoints.base;
export const GRAPHQL_URL = endpoints.graphql;
export const REST_URL = endpoints.rest;
export const IMAGES_PUBLIC_BASE_URL = endpoints.images;

/**
 * Gateway session routes for ADMIN accounts. The gateway has dedicated admin
 * controllers (`AuthController` in ekoru-gateway): `authAdmin` / `refreshAdmin`
 * resolve against the `admin` table and issue `adminId` tokens, whereas the
 * seller routes (`auth` / `refresh`) resolve against `seller` and would reject
 * admin credentials. Logout is shared.
 */
export const ADMIN_AUTH_PATH = "/session/authAdmin";
export const ADMIN_REFRESH_PATH = "/session/refreshAdmin";
export const ADMIN_LOGOUT_PATH = "/session/logout";
