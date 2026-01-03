
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: String,
    content: String,
    date: Date,
    updatedAt: Date
});

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;