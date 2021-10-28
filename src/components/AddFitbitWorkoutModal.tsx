import React from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Button,
  UseDisclosureReturn,
} from '@chakra-ui/react';
import { AddWorkoutForm, SubmittingState } from './AddWorkoutForm';
import { TFitbitActivity } from 'lib/queries/fetchFitbitActivities';

/**
 *
 */
type Props = {
  modalDisclosure: UseDisclosureReturn;
  fitbitActivity?: TFitbitActivity;
};

/**
 * Opens a modal overlay with the AddWorkoutForm and default values
 * provided by the fitbitActivity
 *
 * @param modalDisclosure to set whether modal is visible
 * @param fitbitActivity provides default values for the form
 * @returns
 */
export const AddFitbitWorkoutModal: React.FC<Props> = ({
  modalDisclosure,
  fitbitActivity,
}) => {
  const [submittingState, setSubmittingState] =
    React.useState<SubmittingState>('idle');

  // React won't let us setState() on another component from within the render method of
  // this component.  So we need to call onClose() inside an effect to get it outside the render.
  React.useEffect(() => {
    if (submittingState === 'isSubmitted') {
      modalDisclosure.onClose();

      // Restore state so modal can re-open again sucessfully
      setSubmittingState('idle');
    }
  }, [submittingState, modalDisclosure]);

  return (
    <>
      <Modal
        blockScrollOnMount={false}
        size="md"
        isOpen={modalDisclosure.isOpen}
        onClose={modalDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Import Fitbit workout</ModalHeader>
          <ModalBody>
            <AddWorkoutForm
              showSubmitButton={false}
              updateSubmitState={setSubmittingState}
              fitbitActivity={fitbitActivity}
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
