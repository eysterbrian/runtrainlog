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
  Center,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconRating } from './IconRating';

const newWorkoutSchema = z.object({
  description: z
    .string()
    .nonempty()
    .min(10, { message: 'Must be at least 10 characters' }),
  distance: z.number().gt(0.1),
  duration: z.number().gt(5).optional(),
  elevation: z.number().optional(),
  startTime: z.date().optional(),

  modality: z.nativeEnum(WorkoutModality).optional(),
  workoutType: z.nativeEnum(WorkoutType).optional(),

  ratingEnergy: z.number().int().gte(1).lte(5).optional(),
  ratingDifficulty: z.number().int().gte(1).lte(5).optional(),
  ratingGeneral: z.number().int().gte(1).lte(5).optional(),
});

type TWorkoutSchema = z.infer<typeof newWorkoutSchema>;

export const AddWorkoutForm: React.FC = () => {
  const {
    handleSubmit,
    register,
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
        <FormControl isInvalid={!!errors.distance}>
          <FormLabel>Distance</FormLabel>
          <Input
            type="number"
            {...register('distance', { valueAsNumber: true })}
          />
          <FormErrorMessage>
            {errors.distance && errors.distance.message}
          </FormErrorMessage>
        </FormControl>
        <IconRating initValue={3} numOptions={6} iconType="Energy" />
        <IconRating initValue={3} numOptions={6} iconType="Star" />
        <IconRating initValue={3} numOptions={6} iconType="Difficulty" />
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
