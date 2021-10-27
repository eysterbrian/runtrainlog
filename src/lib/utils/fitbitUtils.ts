import { WorkoutModality, WorkoutType } from '@prisma/client';

export function modalityFromFitbitActivity(activity: string): WorkoutModality {
  switch (activity) {
    case 'Run':
      return 'RUN';
    case 'Bike':
      return 'BIKE';
    case 'Spinning':
      return 'SPINNING';
    default:
      const errMsg = `Missing modality "${activity}" in modalityFromFitbitActivity`;
      console.log(errMsg);
      throw new Error(errMsg);
  }
}
