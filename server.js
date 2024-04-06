const express = require('express');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require('body-parser');
const {v4:uuidv4}=require('uuid');
const nocache = require('nocache');
const db = require('./config/db');
const PORT = 3000;
const app = express();

const cookieParser = require('cookie-parser');
const Category = require("./models/category");

const adminRouter = require('./routes/admin')
const userRouter = require('./routes/user')

const cors = require('cors');

app.use(cookieParser());

app.use(cors());
app.options('*',cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json());
const mongoose = require('mongoose')
app.set('view engine','ejs')
app.use(nocache());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true
}));


app.use((req,res,next)=>{
  res.locals.message=req.session.message;
  res.locals.name = req.session.name
  delete req.session.message;
  next();
})

// app.use(express.static('views'))

// const isAuthenticatedAdmin = (req, res, next) => {
//   if(req.session && req.session.admin){
//     next();
//   }else {
//     res.redirect('/admin');
//   }
// };

// function checkAuthenticated(req,res,next){
//   if(req.session.admin){
//     res.redirect('/admin/panel');
//   }
//   next();
// }


// app.get('/admin/panel',isAuthenticatedAdmin,(req,res)=>{
  
// });

// app.get("/admin",checkAuthenticated,(req,res)=>{
  
// })
// app.post("/admin/login",(req,res)=>{
 
// })

app.get("/user/logout",(req,res)=>{
  
  req.session.user = null;
  res.redirect('/user/landpage');
})

app.get('/admin/logout',(req,res)=>{
  req.session.admin = null;
  res.redirect('/admin');
})



app.use('/admin',adminRouter)
app.use('/user',userRouter);
app.listen(PORT,()=>{
  console.log(`server running on port ${PORT}`)
});
