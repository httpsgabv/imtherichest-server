-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "achievementAlerts" BOOLEAN NOT NULL DEFAULT true,
    "rankAlerts" BOOLEAN NOT NULL DEFAULT true,
    "paymentConfirmations" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_profileId_key" ON "notification_settings"("profileId");

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
