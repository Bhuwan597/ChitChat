import { DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  Checkbox,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { ChatState } from "../../contexts/ChatProvider";
import axios from "axios";

const Profile = ({ userProfile, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isHidden, setIsHidden] = useState(userProfile.isHidden);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user, setUser } = ChatState();
  const [updatedName, setUpdatedName] = useState(userProfile.name);
  const handleCheckbox = (e) => {
    if (e.target.checked) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  };
  const updateStatus = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/user/update",
        {
          name: updatedName,
          isHidden: isHidden,
        },
        config
      );
      localStorage.setItem('userInfo', JSON.stringify(data))
      setUser(data)
      setLoading(false);
      toast({
        title: "Profile Updated Successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to update your status",
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
            flexDir={"column"}
            alignItems={"center"}
          >
            {userProfile.name}
            <Input
              contentEditable
              width={"400px"}
              height={"50px"}
              textAlign={"center"}
              fontSize={"1.5rem"}
              onChange={(e) => setUpdatedName(e.target.value)}
              placeholder="Update your name. . . . . . ."
            />
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

          <ModalFooter
            display={"flex"}
            justifyContent={"flex-end"}
            alignItems={"center"}
          >
            <Stack spacing={5} direction="row" mr={3} mb={3}>
              {/* {isHidden?<Checkbox isChecked onChange={(e) => handleCheckbox(e)}>
                Keep your profile secret.
              </Checkbox>: <Checkbox  onChange={(e) => handleCheckbox(e)}>
                Keep your profile secret.
              </Checkbox> } */}
              {isHidden ? (
                <Checkbox isChecked onChange={(e) => handleCheckbox(e)}>
                  Secret Profile
                </Checkbox>
              ) : (
                <Checkbox onChange={(e) => handleCheckbox(e)}>
                  Secret Profile
                </Checkbox>
              )}
            </Stack>
            <Button
              isLoading={loading}
              colorScheme="purple"
              mr={3}
              onClick={() => updateStatus()}
            >
              Update
            </Button>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Profile;
