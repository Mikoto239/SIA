const express = require('express');
const route = express.Router();
const path = require('path');
const { createMemo, displayMemo, showusermemo, memodetails, isAcknowledgememo, read, memoIcreate, Iacknowledge, memodate, getMyNotifications, Allreport } = require('../controllers/memo');
const { isAuthenticated, isAdmin, checkRole } = require('../middleware/auth');

// Serve static files directly from the 'typememo' directory
route.post('/memo/create', createMemo);
route.get('/showmemo', showusermemo);
route.get('/memo/list', displayMemo);
route.get('/memo/details/:memoId', memodetails);
route.post('/memo/acknowledge/:memoId', isAcknowledgememo);
route.post('/Iacknowledge/:memoId', Iacknowledge);
route.post('/memo/read', read);
route.get('/memoIcreate', memoIcreate);
route.post('/memo/send-and-recieve', memodate);
route.post('/getMynotifications', getMyNotifications);
route.post('/allreport', Allreport);

// Error handling middleware
route.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = route;
