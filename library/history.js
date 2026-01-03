const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  sender: String,
  receiver: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'unread' } // 'unread' or 'read'
});

const History = mongoose.model('HistorySchema', historySchema);
module.exports = History;