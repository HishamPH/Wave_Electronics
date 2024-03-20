const multer = require('multer');
const path = require('path');
const SharpMulter = require('sharp-multer')

const MulterSharpResizer = require('multer-sharp-resizer')

const sharp = require('sharp');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  },
});


// const size = SharpMulter({
//   imageOptions: {
//     resize: { width: 300, height: 600 } // Resize options
//   },
//   storage: storage // Storage configuration
// });
const upload = multer({ storage });
let uploadImage = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }, 
  { name: 'image3', maxCount: 1 }
])



// const uploadImage = multer({ storage: size }).array('images', 3);





module.exports = {uploadImage}