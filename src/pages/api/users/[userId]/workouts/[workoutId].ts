import prisma from 'lib/server/prisma';
import { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(400).send('User must be logged-in');
  }

  const userId =
    req.query?.userId === 'me' ? session.user?.id : req.query?.userId;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).send('Invalid userId');
  }

  /**
   * Delete the specified workout for this user
   */
  if (req.method === 'DELETE') {
    console.log('🏃  workout DELETE handler', req.body);

    const workoutId = req.query?.workoutId;
    if (!workoutId || Array.isArray(workoutId)) {
      return res.status(400).send('Incorrectly formed workoutId');
    }

    // Long pause
    await new Promise((res) => {
      setTimeout(res, 1000);
    });

    // Confirm that this user is allowed to delete this workout
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    if (workout?.user?.id !== userId) {
      return res.status(400).send('User not allowed to delete this workout');
    }

    // Delete the workout
    const deletedWorkout = await prisma.workout.delete({
      where: {
        id: workoutId,
      },
    });
    return res.status(200).json(deletedWorkout);
  }
};

export default handler;
