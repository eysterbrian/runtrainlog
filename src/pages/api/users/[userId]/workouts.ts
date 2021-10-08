import prisma from 'api/clients/prisma';
import { NextApiHandler } from 'next';
import { getSession } from 'next-auth/client';

const handler: NextApiHandler = async (req, res) => {
  console.log('🏃  workouts handler', req.query);
  const userId = req.query?.userId;

  const session = await getSession({ req });
  console.log('🏃  workouts handler', { session });

  if (!session) {
    return res.status(400).send('User must be logged-in');
  }

  if (req.method === 'GET') {
    if (userId === 'me') {
      const workouts = await prisma.user.findFirst({
        where: {
          email: session.user?.email,
        },
        select: {
          id: true,
          workouts: true,
        },
      });
      return res.status(200).json(workouts);
    }
  }

  res.status(200).send(req.query);
};

export default handler;
