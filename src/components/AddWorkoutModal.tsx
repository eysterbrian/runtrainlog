import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  UseDisclosureReturn,
} from '@chakra-ui/react';
import { AddWorkoutForm, SubmittingState } from './AddWorkoutForm';

type Props = {
  modalDisclosure: UseDisclosureReturn;
};

/**
 * Opens a modal overlay with the add workout form
 * @param modalDisclosure to set whether modal is visible
 * @returns
 */
export const AddWorkoutModal: React.FC<Props> = ({ modalDisclosure }) => {
  const [submittingState, setSubmittingState] =
    React.useState<SubmittingState>('idle');

  if (submittingState === 'isSubmitted') {
    modalDisclosure.onClose();

    // Restore state so modal can re-open again sucessfully
    setSubmittingState('idle');
  }
  return (
    <>
      <Modal
        blockScrollOnMount={false}
        isOpen={modalDisclosure.isOpen}
        onClose={modalDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Add new workout</ModalHeader>
          <ModalBody>
            <AddWorkoutForm
              showSubmitButton={false}
              updateSubmitState={setSubmittingState}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              isLoading={submittingState === 'isSubmitting'}
              form="addWorkoutForm"
              type="submit">
              Add Workout
            </Button>
            <Button variant="ghost" onClick={modalDisclosure.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
