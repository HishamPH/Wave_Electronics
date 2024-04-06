const mongoose=require('mongoose')
require('dotenv').config()

const MONGO_ATLAS_URL = process.env.MONGO_ATLAS_URL

const MONGODB_URL=process.env.MONGO_URL

mongoose.connect(MONGODB_URL)
.then((msg)=>{
  console.log('db connected')
})
.catch((err)=>{
  console.log(err.msg)
});

mongoose.connection.on('connected',()=>{
    console.log('Connected to Database Successfully!!!')
})

mongoose.connection.on('disconnected',()=>{
    console.log('Failed to Connect the  Database!!!')
})