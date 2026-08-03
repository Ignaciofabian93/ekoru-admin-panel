import { gql } from "@apollo/client";

// Admin writes over ServicePackage + its items. Bulk mutations back both the
// row-edit forms (a one-row array) and the XLSX import (many rows).

const BULK_RESULT = `
  created
  createdIds
  updated
  failed
  errors { index id message }
`;

export const BULK_UPSERT_SERVICE_PACKAGES = gql`
  mutation BulkUpsertServicePackages($rows: [ServicePackageUpsertRowInput!]!) {
    bulkUpsertServicePackages(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_SERVICE_PACKAGE = gql`
  mutation DeleteServicePackage($id: Int!) {
    deleteServicePackage(id: $id)
  }
`;

export const BULK_UPSERT_SERVICE_PACKAGE_ITEMS = gql`
  mutation BulkUpsertServicePackageItems($rows: [ServicePackageItemUpsertRowInput!]!) {
    bulkUpsertServicePackageItems(rows: $rows) {${BULK_RESULT}}
  }
`;

export const DELETE_SERVICE_PACKAGE_ITEM = gql`
  mutation DeleteServicePackageItem($id: Int!) {
    deleteServicePackageItem(id: $id)
  }
`;
