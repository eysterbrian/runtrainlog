import { z } from 'zod';
import { WorkoutModality, WorkoutType } from '.prisma/client';
import { parseISO, isValid } from 'date-fns';

export const newWorkoutSchema = z.object({
  description: z
    .string()
    .nonempty()
    .min(10, { message: 'Must be at least 10 characters' }),
  distance: z.number({ invalid_type_error: 'A number is required' }).gt(0.1),
  activeDuration: z.number().gt(5).optional(),
  elevation: z.number().optional(),
  startTime: z
    // zod's will reject an ISO string using its built-in z.date() fn, so
    // we manually check whether the string version of a date is valid
    .union([z.date(), z.string().refine((val) => isValid(parseISO(val)))]),

  modality: z.nativeEnum(WorkoutModality, {
    errorMap: (issue, _ctx) => {
      // Return generic error message for any enum errors
      return {
        message: 'Invalid value',
      };
    },
  }),
  workoutType: z.nativeEnum(WorkoutType, {
    errorMap: (issue, _ctx) => {
      // Return generic error message for any enum errors
      return {
        message: 'Invalid value',
      };
    },
  }),

  ratingEnergy: z
    .number({ required_error: 'A rating is required' })
    .int()
    .gte(1, { message: 'A rating is required' })
    .lte(5)
    .optional(),
  ratingDifficulty: z
    .number({ required_error: 'A rating is required' })
    .int()
    .gte(1, { message: 'A rating is required' })
    .lte(5)
    .optional(),
  ratingGeneral: z
    .number({ required_error: 'A rating is required' })
    .int()
    .gte(1, { message: 'A rating is required' })
    .lte(5)
    .optional(),
  fitbitLogId: z
    .number()
    .min(1000, { message: 'Must be at least 1000' })
    .optional(),
});

export type TNewWorkoutSchema = z.infer<typeof newWorkoutSchema>;
