const express = require('express')

const {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup, deleteChat} = require('../Controllers/chatController')

const protect = require('../middlewares/authMiddleware')

const router = express.Router()

router.route('/').post(protect, accessChat).get(protect,fetchChats)
router.route('/delete').post(protect,deleteChat)
router.route('/group').post(protect,createGroupChat)
router.route('/rename').put(protect,renameGroup)
router.route('/groupremove').put(protect,removeFromGroup)
router.route('/groupadd').put(protect,addToGroup)

module.exports = router
