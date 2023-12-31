const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const chats = require("./data/data");

const connectDB = require("./config/db");

const colors = require("colors");

const path = require('path')

const { errorHandler, notFound } = require("./middlewares/errorMiddleware");

const userRoutes = require("./Routes/userRoutes");

const chatRoutes = require("./Routes/chatRoutes");

const messageRoutes = require("./Routes/messageRoutes");

connectDB();

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/user", userRoutes);

app.use("/api/chats", chatRoutes);

app.use("/api/message", messageRoutes);

// -------------------------------Deployment-------------------
const __dirname1 = path.resolve()
if(process.env.NODE_ENV === 'productions'){
    app.use(express.static(path.join(__dirname1, "/frontend/build")))
    app.get('*', (req,res)=>{
      res.sendFile(path.resolve(__dirname1, "frontend/build", 'index.html'))
    })
}else{
  app.get('/', (req,res)=>{
    res.send('API is running successfully');
  })
}

// -------------------------------Deployment-------------------

app.use(notFound);

app.use(errorHandler);

const server = app.listen(
  process.env.PORT || 5000,
  "0.0.0.0",
  console.log(
    `Server started at: http://localhost:${process.env.PORT || 5000}`.yellow
      .bold
  )
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: `http://localhost:${process.env.PORT}`,
  },
});
const activeUsersByRoom = new Map();
io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room, userId) => {
    socket.join(room);
    if (!activeUsersByRoom.has(room)) {
      activeUsersByRoom.set(room, new Set());
    }
    activeUsersByRoom.get(room).add(userId);
    console.log("User joined room ", room);
  });
  socket.off('join chat', (room)=>{
    console.log('Chat disconnected for ', room)
  })

  socket.on('typing', (room)=> socket.in(room).emit('typing'))

  socket.on('stop typing', (room)=> socket.in(room).emit('stop typing'))

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("Chat users not defined");
    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
  socket.off('setup', ()=>{
    console.log("USEER DISCONNECTED")
    socket.leave(userData._id)
  })
  socket.on("disconnect", () => {
    console.log('Some user disconnected')
    // Handle user disconnection
    // Remove the user from the list of active users in all rooms they joined
    for (const [room, activeUsers] of activeUsersByRoom) {
      if (activeUsers.has(socket.id)) {
        activeUsers.delete(socket.id);
      }
    }
  });

  // Check if a user is active in a specific chat room
  socket.on("checkUserActivity", (room, userId, callback) => {
    const activeUsers = activeUsersByRoom.get(room) || new Set();
    const isActive = activeUsers.has(userId);
    callback(isActive);
  });
});
