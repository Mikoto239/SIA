const express = require('express');
const { verify } = require('jsonwebtoken');
const route = express.Router();
const {signup,login,logout,singleuser,Userprofile,invite,verifycode,updaterole,getmyrole,getalluser, deleteuser,getallbsat,getallbsit,getallbset,getallbsft,getrole,updateuserrole, createevent,showAllevent,Eventonthismonth, deletecode } = require('../controllers/auth');
const {isAuthenticated,afterlogin,isAdmin} = require('../middleware/auth');

route.post('/signup',signup);
route.post('/login',login);
route.get('/logout',logout);
route.get('/getme',isAuthenticated,Userprofile);
route.get('/admin/dashboard', isAuthenticated, isAdmin );
route.get('/details',afterlogin,Userprofile)
route.get('/user/:id',singleuser);
route.post('/invite',invite)
route.post('/verifycode',verifycode);
route.post('/updaterole',updaterole);
route.get('/getmyrole',getmyrole);
route.get('/getallusers',getalluser)
route.post('/deletethisuser',deleteuser);
route.get('/getallbsat',getallbsat);
route.get('/getallbsit',getallbsit);
route.get('/getallbset',getallbset);
route.get('/getallbsft',getallbsft);
route.get('/role',getrole);
route.post('/updateuserrole',updateuserrole);
route.post('/create_event',createevent);
route.post('/getevent',showAllevent);
route.post('/Eventonthismonth',Eventonthismonth );
route.post('/deletecode',deletecode)

module.exports = route;