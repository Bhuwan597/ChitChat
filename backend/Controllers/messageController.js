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
    const isAccessible = await Chat.find({
            users: { $elemMatch: { $eq: req.user._id } } 
    })
    if(isAccessible.length ===0){
        res.status(401)
        throw new Error('You are not part of this chat!')
    }
    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }
    try {
        let message = await Message.create(newMessage)
        message = await message.populate('sender', 'name picture email')
        message = await message.populate('chat')
        message = await User.populate(message, {
            path : 'chat.users',
            select: 'name picture email'
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
            if(!(messages[0].chat.users.includes(req.user._id))){
                res.status(401)
                throw new Error('You are not part of this chat!')
            }
            res.json(messages)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
)


module.exports = {sendMessage, allMessages}