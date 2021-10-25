import React from 'react';
import {
  UseDisclosureReturn,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from '@chakra-ui/react';

type Props = {
  showDialog: UseDisclosureReturn;
  workoutDateStr: string;
  onDeleteHandler: () => void;
};

export const DeleteWorkoutConfirm: React.FC<Props> = ({
  showDialog,
  workoutDateStr,
  onDeleteHandler,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <AlertDialog
      isOpen={showDialog.isOpen}
      leastDestructiveRef={cancelRef}
      onClose={showDialog.onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Workout
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete the{' '}
            <strong>{workoutDateStr}</strong> workout? You cannot undo this
            action.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={showDialog.onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onDeleteHandler} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
