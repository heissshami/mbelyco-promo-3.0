-- Canonicalize promo_code.status to: active | used | redeemed | reported | expired | blocked
-- 1) Update default on column to 'active'
ALTER TABLE "promo_code"
  ALTER COLUMN "status" SET DEFAULT 'active';

-- 2) Convert previously used internal statuses to canonical labels
-- new -> active
UPDATE "promo_code" SET "status" = 'active' WHERE lower("status") = 'new';
-- issued -> used
UPDATE "promo_code" SET "status" = 'used' WHERE lower("status") = 'issued';
-- invalid -> blocked
UPDATE "promo_code" SET "status" = 'blocked' WHERE lower("status") = 'invalid';

-- 3) Ensure all statuses are lowercase canonical forms
UPDATE "promo_code" SET "status" = lower("status") WHERE "status" IS NOT NULL;

-- Note: legacy promo_codes table already uses the desired labels, including 'expired' and possibly 'reported'.