# Admin Panel — CRUD + XLSX coverage

Living checklist of every database table (from the master schema `prisma/schema.prisma`)
and how far the platform-admin CRUD is built for each.

## Legend

- ✅ **Done** — the full pattern: raw admin reads (all translations, inactive
  included) + bulk upsert (create/update, id-keyed) + per-row delete + XLSX
  export/import, with list & edit screens in the panel.
- 🟡 **Partial** — some admin CRUD exists (forms and/or raw reads) but **not** the
  full XLSX bulk round-trip.
- ⬜ **Todo** — no admin CRUD yet.
- 📊 _analytics / moderation_ — log or user-generated table; likely wants
  read/moderation, not full XLSX authoring (revisit per table).

## The pattern to replicate

Reference implementation = **marketplace catalog** (`ekoru-marketplace/src/adminCatalog/`
backend, `ekoru-admin-panel/features/marketplace/` frontend). Each table group gets:

- Backend: an `adminCatalog`-style module per subgraph with `raw<X>s` queries
  (paginated, `id`/`search`/parent filters), `bulkUpsert<X>s(rows)` mutations
  (rows with `id` update, without `id` create; translations match by
  parent+language), `delete<X>(id)`, all `@CurrentAdmin`-gated.
- Frontend: `features/<domain>/` with `types.ts`, `hooks/useRaw*.ts` +
  `hooks/use*Mutations.ts`, `xlsx.ts` (export sheet builders + import mappers,
  workbook = `data` + `translations` tabs), list screens + FormShell edit
  screens + `CatalogImportDialog`, routes under `app/[lang]/(dashboard)/…`, i18n.

---

## ekoru-marketplace

- ✅ Department + DepartmentTranslation
- ✅ DepartmentCategory + DepartmentCategoryTranslation
- ✅ ProductCategory + ProductCategoryTranslation
- ⬜ Product _(large table; raw admin read must bypass the `isActive`/`deletedAt` web filter)_
- ⬜ ProductCategoryMaterial _(join: product category ↔ material, with quantity/unit)_
- ⬜ MaterialImpactEstimate + MaterialImpactEstimateTranslation
- ⬜ WaterImpactMessage + WaterImpactMessageTranslation
- ⬜ Co2ImpactMessage + Co2ImpactMessageTranslation
- ⬜ Advertisement
- ⬜ MarketplaceProductLike 📊
- ⬜ Chat, Message 📊 _(moderation/read-only)_

## ekoru-stores

- ✅ StoreCategory + StoreCategoryTranslation
- ✅ StoreSubCategory + StoreSubCategoryTranslation
- ⬜ StoreProduct _(+ StoreProductMaterialComposition, ProductVariant)_
- ⬜ StoreProductReview 📊 _(moderation)_
- ⬜ ProductComment 📊 _(moderation)_
- ⬜ StoreProductLike 📊

## ekoru-services

- ⬜ ServiceCategory + ServiceCategoryTranslation
- ⬜ ServiceSubCategory + ServiceSubCategoryTranslation
- ⬜ Service _(+ ServiceMedia, ServiceFAQ)_
- ⬜ ServicePackage + ServicePackageItem
- ⬜ ServiceProviderCredentials
- ⬜ Quotation 📊, ServiceBooking 📊 _(operational)_
- ⬜ ServiceReview 📊 _(moderation)_
- ⬜ ServiceLike 📊

## ekoru-users

- ✅ Country + CountryTranslation, Region, City, County _(full CRUD + XLSX; `updateRegion` + `Country.code` added)_
- ✅ Admin _(full CRUD + XLSX)_; AdminActivityLog 📊
- ✅ SellerLabel + SellerLabelTranslation _(full CRUD + XLSX)_; SellerAchievedLabel 📊
- ✅ SellerLevel + SellerLevelTranslation _(full CRUD + XLSX)_; ⬜ PointsByTransactionKind
- ✅ PersonMembership + Translation + Pricing _(full CRUD + XLSX)_
- ✅ BusinessMembership + Translation + Pricing _(full CRUD + XLSX)_
- 🟡 PersonMembershipSubscription, BusinessMembershipSubscription 📊 _(read)_
- 🟡 Seller _(read + export; import stubbed)_, SellerPreferences, PersonProfile, BusinessProfile
- ⬜ BannedSeller _(moderation)_
- ⬜ TransactionFee _(nav present; no screen)_
- ⬜ Notification + NotificationTemplate + NotificationTemplateTranslation
- ⬜ Match 📊

## ekoru-transactions

- ⬜ ShippingStatus _(small config table — good first target here)_
- ⬜ ChileanPaymentConfig _(config)_
- ⬜ TransactionFee _(confirm ownership vs users)_
- ⬜ Transaction 📊, Exchange 📊, Order + OrderItem 📊, ShippingAddress 📊
- ⬜ Payment 📊, PaymentRefund 📊, PaymentTransaction 📊, PaymentWebhook 📊

## ekoru-blog-community

- ✅ BlogCategory + BlogCategoryTranslation _(full CRUD + XLSX; `adminCatalog` module + `features/blogCommunity/`)_
- 🟡 BlogPost + BlogPostTranslation _(form-based CRUD: cover image + per-language translations editor; not XLSX. `coverImage` added to schema)_
- ✅ CommunityCategory + CommunityCategoryTranslation _(full CRUD + XLSX)_
- ✅ CommunitySubCategory + CommunitySubCategoryTranslation _(full CRUD + XLSX; re-parent via `communityCategoryId`)_
- 🟡 CommunityPost → **event** _(reshaped: coverImage/startDate/endDate/capacity; form-based CRUD + registrations panel)_
- ✅ CommunityPostRegistration _(new table; app writes, panel lists/removes)_
- ⬜ BlogReaction 📊 _(read counts on the post)_; ~~CommunityComment~~ _(dropped)_

**Not XLSX** — blog posts/events are rich single records (long content, images, dates), so they use **form-based** create/edit screens (`features/blogPosts/`, `features/communityEvents/`) with the shared `ImageUploadField` (R2 via `/api/images/asset` → gateway `/api/images/upload/department`). Backend: `ekoru-blog-community/src/{blogPosts,communityEvents}/`. **Requires** the user to (1) run the destructive migration `npm run prisma:migrate:dev` (drops `CommunityComment` + `images`/`comments` columns) and (2) enable the blog-community subgraph in the gateway (+ its URL) — neither is done yet, so this can't be exercised end-to-end.

## ekoru-search

- ⬜ SearchSynonym _(config — good target)_
- ⬜ SearchCorrection _(config)_
- ⬜ SearchSuggestion _(config)_
- ⬜ PopularSearch 📊
- ⬜ SearchLog 📊, SearchClick 📊, SearchSession 📊, UserSearchHistory 📊, ItemView 📊

---

## Suggested order

1. ~~**stores catalog** (StoreCategory/SubCategory)~~ ✅ done — mirror of marketplace.
2. **services catalog** (ServiceCategory/SubCategory) — next up (ESM `.js` imports, `NotFoundError`/`BadRequestError`).
3. marketplace **impact messages + materials** (small, translation-backed).
4. ~~**blog/community categories** (translation-backed)~~ ✅ done — BlogCategory, CommunityCategory, CommunitySubCategory via `ekoru-blog-community/src/adminCatalog/` + `features/blogCommunity/` (uses the shared `components/BulkImportDialog`). Blog + community posts/events are ✅ (form-based, not XLSX). The whole blog-community subgraph is now fully covered except BlogReaction 📊 (read-only).
5. **transactions/search config tables** (ShippingStatus, ChileanPaymentConfig, SearchSynonym…).
6. ekoru-users XLSX CRUD ✅ done for labels, levels, locations, admins & memberships (shared `src/common/bulk` backend helpers + `UsersBulkUpsertResult`, shared `components/BulkImportDialog` with N named-sheet specs). Remaining 🟡 there is only Seller (bulk-create intentionally stubbed) + read-only subscription/log tables.
7. Large product/service tables (Product, StoreProduct, Service) — need admin-scoped raw reads.
