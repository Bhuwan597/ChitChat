import React, { useEffect, useState } from "react";
import { ChatState } from "../contexts/ChatProvider";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon, DeleteIcon } from "@chakra-ui/icons";
import { getSender, getSenderProfile } from "../config/chatLogics";
import Profile from "./miscellaneous/Profile";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import "./style.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import animationData from "./Animation/typing.json";
import ChatProfile from "./miscellaneous/ChatProfile";
import TypingBubble from '../Components/miscellaneous/TypingBubble'
import ActiveBadge from '../Components/miscellaneous/ActiveBadge'

let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  // const ENDPOINT = 'http://localhost:3000'
  const ENDPOINT = 'https://chitchat-vvuo.onrender.com'
  const { user, selectedChat, setSelectedChat, notification, setNotification, chats, setChats } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const toast = useToast();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    preserveAspectRatio: "xMidYMid slice",
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      event.preventDefault();
      event.stopPropagation();
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        chats.map((chat,i)=>{
            chat.users.map((user,j)=>{
              if(user._id === data.sender._id && chat.chatName === 'sender' &&  selectedChat._id === chat._id && chat.latestMessage){
                chats[i].latestMessage.sender.name = 'You : '
                chats[i].latestMessage.content = data.content
               return setChats(chats)
              }
            })
        })
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        console.log(error)
        toast({
          title: "Error Occured!",
          description: "Failed to send Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  const fetchMessages = async () => {

    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id, user._id);
      socket.emit('iamonline', user._id)
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
    setLoading(false);
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);


  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if(!notification.includes(newMessageRecieved)){
          setNotification([newMessageRecieved, ...notification])
          setFetchAgain(!fetchAgain)
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
  const typingHandler = async (e) => {
    setNewMessage(e.target.value);
    const userToBeChecked = selectedChat.users.filter((u)=> u._id !== user._id)
    socket.emit("checkUserActivity", selectedChat._id, userToBeChecked[0]._id, (isActive) => {
      // Receive the server's response and update the UI
      setIsOnline(isActive);
    });
    // typing indicator
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDifference = timeNow - lastTypingTime;
      if (timeDifference >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "32px" }}
            pb={3}
            px={2}
            w={"100%"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems={"center"}
            fontWeight={"bold"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat(null)}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                {isOnline? <ActiveBadge status='online'/> :  <ActiveBadge status='offline'/>}
                <ChatProfile fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} userProfile={getSenderProfile(user, selectedChat.users)} />
              </>
            ) : (
              <>
              {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg={"#E8E8E8"}
            w={"100%"}
            h={"100%"}
            borderRadius={"lg"}
            overflowY={"hidden"}
          >
            {loading ? (
              <Spinner
                size={"xl"}
                w={20}
                h={20}
                alignSelf={"center"}
                margin={"auto"}
              />
            ) : (
              <>
                <div className="messages">
                  <ScrollableChat messages={messages} />
                </div>
                {isTyping ? (
                  <div>
                    {<TypingBubble/>}
                  </div>
                ) : (
                  <></>
                )}
              </>
            )}
            <form>
              <FormControl
                isRequired
                mt={3}
                onKeyDown={sendMessage}
                display={"flex"}
                gap={1}
              >
                <Input
                  variant={"filled"}
                  bg={"#E0E0E0"}
                  placeholder="Type a message. . . . . . . . ."
                  onChange={typingHandler}
                  value={newMessage}
                  autoComplete="off"
                />
                {/* <Button id="send-message" onClick={sendMessage} colorScheme={'yellow'} w={20} rightIcon={<ArrowForwardIcon/>}></Button> */}
              </FormControl>
            </form>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          height={"100%"}
        >
          <Text fontSize={"3xl"} pb={3} fontFamily={"Work sans"}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
