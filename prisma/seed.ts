//
// Run this with: `npx prisma db seed`
//
// Package.json must have prisma.seed key defined.
// For NextJS usage it must look like:
// "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
//
import faker from 'faker';
faker.seed(123);

import {
  PrismaClient,
  Prisma, // namespace with input types
  WorkoutModality,
  WorkoutType,
} from '@prisma/client';

// Create prisma client and disconnect at end of this file
const prisma = new PrismaClient();

const USER_EMAIL = 'eysterbrian@gmail.com';

async function main() {
  // Delete all workouts
  console.log(`\n🪓   Removing all workouts from user ${USER_EMAIL}\n`);
  const result = await prisma.user.update({
    where: {
      email: USER_EMAIL,
    },
    data: {
      workouts: {
        deleteMany: {},
      },
    },
    include: {
      workouts: true,
    },
  });

  const newWorkouts: Prisma.WorkoutCreateWithoutUserInput[] = [
    ...new Array(16),
  ].map(() => {
    const modality = faker.random.arrayElement([
      ...new Array(4).fill('RUN'), // Increase likelihood of 'RUN'
      ...Object.values(WorkoutModality),
    ]) as WorkoutModality;
    return {
      startTime: faker.date.recent(21), // Dates in the past 3 weeks
      activeDurationSeconds: faker.datatype.number({
        min: 20 * 60,
        max: 70 * 60,
      }),
      distance: faker.datatype.float({ min: 1, max: 20 }),
      elevation: faker.datatype.float({ min: 50, max: 1500 }),
      paceMinPerMile: faker.datatype.float({ min: 60 / 13, max: 60 / 6 }),
      avgHeartRate: faker.datatype.number({ min: 100, max: 130 }),
      modality,
      workoutType:
        modality !== 'RUN'
          ? 'CROSSTRAIN'
          : (faker.random.objectElement(WorkoutType) as WorkoutType),
      description: faker.lorem.sentence(),
      location: faker.address.streetName(),
      listening: faker.music.genre(),
      personalFeelings: faker.random.arrayElement([
        'Feeling pretty good!',
        'Lovely day',
        'Kind of worn out from last workout',
      ]),
      strengthExercises: faker.random.arrayElement([
        'Situps, rows, and pushups',
        'band workout',
        'myrtle workout',
      ]),
      ratingDifficulty: faker.datatype.number({ min: 1, max: 5 }),
      ratingEnergy: faker.datatype.number({ min: 1, max: 5 }),
      ratingGeneral: faker.datatype.number({ min: 1, max: 5 }),
    };
  });
  const workout = await prisma.user.update({
    where: {
      email: USER_EMAIL,
    },
    data: {
      workouts: {
        createMany: {
          data: newWorkouts,
        },
      },
    },
    include: {
      workouts: true,
    },
  });
  console.log(workout);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
