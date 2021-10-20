import {
  Center,
  Spinner,
  VisuallyHidden,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalBody,
  UseDisclosureReturn,
} from '@chakra-ui/react';

/**
 * Simple loading spinner centered on the content area
 */
export const Loading: React.FC = () => {
  return (
    <Center>
      <Spinner size="xl" color="brand.500" label="Loading..." thickness="8px" />
    </Center>
  );
};

/**
 * Loading spinner with a blocking overlay
 * @param showLoadingModal
 * @returns
 */
export const LoadingModal: React.FC<{ showLoadingModal: UseDisclosureReturn }> =
  ({ showLoadingModal }) => {
    return (
      <Modal
        isCentered
        size="xl"
        isOpen={showLoadingModal.isOpen}
        onClose={() => true}>
        <ModalOverlay />
        <ModalContent bg="transparent">
          <ModalBody>
            <Center>
              <Spinner
                size="xl"
                color="brand.500"
                label="Loading..."
                thickness="8px"
              />
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
