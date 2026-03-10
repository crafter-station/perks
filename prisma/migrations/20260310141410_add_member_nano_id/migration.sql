-- Step 1: Add column as nullable (safe for existing rows)
ALTER TABLE "member" ADD COLUMN "nanoId" TEXT;

-- Step 2: Backfill existing rows with unique random IDs
-- Using gen_random_uuid() to guarantee uniqueness, trimmed to cuid-like length
UPDATE "member" SET "nanoId" = replace(gen_random_uuid()::text, '-', '') WHERE "nanoId" IS NULL;

-- Step 3: Now that all rows have values, set NOT NULL
ALTER TABLE "member" ALTER COLUMN "nanoId" SET NOT NULL;

-- Step 4: Add unique index
CREATE UNIQUE INDEX "member_nanoId_key" ON "member"("nanoId");
