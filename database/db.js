"use strict";
const {
	limitCount,
	MoneyCount,
	limitPremium,
	dateLimit,
	profilePath
} = require('../library/settings');
const {
	User
} = require('./model');

function randomText(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset.charAt(randomIndex);
    }

    return result;
}
const keys = randomText(15);

function tanggal() {
	var myMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
	var myDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum at", "Sabtu"];
	var tgl = new Date();
	var day = tgl.getDate();
	var bulan = tgl.getMonth();
	var thisDay = tgl.getDay();
	var ThisDay = myDays[thisDay];
	var yy = tgl.getYear();
	var year = (yy < 1000) ? yy + 1900 : yy;
	return `${ThisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
}

exports.addUser = async (email, username, password, apikey) => {
	let obj = {
		email,
		username,
		password,
		apikey: randomText(15),
		limiter: 0,
		limit: limitCount,
		banned: false,
		money: MoneyCount,
		role: 'Member',
		since: tanggal(),
		url: profilePath,
		premium: null,
		verif: true
	};
	return await User.create(obj);
};

async function isLimit(apikey) {
	let key = await User.findOne({apikey: apikey});
	if (key.limit <= 0){
		return true;
	} else {
		return false;
	}
}
module.exports.isLimit = isLimit

exports.checkEmail = async (gmail) => {
	let users = await User.findOne({
		email: gmail
	});
	if (users !== null) {
		return users.email;
	} else {
		return false;
	}
};

async function checkUsername(username) {
        let users = await User.findOne({username: username});
        if(users !== null) {
            return users.username;
        } else {
            return false;
        }
    }
    module.exports.checkUsername = checkUsername;

async function resetAllLimit() {
        let users = await User.find({});
        users.forEach(async(data) => {
            let { premium, username } = data
            if (premium !== null) {
                return User.updateOne({username: username}, {limit: limitPremium}, function (err, res) {
                    if (err) throw err;
                })   
            } else {
                return User.updateOne({username: username}, {limit: limitCount}, function (err, res) {
                    if (err) throw err;
                })
            }
        })
    }
    module.exports.resetAllLimit = resetAllLimit
