import React, { useEffect, useState } from "react";
import { ChatState } from "../contexts/ChatProvider";
import { Box, Button, Stack, useToast, Text, Avatar } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getAnotherUserProfilePicture, getSender, isSameUser, isYou } from "../config/chatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";
const { DateTime } = require("luxon");

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setUser, user, setSelectedChat, selectedChat, chats, setChats } =
    ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chats", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
    setLoading(false);
  };
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);
  return (
    <>
      <Box
        display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
        flexDir={"column"}
        alignItems={"center"}
        p={3}
        bg={"white"}
        w={{ base: "100%", md: "31%" }}
        borderRadius={"lg"}
        borderWidth={"1px"}
      >
        <Box
          px={3}
          pb={3}
          fontSize={{ base: "28px", md: "30px" }}
          fontFamily={"Work sans"}
          display={"flex"}
          w={"100%"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          My Chats
          <GroupChatModal>
            <Button
              display={"flex"}
              fontSize={{ base: "17px", md: "10px", lg: "17px" }}
              rightIcon={<AddIcon />}
            >
              New Group Chat
            </Button>
          </GroupChatModal>
        </Box>
        <Box
          display={"flex"}
          flexDir={"column"}
          p={3}
          bg={"#F8F8F8"}
          w={"100%"}
          h={"100%"}
          borderRadius={"lg"}
          overflow={"hidden"}
        >
          {loading ? (
            <ChatLoading />
          ) : (
            <>
              {chats ? (
                <Stack overflowY={"scroll"}>
                  {chats.length > 0 &&
                    chats.map((chat,i) => {
                      let formattedDateTime;
                      let sender = undefined;
                      let content = undefined;
                      let newUser = true;

                      if (chat.latestMessage) {
                        sender = chat.latestMessage.sender;
                        content = chat.latestMessage.content;
                        newUser = false;
                        // Assuming you have retrieved a MongoDB date from your data

                        const utcDateTimeString = chat.latestMessage.createdAt;

                        // Create a DateTime object using the UTC date-time string
                        const utcDate = DateTime.fromISO(utcDateTimeString, {
                          zone: "utc",
                        });

                        // Convert to Nepal Standard Time (NST)
                        const nepalDateTime = utcDate.setZone("Asia/Kathmandu");

                        // Format the date-time in Nepal Standard Time
                        formattedDateTime = nepalDateTime.toFormat("HH:mm");
                      }
                      return (
                        <Box
                          onClick={() => setSelectedChat(chat)}
                          cursor={"pointer"}
                          bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                          color={selectedChat === chat ? "white" : "black"}
                          px={3}
                          py={2}
                          borderRadius={"lg"}
                          key={chat._id}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                          gap={4}
                        >
                          {sender && sender._id !== user._id ? (
                            <Avatar src={sender && sender.picture} />
                          ) : (
                            <Avatar
                              src={getAnotherUserProfilePicture(
                                chat.users,
                                user
                              )}
                            />
                          )}

                          <Box width={"100%"}>
                            <Text fontWeight={"extrabold"}>
                              {!chat.isGroupChat
                                ? getSender(loggedUser, chat.users)
                                : chat.chatName}
                              {newUser && (
                                <Text
                                  fontSize={"sm"}
                                  display={"inline"}
                                  fontWeight={"semibold"}
                                >
                                  {" "}
                                  is connected with you. Tap to send message
                                </Text>
                              )}
                              {chat.isGroupChat && (
                                <Text
                                  display={"inline"}
                                  ml={2}
                                  fontSize={"0.8rem"}
                                  fontWeight={"light"}
                                >
                                  Group
                                </Text>
                              )}
                            </Text>
                            <Box
                              display={"flex"}
                              flexDirection={"row"}
                              justifyContent={"space-between"}
                              alignItems={"center"}
                              gap={2}
                              width={"100%"}
                            >
                              <div style={{ display: "flex" }}>
                                <Text fontSize={"0.8rem"} fontWeight={"bold"}>
                                  {chat.isGroupChat &&  
                                    sender.name + " :"}
                                    {(!chat.isGroupChat && !newUser && (user._id === sender._id) ) && 'You : '}
                                    {!chat.isGroupChat && !newUser && !(user._id === sender._id) && `${sender.name} : ` + ' '}
                                </Text>
                                <Text fontSize={"0.8rem"}>
                                  {content &&
                                    (content.length > 30
                                      ? content.slice(0, 30) + "......."
                                      : content.slice())}
                                  {}
                                </Text>
                              </div>
                              <Text>{formattedDateTime}</Text>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                </Stack>
              ) : (
                <ChatLoading />
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default MyChats;
