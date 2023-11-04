import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../config/chatLogics";
import { ChatState } from "../contexts/ChatProvider";
import { Avatar, Tooltip } from "@chakra-ui/react";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  return (
    <>
      <ScrollableFeed>
        {messages &&
          messages.map(( message,i) => (
            <div style={{ display: "flex" }} key={message._id}>
              {(isSameSender(messages, message, i, user._id) || isLastMessage(messages,i,user._id))
              && (
                <Tooltip label={message.sender.name} 
                placement="bottom-start"
                hasArrow
                >
                <Avatar
                    mt={'7px'}
                    mr={3}
                    size={'sm'}
                    cursor={'pointer'}
                    name={message.sender.name}
                    src={message.sender.picture}

                />
                </Tooltip>)}
                <span style={{
                    backgroundColor : message.sender._id === user._id ? '#BEE3F8' : '#B9F5D0'
                ,
                borderRadius :"20px",
                padding: "5px 15px",
                maxWidth : "75%",
                marginLeft : isSameSenderMargin(messages, message, i, user._id),
                marginTop: isSameUser(messages, message, i, user._id)?3: 10,
                }}
                >{message.content}</span>
            </div>

          ))}
      </ScrollableFeed>
    </>
  );
};

export default ScrollableChat;
