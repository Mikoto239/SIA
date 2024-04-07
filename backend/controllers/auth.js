const User = require('../models/user');
const Code = require('../models/code');
const ErrorRespond = require('../utils/errorResponds');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("373547344231-ft1oo9dvva0qkbvu4aqhv8f4f82dunbu.apps.googleusercontent.com");
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const CalendarEvent = require('../models/calendarevent')

exports.signup= async (req,res,next)=>{
  const {email,role} = req.body;
  const userexist = await User.findOne({email});
      if(userexist)
      {
        return next(new ErrorRespond("Email is Already exist!",400))
      }
      try{
        const user = await User.create(req.body);
          res.status(200).json({success:true,user});
      } 
      catch(error) {
          next(error)
        }
}

exports.login = async (req, res, next) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '373547344231-ft1oo9dvva0qkbvu4aqhv8f4f82dunbu.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    const emailFromGoogle = payload.email;

    // Check if the email domain is buksu.edu.ph
    // if (!emailFromGoogle.endsWith('.buksu.edu.ph')) {
    //   console.log('JSON Response:', JSON.stringify(invalidUserAccessResponse, null, 2));
    //   return next(new ErrorRespond('You are invalid to access', 400));
    // }

    const user = await User.findOne({ email: emailFromGoogle });

    if (!user) {
      const userNotFoundResponse = {
        success: false,
        message: 'User not found'
      };

      console.log('JSON Response:', JSON.stringify(userNotFoundResponse, null, 2));
      return next(new ErrorRespond('User not found', 404));
    }

    const tokenToSend = await user.webtokenjwt();

    const successResponse = {
      success: true,
      token: tokenToSend
    };

    console.log('JSON Response:', JSON.stringify(successResponse, null, 2));

    res.status(200).json(successResponse);
  } catch (error) {
    const verificationErrorResponse = {
      success: false,
      message: 'Unable to verify Google token'
    };

    console.log('JSON Response:', JSON.stringify(verificationErrorResponse, null, 2));

    next(new ErrorRespond('Unable to verify Google token', 400));
  }
};


exports.logout = (req,res)=>{
    res.clearCookie('token');
    res.status(200).json({success:true,message:"log out"});
  }


exports.singleuser = async(req,res,next)=>{
  try{
        const user = await User.findById(req.params.id);
          res.status(200).json({success:true,user});
          
      } 
      catch(error) {
        next(error);
        }
  }
  
  exports.Userprofile = async (req, res, next) => {
    try {
      const user = req.user; 
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error fetching user profile' });
    }
  };




  exports.invite = async (req, res, next) => {
    try {
      const { recipient, subject, message, code, role } = req.body;
      const sender = req.body.sender;
  
      // Save code to the database
      const savedCode = await Code.create({ code: code, role: role });
  
      // Send email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: sender, // Your Gmail address
          pass: process.env.GMAIL_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: sender,
        to: recipient,
        subject: subject,
        text: message,
      };
  
      const info = await transporter.sendMail(mailOptions);
  
      console.log('Email sent: ' + info.response);
      res.status(200).json({ success: true, savedCode, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'There are Somethinfg error happened, Please trye again!' });
    }
  };



  exports.verifycode = async (req, res, next) => {
    const code = req.body.code;
  
    try {
      const user = await Code.findOne({ code: code });
  
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid verification code.' });
      }
  
       
      res.json({ success: true, message: 'Verification successful.', code:user });
      
  
    } catch (error) {
      console.error('Error in code verification:', error);
      res.status(500).json({ success: false, message: 'Internal server error during code verification.' });
    }
  };
  

  exports.deletecode = async (req,res,next) =>{
    const code = req.body.code;
  
    try {
      const user = await Code.findOneAndDelete({ code: code });
  
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid verification code.' });
      }
  
       
      res.json({ success: true, message: 'Successfully deleted.'});
      
  
    } catch (error) {
      console.error('Error in code verification:', error);
      res.status(500).json({ success: false, message: 'Internal server error during code verification.' });
    }
  }

  exports.updaterole = async (req, res, next) => {
 const {email,role,department} = req.body;
  
    try {
      const user = await User.findOneAndUpdate(
        { email: email },
        { $set: { role: role, department: department } },
        { new: true }
      );
  
      if (!user) {
        return res.status(400).json({ success: false, message: 'Error Update role' });
      }
  
      res.json({ success: true, user: user });
  
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ success: false, message: 'Internal server error during role update.' });
    }
  };
  

  exports.getmyrole = async (req, res, next) => {
    try {
      const code = req.body.code;
  
      const myrole = await Code.findOne({ code: code });
  
      if (!myrole) {
        return res.status(500).json({ success: false, message: 'Error getting the role' });
      }
  
  
      res.json({ success: true, code: code, role: myrole });
    } catch (error) {
      console.error('Error in getmyrole:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  exports.getalluser = async (req, res, next) => {
    try {
      const users = await User.find();
  
      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'No users found' });
      }
  
      return res.status(200).json({ success: true, users });
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  exports.deleteuser = async (req, res, next) => {
    try {
      const email = req.body.email;
  
      const deletecomplete = await User.findOneAndDelete({ email: email });
  
      if (!deletecomplete) {
        return res.status(404).json({ success: false, message: "Unable to delete or user not found" });
      }
  
      return res.status(200).json({ success: true, message: "User has been deleted" });
  
    } catch (error) {
      console.error('Error in deleteuser:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  exports.getallbsat = async (req,res,next) =>{
    try{  
      const bsatuser = await User.find({department:'Bachelor of Science in Automotive Technology'})
       return res.status(200).json({success:true, bsatuser})
    }catch(error){
        res.status(404).json({success:false, message:"unable to retrive"})
    }
  }

  exports.getallbsit = async (req,res,next) =>{
    try{
      const bsituser = await User.find({department:'Bachelor of Science and Information Technology'})
      return res.status(200).json({success:true, bsituser})
    }catch(error){
      res.status(404).json({success:false, message:"unable to retrive"})
  }
  }

  exports.getallbsft = async (req,res,next) =>{
    try{
      const bsftuser = await User.find({department:'Bachelor of Science in Food Technology'})
      return res.status(200).json({success:true,bsftuser})
    }catch(error){
      res.status(404).json({success:false, message:"unable to retrive"})
  }
  }

exports.getallbset  = async (req,res,next) =>{
  try{
    const bsetuser = await User.find({department:'Bachelor of Science in Electrical Technology'})
    return res.status(200).json({success:true,bsetuser})
  }
  catch(error){
    res.status(404).json({success:false, message:"unable to retrive"})
}
}

exports.getrole = async (req,res,next) =>{
  try{
    const baseonrole = await User.aggregate([
      { $sort: { role: 1 } },
      { $addFields: { sortOrder: { $cond: { if: { $eq: ['$role', 1] }, then: 0, else: 1 } } } },
      { $sort: { sortOrder: 1 } }
    ]).exec();

    return res.status(200).json({success:true,baseonrole})
  }
  catch(error){
    res.status(404).json({success:false, message:"unable to retrive"})
}
}



exports.updateuserrole= async (req, res, next) => {
  const {email,role} = req.body;
   
     try {
       const user = await User.findOneAndUpdate(
         { email: email },
         { $set: { role: role } },
         { new: true }
       );
   
       if (!user) {
         return res.status(400).json({ success: false, message: 'Error Update role' });
       }
   
       res.json({ success: true, user: user });
   
     } catch (error) {
       console.error('Error updating user role:', error);
       res.status(500).json({ success: false, message: 'Internal server error during role update.' });
     }
   };



  exports.createevent = async (req, res, next) => {
    try {
      const { useremail,summary, description, startDateTime, endDateTime } = req.body;
  
     const donecreate = await CalendarEvent.create({useremail,title:summary,description,startDateTime,endDateTime})
     
  
      res.status(200).json({ success: true, donecreate});
    } catch (error) {
      console.error('Error creating event:', error);
      next(new ErrorRespond('Unable to make event', 400));
    }
  };
  
  exports.showAllevent = async (req, res, next) => {
    try {
      const { useremail,date} = req.body; 
      

      const showEvent = await CalendarEvent.find({
        useremail: useremail,
        startDateTime: { $gte: new Date(date), $lt: new Date(date).setDate(new Date(date).getDate() + 1) }
      }).lean(); //

      if (!showEvent) {
        return res.status(200).json({ success: true, showmyEvents: [] });
      }
      
      const showmyEvents = showEvent.map((event) => ({ ...event, type: 'event' }));
      res.status(200).json({ success: true, showmyEvents });
    } catch (error) {
      console.error('Error retrieving events', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  exports.Eventonthismonth = async (req, res, next) => {
    try {
      const { email } = req.body;
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
      const myEvent = await CalendarEvent.find({
        useremail: email,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });
  
      res.json({ events: myEvent });
    } catch (error) {
      console.error('Error retrieving events', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  