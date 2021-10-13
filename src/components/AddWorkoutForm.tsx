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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconRating } from './IconRating';

const newWorkoutSchema = z.object({
  description: z
    .string()
    .nonempty()
    .min(10, { message: 'Must be at least 10 characters' }),
  distance: z.number({ invalid_type_error: 'A number is required' }).gt(0.1),
  duration: z.number().gt(5).optional(),
  elevation: z.number().optional(),
  startTime: z.date().optional(),

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
    .lte(5),
  ratingDifficulty: z
    .number({ required_error: 'A rating is required' })
    .int()
    .gte(1, { message: 'A rating is required' })
    .lte(5),
  ratingGeneral: z
    .number({ required_error: 'A rating is required' })
    .int()
    .gte(1, { message: 'A rating is required' })
    .lte(5),
});

type TWorkoutSchema = z.infer<typeof newWorkoutSchema>;

export const AddWorkoutForm: React.FC = () => {
  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TWorkoutSchema>({
    // Type arg to useForm, so all RHF methods will be fully typed!
    resolver: zodResolver(newWorkoutSchema),
  });

  function onSubmit(values: TWorkoutSchema): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2));
        resolve();
      }, 3000);
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
