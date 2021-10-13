import { WorkoutModality, WorkoutType } from '.prisma/client';
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Select,
  Center,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconRating } from './IconRating';
import { fetchAddWorkout } from 'lib/queries/fetchAddWorkout';
import { useMutation } from 'react-query';
import {
  newWorkoutSchema,
  TNewWorkoutSchema,
} from 'lib/validators/addWorkoutSchema';

export const AddWorkoutForm: React.FC = () => {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TNewWorkoutSchema>({
    // Type arg to useForm, so all RHF methods will be fully typed!
    resolver: zodResolver(newWorkoutSchema),
  });

  const mutation = useMutation(fetchAddWorkout);

  function onSubmit(values: TNewWorkoutSchema): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mutation.mutate(values);
        resolve();
      }, 1000);
    });
  }

  // Most basic info for the form: description, duration, length
  return (
    <Center>
      <form onSubmit={handleSubmit(onSubmit)}>
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
        <FormControl isInvalid={!!errors.ratingEnergy}>
          <FormLabel>Energy</FormLabel>
          <Controller
            name="ratingEnergy"
            control={control}
            defaultValue={0}
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
        <FormControl isInvalid={!!errors.ratingDifficulty}>
          <FormLabel>Difficulty</FormLabel>
          <Controller
            name="ratingDifficulty"
            control={control}
            defaultValue={0}
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
        <FormControl isInvalid={!!errors.ratingGeneral}>
          <FormLabel>General</FormLabel>
          <Controller
            name="ratingGeneral"
            control={control}
            defaultValue={0}
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
        <Button
          mt={4}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit">
          Submit
        </Button>
      </form>
    </Center>
  );
};
