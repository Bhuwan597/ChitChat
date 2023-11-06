const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

const userModel = mongoose.Schema(
    {
        name: {type: String, required:true},
        email: {type: String, required:true, unique:true},
        password: {type: String, required:true},
        picture: {type: String, default: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=60&w=500&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D'},
        isHidden: {type: Boolean, default: false}
    }, {
        timestamps: true,
    }
)
userModel.pre('save', async function(next){
    if(!this.isModified){
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userModel.methods.matchPassword = async function(enteredpassword){
    const flag = await bcrypt.compare(enteredpassword, this.password)
    return flag
}


const User = mongoose.model('User', userModel)

module.exports = User;