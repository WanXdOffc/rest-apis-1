"use strict";

const __path = process.cwd();
const { User } = require("../database/model");
const { dateLimit } = require("./settings");

module.exports = async function (req, res, next) {
    let apikey = req.query.apikey;

    if (!apikey) {
        return res.json({
            status: false,
            dev: "Darmawan.",
            message: "Masukkan parameter apikey"
        });
    }

    let users = await User.findOne({ apikey: apikey });
    let expired;
    let premium = null; // Tambahkan variabel isPremium dengan nilai awal false

    if (!users) {
        expired = dateLimit;
    } else {
        expired = users.limiter;
        premium = users.premium; // Periksa apakah user merupakan premium atau bukan
    }

    let daysUser = new Date(expired).getTime();
    let daysNow = new Date().getTime();
    let distance = daysUser - daysNow;
    let result = Math.floor(distance / (1000 * 60 * 60 * 24));
    let validasi = !users || result < 1 || users.limit == 0 || users.apikey !== apikey;

    if (validasi && !premium) {
        return res.json({
            status: false,
            dev: "Darmawan.",
            msg: "Apikey is not registered or requests limit exceeded (30 req / day)."
        });
    }

    let limit; // Deklarasikan variabel limit

    if (premium) {
        limit = users.limit; // Jika user premium, gunakan limit yang ada tanpa mengurangi
    } else {
        limit = users.limit - 1; // Jika bukan user premium, kurangi limit sebanyak 1
    }

    const totalRequests = users.totalRequests + 1;

    await User.findOneAndUpdate(
        { apikey: users.apikey },
        { limit: limit }
    );
    await User.updateOne(
        { apikey: apikey },
        { totalRequests: totalRequests }
    );
    
    next();
};