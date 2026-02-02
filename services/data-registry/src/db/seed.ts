import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const LEAGUES = [
  { id: 'UEFA Champions League', name: 'UEFA Champions League', country: 'Europe' },
  { id: 'Spain La Liga', name: 'Spain La Liga', country: 'Spain' },
  { id: 'Spain La Liga 2', name: 'Spain La Liga 2', country: 'Spain' },
  { id: 'England Premier League', name: 'England Premier League', country: 'England' },
  { id: 'Italy Serie A', name: 'Italy Serie A', country: 'Italy' },
  { id: 'Germany Bundesliga', name: 'Germany Bundesliga', country: 'Germany' },
  { id: 'France Ligue 1', name: 'France Ligue 1', country: 'France' },
];

const SEASONS = ['23/24', '24/25', '25/26'];

console.log('Starting seeding...');
console.log(
  'DB Connection Check:',
  connectionString ? 'Defined (length: ' + connectionString.length + ')' : 'UNDEFINED',
);

try {
  for (const leagueData of LEAGUES) {
    const league = await prisma.league.upsert({
      where: { id: leagueData.id },
      update: {
        name: leagueData.name,
        country: leagueData.country,
      },
      create: {
        id: leagueData.id,
        name: leagueData.name,
        country: leagueData.country,
      },
    });

    console.log(`Upserted league: ${league.name}`);

    for (const year of SEASONS) {
      await prisma.season.upsert({
        where: {
          leagueId_name: {
            leagueId: league.id,
            name: year,
          },
        },
        update: {},
        create: {
          name: year,
          leagueId: league.id,
        },
      });
      console.log(`  - Added season: ${year}`);
    }
  }
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  console.log('Seeding finished.');
}
