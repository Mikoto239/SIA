const Memo = require('../models/memo');
const express= require('express');
const Notification = require('../models/notification');
const Errorrespond = require('../utils/errorResponds');
const nodemailer = require('nodemailer');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './typememo');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix  + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

exports.createMemo = async (req, res, next) => {
  try {
    // Assuming you have already configured the 'upload' middleware
    upload.single('file')(req, res, async (err) => {
      if (err) {
        // Handle any errors related to file upload
        console.error(err);
        return res.status(500).json({ success: false, error: 'File upload failed.' });
      }

      const sender = req.body.sender;
      const senderEmail = req.body.senderEmail;
      const content = req.file.filename;
      const recipients = JSON.parse(req.body.recipients);
      const title = req.body.title;
      const subject = req.body.subject;
      const message = req.body.message;

      try {
        const memo = await Memo.create({ sender, senderEmail, content, title, recipients });

        // Create notifications for each recipient
        for (const recipient of recipients) {
          await Notification.create({
            recipientEmail: recipient.useremail,
            recipientName: recipient.username, // Change this to match your recipient name field
            senderEmail,
            senderName: sender,
            type: 'New Memo',
            memoId: memo._id,
          });
        }

        res.status(201).json({ success: true, memo });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to create memo and notifications.' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Unexpected error occurred.' });
  }
};



exports.displayMemo = async (req, res, next) => {
  const pageSize = 2;
  const page = Number(req.query.pageNumber) || 1;
  const count = await Memo.find({}).estimatedDocumentCount();

  try {
    const memos = await Memo.find() // Fetch a list of memos
    .skip(pageSize * (page - 1)).limit(pageSize)
  
    res.status(200).json({ success: true, memos ,page,pages:Math.ceil(count / pageSize),count}); 
  } catch (error) {
    console.error(error);
    next(error); 
  }
};



exports.showusermemo = async (req, res, next) => {
  const email = req.query.email; 
  try {
    const showmemo = await Memo.find({ 'recipients.useremail': email });
    res.status(200).json({ success: true, showmemo });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


exports.memodetails = async (req, res, next) => {
  const memoId = req.params.memoId;

  try {
    
    const memo = await Memo.findById(memoId);

    if (!memo) {
      return res.status(404).json({ message: 'Memo not found' });
    }
 
    res.status(200).json({success:true, memo });
  } catch (error) {
    console.error('Error fetching memo details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.isAcknowledgememo = async (req, res, next) => {
  const { email,name } = req.body;
  const memoId = req.params.memoId;

  try {
    const memo = await Memo.findById(memoId);
    const senderEmail = memo.senderEmail;
    const senderName = memo.senderName;
    if (!memo) {
      return res.status(404).json({ success: false, message: 'Memo not found' });
    }

    const recipient = memo.recipients.find(recipient => recipient.useremail === email);

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found for this memo' });
    }

    await Notification.create({recipientEmail:senderEmail,recipientName:senderName,senderName:name,senderEmail:email,type:'Acknowledge',memoId:memoId})

    recipient.acknowledge = true;
    await memo.save();

    res.status(200).json({ success: true, message: 'Memo acknowledged successfully' });
  } catch (error) {
    console.error('Error acknowledging memo:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



exports.Iacknowledge = async (req, res, next) => {
  const { email } = req.body;
  const memoId = req.params.memoId;

  try {
    const memo = await Memo.findById(memoId);

    if (!memo) {
      return res.status(404).json({ message: 'Memo not found' });
    }

    const recipient = memo.recipients.find(
      recipient => recipient.useremail === email
    );

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }


    const acknowledgeStatus = recipient.acknowledge;

    res.status(200).json({ acknowledgeStatus });
  } catch (error) {
    console.error('Error in Iacknowledge:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.read = async (req, res, next) => {
  try {
    const email = req.body.email;
    const memoId = req.body.memoId;

    const memo = await Memo.findById(memoId);

    if (!memo) {
      const notFoundMemoResponse = {
        success: false,
        message: 'Memo not found'
      };

      console.log('JSON Response:', JSON.stringify(notFoundMemoResponse, null, 2));

      return res.status(404).json(notFoundMemoResponse);
    }

    const recipient = memo.recipients.find(recipient => recipient.useremail === email);

    if (!recipient) {
      const notFoundRecipientResponse = {
        success: false,
        message: 'Recipient not found for this memo'
      };

      console.log('JSON Response:', JSON.stringify(notFoundRecipientResponse, null, 2));

      return res.status(404).json(notFoundRecipientResponse);
    }

    if (recipient.read === true) {
      const alreadyReadResponse = {
        success: true
      };

      console.log('JSON Response:', JSON.stringify(alreadyReadResponse, null, 2));

      return res.status(200).json(alreadyReadResponse);
    }

    recipient.read = true;
    await memo.save();

    const successResponse = {
      success: true
    };

    console.log('JSON Response:', JSON.stringify(successResponse, null, 2));

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error acknowledging memo:', error);

    const errorResponse = {
      success: false,
      message: 'Internal server error'
    };

    console.log('JSON Response:', JSON.stringify(errorResponse, null, 2));

    res.status(500).json(errorResponse);
  }
};


exports.memoIcreate = async (req, res, next) => {
  const email = req.query.email; // Use req.query.email to get the email from the query parameters
  try {
    const showmemo = await Memo.find({ senderEmail: email });
    res.status(200).json({ success: true, showmemo });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


exports.memodate = async (req, res, next) => {
  const myemail = req.body.email;
  const memodate = req.body.date;
  try {
 

    // Retrieve sent memos
    const sentMemos = await Memo.find({
      senderEmail: myemail,
      createdAt: { $gte: new Date(memodate), $lt: new Date(new Date(memodate).getTime() + 86400000) } // 86400000 milliseconds in a day
    
    }).lean(); // Using lean() to get plain JavaScript objects

    // 
    const receivedMemos = await Memo.find({
      'recipients.useremail': myemail,
      createdAt: { $gte: new Date(memodate), $lt: new Date(new Date(memodate).getTime() + 86400000) } 

    }).lean();
    if (sentMemos.length === 0 && receivedMemos.length === 0) {
      return res.status(200).json({ success: true, showmyEvents: [] });
    }
    const sentMemosWithType = sentMemos.map(memo => ({ ...memo, type: 'Sent' }));
    const receivedMemosWithType = receivedMemos.map(memo => ({ ...memo, type: 'New Memo' }));

    const memo = [...sentMemosWithType, ...receivedMemosWithType];

    if (!memo || memo.length === 0) {
      return res.status(404).json({ success: false, message: 'No memos found' });
    }

    res.status(200).json({ success: true, memo });
  } catch (error) {
    console.error(error);
    next(error);
   
  }
};


exports.getMyNotifications = async (req, res, next) => {
  try {
    const email = req.body.email;
    const name = req.body.name;

    const ackNotifications = await Notification.find({ recipientEmail: email, type: 'Acknowledge' });

    const receivedMemos = await Notification.find({ recipientEmail: email, recipientName: name, type: 'New Memo' });

    res.json({ ackNotifications, receivedMemos });
  } catch (error) {
    console.error(error);
    next(error);
  }
};



exports.Allreport = async (req, res, next) => {
  const myemail = req.body.email;
  const month = req.body.month;
  const year = req.body.year;

  try {
    const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
    const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

    // Check if startDate is a valid date
    if (isNaN(startDate.valueOf()) || isNaN(endDate.valueOf())) {
      return res.status(400).json({ success: false, message: 'Invalid date' });
    }

    const sentMemos = await Memo.find({
      senderEmail: myemail,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    }).lean();

    const receivedMemos = await Memo.find({
      'recipients.useremail': myemail,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    }).lean();

    if (sentMemos.length === 0 && receivedMemos.length === 0) {
      return res.status(200).json({ success: true, memo: [] });
    }

    const sentMemosWithType = sentMemos.map((memo) => ({ ...memo, type: 'sent' }));
    const receivedMemosWithType = receivedMemos.map((memo) => ({ ...memo, type: 'received' }));

    res.status(200).json({
      success: true,
      receivememo: receivedMemosWithType,
      sentmemo: sentMemosWithType,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    next(error);
  }
};
