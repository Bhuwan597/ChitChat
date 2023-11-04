const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, picture } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields.");
  }
  const userExists = await User.findOne({ email });
  try {
    if (userExists) {
      throw new Error("User already exists. Proceed for login!");
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  const user = await User.create({
    name,
    email,
    password,
    picture,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    });
  } else {
    try {
      throw new Error("Internal Server Occured, Try Again !");
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    });
  } else {
    try {
      throw new Error("Invalid Credentials!");
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
});

const allUsers = asyncHandler(async (req,res)=>{
    const keyword = req.query.search?{
        $or : [
            {name: {$regex: req.query.search, $options: 'i'}},
            {email: {$regex: req.query.search, $options: 'i'}},
        ]
    }:{}
    const users = await User.find(keyword).find({_id:{$ne: req.user._id}}).select('-password')
    res.send(users)
    
})

module.exports = { registerUser, authUser, allUsers };
