const mongoose = require('mongoose');
const offerSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories', 
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value >= 0 && value <= 100;
      },
      message: 'Percentage must be between 0 and 100'
    }
  },
  startDate:{type: Date,required: true},
  endDate:{type: Date,required: true},
  status: {type:Boolean,default:true},
});


const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;