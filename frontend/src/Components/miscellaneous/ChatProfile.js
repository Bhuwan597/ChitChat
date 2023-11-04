import { DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { ChatState } from "../../contexts/ChatProvider";
import axios from "axios";

const ChatProfile = ({fetchAgain, setFetchAgain,userProfile, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, selectedChat, setSelectedChat } = ChatState();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const deleteConversation = async () => {
    try {
      setLoading(true);
      const config = {
        headers : {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        'api/chats/delete',
        { chatId : selectedChat._id },
        config
      );
      setLoading(false)
      setSelectedChat(null)
      setFetchAgain(!fetchAgain)
      toast({
        title: "Conversation Deleted Successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to delete the conversation",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
    setLoading(false);
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton display={"flex"} icon={<ViewIcon />} onClick={onOpen} />
      )}

      <Modal size={"lg"} isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"40px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            {userProfile.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"space-between"}
            gap={4}
          >
            <Image
              borderRadius={"full"}
              boxSize={"150px"}
              src={userProfile.picture}
              alt={userProfile.name}
            />
            <Text>Email : {userProfile.email}</Text>
          </ModalBody>

          <ModalFooter>
            <ConfirmModal
              action={"delete"}
              handleFunction={() => deleteConversation()}
            >
              <Button
                isLoading={loading}
                colorScheme={"red"}
                leftIcon={<DeleteIcon />}
                mr={2}
              >
                Delete conversation.
              </Button>
            </ConfirmModal>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChatProfile;
