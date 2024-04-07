    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');
    const webtoken = require('jsonwebtoken');

    const userSchema = new mongoose.Schema({
    name:{type:String,
          maxlength:100,
          required:[false, 'Please enter your name']
        },
        email: {
          type: String,
          unique: true,
          required: [false, "Please enter your email"], // Corrected "require" to "required"
          match: [
            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
            "Please enter a valid email", // Corrected "Please enter your valid email"
          ],
        },

        
    role:{
      type:Number,
      default:0,
    },
    department:{
      type:"String"
    ,
    },
    picture:{
      type:'String'
    },



    },{timestamps:true})


    // userSchema.pre("save", async function(next){
    // if(!this.isModified)
    // {
    //   next()
    // }
    // this.password = await bcrypt.hash(this.password, 10)
    // })

    // userSchema.methods.comparePassword = async function(yourpassword){
    //   return await bcrypt.compare(yourpassword, this.password);
    // }

    userSchema.methods.webtokenjwt = function(){
      return webtoken.sign({id: this.id}, process.env.JWT_SECRET,{
        expiresIn: 100000
      });
    }
    const user = mongoose.model("User",userSchema);
    module.exports = user;