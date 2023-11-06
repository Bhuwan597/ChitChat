const express = require('express')

const {registerUser, authUser, allUsers, updateUserInfo} = require('../Controllers/userController')

const protect = require('../middlewares/authMiddleware')

const router = express.Router()

router.route('/').post(registerUser).get(protect,allUsers)
router.route('/login').post(authUser)
router.route('/update').post(protect, updateUserInfo)

module.exports = router
