import { WorkoutModality, WorkoutType } from '@prisma/client';

export function modalityFromFitbitActivity(activity: string): WorkoutModality {
  switch (activity) {
    case 'Run':
      return 'RUN';
    case 'Bike':
    case 'Outdoor Bike':
      return 'BIKE';
    case 'Spinning':
      return 'SPINNING';
    case 'Walk':
      return 'OTHER';
    case 'Sport':
      return 'SPORT';
    default:
      const errMsg = `Missing modality "${activity}" in modalityFromFitbitActivity`;
      console.log(errMsg);
      throw new Error(errMsg);
  }
}
