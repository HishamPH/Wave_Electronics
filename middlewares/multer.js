const multer = require('multer');
const path = require('path');
const SharpMulter = require('sharp-multer')

const MulterSharpResizer = require('multer-sharp-resizer')

const sharp = require('sharp');
const fs = require('fs');


const size = SharpMulter({
  imageOptions: {
    resize: { width: 300, height: 600 }
  }
});

// Use SharpMulter middleware directly
const resizeImage = multer({ size });



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  },
});
const upload = multer({ storage });
let uploadImage = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }, 
  { name: 'image3', maxCount: 1 }
])


// const resize = (req, res, next) => {
//   if (!req.files) {
//     return next();
//   }
//   console.log('hello')
//   // Process each uploaded image and resize it
//   const resizePromises = req.files.map((file) => {
//     return sharp(file.path)
//       .resize({ width: 300, height: 600 })
//       .toBuffer()
//       .then((buffer) => {
//         fs.writeFileSync(file.path, buffer); // Overwrite original file with resized image
//       });
//   });

//   // Wait for all resize operations to complete
//   Promise.all(resizePromises)
//     .then(() => {
//       next();
//     })
//     .catch((err) => {
//       next(err);
//     });
// };


module.exports = {uploadImage,resizeImage}