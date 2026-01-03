const mongoose = require('mongoose');

const redeemCodeSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    money: { type: Number },
    isRedeemed: { type: Boolean, default: false },
  });
  
  const RedeemCode = mongoose.model('RedeemCode', redeemCodeSchema);
  module.exports = RedeemCode;