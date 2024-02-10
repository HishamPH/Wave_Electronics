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
    res.redirect('/');
  }
};

function checkAuthenticated(req,res,next){
  if(req.session.username){
    res.redirect('/home');
  }
  next();
}


app.get('/index',isAuthenticatedAdmin,(req,res)=>{
  res.render('index');
});

app.get("/",checkAuthenticated,(req,res)=>{
  if(req.session.admin){
      res.redirect('/index')
  }else res.render("admin_login")
})
app.post("/admin_login",(req,res)=>{
  const admin_id="admin@gmail.com";
  const admin_password='admin123'
  if(admin_id==req.body.adminname&&admin_password==req.body.password){
      req.session.admin=true
      res.redirect("/index")
  }
  
})


app.get("/products",(req,res)=>{
  res.render("products");
})

app.get("/addproduct",(req,res)=>{
  res.render("addproduct");
})


app.get("/category",async(req,res)=>{
  const cat = await Category.find();
  console.log(cat);
  res.render("category",{cat});
})
// console.log(Category.keys());
app.get("/addcategory",(req,res)=>{
  res.render("addcategory");
})

app.post("/addcategory",async(req,res)=>{
  const userData = await Category.create(req.body);
  res.redirect('/category')
})


app.get("/logout",(req,res)=>{
  req.session.destroy();
  res.redirect('/');
})


app.listen(PORT,()=>{
  console.log(`server running on port ${PORT}`)
});