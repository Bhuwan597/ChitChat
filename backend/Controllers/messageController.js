const asyncHandler = require('express-async-handler')
const Message = require('../models/MessageModel')
const User = require('../models/UserModel')
const Chat = require('../models/ChatModel')




const sendMessage = asyncHandler(async(req,res)=>{
    // return res.send(req.user)
    const {content, chatId} = req.body
    if(!content || !chatId){
        res.status(400)
        throw new Error('Invalid data passed into request')
    }
    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }
    try {
        let message = await Message.create(newMessage)
        message = await message.populate('sender', 'name picture email _id')
        message = await message.populate('chat')
        message = await User.populate(message, {
            path : 'chat.users',
            select: 'name picture email _id'
        })
        message = await Message.populate(message, {
            path : 'chat.latestMessage',
            select: 'sender',
            populate: {
                path: 'sender',
                select: '-password'
            }
        })
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage : message
        })
        res.json(message)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const allMessages = asyncHandler(
   async (req,res)=>{
        try {
            const messages = await Message.find({
                chat: req.params.chatId,
            })
            .populate('sender', 'name picture email')
            .populate('chat')
            res.json(messages)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
)


module.exports = {sendMessage, allMessages}