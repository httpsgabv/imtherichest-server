-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievement" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_profileId_createdAt_idx" ON "payment"("profileId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_achievement_profileId_idx" ON "user_achievement"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievement_profileId_achievementId_key" ON "user_achievement"("profileId", "achievementId");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
