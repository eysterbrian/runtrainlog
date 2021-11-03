/**
 * Playground file to test out Prisma DB commands
 * Can be run via: ts-node --compiler-options {\"module\":\"CommonJS\"} src/lib/server/_playground.ts
 */
import {
  PrismaClient,
  Prisma, // namespace with input types
  WorkoutModality,
  WorkoutType,
} from '@prisma/client';

const USER_EMAIL = 'eysterbrian@gmail.com';

// Create prisma client and disconnect at end of this file
const prisma = new PrismaClient();

/**
 * Wrap all our async code in a function, since we can't otherwise do
 * top-level async/await
 */
async function main() {
  console.log('🎈  Prisma Test playground   ');

  // Get the first few workouts and their IDs
  const workouts = await prisma.user.findFirst({
    where: {
      email: USER_EMAIL,
    },
    select: {
      id: true,
      workouts: {
        take: 8,
        orderBy: {
          startTime: 'asc',
        },
        select: {
          id: true,
          startTime: true,
        },
      },
    },
  });
  console.log(workouts);

  // Manually supply a list of workout IDs to test deleting
  const workoutIds = ['ckvd09bsm0017pa6nd74gylfg', 'ckvd09bsm0014pa6nosj2ksjg'];
  const USER_ID = 'ckv04xl430006xy6nowoui4uu';

  // Get the count of workouts for this user that match that list of IDs
  const numMatchedIds = await prisma.workout.count({
    where: {
      userId: USER_ID,
      id: {
        in: workoutIds,
      },
    },
  });

  console.log(`🧮 num Matching workouts: ${numMatchedIds}`);
  if (numMatchedIds === workoutIds.length) {
    console.log('🍻  All workouts belong to this user');
  }

  const numWorkoutsBefore = await prisma.user.findUnique({
    where: {
      id: USER_ID,
    },
    include: {
      _count: {
        select: {
          workouts: true,
        },
      },
    },
  });
  console.log(
    ' numWorkouts BEFORE delete: ',
    numWorkoutsBefore?._count?.workouts
  );

  // Delete these workouts
  const deletedWorkouts = await prisma.workout.deleteMany({
    where: {
      userId: USER_ID,
      id: {
        in: workoutIds,
      },
    },
  });
  console.log('Deleted workouts: ', deletedWorkouts);

  const numWorkouts = await prisma.user.findUnique({
    where: {
      id: USER_ID,
    },
    include: {
      _count: {
        select: {
          workouts: true,
        },
      },
    },
  });
  console.log(' numWorkouts after delete: ', numWorkouts?._count?.workouts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
