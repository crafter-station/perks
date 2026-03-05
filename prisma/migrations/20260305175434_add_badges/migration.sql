-- CreateTable
CREATE TABLE "badge" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_badge" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unlocked',

    CONSTRAINT "org_badge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "badge_key_key" ON "badge"("key");

-- CreateIndex
CREATE INDEX "org_badge_organizationId_idx" ON "org_badge"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "org_badge_organizationId_badgeId_key" ON "org_badge"("organizationId", "badgeId");

-- AddForeignKey
ALTER TABLE "org_badge" ADD CONSTRAINT "org_badge_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_badge" ADD CONSTRAINT "org_badge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
