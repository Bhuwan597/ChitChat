import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../contexts/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import ConfirmModal  from '../miscellaneous/ConfirmModal'

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain , fetchMessages}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const { selectedChat, setSelectedChat, user } = ChatState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const toast = useToast();

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only Admin can Remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chats/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages()
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Remove user from group",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in Group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only Admin can Add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chats/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Add user to group",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chats/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      toast({
        title: "Group Chat Renamed Successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to rename.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              {selectedChat.users.map((u) => (
                <ConfirmModal
                key={u._id}
                action={'remove'}
                handleFunction={() => handleRemove(u)}
                >
                <UserBadgeItem
                  user={u}
                />
                </ConfirmModal>
              ))}
            </Box>
            <form>
              <FormControl display={"flex"}>
                <Input
                  placeholder="Chat Name"
                  mb={3}
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button
                  variant={"solid"}
                  colorScheme="teal"
                  ml={1}
                  isLoading={renameLoading}
                  onClick={handleRename}
                >
                  Update
                </Button>
              </FormControl>
              <FormControl>
                <Input
                  placeholder="Add User to group"
                  mb={1}
                  mt={1}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </FormControl>
            </form>
            {loading ? (
              <Spinner size={"lg"} />
            ) : (
              searchResult.map((u) => {
                return (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleAddUser(u)}
                  />
                );
              })
            )}
          </ModalBody>

          <ModalFooter>
          {/* onClick={() => handleRemove(user)} */}
            
            <ConfirmModal action={'leave'} handleFunction={()=>handleRemove(user)} >
            <Button  colorScheme="red">
              Leave Group
            </Button>
            </ConfirmModal>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
