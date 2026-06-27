import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { faker } from '@faker-js/faker';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

const TOTAL_USERS = 500;
const BATCH_SIZE = 50;

const ACHIEVEMENT_IDS = [
  'verified-email', 'first-login', 'first-purchase',
  'spent-100', 'spent-1000', 'spent-10000',
  'top-100', 'top-10', 'top-3', 'rank-1',
  'night-owl', 'bitcoin-whale', 'weekend-warrior', 'lucky-seven',
  'serial-spender', 'millionaire-mindset', 'insomniac', 'speed-runner',
  'tax-collector', 'nice', 'over-9000',
  'based', 'certified-baller', 'goblin-mode', 'perfect-score',
  'say-less', 'vibe-check', 'rents-due', 'fr-fr', 'understood-assignment', 'sheesh',
] as const;
type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

/** Weighted random pick */
function pickWeighted<T>(items: T[], weights: number[]): T {
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function generatePaymentAmounts(count: number): number[] {
  const buckets = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000];
  const weights = [20, 25, 20, 15, 10, 5, 3, 2];
  return Array.from({ length: count }, () => pickWeighted(buckets, weights));
}

function computeAchievements(opts: {
  totalPaid: number;
  points: number;
  paymentCount: number;
  rank: number; // 1-based
}): AchievementId[] {
  const { totalPaid, points, paymentCount, rank } = opts;
  const unlocked = new Set<AchievementId>();

  unlocked.add('first-login');
  if (Math.random() < 0.85) unlocked.add('verified-email');

  if (paymentCount >= 1) {
    unlocked.add('first-purchase');
    if (Math.random() < 0.4) unlocked.add('speed-runner');
    if (Math.random() < 0.3) unlocked.add('rents-due');
    if (Math.random() < 0.25) unlocked.add('weekend-warrior');
    if (Math.random() < 0.2) unlocked.add('goblin-mode');
    if (Math.random() < 0.15) unlocked.add('night-owl');
    if (Math.random() < 0.15) unlocked.add('vibe-check');
    if (Math.random() < 0.1) unlocked.add('fr-fr');
    if (Math.random() < 0.1) unlocked.add('lucky-seven');
  }
  if (paymentCount >= 10) unlocked.add('perfect-score');
  if (paymentCount >= 30 && Math.random() < 0.5) unlocked.add('serial-spender');

  if (totalPaid >= 10_000) unlocked.add('spent-100');
  if (totalPaid >= 100_000) unlocked.add('spent-1000');
  if (totalPaid >= 1_000_000) unlocked.add('spent-10000');
  if (totalPaid >= 10_000 && Math.random() < 0.3) unlocked.add('sheesh');
  if (totalPaid >= 50_000) unlocked.add('certified-baller');
  if (totalPaid >= 6_000_000) unlocked.add('bitcoin-whale');

  if (points === 69) unlocked.add('nice');
  if (points === 404) unlocked.add('tax-collector');
  if (points === 420) unlocked.add('based');
  if (points > 9000) unlocked.add('over-9000');

  if (rank <= 100) {
    unlocked.add('top-100');
    if (Math.random() < 0.5) unlocked.add('millionaire-mindset');
    if (Math.random() < 0.3) unlocked.add('say-less');
    if (Math.random() < 0.3) unlocked.add('insomniac');
  }
  if (rank <= 10) unlocked.add('top-10');
  if (rank <= 3) unlocked.add('top-3');
  if (rank === 1) unlocked.add('rank-1');

  const normalIds: AchievementId[] = [
    'verified-email', 'first-login', 'first-purchase', 'spent-100',
    'spent-1000', 'spent-10000', 'top-100', 'top-10', 'top-3', 'rank-1',
  ];
  if (normalIds.every((id) => unlocked.has(id))) {
    unlocked.add('understood-assignment');
  }

  return Array.from(unlocked);
}

async function chunked<T>(arr: T[], size: number, fn: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < arr.length; i += size) {
    await fn(arr.slice(i, i + size));
  }
}

async function main() {
  console.log(`Seeding ${TOTAL_USERS} users...`);

  // Clear in dependency order
  await prisma.userAchievement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.privacySettings.deleteMany();
  await prisma.notificationSettings.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared existing data.');

  const usedEmails = new Set<string>();
  const usedUsernames = new Set<string>();
  const now = Date.now();
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

  // Build all data in memory first
  const userData: {
    user: { id: string; name: string; email: string; emailVerified: boolean; createdAt: Date; updatedAt: Date };
    profile: { id: string; userId: string; username: string; displayName: string; bio: string; country: string; avatarUrl: string | null; points: number; totalPaid: number; createdAt: Date; updatedAt: Date };
    payments: { profileId: string; amount: number; points: number; stripeSessionId: string; createdAt: Date }[];
    paymentCount: number;
  }[] = [];

  for (let i = 0; i < TOTAL_USERS; i++) {
    const userId = faker.string.uuid();
    const profileId = `c${faker.string.alphanumeric(24)}`;
    const createdAt = faker.date.past({ years: 2 });

    let email: string;
    do { email = faker.internet.email().toLowerCase(); } while (usedEmails.has(email));
    usedEmails.add(email);

    let username: string;
    do {
      username = (faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20) || `user${i}`);
    } while (usedUsernames.has(username));
    usedUsernames.add(username);

    const paymentCount = pickWeighted(
      [0, 1, 2, 5, 10, 20, 50, 100],
      [5, 10, 15, 20, 20, 15, 10, 5],
    );
    const amounts = generatePaymentAmounts(paymentCount);
    const totalPaid = amounts.reduce((s, a) => s + a, 0);
    const points = amounts.reduce((s, a) => s + Math.round(a / 100), 0);

    const payments = amounts.map((amount) => ({
      profileId,
      amount,
      points: Math.round(amount / 100),
      stripeSessionId: `cs_test_${faker.string.alphanumeric(32)}`,
      createdAt: new Date(oneYearAgo + Math.random() * (now - oneYearAgo)),
    }));

    userData.push({
      user: {
        id: userId,
        name: faker.person.fullName(),
        email,
        emailVerified: Math.random() < 0.85,
        createdAt,
        updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
      },
      profile: {
        id: profileId,
        userId,
        username,
        displayName: faker.internet.displayName(),
        bio: Math.random() < 0.6 ? faker.lorem.sentence({ min: 5, max: 20 }) : '',
        country: faker.location.countryCode('alpha-2'),
        avatarUrl: Math.random() < 0.7 ? faker.image.avatar() : null,
        points,
        totalPaid,
        createdAt,
        updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
      },
      payments,
      paymentCount,
    });
  }

  // Sort by points to assign ranks
  const ranked = [...userData].sort((a, b) => b.profile.points - a.profile.points);

  const allAchievements: {
    profileId: string; achievementId: string; unlockedAt: Date;
  }[] = [];

  for (let rank = 0; rank < ranked.length; rank++) {
    const { profile, paymentCount } = ranked[rank];
    const achIds = computeAchievements({
      totalPaid: profile.totalPaid,
      points: profile.points,
      paymentCount,
      rank: rank + 1,
    });
    for (const achievementId of achIds) {
      allAchievements.push({
        profileId: profile.id,
        achievementId,
        unlockedAt: faker.date.between({ from: profile.createdAt, to: new Date() }),
      });
    }
  }

  const allUsers = userData.map((d) => d.user);
  const allProfiles = userData.map((d) => d.profile);
  const allPayments = userData.flatMap((d) => d.payments);
  const allPrivacy = allProfiles.map((p) => ({
    profileId: p.id,
    publicProfile: Math.random() < 0.9,
    showTotalPaid: Math.random() < 0.8,
    showAchievements: Math.random() < 0.85,
    showActivity: Math.random() < 0.75,
  }));
  const allNotifs = allProfiles.map((p) => ({
    profileId: p.id,
    achievementAlerts: Math.random() < 0.8,
    rankAlerts: Math.random() < 0.7,
    paymentConfirmations: Math.random() < 0.95,
    marketingEmails: Math.random() < 0.3,
  }));

  console.log('Inserting users...');
  await chunked(allUsers, BATCH_SIZE, (batch) => prisma.user.createMany({ data: batch }));

  console.log('Inserting profiles...');
  await chunked(allProfiles, BATCH_SIZE, (batch) => prisma.profile.createMany({ data: batch }));

  console.log(`Inserting ${allPayments.length} payments...`);
  await chunked(allPayments, 200, (batch) => prisma.payment.createMany({ data: batch }));

  console.log('Inserting privacy settings...');
  await chunked(allPrivacy, BATCH_SIZE, (batch) => prisma.privacySettings.createMany({ data: batch }));

  console.log('Inserting notification settings...');
  await chunked(allNotifs, BATCH_SIZE, (batch) => prisma.notificationSettings.createMany({ data: batch }));

  console.log(`Inserting ${allAchievements.length} achievements...`);
  await chunked(allAchievements, 200, (batch) => prisma.userAchievement.createMany({ data: batch }));

  console.log('\nSeed complete:');
  console.log(`  Users:        ${allUsers.length}`);
  console.log(`  Payments:     ${allPayments.length} (avg ${(allPayments.length / TOTAL_USERS).toFixed(1)}/user)`);
  console.log(`  Achievements: ${allAchievements.length} (avg ${(allAchievements.length / TOTAL_USERS).toFixed(1)}/user)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
