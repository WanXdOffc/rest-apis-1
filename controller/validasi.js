"use strict";

const jwt = require("jsonwebtoken");
const {
	checkEmail
} = require("../database/db");
const {
	mail
} = require("./nodemailer");
const {
	user,
	jwtToken
} = require("../library/settings");
const {
	getHashedPassword,
	randomText
} = require("../library/functions");
const {
	sendMailRegister
} = require("./nodemailer");
const {
	htmlRegister
} = require("./config");

module.exports = async function (req, res, subject, next) {
	return new Promise(async (resolve, reject) => {
		let { username, email, password, confirmPassword } = req.body;
		let checking = await checkEmail(email);
		let data = {
			email: email,
			username: username,
			password: getHashedPassword(password),
			apikey: randomText(10)
		};
		let token = jwt.sign(data, jwtToken, { expiresIn: "1h" });
		let mailOptions = {
			from: user,
			to: email,
			subject,
			html: htmlRegister(`${req.protocol}://${req.get("host")}/users/verify/${token}`),
		};
		let patternEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		if (!/^[a-zA-Z]+$/.test(username) || username.length < 5) {
			req.flash("error_msg", "Nama pengguna minimal harus 5 karakter dan hanya mengandung huruf.");
			res.redirect("/users/register");
		} else if (email.length < 1) {
			req.flash("error_msg", "Silakan Masukkan Email");
			res.redirect("/users/register");
		} else if (checking) {
			req.flash("error_msg", "User dengan email yang sama sudah ada");
			res.redirect("/users/register");
		} else if (password.length < 1) {
			req.flash("error_msg", "Silakan masukkan kata sandi");
			res.redirect("/users/register");
		} else if (password.length < 8) {
			req.flash("error_msg", "Kata sandi minimal harus 8 karakter");
			res.redirect("/users/register");
		} else if (confirmPassword.length < 1) {
			req.flash("error_msg", "Silahkan masukan confirm password");
			res.redirect("/users/register");
		} else if (password !== confirmPassword) {
			req.flash("error_msg", "Kata sandi tidak sama");
			res.redirect("/users/register");
		} else if (!patternEmail.test(email)) {
			req.flash("error_msg", "Silakan masukkan gmail dengan benar");
			res.redirect("/users/register");
		} else {
			await sendMailRegister(mailOptions);
			resolve(data);
			req.flash("success_msg", "Periksa email anda di folder/spam untuk verifikasi!");
			res.redirect("/users/login");
		}
	});
};