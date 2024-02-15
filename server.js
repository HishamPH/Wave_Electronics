const express = require('express');
const session = require('express-session');
require('dotenv').config();
const bodyParser = require('body-parser');
const {v4:uuidv4}=require('uuid');
const nocache = require('nocache');
const db = require('./config/db');
const PORT = 3000;
const app = express();
const Category = require("./models/category");

const adminRouter = require('./routes/admin')
const userRouter = require('./routes/user')

const cors = require('cors');

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
  delete req.session.message;
  next();
})

// app.use(express.static('views'))

const isAuthenticatedAdmin = (req, res, next) => {
  if(req.session && req.session.admin){
    next();
  }else {
    res.redirect('/admin');
  }
};

function checkAuthenticated(req,res,next){
  if(req.session.username){
    res.redirect('/admin/panel');
  }
  next();
}


app.get('/admin/panel',isAuthenticatedAdmin,(req,res)=>{
  res.render('admin/index');
});

app.get("/admin",checkAuthenticated,(req,res)=>{
  if(req.session.admin){
      res.redirect('/admin/panel')
  }else res.render("admin/admin_login")
})
app.post("/admin/login",(req,res)=>{
  const admin_id="admin@gmail.com";
  const admin_password='admin123'
  if(admin_id==req.body.adminname&&admin_password==req.body.password){
      req.session.admin=true
      res.redirect("/admin/panel")
  }
  
})

app.get("/user/logout",(req,res)=>{
  req.session.destroy();
  res.redirect('/user/landpage');
})

app.use('/admin',adminRouter)
app.use('/user',userRouter);
app.listen(PORT,()=>{
  console.log(`server running on port ${PORT}`)
});
