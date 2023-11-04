import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../config/chatLogics";
import { ChatState } from "../contexts/ChatProvider";
import { Avatar, Text, Tooltip } from "@chakra-ui/react";
import {DateTime} from 'luxon'

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  return (
    <>
      <ScrollableFeed>
        {messages &&
          messages.map(( message,i) => {
            // Assuming you have retrieved a MongoDB date from your data
            const utcDateTimeString = message.createdAt;

            // Create a DateTime object using the UTC date-time string
            const utcDate = DateTime.fromISO(utcDateTimeString, {
              zone: "utc",
            });

            // Convert to Nepal Standard Time (NST)
            const nepalDateTime = utcDate.setZone("Asia/Kathmandu");

            // Format the date-time in Nepal Standard Time
            const formattedDateTime = nepalDateTime.toFormat("HH:mm");
            return <div style={{ display: "flex" }} key={message._id}>
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
                >{message.content}
                <Text fontSize={'0.6rem'} display={'felx'} justifyContent={'flex-end'} width={'100%'}>{formattedDateTime}</Text>
                </span>
            </div>

        })}
      </ScrollableFeed>
    </>
  );
};

export default ScrollableChat;
