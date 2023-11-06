const asyncHandler = require('express-async-handler')

const Chat = require("../models/ChatModel");
const User = require('../models/UserModel');
const Message = require('../models/MessageModel');

const accessChat = asyncHandler(async (req,res)=>{
    const {userId} = req.body
    if(!userId){
        console.log('Id not sent')
        return res.sendStatus(400)
    }
    
    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: req.user._id } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
      })
        .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat,{
        path : 'latestMessage.sender',
        select: 'name email picture'
    })
    if(isChat.length > 0){
        res.send(isChat[0])
    }else{
        let chatData = {
            chatName : 'sender',
            isGroupChat: false,
            users: [req.user._id, userId]
        }
        try{
            const createdChat = await Chat.create(chatData)
            const fullChat = await Chat.findOne({_id: createdChat._id}).populate('users','-password')
            return res.status(200).send(fullChat)
        }catch(error){
            res.status(400)
            throw new Error(error)
        }
    }
})


const fetchChats = asyncHandler(
    async (req,res)=>{
        try {
            Chat.find({
                users: {$elemMatch : {$eq: req.user._id}}
            })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({updatedAt:-1})
            .then(async (results)=>{
                results = await User.populate(results, {
                    path:'latestMessage.sender',
                    select: 'name email picture',
                })
                res.status(200).send(results)
            })

        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
)

const createGroupChat = asyncHandler(
    async (req,res)=>{
        if(!req.body.users || !req.body.name){
            return res.status(400).send({
                message: 'Please fill all the fields'
            })
        }
        let users = JSON.parse(req.body.users)
        if(users.length < 2){
            return res.status(400).send({
                message: 'At least 2 group members are required for group chat.'
            })
        }
        users.push(req.user)

        try {
            const groupChat = await Chat.create({
                chatName : req.body.name,
                users: users,
                isGroupChat: true,
                groupAdmin: req.user
            })
            const fullGroupChat = await Chat.findOne({
                _id: groupChat._id
            }).populate('users', '-password').populate('groupAdmin', '-password')
            res.status(200).send(fullGroupChat)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
)

const renameGroup = asyncHandler(
    async(req,res)=>{
        const {chatId, chatName} = req.body
        const updatedChat = await Chat.findByIdAndUpdate(chatId,{
            chatName
        },{
            new:true
        }).populate('users', '-password').populate('groupAdmin', '-password')

        if(!updatedChat){
            res.status(400)
            throw new Error('Chat Not Found')
        }else{
            return res.status(200).json(updatedChat)
        }
    }
)


const addToGroup = asyncHandler(
    async (req,res)=>{
        const {chatId, userId} = req.body
        const added = await Chat.findByIdAndUpdate(chatId, {
            $push : {
                users: userId
            }
        }, {new:true}).populate('users', '-password').populate('groupAdmin', '-password')

        if(!added){
            res.status(400)
            throw new Error('Chat Not Found')
        }else{
            return res.status(200).json(added)
        }
    }

)


const removeFromGroup = asyncHandler(
    async (req,res)=>{
        const {chatId, userId} = req.body
        const removed = await Chat.findByIdAndUpdate(chatId, {
            $pull : {
                users: userId
            }
        }, {new:true}).populate('users', '-password').populate('groupAdmin', '-password')

        if(!removed){
            res.status(400)
            throw new Error('Chat Not Found')
        }else{
            return res.status(200).json(removed)
        }
    }

)

const deleteChat = asyncHandler(async(req,res)=>{
    const chat = await Chat.find({
        _id: req.body.chatId,
        users: { $elemMatch: { $eq: req.user._id } },
      })
        .populate("users", "-password")
        .populate("latestMessage");

    if(chat.length !== 0){
       await Message.deleteMany({
             chat : req.body.chatId
            }); 
        return res.send(await Chat.deleteOne({ _id: req.body.chatId }))
    }
    res.status(400)
    throw new Error('Chat Not Found')
})

module.exports = {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup, deleteChat}