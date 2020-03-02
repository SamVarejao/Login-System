const mongoose= require("mongoose");

const ItemSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true
    },  
    date:{
        type: Date,
        default: Date.now
    },
    limit:{
        type:Date
    }

})

const User= mongoose.model("User", UserSchema);
module.exports= User;