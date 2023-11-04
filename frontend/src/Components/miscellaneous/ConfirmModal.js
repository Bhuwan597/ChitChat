import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import React from 'react'

const ConfirmModal = ({action, handleFunction, children}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <>
        <span onClick={onOpen}>{children}</span>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Are you sure you want to perform {action} operation?</ModalHeader>
              <ModalCloseButton />
              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button variant='solid' colorScheme='red' textTransform={'capitalize'} onClick={handleFunction}>{action}</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default ConfirmModal