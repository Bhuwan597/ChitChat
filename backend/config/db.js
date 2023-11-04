const mongoose = require('mongoose')

const dotenv = require('dotenv')

const colors = require('colors')

dotenv.config()

const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
        })
        console.log(`Database Connected ${conn.connection.host}`.green.bold)
    } catch (error) {
        console.log(`Error Occured ${error}`.red.bold)
    }
}

module.exports = connectDB