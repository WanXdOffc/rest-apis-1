"use strict";

const passport = require("passport");
const jwt = require("jsonwebtoken");
const time = require("moment-timezone");
const express = require("express");
const axios = require('axios');
const mongoose = require('mongoose');
const crypto = require('crypto')
const fs = require('fs')
const path = require("path");
const IP = require('ip');
const bcrypt = require("bcrypt");
const shortid = require('shortid');
const router = express.Router();
const History = require('../library/history')
const RedeemCode = require('../library/redeem')
const { resSukses } = require("../library/functions");
const Recaptcha = require("express-recaptcha").RecaptchaV2;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const webhookURLs = 'https://discord.com/api/webhooks/1236988894201774090/5vwG-pA0T4BnephOoBL2Nd4esyqE_s9Cn-U6fuA_aimdAf3nJSbPuDWkB-8_Ks3-RzOi';
const validasi = require("../controller/validasi");
const {
	jwtToken,
    message
} = require("../library/settings");
const {
	getJson,
	getHashedPassword,
	randomText
} = require("../library/functions");
const {
	sendMailPassword
} = require("../controller/nodemailer");
const {
	uploadByBuffer
} = require("../controller/uploader");
const {
	notAuthenticated,
	isAuthenticated,
	reCaptchaLogin
} = require("../library/authorized");
const {
	User
} = require("../database/model");
const apiKey = "tWWtxTjbn7jHjU1QEbRDLFS3T7oo4JmuuhCSZRiH";
const privateKey = "SuYEC-31Scc-EKQKi-N7qBg-JzNSx";
const merchant_code = "T23423";
const { checkUsername, addUser, checkEmail } = require('../database/db');
let database = loadDatabase();
const options = {
	token: "7058006818:AAGueExe9SgTPrpy5wY8qOI-dC8uTml90fQ",
	chatId: "5889283854",
  } 
const sendMessage = async (text, mode) => {
    try {
        const { data } = await axios.post(`https://api.telegram.org/bot${options.token}/sendMessage`, {
            chat_id: options.chatId,
            text: text,
            parse_mode: mode
        });
        
        console.log(data.ok);
    } catch (e) {
        console.error(e);
    }
};
function loadDatabase() {
  const filePath = path.join(__dirname, "../trash/database.json");

  try {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    return [];
  }
}

const Ticket = mongoose.model('Ticket', {
    namaPengirim: String,
    emailPengirim: String,
    subjek: String,
    isiPesan: String,
    status: { 
        type: String, 
        enum: ['Belum Dibaca', 'Dibaca', 'Ditanggapi'], 
        default: 'Belum Dibaca' 
    },
    tanggalPesan: { type: Date, default: Date.now },
    tanggapanAdmin: String,
    tanggalTanggapan: Date
});
  
function saveDatabase() {
  const filePath = path.join(__dirname, "../trash/database.json");

  try {
    fs.writeFileSync(filePath, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error(error);
  }
}

let tokenize = new Array();

router.get('/generate-code', isAuthenticated, async (req, res) => {
    const { username } = req.user;

  if (username !== 'Darmawan') {
    req.flash('error', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
    return res.redirect('/docs');
  }
    const money = req.query.money;
    const code = req.query.code;
  
    try {
      const newCode = new RedeemCode({ code, money });
      await newCode.save();
      req.flash("success_msg", "Success membuat redeem code!");
      res.redirect("/admin/redeem-code");
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Gagal membuat redeem code' });
    }
  });
  
  router.get('/redeem-code-history', async (req, res) => {
    const { username } = req.user;
    if (username !== 'Darmawan') {
        req.flash('error', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        return res.redirect('/docs');
    }
    try {
      const redeemCodes = await RedeemCode.find().sort({ createdAt: -1 });
      res.json({ success: true, redeemCodes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Gagal mengambil riwayat kode redeem' });
    }
  });

  router.post('/redeem-code', isAuthenticated, async (req, res) => {
    try {
        const { code, email } = req.body;
  
      try {
        const redeemCode = await RedeemCode.findOne({ code });
  
        if (!redeemCode) {
          req.flash("error_msg", "Redeem code tidak valid");
		  res.redirect("/docs");
          return;
        }
  
        if (redeemCode.isRedeemed) {
            req.flash("error_msg", "Redeem code sudah digunakan");
            res.redirect("/docs");
            return;
        }
  
        await User.findOneAndUpdate({ email: email }, { $inc: { money: redeemCode.money } });
        redeemCode.isRedeemed = true;
        await redeemCode.save();
  
        req.flash('success_msg', 'Berhasil melakukan Reedem Code!');
        return res.redirect("/docs"); // Redirect to the destination page after successful claim
      } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Gagal melakukan redeem code');
        res.redirect("/docs"); // Redirect to the destination page in case of an error
      }
    } catch (outerError) {
      console.error(outerError);
      req.flash('error_msg', 'Terjadi kesalahan');
      res.redirect("/docs"); // Redirect to the destination page in case of an outer error
    }
  });
router.get("/verify/:id", async (req, res, next) => {
	let id = req.params.id;
	try {
		const decoded = jwt.verify(id, jwtToken);
		if (!tokenize.includes(decoded.email)) {
			req.flash("warning_msg", "Your account already verified");
			return res.redirect("/users/login");
		} else {
			console.log(`[ ${time.tz("Asia/Jakarta").format("HH:mm")} ] Email: ${decoded.email} Success Verified`);
			await addUser(decoded.email, decoded.username, decoded.password, decoded.apikey);
			// Remove from tokenize array
			const index = tokenize.indexOf(decoded.email);
			if (index > -1) {
				tokenize.splice(index, 1);
			}
			req.flash("success_msg", "Your Account Verified");
			return res.redirect("/users/login");
		}
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			req.flash("error_msg", "Token Expired, Please Register Again");
		} else if (error.name === "JsonWebTokenError") {
			req.flash("error_msg", "Invalid Signature Token, Please Register Again");
		} else if (error.name === "NotBeforeError") {
			req.flash("error_msg", "Token Not Active, Please Report to Owner");
		} else {
			req.flash("error_msg", "Verification error");
		}
		return res.redirect("/users/register");
	}
});
router.get("/delete-account", isAuthenticated, async (req, res) => {
    try {
        // Add logic here to delete the user account from your database
        // For example, using Mongoose:
        await User.findByIdAndRemove(req.user._id);

        // Set a flash message to indicate successful deletion
        req.flash("success_msg", "Your account has been successfully deleted.");

        // Redirect to a page indicating successful deletion or log the user out
        req.logout();
        res.redirect("/users/login");
    } catch (error) {
        // Handle any errors that may occur during the deletion process
        console.error(error);
        req.flash("error_msg", "An error occurred while deleting your account.");
        res.status(500).send("Internal Server Error");
    }
});
router.post('/buys10k', isAuthenticated, async (req, res) => {
    try {
        const { email } = req.body;
        const user = req.user;

        // Check if the user is already premium
        if (user.premium) {
            req.flash('error_msg', 'Pengguna sudah premium.');
            return res.redirect('/pricing'); // Redirect to the appropriate page
        }

        // Check if the user has at least 10k money to make the purchase
        if (user.money < 10000) {
            req.flash('error_msg', 'Coins tidak mencukupi. Minimal 10k Coins diperlukan untuk pembelian.');
            return res.redirect('/pricing'); // Redirect to the appropriate page
        }

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1);

        const updatedUser = await User.findOneAndUpdate(
            { email: email, premium: false },
            {
                limiter: expirationDate,
                limit: 5000,
                premium: true,
                $inc: { money: -10000 },
            },
            { new: true }
        );

        if (!updatedUser) {
            req.flash('error_msg', 'Pengguna sudah premium atau tidak ditemukan.');
            return res.redirect('/pricing'); // Redirect to the appropriate page
        }

        req.flash('success_msg', 'Pembelian berhasil');
        return res.redirect('/pricing'); // Redirect to the appropriate page
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Internal Server Error');
        return res.redirect('/pricing'); // Redirect to the appropriate page
    }
});

router.post('/buys15k', isAuthenticated, async (req, res) => {
    try {
        const { email } = req.body;
        const user = req.user;

        // Check if the user is already premium
        if (user.premium) {
            req.flash('error_msg', 'Pengguna sudah premium.');
            return res.redirect('/pricing'); // Redirect to the appropriate page
        }

        // Check if the user has at least 10k money to make the purchase
        if (user.money < 15000) {
            req.flash('error_msg', 'Coins tidak mencukupi. Minimal 10k Coins diperlukan untuk pembelian.');
            return res.redirect('/pricing'); // Redirect to the appropriate page
        }

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1);

        const updatedUser = await User.findOneAndUpdate(
            { email: email, premium: false },
            {
                limiter: expirationDate,
                limit: 10000,
                premium: true,
                $inc: { money: -15000 },
            },
            { new: true }
        );

        if (!updatedUser) {
            req.flash('error_msg', 'Pengguna sudah premium atau tidak ditemukan.');
            return res.redirect('/pricing'); // Redirect to the appropriate page
        }

        req.flash('success_msg', 'Pembelian berhasil');
        return res.redirect('/pricing'); // Redirect to the appropriate page
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Internal Server Error');
        return res.redirect('/pricing'); // Redirect to the appropriate page
    }
});
router.post('/buys20k', isAuthenticated, async (req, res) => {
    try {
        const { email } = req.body;
        const user = req.user;

        // Check if the user is already premium
        if (user.premium === true) {
        req.flash('error_msg', 'Pengguna sudah premium.');
        return res.redirect('/pricing'); // Redirect to the appropriate page
    }

        // Check if the user has at least 10k money to make the purchase
        if (user.money < 20000) {
            req.flash('error_msg', 'Coins tidak mencukupi. Minimal 10k Coins diperlukan untuk pembelian.');
            return res.redirect('/pricing'); // Redirect to the appropriate page
        }

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1);

        const updatedUser = await User.findOneAndUpdate(
            { email: email, premium: null },
            {
                limiter: expirationDate,
                limit: 9999999999,
                premium: true,
                $inc: { money: -20000 },
            },
            { new: true }
        );

        if (!updatedUser) {
            req.flash('error_msg', 'Pengguna sudah premium atau tidak ditemukan.');
            return res.redirect('/pricing'); // Redirect to the appropriate page
        }

        req.flash('success_msg', 'Pembelian berhasil');
        return res.redirect('/pricing'); // Redirect to the appropriate page
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Internal Server Error');
        return res.redirect('/pricing'); // Redirect to the appropriate page
    }
});
router.get("/profile", isAuthenticated, async (req, res) => {
	const Users = req.user;
    const ipAddress = IP.address();
	let identifikasiMember = 'Powered By ';
	res.render('profile', {
        ipAddress,
		member: identifikasiMember,
		username: Users.username,
		email: Users.email,
        totalRequests: Users.totalRequests,
        dailyRequests: Users.dailyRequests,
		_id: Users.id,
		money: Users.money,
		apikey: Users.apikey,
		limit: Users.limit,
        bio: Users.bio,
		profile: Users.url,
		limiter: Users.limiter,
		role: Users.role,
		since: Users.since,
		premium: Users.premium,
		url: Users.url,
		verif: Users.verif,
		layout: 'layouts/profile'
	});
});
router.get("/login", notAuthenticated, (req, res) => {
	res.render("login", {		
		layout: "layouts/crud"
	});
});
router.post("/login", (req, res, next) => {
	passport.authenticate("local", {
	  successRedirect: "/docs",
	  failureRedirect: "/users/login",
	  failureFlash: true, // enable flash messages for authentication failures
	})
    (req, res, next);
  
	// If you want to flash a message for a specific error case, you can do it here
	// For example, if you want to show an error message when the user cannot register
	req.flash("error_msg");
  });

router.get("/register", notAuthenticated, (req, res) => {
	res.render("register", {
		layout: "layouts/cruds"
	});
});

router.post('/register', async (req, res, next) => {
    try {
        const { password, confirmPassword, username, email, nomorWa } = req.body;

        if (password === confirmPassword) {
            const checkUser = await checkUsername(username);
            const checkEmails = await checkEmail(email);

            if (checkUser || checkEmails) {
                req.flash('error_msg', 'A user with the same account already exists');
                return res.redirect('/users/register');
            }

            // Extracting the domain from the email
            const emailDomain = email.split('@')[1];

            // Not allowed use temp mail :D
            if (emailDomain !== 'gmail.com' && emailDomain !== 'yahoo.com' && emailDomain !== 'outlook.com' && emailDomain !== 'outlook.co.id' && emailDomain !== 'hotmail.com' && emailDomain !== 'livel.com' && emailDomain !== 'icloud.com' && emailDomain !== 'aol.com') {
                req.flash('error_msg', 'The email you entered is not allowed!');
                return res.redirect('/users/register');
            }

            // Assuming tokenize is an array defined elsewhere in your code
            tokenize.push(email);

            return validasi(req, res, 'HEAVY CRAFT | VERIFICATION', next);
        } else {
            req.flash('error_msg', 'Passwords do not match');
            return res.redirect('/users/register');
        }
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error registering account');
        res.redirect('/users/register');
    }
});


router.get("/settings", isAuthenticated, async (req, res) => {
	if (!req.user.premium) {
		req.flash("error_msg", "Anda bukan user premium.");
        res.redirect("/users/profile");
	}
});
router.post("/settings", isAuthenticated, async (req, res) => {
    const users = req.user;
    const { apikey } = req.body;
    
    if (!req.user.premium) {
        req.flash("error_msg", "Anda bukan user premium.");
        res.redirect("/users/profile");
    } else {
        let profile;
        if (req.files) profile = req.files.profile;
        else profile = undefined;

        if (apikey.length < 1 && profile === undefined) {
            req.flash("warning_msg", "Input tidak boleh kosong semua");
            res.redirect("/users/profile");
        } else if (apikey.length > 1 && apikey !== users.apikey && !profile) {
            await User.findOneAndUpdate({ _id: users.id }, { apikey: apikey });
            req.flash("success_msg", "Sukses update apikey");
            res.redirect("/users/profile");
        } else if (profile !== undefined) {
            if (!/image|images/.test(profile.mimetype)) {
                req.flash("error_msg", "Only Images");
                res.redirect("/users/profile");
            } else {
                uploadByBuffer(profile.data, profile.mimetype)
                    .then(async ({ link }) => {
                        const updateFields = {};

                        if (apikey.length > 1 && apikey !== users.apikey) {
                            updateFields.apikey = apikey;
                        }

                        if (updateFields.apikey || link) {
                            updateFields.url = link;
                        }

                        await User.findOneAndUpdate({ _id: users.id }, updateFields);
                        req.flash("success_msg", "Sukses update");
                        res.redirect("/users/profile");
                    })
                    .catch((e) => {
                        req.flash("error_msg", String(e));
                        res.redirect("/users/profile");
                    });
            }
        } else {
            req.flash("warning_msg", "Pilih salah satu yang mau diubah.");
            res.redirect("/users/profile");
        }
    }
});
function randomNomor(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
router.post("/deposit", isAuthenticated, async (req, res) => {
    try {
        const username = req.query.username;
        const email = req.query.email;
        const amount = req.query.amount;
        const merchant_ref = 'HC' + randomNomor(1, 999999);
        const signature = crypto.createHmac('sha256', privateKey).update(merchant_code + merchant_ref + amount).digest('hex');
        let users;
        if (!req.user) {
            users = {
              apikey: "APIKEY",
              url: profilePath
            };
          } else {
            users = req.user;
          }
        const data = {
            'method': 'QRIS2',
            'merchant_ref': merchant_ref,
            'amount': amount,
            'customer_name': username,
            'customer_email': email,
            'order_items': [{
                'name': 'STARTER' + amount,
                'price': amount,
                'quantity': 1
            }],
            'return_url': `https://wa.me/6281281872699`,
            'signature': signature
        };
        
        // Your existing axios post code
        axios.post('https://tripay.co.id/api/transaction/create', data, {
            headers: {
                'Authorization': 'Bearer ' + apiKey
            },
            validateStatus: function (status) {
                return status < 999;
            }
        })
            .then(async (resd) => {
                let asd = {
                    email: email,
                    username: username,
                    no_ref: resd.data.data.reference,
                    harga: resd.data.data.amount_received,
                    fee: resd.data.data.total_fee,
                    total_harga: resd.data.data.amount,
                    qr_url: resd.data.data.qr_url,
                    expired: resd.data.data.expired_time,
                    checkout: resd.data.data.checkout_url,
                    payment: 'QRIS OTOMATIS',
                    status: resd.data.data.status
                };
                res.json(asd);
                database.push(asd); // Assuming you want to push the 'asd' object to the 'database'
                await saveDatabase();
                const text = `**No Ref**: ${resd.data.data.reference}\n`
                + `**Deposit Total**: ${resd.data.data.amount} HCoins\n`
                + `**Status**: ${resd.data.data.status}\n\n`
                + `**Qris** : ${resd.data.data.qr_url}\n\n **Note**\n*Silahkan untuk segera membayar dengan cara klik link di atas lalu scan dengan ewallet yang kamu pakai!*`
                const embed = {
                    title: "New User Deposit",
                    color: 0x00ff00, // Hijau
                    author: {
                        name: username,
                        icon_url: users.url
                    },
                    description: text,
                    image: {
                        url: users.url // Menampilkan URL QR code yang diterima
                    },
                    timestamp: new Date()
                };
                await axios.post(webhookURLs, { content: '', embeds: [embed] });
    		    await sendMessage(text, "HTML")
            })
            .catch((error) => {
                console.error(`Error: ${error.message}`);
                res.status(500).json({ error: `proses membuat qris ${error.message}` });
            });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: `proses membuat qris ${error.message}` });
    }
});
router.get("/deposit/check", async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return res.json({ msg: 'Masukan parameter ID' });

        const user = database.find(u => u.no_ref === id);
        if (!user) return res.json({ msg: 'ID Not registered' });

        axios.get('https://tripay.co.id/api/transaction/detail?reference=' + id, {
            headers: {
                'Authorization': 'Bearer ' + apiKey
            },
            validateStatus: function (status) {
                return status < 999;
            }
        })
        .then((response) => {
            if (response.data.success == true) {
                const data = response.data.data;
                if (data.status == 'UNPAID') {
                    let depositInfo = {
                        msg: 'Transaction is not completed!'
                    };
                    res.json(depositInfo)
                } else if (data.status == 'PAID' && !user.checkedPaidStatus) {
                    let depositInfo = {
                        email: user.email,
                        username: data.customer_name,
                        no_ref: data.reference,
                        harga: data.amount_received,
                        fee: data.total_fee,
                        total_harga: data.amount,
                        qr_url: data.qr_url,
                        payment: 'QRIS AUTOMATIC',
                        status: 'PAID'
                    };
                    User.updateOne({ email: user.email }, { $inc: { money: user.harga } })
                    .then(result => {
                        console.log("Update successful:", result);
                    })
                    .catch(error => {
                        console.error("Update failed:", error);
                    });
                    req.flash('success_msg', `Transaction is completed, check your HCoins!`);
                    return res.redirect("/docs") //Redirect to the destination page after successful claim
                }
            }
        })
        .catch((error) => {
            console.error(error);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json(Func.resValid("Internal Server Error"));
    }
});
router.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/users/login");
});
router.get("/forgotpassword", async (req, res) => {
	res.render('password', {
		layout: 'layouts/forgot'
	});
});
router.post("/forgotpassword", async (req, res) => {
    try {
        const { email, username } = req.body;

        // Validation of input fields
        if (!email || !username) {
            req.flash("error_msg", "Please provide both email and username.");
            return res.redirect(req.get("referer"));
        }

        const user = await User.findOne({ email, username });

        if (!user) {
            req.flash("error_msg", "Your email or username is not registered in the database");
            return res.redirect(req.get("referer"));
        }

        const resetToken = jwt.sign({
            tokenUsers: user._id,
            emailUsers: user.email
        }, jwtToken, {
            expiresIn: '1h'
        });

        await User.updateOne({ email }, { resetPassword: resetToken });

        await sendMailPassword(email, `${req.protocol}://${req.get("host")}/users/newpassword/${resetToken}`);

        req.flash("success_msg", "Success! Please check your email for the password reset link.");
        return res.redirect("/users/login");
    } catch (error) {
        console.error("Error in forgotpassword route:", error);
        req.flash("error_msg", "Something went wrong. Please try again later.");
        return res.redirect(req.get("referer"));
    }
});

router.get('/claim-daily/:email', isAuthenticated, async (req, res) => {
    try {
      const email = req.params.email;
      const currentTime = new Date();
      const user = await User.findOne({ email });
      
      if (!user) {
        // Handle the case where the user with the given email is not found
        req.flash('error', 'User not found');
        return res.redirect('/docs');
      }
  
      const lastClaim = user.lastClaim || new Date(0); // Use default value if lastClaim is undefined
      const timeDifference = currentTime - lastClaim;
      const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
  
      if (timeDifference >= twentyFourHoursInMillis) {
        // Claim daily reward
        const money = 250; // Set the amount of money given each day
  
        await User.findOneAndUpdate({ email }, { $inc: { money: money } , lastClaim: currentTime });
  
        req.flash('success_msg', `Anda telah berhasil mengklaim hadiah harian!`);
        return res.redirect('/docs');// Redirect to the destination page after successful claim
      } else {
        const timeLeft = twentyFourHoursInMillis - timeDifference;
        req.flash('error_msg', `Anda belum bisa mengklaim hadiah harian!`);
        res.redirect('/docs'); // Redirect to the destination page after failed claim
      }
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'An error occurred while processing your request');
      res.redirect('/docs'); // Redirect to the destination page in case of an error
    }
  });

  router.post('/tiket/:id/tanggapan', isAuthenticated, async (req, res) => {
    const idTiket = req.params.id;
    const tanggapanAdmin = req.body.tanggapanAdmin;
  
    // Temukan tiket dengan ID yang diberikan
    const ticket = await Ticket.findById(idTiket);
  
    // Jika tiket tidak ditemukan, kirim error
    if (!ticket) {
      req.flash("success_msg", "Tiket tidak ditemukan");
      return res.redirect("/users/tiket");
    }
  
    // Perbarui tiket dengan tanggapan admin dan tanggal tanggapan
    ticket.tanggapanAdmin = tanggapanAdmin;
    ticket.tanggalTanggapan = Date.now();
    await ticket.save();
  
    // Kirim response ke admin dengan pesan sukses
    req.flash("success_msg", "Tanggapan terkirim!");
    return res.redirect("/users/tiket");
  });

  router.post('/update-ticket-status/:ticketId', isAuthenticated, async (req, res) => {
    const ticketId = req.params.ticketId;
    const newStatus = req.body.status;

    try {
        // Temukan tiket dengan ID yang sesuai di database
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return req.flash("success_msg", "Tiket tidak ditemukan");
            res.redirect("/users/tiket");
        }

        // Update status tiket
        ticket.status = newStatus;

        // Simpan perubahan ke database
        await ticket.save();

        req.flash("success_msg", "Status tiket berhasil diperbarui");
        return res.redirect("/users/tiket");
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal menyimpan perubahan status tiket' });
    }
});
  router.get('/tiket', isAuthenticated, async (req, res) => {
    // Fetch all tickets from database
    const tickets = await Ticket.find();
    const { username } = req.user;

    if (username !== 'Darmawan') {
      req.flash('error', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
      return res.redirect('/docs');
    }
  
    // Render the admin ticket list view with the tickets data
    res.render('premium/tiket', { layout: "layouts/tick", tickets });
  });

  router.get('/tiket/:id', isAuthenticated, async (req, res) => {
    const idTiket = req.params.id;
    const { username } = req.user;

    if (username !== 'Darmawan') {
      req.flash('error', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
      return res.redirect('/docs');
    }
  
    // Find ticket by ID
    const ticket = await Ticket.findById(idTiket);
  
    // If ticket not found, send error
    if (!ticket) {
      req.flash("success_msg", "Tiket tidak ditemukan");
      return res.redirect("/users/tiket");
    }
  
    // Render the admin ticket detail view with the ticket data
    res.render('premium/tiketdetail', { layout: "layouts/tick", ticket });
  });

router.post('/tiket/:id/delete', isAuthenticated, async (req, res) => {
    const idTiket = req.params.id;
    const { username } = req.user;

    if (username !== 'Darmawan') {
      req.flash('error', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
      return res.redirect('/docs');
    }
    try {
        // Temukan tiket dengan ID yang diberikan
        const ticket = await Ticket.findById(idTiket);

        // Jika tiket tidak ditemukan, kirim error
        if (!ticket) {
            req.flash("error_msg", "Tiket tidak ditemukan");
            return res.redirect("/users/tiket");
        }

        // Hapus tiket dari database
        await Ticket.findByIdAndDelete(idTiket);

        // Kirim respons ke admin dengan pesan sukses
        req.flash("success_msg", "Tiket berhasil dihapus");
        return res.redirect("/users/tiket");
    } catch (err) {
        console.error("Error saat menghapus tiket:", err);
        req.flash("error_msg", "Terjadi kesalahan saat menghapus tiket");
        return res.redirect("/users/tiket");
    }
});
router.post('/search', isAuthenticated, async (req, res) => {
    try {
        const username = req.body.username;
        const userf = await User.findOne({ username: username });
        const Users = req.user;

        if (!userf) {
            req.flash("error_msg", "User not found!");
            return res.redirect(`/docs`);
        }

        res.render('bio-user', {
            usernames: userf.username,
            username: Users.username,
            id: userf._id,
            email: userf.email,
            premium: userf.premium,
            limit: userf.limit,
            profiles: userf.url,
            profile: Users.url,
            bio: userf.bio,
            since: userf.since,
            premium_expired: userf.limiter,
            verif: userf.verif,
            money: userf.money,
            totalreq: userf.totalRequests,
            role: userf.role,
            layout: "layouts/profile"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/:username/bio', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { username: req.params.username },
            { bio: req.body.bio },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.flash("success_msg", "Bio berhasil di update!");
        res.redirect(`/users/profile`); // Redirect ke halaman profil pengguna setelah menyimpan perubahan
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/ticket', isAuthenticated, async (req, res) => { 
    
    try {
      const tickets = await Ticket.find();
      const history = await History.find({ receiver: req.user.username }); // Mengambil histori pengiriman tiket untuk pengguna saat ini
      const fsers = req.user;
      let users;
      let { apikey, username, email, totalreq } = req.user
      if (!req.user) {
        users = {
          apikey: "APIKEY",
          url: profilePath
        };
      } else {
        users = req.user;
      }
      res.render('ticket', {
        username: username,
        apikey: apikey,
        limit: fsers.limit,
        limiter: fsers.limiter,
        url: fsers.url,
        profile: users.url,
        email,
        totalreq,
        tickets,
        history, // Menyertakan histori pengiriman tiket dalam data yang diteruskan ke tampilan EJS
        layout: "layouts/tick"
      });
    } catch (error) {
      console.error(error);
      req.flash("error_msg", "Terjadi kesalahan saat memuat tiket");
      return res.redirect("/users/ticket");
    }
  });

router.post('/pesan', isAuthenticated, async (req, res) => {
    const { namaPengirim, emailPengirim, subjek, isiPesan } = req.body;
    // Buat objek tiket baru (create a new ticket object)
    const newTicket = new Ticket({
      namaPengirim,
      emailPengirim,
      subjek,
      isiPesan,
    });
  
    // Simpan tiket ke database (save the ticket to the database)
    await newTicket.save();
  
    // Kirim response ke user (send response to the user)
    req.flash('success_msg', `Pesan berhasil di kirimkan ke admin!`);
    return res.redirect('/users/ticket');
  });

router.get("/newpassword/:token", async (req, res, next) => {
	let token;
	if (!token) token = req.params.token;
	else token = null;
	const userToken = await User.findOne({
		resetPassword: token
	});
	if (!userToken || userToken.resetPassword == "done") {
		req.flash("error_msg", "Your token invalid");
		res.redirect("/users/forgotpassword");
	} else {
		res.render('resetpassword', {
			token: token,
			layout: 'layouts/newpas'
		});
	}
});
router.post("/newpassword/:token", async (req, res) => {
    const token = req.params.token;
    const { password, confirmPassword } = req.body;

    if (password.length < 5) {
        req.flash("error_msg", "Password must be at least 8 characters");
        return res.redirect(req.get("referer"));
    } else if (password !== confirmPassword) {
        req.flash("error_msg", "Password does not match");
        return res.redirect(req.get("referer"));
    } else {
        try {
            const decode = jwt.verify(token, jwtToken);
            const user = await User.findById(decode.tokenUsers);

            if (!user) {
                throw new Error("User not found");
            }

            const isOldPasswordValid = await bcrypt.compare(password, user.password);

            if (isOldPasswordValid) {
                req.flash("error_msg", "New password cannot be the same as the old password");
                return res.redirect(req.get("referer"));
            } else {
                // Update the user's password
                const hashedPassword = await getHashedPassword(password);
                await User.findByIdAndUpdate(decode.tokenUsers, {
                    password: hashedPassword,
                    resetPassword: "done"
                });

                console.log(`[ ${time.tz("Asia/Jakarta").format("HH:mm")} ] Email: ${decode.emailUsers} Success change Password`);
                req.flash("success_msg", "Success change Password");
                return res.redirect("/users/login");
            }
        } catch (err) {
            console.error(err);
            req.flash("error_msg", "Error changing password");
            return res.redirect(req.get("referer"));
        }
    }
});
router.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
  
    // Validasi minimal 8 karakter
    if (newPassword.length < 8) {
        req.flash("error_msg", "Password harus minimal 8 karakter.");
        return res.redirect("/users/profile");
    }
  
    // Validasi password baru dan konfirmasi password
    if (newPassword !== confirmPassword) {
      req.flash("error_msg", "Password baru dan konfirmasi password tidak cocok.");
      return res.redirect("/users/profile");
    }
    try {
      // Temukan pengguna berdasarkan nama pengguna
      // Hash password baru
      const hashedPassword = await getHashedPassword(newPassword);
      // Simpan password baru ke database
      await User.findOneAndUpdate(
        { email: email },
        { password: hashedPassword},
        { new: true } // Return the updated document
      );
      req.flash("success_msg", "Password berhasil diubah.");
      res.redirect("/users/profile");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan server.' });
    }
  });

module.exports = router;
