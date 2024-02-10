const Category = require("../models/category");

module.exports = {
  addCategory:async(req,res)=>{
    
  }
}

app.post("/addcategory",async(req,res)=>{
  await Category.create(req.body);
})