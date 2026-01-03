const mongoose = require('mongoose');
const { expiredTokenDb } = require('../library/settings');


const Users = mongoose.Schema({
	googleId: { type: String },
	githubId: { type: String },
	totalRequests: {
		type: Number,
		default: 0,
	  },
	email: {
		type: String,
		required: false
	  },
	  username: {
		type: String,
		required: true
	  },
	  ipHistory: [{ type: String, default: [] }],
	  password: {
		type: String,
		required: true
	  },
	  apikey: {
		type: String
	  },
	  phone: {
		type: String
	  },
	  bio: {
	  	type: String,
	  },
	  limiter: {
		type: String
	  },
	  role: {
		type: String
	  },
	  limit: {
		type: Number
	  },
	  lastClaim: {
		type: Number
	  },
	  money: { type: Number, 
	  default: 0 
	  },
	  since: {
		type: String
	  },
	  url: {
		type: String
	  },
	  premium: {
		type: Boolean
	  },
	  banned: {
		type: Boolean
	  },
	  verif: {
		type: Boolean
	  },
	  resetPassword: {
		type: String
	  },
	  claimHistory: [
		{
		  amount: Number,
		  timestamp: Date
		}
	  ]
	}, { versionKey: false });

module.exports.User = mongoose.model('api', Users);

const Utils = mongoose.Schema({
    total: { type: Number },
    today: { type: Number },
    visitor: { type: Number },
    util: { type: String }
}, { versionKey: false });
module.exports.Utils = mongoose.model('util', Utils);

const Token = mongoose.Schema({
    token: { type: String },
    expire_at: {
        type: Date,
        default: Date.now,
        expires: expiredTokenDb,
    }
}, { versionKey: false });
module.exports.Token = mongoose.model('token', Token);