# Bangladesh Travel Dashboard — Handoff Document
Last updated: 2026-08-09

## Supabase project
- Name: **bangladesh-explorer**
- Project ID: `xaummlewqjletagnuxhu`
- Region: ap-southeast (Tokyo)
- Postgres 17, RLS enabled on all tables

(There is a second, unrelated project on the same Supabase org: `ronykitty's Project` / `dggjeseonhnqxawmtlmf`. Do not confuse the two.)

## Schema status: COMPLETE — no new tables needed
Verified live against the database on 2026-08-09. Every table required by the
original spec (location hierarchy + trip/expense model) already exists:

| Table | Rows | Purpose |
|---|---|---|
| `divisions` | 8 | Division list, name_bn/name_en, sort_order |
| `districts` | 64 | FK → divisions |
| `upazilas` | 498 | FK → districts. **This is the verified current count as seeded — not the commonly-assumed 503.** If you re-verify against bangladesh.gov.bd or BBS data later, reconcile against this number rather than assuming either figure is correct. |
| `categories` | 20 | Place categories (Heritage, Rivers, Ferry, etc.) |
| `places` | 4 | Wishlist/planned/visited/revisited places, linked to category + district + upazila |
| `visits` | 2 | Visit log entries per place |
| `expense_categories` | 9 | Transport/Bus/Train/Hotel/Food/etc., admin-editable, `is_active` flag |
| `trips` | 0 | Trip records — status: wishlist/planned/ongoing/completed/cancelled |
| `expenses` | 0 | FK → trips + expense_categories, `amount >= 0` check constraint |
| `trip_places` | 0 | Join table (trip_id + place_id composite PK), links Trip ↔ Place |

`trips`, `expenses`, and `trip_places` have zero rows — they exist but are
unused so far, so there's no data-migration risk in the work below.

### Foreign key delete behavior (confirmed via `pg_constraint`)
- `expenses.trip_id` → `trips.id`: **ON DELETE CASCADE**
- `trip_places.trip_id` → `trips.id`: **ON DELETE CASCADE**
- `trip_places.place_id` → `places.id`: **ON DELETE CASCADE**
- `expenses.expense_category_id` → `expense_categories.id`: **RESTRICT** (can't delete a category that's in use — matches the "archive, don't hard-delete" requirement)
- `places.category_id` / `places.district_id`: **RESTRICT**
- `places.upazila_id` / `trips.division_id/district_id/upazila_id`: **SET NULL**

Deleting a trip is therefore safe and self-cleaning — its expenses and
trip_places rows go with it automatically. You do NOT need to manually
delete children before deleting a trip.

### RLS policies (confirmed)
All in place and correctly scoped:
- `divisions`, `districts`, `upazilas`, `categories`, `expense_categories`: public SELECT (lookup tables)
- `places`, `trips`: SELECT/INSERT/UPDATE/DELETE scoped to `auth.uid() = user_id`
- `visits`: scoped via parent `places.user_id`
- `expenses`, `trip_places`: scoped via parent `trips.user_id`

No RLS gaps found. No changes needed here either.

## What was done in this session
1. Full schema + RLS + FK-cascade audit (above).
2. `types/database.phase2.ts` — Row/Insert/Update TypeScript types for
   `trips`, `expenses`, `expense_categories`, `trip_places`. **Merge these
   into your existing `database.ts`** alongside the current tables, then
   delete the phase2 file.
3. Hooks (assume Supabase client is importable as `@/lib/supabase` —
   **adjust the import path in each file if yours differs**):
   - `hooks/useExpenseCategories.ts` — fetch active (or all) expense categories
   - `hooks/useTrips.ts` — list (with filters)/create/update/delete trips, joined with division/district/upazila names
   - `hooks/useExpenses.ts` — exports `useTripExpenses(tripId)` (CRUD + dynamic total for one trip, `hasExpenses` flag for the "কোনো খরচের তথ্য নেই" empty state) and `useOverallExpenseStats()` (dashboard-wide total + by-month breakdown)
   - `hooks/useTripPlaces.ts` — link/unlink places to a trip via `trip_places`
   - `hooks/useTripDetail.ts` — composite hook combining trip + places + expenses for the Trip Details page (single source of truth, no duplicated calculations)

All totals in these hooks are computed with `useMemo`/`reduce` over real
fetched rows — nothing is hardcoded or cached separately, per the "never
display a calculated financial figure unless the underlying data exists"
requirement.

## What's still pending (next session)
This session had no access to the actual frontend repo (components, routes,
existing `database.ts`, sidebar, dashboard cards) — only the Supabase
database. Before continuing, a future session needs either:
- a GitHub repo link, or
- the relevant existing files uploaded directly (`database.ts`, dashboard components, sidebar, App routes)

Remaining spec items not yet started:
- [ ] Merge `database.phase2.ts` into the real `database.ts`
- [ ] Drop hooks into the real `hooks/` folder, fix import path
- [ ] Trip Details page UI (uses `useTripDetail`)
- [ ] "খরচ যোগ করুন" expense form + itemized table + delete confirmation
- [ ] Reports section (filters + aggregate report, uses `useOverallExpenseStats` as a starting point — will need district/upazila coverage queries too)
- [ ] Print/PDF stylesheet
- [ ] Dashboard redesign (cards, charts) wired to real hooks — no hardcoded numbers
- [ ] District/upazila coverage section (visited vs total, needs a query joining `places`/`trips` completed status → district/upazila)
- [ ] Category management admin UI (expense_categories + categories, archive not delete)
- [ ] Sidebar reorganization (Explore / My Travel / Analytics groups)
- [ ] Interactive/clickable dashboard cards
- [ ] Bengali typography setup (SolaimanLipi/Nikosh + Noto Serif/Sans Bengali fallback)

## Key design decisions to preserve
- Categories (`categories`, `expense_categories`) use `is_active` for
  soft-delete — DB-level RESTRICT constraints already back this up, so the
  UI should never attempt a hard delete on a referenced category.
- Trip total expense = `SUM(expenses.amount WHERE trip_id = X)`, computed
  live, never stored on the `trips` row.
- A place becomes "visited" through its own `status` field on `places`
  (not through `trip_places` membership) — `trip_places` is for showing
  which places belong to which trip, not for deriving visited status by
  itself. Confirm this matches your intended UX before building coverage
  calculations, since section 14 of the spec implies trip completion
  should also be able to drive place status.
