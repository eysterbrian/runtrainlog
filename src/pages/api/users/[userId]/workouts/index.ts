import prisma from 'lib/server/prisma';
import { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Workout } from '@prisma/client';
import { newWorkoutSchema } from 'lib/validators/addWorkoutSchema';

const handler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send('User must be logged-in');
  }

  const userId =
    req.query?.userId === 'me' ? session.user?.id : req.query?.userId;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).send('Malformed userId');
  }

  //

  /**
   * Return array of all workouts for this user
   */
  if (req.method === 'GET') {
    const workouts = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        workouts: true,
      },
    });
    return res.status(200).json(workouts);
  } else if (req.method === 'POST') {
    /**
     * Create a new workout for this user
     */
    console.log('🏃  workout POST handler', req.body);

    try {
      const newWorkoutData = newWorkoutSchema.parse(JSON.parse(req.body));
      console.log(newWorkoutData);

      const workouts = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          workouts: {
            create: {
              ...newWorkoutData,
            },
          },
        },
        select: {
          id: true,
          workouts: true,
        },
      });
      return res.status(201).json(workouts);
    } catch (err) {
      console.log('Catch in POST method');
      console.log(err);
      return res.status(400).json(err);
    }
  }

  /**
   * Delete multiple workouts for this user
   *
   * req.body.workoutIds should contain an array of ID strings
   */
  if (req.method === 'DELETE') {
    console.log('🏃  workout DELETE handler', JSON.parse(req.body));

    try {
      const data = JSON.parse(req.body);
      const workoutIds: string[] = data.workoutIds;
      if (!Array.isArray(workoutIds)) {
        throw new Error('Invalid list of workoutIDs');
      }

      // Confirm that the user owns all these workouts

      // Since the workout IDs are unique, the count of workoutIds that
      // belong to this user should be ALL of the workoutIds.
      const numMatchedIds = await prisma.workout.count({
        where: {
          userId: userId,
          id: {
            in: workoutIds,
          },
        },
      });
      if (numMatchedIds !== workoutIds.length) {
        return res
          .status(403)
          .send('User is not allowed to delete these workouts');
      } else {
        console.log('🍻  All workouts belong to this user');
      }

      // Delete these workouts
      const deletedWorkouts = await prisma.workout.deleteMany({
        where: {
          userId: userId,
          id: {
            in: workoutIds,
          },
        },
      });
      console.log('Deleted workouts: ', deletedWorkouts);
      if (deletedWorkouts.count !== workoutIds.length) {
        res
          .status(500)
          .send(
            `Error deleting workouts. Only ${deletedWorkouts.count} workouts deleted`
          );
      }
      return res.status(200).json(deletedWorkouts);
    } catch (err: unknown) {
      console.log('Catch in DELETE method');
      console.log(err);
      return res.status(400).json(err);
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${req?.method ?? '??'} Not Allowed`);
};

export default handler;
