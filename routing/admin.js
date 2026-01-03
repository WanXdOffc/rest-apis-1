const express = require('express');
const { checkUsername, resetAllLimit } = require('../database/db');
const { addPremium, deletePremium, tokens, checkPremium, changeKey, resetOneLimit, resetTodayReq } = require('../database/premium');
const { isAuthenticated, isAdmin } = require('../library/authorized');
const mongoose = require('mongoose');
const { limitCount } = require('../library/settings');
const Announcement  = require('../library/announcement');
const RedeemCode = require('../library/redeem')
const router = express.Router();
const {
	addUser,
	checkEmail
} = require("../database/db");
const {
	User
} = require("../database/model");

router.get('/', isAuthenticated, isAdmin, async (req, res) => {
	let { apikey, username, email, premium, totalreq, money} = req.user
	const fsers = req.user;
	if (!req.user) {
        users = {
            apikey: "APIKEY",
            url: "profilePath"  // Replace "profilePath" with the actual path you want to use
        };
    } else {
        users = req.user;
    }
    res.render('premium/index', {
		profile: users.url,
		username: username,
		apikey: apikey,
		email,
		money,
		limit: fsers.limit,
        layout: 'layouts/admin'
    })
})

router.get('/announcements', async (req, res) => {
	const fsers = req.user;
    const announcements = await Announcement.find();
	if (!req.user) {
        users = {
            apikey: "APIKEY",
            url: "profilePath"  // Replace "profilePath" with the actual path you want to use
        };
    } else {
        users = req.user;
    }
	res.render('premium/announcements', {
		announcements: announcements,
		layout: 'layouts/ann'
   })
});

// Rute untuk menambah pengumuman baru
router.post('/announcements/add', async (req, res) => {
    const newAnnouncement = new Announcement({
        title: req.body.title,
        content: req.body.content,
        date: new Date(),
        updatedAt: new Date()
    });

    try {
        await newAnnouncement.save();
		req.flash('success_msg', `Success adding announcement`);
        res.redirect('/admin/announcements');
    } catch (err) {
        console.error('Error adding announcement', err);
        res.status(500).send('Internal Server Error');
    }
});

// Rute untuk menghapus pengumuman
router.post('/announcements/delete/:id', async (req, res) => {
	try {
        await Announcement.findByIdAndDelete(req.params.id);
		req.flash('success_msg', `Success deleting announcement`);
        res.redirect('/admin/announcements');
    } catch (err) {
        console.error('Error deleting announcement', err);
        res.status(500).send('Internal Server Error');
    }
});

// Rute untuk menyimpan perubahan pada pengumuman
router.post('/announcements/edit/:id', async (req, res) => {
	try {
        await Announcement.findByIdAndUpdate(req.params.id, {
            title: req.body.updatedTitle,
            content: req.body.updatedContent,
            updatedAt: new Date()
        });
		req.flash('success_msg', `Success editing announcement`);
        res.redirect('/admin/announcements');
    } catch (err) {
        console.error('Error editing announcement', err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/add', isAuthenticated, isAdmin, (req, res) => {
    res.render('premium/add',  {
        layout: 'layouts/crud'
    });
});

router.get('/listuser', isAuthenticated, isAdmin, async (req, res) => {
	let { username, email } = req.user
    let List = await User.find({})
	const fsers = req.user;
	const currentPage = req.query.page ? parseInt(req.query.page) : 1; // Default to page 1
	const itemsPerPage = 10; // Display 10 users per page
	const totalUsers = List.length;
	const totalPages = Math.ceil(totalUsers / itemsPerPage);
	if (!req.user) {
        users = {
            apikey: "APIKEY",
            url: "profilePath"  // Replace "profilePath" with the actual path you want to use
        };
    } else {
        users = req.user;
    }
    res.render('premium/listuser', {
         List,
         username,
         email,
		 currentPage,
		 itemsPerPage,
		 totalPages,
		 limit: fsers.limit,
		 profile: users.url,
         layout: 'layouts/admin'
    })
  })

  router.get('/redeem-code', isAuthenticated, isAdmin, async (req, res) => {
	let { username, email } = req.user
    let List = await User.find({})
	const fsers = req.user;
	const currentPage = req.query.page ? parseInt(req.query.page) : 1; // Default to page 1
	const itemsPerPage = 10; // Display 10 users per page
	const totalUsers = List.length;
	const totalPages = Math.ceil(totalUsers / itemsPerPage);
	const redeemCodes = await RedeemCode.find({ username: req.user.username }).sort({ createdAt: -1 });
	if (!req.user) {
        users = {
            apikey: "APIKEY",
            url: "profilePath"  // Replace "profilePath" with the actual path you want to use
        };
    } else {
        users = req.user;
    }
    res.render('premium/rc', {
         List,
         username,
         email,
		 currentPage,
		 itemsPerPage,
		 totalPages,
		 redeemCodes,
		 limit: fsers.limit,
		 profile: users.url,
         layout: 'layouts/admin'
    })
  })
  router.post('/hapus-user', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { username } = req.body;

        // Hapus pengguna dari database berdasarkan username
        await User.deleteOne({ username: username });

        req.flash('success_msg', 'Pengguna berhasil dihapus');
        res.status(200).json({ message: 'Pengguna berhasil dihapus' });
    } catch (error) {
        console.error('Error:', error);
        req.flash('error_msg', 'Gagal menghapus pengguna');
        res.status(500).json({ error: 'Gagal menghapus pengguna' });
    }
});

router.get("/update", isAuthenticated, isAdmin, async (req, res) => {
	let { apikey, username, email, premium, totalreq, money} = req.user
	const fsers = req.user;
	if (!req.user) {
        users = {
            apikey: "APIKEY",
            url: "profilePath"  // Replace "profilePath" with the actual path you want to use
        };
    } else {
        users = req.user;
    }
	res.render("update", {
		profile: users.url,
		username: username,
		email,
		apikey: apikey,
		limit: fsers.limit,
		layout: "layouts/admin"
	});
});

// updates users past bot/post
router.post("/updates", isAuthenticated, isAdmin, async (req, res) => {
	let { email, limit, expired, premium } = req.query;
    let { username } = req.user
	let checking = await checkEmail(email);
	let regex = new RegExp(/(0?[1-9]|[12][0-9]|3[01])[\/\,] ([A-Z][a-z]+) \d{4}$/m, "g");
	let bool = ["false", "true"];
	const requests = (status, result) => res.json({ status, dev: "Darmawan", result });
	if ((email.length || limit.length || expired.length) < 1) {
		requests("error_msg", "Masukkan input dengan benar");
	} else if (!checking) {
		requests("error_msg", "Email tidak terdaftar dalam database");
	} else if (!Number(limit)) {
		requests("error_msg", "Limit harus berupa angka");
	} else if (!regex.test(expired)) {
		requests("error_msg", "Format tanggal salah");
	} else if (!bool.includes(premium.toLowerCase())) {
		requests("error_msg", "Input premium harus berupa type boolean");
	} else {
		await User.findOneAndUpdate({ email: email }, {
			limiter: expired,
			limit: limit,
			premium: premium.toLowerCase()
		});
		const anu = await User.findOne({ email: email });
		let resulter;
		try {
			resulter = await getJson("https://hosei.xyz/api/cekkey?apikey=" + anu.apikey, { method: 'GET' });
		} catch (er) {
			console.log(er);
			requests(false, undefined);
		} finally {
			requests(true, resulter.result);
		}
	}
});

router.get("/addmoney", isAuthenticated, isAdmin,  async (req, res) => {
	res.render("money", {
		layout: "layouts/crud"
	});
});

router.post("/addmoney", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { email, money } = req.body;
        const checking = await checkEmail(email);

        if (!checking) {
            req.flash('error_msg', 'Email tidak terdaftar dalam database');
            return res.redirect('/admin/addmoney'); // Redirect to the addmoney page
        }

        if (isNaN(money) || money <= 0) {
            req.flash('error_msg', 'Money harus berupa angka yang lebih dari 0');
            return res.redirect('/admin/addmoney'); // Redirect to the addmoney page
        }

        await User.findOneAndUpdate({ email: email }, { $inc: { money: money } });

        req.flash('success_msg', 'Money added successfully');
        return res.redirect('/admin/addmoney'); // Redirect to the addmoney page
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Something went wrong');
        return res.redirect('/admin/addmoney'); // Redirect to the addmoney page
    }
});
router.get('/generate-all-apikeys', isAuthenticated, isAdmin, async (req, res) => {
	try {
	  // Cek apakah request berasal dari admin (Anda dapat menyesuaikan metode autentikasi sesuai kebutuhan)
  
	  // Dapatkan semua user ID dari MongoDB (contoh, Anda dapat menyesuaikan query sesuai dengan skema Anda)
	  const allUserIds = await User.find().distinct('_id');
  
	  // Generate dan simpan API key untuk setiap user ID
	  for (const userId of allUserIds) {
		const apiKey = generateRandomKey();
  
		// Update atau tambahkan API key ke MongoDB menggunakan findOneAndUpdate
		await User.findByIdAndUpdate(userId, { $set: { apikey: 'HC-'+apiKey } });
	  }
  	res.json({ message: 'API keys generated for all user IDs' });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal Server Error' });
	}
  });
  
  function generateRandomKey() {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let apiKey = '';
  
	for (let i = 0; i < 15; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		apiKey += characters.charAt(randomIndex);
	  }
	
	  return apiKey;
	}

router.post("/update", isAuthenticated, isAdmin, async (req, res) => {
	let { email, apikey, limit, expired, role, premium } = req.body;
	let checking = await checkEmail(email);
	let regex = new RegExp(/(0?[1-9]|[12][0-9]|3[01])[\/\,] ([A-Z][a-z]+) \d{4}$/m, "g");
	let bool = ["false", "true"];
	if ((email.length || apikey.length || role.length || limit.length || expired.length) < 1) {
		req.flash("error_msg", "Isi dengan benar input");
		res.redirect("/admin/update");
	} else if (!checking) {
		req.flash("error_msg", "Email tidak terdaftar dalam database");
		res.redirect("/admin/update");
	} else if (!Number(limit)) {
		req.flash("error_msg", "Limit harus berupa angka");
		res.redirect("/admin/update");
	} else if (!regex.test(expired)) {
		req.flash("error_msg", "Format tanggal salah");
		res.redirect("/admin/update");
	} else if (!bool.includes(premium.toLowerCase())) {
		req.flash("error_msg", "input premium harus type boolean");
		res.redirect("/admin/update");
	} else {
		await User.findOneAndUpdate({ email: email }, {
			apikey: apikey,
			limiter: expired,
			limit: limit,
			role: role,
			premium: premium.toLowerCase()
		});
		req.flash("success_msg", "Sukses modified users");
		res.redirect("/docs");
	}
});

router.post('/resetall', isAuthenticated, isAdmin, (req, res) => {
    let { token } = req.body;
    if (token != tokens) {
        req.flash('error_msg', 'Invalid Token');
        return res.redirect('/premium');
    } else {
        resetAllLimit();
        resetTodayReq();
        req.flash('success_msg', `Succes Reset Limit All Apikey`);
        return res.redirect('/premium');
    }
})

module.exports = router;