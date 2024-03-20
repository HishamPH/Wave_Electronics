const mongoose = require('mongoose');
const { Schema } = mongoose;

const walletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default:0},
  transactions:[{
    type:{ type: String, enum: ['deposit', 'withdrawal', 'purchase', 'referral_reward','refund'] },
    amount:{type:Number},
    date:{type:Date,default:Date.now}
  }] ,
  ReferrerID: { type: Schema.Types.ObjectId, ref: 'User' } 
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;