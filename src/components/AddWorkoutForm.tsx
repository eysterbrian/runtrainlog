import React from 'react';
import { WorkoutModality, WorkoutType } from '.prisma/client';
import {
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  GridItem,
  useToast,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchAddWorkout } from 'lib/queries/fetchAddWorkout';
import { TFitbitActivity } from 'lib/queries/fetchFitbitActivities';
import { modalityFromFitbitActivity } from 'lib/utils/fitbitUtils';
import {
  newWorkoutSchema,
  TNewWorkoutSchema,
} from 'lib/validators/addWorkoutSchema';
import { useSession } from 'next-auth/client';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { IconRating } from './IconRating';
import { parseISO, format } from 'date-fns';

export type SubmittingState = 'idle' | 'isSubmitting' | 'isSubmitted';
type Props = {
  showSubmitButton?: boolean;
  updateSubmitState?: (state: SubmittingState) => void;
  fitbitActivity?: TFitbitActivity;
};

/**
 * Form for adding a new workout
 * @param updateSubmitState callback fn
 * @param showSubmitButton specify whether to include submit button with form
 * @returns
 */
export const AddWorkoutForm: React.FC<Props> = ({
  updateSubmitState,
  showSubmitButton = true,
  fitbitActivity,
}) => {
  //
  // Default values for the form:
  // If a fitbitActivity is provided, then define default values for the form based on
  // this activity.
  const fitbitValues = React.useMemo<Partial<TNewWorkoutSchema>>(
    () =>
      !fitbitActivity
        ? {}
        : {
            description: 'Imported from fitbit',
            modality: modalityFromFitbitActivity(fitbitActivity.activityName),
            distance: fitbitActivity?.distance
              ? Math.round(fitbitActivity.distance * 100) / 100
              : 0,
            startTime: format(parseISO(fitbitActivity.startTime), 'yyyy-MM-dd'),
            workoutType:
              modalityFromFitbitActivity(fitbitActivity.activityName) !== 'RUN'
                ? 'CROSSTRAIN'
                : 'BASE',
            activeDuration: fitbitActivity.activeDuration,
            elevation: fitbitActivity?.elevationGain,
            fitbitLogId: fitbitActivity.logId,
          },
    [fitbitActivity]
  );

  console.log('default values: ', fitbitValues);

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<TNewWorkoutSchema>({
    resolver: zodResolver(newWorkoutSchema),
    defaultValues: fitbitValues,
  });
  const [session] = useSession();
  const queryClient = useQueryClient();
  const addWorkoutMutation = useMutation(fetchAddWorkout, {
    onError: (error) => {
      console.log(error);
      toast({
        title: 'Error Adding Workout',
        status: 'error',
      });
    },
    onSuccess: () => {
      // console.log('🪓  Invalidating workouts after mutation success');
      queryClient.invalidateQueries(['workouts', session?.user?.id]);
      // console.log('🍻  Toasting mutation success');
      toast({
        title: 'Workout Added',
        description: 'Congrats on another workout',
        status: 'success',
      });
    },
  });
  const toast = useToast();

  useEffect(() => {
    if (!updateSubmitState) {
      return;
    }
    // Determine the 3-way value based on 2 RHF fields: isSubmitted and isSubmitting
    const newState: SubmittingState =
      !isSubmitted && !isSubmitting
        ? 'idle'
        : isSubmitting
        ? 'isSubmitting'
        : 'isSubmitted';
    updateSubmitState(newState);
  }, [isSubmitting, isSubmitted, updateSubmitState]);

  function onSubmit(values: TNewWorkoutSchema) {
    // console.log('💩 onSubmit - before mutation');
    addWorkoutMutation.mutate(values);
    // console.log('💩 onSubmit - after mutation');
  }

  return (
    <Center>
      <form onSubmit={handleSubmit(onSubmit)} id="addWorkoutForm">
        <Input type="hidden" {...register('fitbitLogId')} />
        <SimpleGrid columns={2} spacing="4">
          <GridItem colSpan={2}>
            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Description</FormLabel>
              <Input
                type="text"
                placeholder="description"
                {...register('description')}
              />
              <FormErrorMessage>
                {errors.description && errors.description.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={!!errors.startTime}>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                {...register('startTime', { valueAsDate: true })}
              />
              <FormErrorMessage>
                {errors.startTime && errors.startTime.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={!!errors.distance}>
              <FormLabel>Distance</FormLabel>
              <Input
                type="number"
                step="0.01"
                {...register('distance', { valueAsNumber: true })}
              />
              <FormErrorMessage>
                {errors.distance && errors.distance.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={!!errors.modality}>
              <FormLabel>Modality</FormLabel>
              <Select {...register('modality')}>
                <option value=""></option>
                {Object.keys(WorkoutModality).map((modality) => (
                  <option key={modality} value={modality}>
                    {modality}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {errors.modality && errors.modality.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={!!errors.workoutType}>
              <FormLabel>Workout Type</FormLabel>
              <Select {...register('workoutType')}>
                <option value=""></option>
                {Object.keys(WorkoutType).map((workoutType) => (
                  <option key={workoutType} value={workoutType}>
                    {workoutType}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {errors.workoutType && errors.workoutType.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={!!errors.ratingEnergy}>
              <FormLabel>Energy</FormLabel>
              <Controller
                name="ratingEnergy"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <IconRating
                    value={value}
                    onChange={onChange}
                    numOptions={5}
                    iconType="Energy"
                  />
                )}
              />
              <FormErrorMessage>
                {errors.ratingDifficulty && errors.ratingDifficulty.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={!!errors.ratingDifficulty}>
              <FormLabel>Difficulty</FormLabel>
              <Controller
                name="ratingDifficulty"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <IconRating
                    value={value}
                    onChange={onChange}
                    numOptions={5}
                    iconType="Difficulty"
                  />
                )}
              />
              <FormErrorMessage>
                {errors.ratingGeneral && errors.ratingGeneral.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={!!errors.ratingGeneral}>
              <FormLabel>General</FormLabel>
              <Controller
                name="ratingGeneral"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <IconRating
                    value={value}
                    onChange={onChange}
                    numOptions={5}
                    iconType="Star"
                  />
                )}
              />
              <FormErrorMessage>
                {errors.ratingGeneral && errors.ratingGeneral.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          {showSubmitButton && (
            <GridItem colSpan={2}>
              <Button
                w="100%"
                isLoading={isSubmitting}
                form="addWorkoutForm"
                type="submit">
                Add Workout{' '}
              </Button>
            </GridItem>
          )}
        </SimpleGrid>
      </form>
    </Center>
  );
};
