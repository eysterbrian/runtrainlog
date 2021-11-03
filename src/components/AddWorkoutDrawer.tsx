import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
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
export const AddWorkoutDrawer: React.FC<Props> = ({ modalDisclosure }) => {
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
      <Drawer
        blockScrollOnMount={false}
        size="md"
        placement="right"
        isOpen={modalDisclosure.isOpen}
        onClose={modalDisclosure.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add new workout</DrawerHeader>
          <DrawerBody>
            <AddWorkoutForm
              showSubmitButton={false}
              updateSubmitState={setSubmittingState}
            />
          </DrawerBody>

          <DrawerFooter>
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
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
