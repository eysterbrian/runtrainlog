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
    // TODO: Auth check. Can current user access this userId's workouts?
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

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req?.method ?? '??'} Not Allowed`);
};

export default handler;
