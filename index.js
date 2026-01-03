const favicon = require("serve-favicon");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const expressLayout = require("express-ejs-layouts");
const compression = require("compression");
const passport = require("passport");
const crypto = require('crypto'); // Add this lin
const flash = require("connect-flash");
const Limiter = require("express-rate-limit");
const path = require('path');
const responseTime = require('response-time');
const fileUpload = require("express-fileupload");
const cron = require("node-cron");
const time = require("moment-timezone");
const { default: axios, isAxiosError } = require("axios");
const { hitCounter, getRoute } = require("./library/functions");
const { profilePath, user } = require("./library/settings");
const { connectMongoDb } = require("./database/connect");
const { isAuthenticated } = require('./library/authorized');
const { Utils } = require("./database/model");
const { User } = require("./database/model");
const Announcement = require('./library/announcement');
const apirouter = require("./routing/api");
const userRouters = require("./routing/users");
const adminRouters = require('./routing/admin');
const featureRouters = require('./routing/feature');
const webhookURL = 'https://discord.com/api/webhooks/1236983197598879744/42pj2lAPxuOwYtZOcDLrJgCC0QQO7tY88pQhEU4TL0Ce0AFsGcgzHORKS_KiaZmxkCti';
const {
	limitCount
} = require('./library/settings');
const { cekExpiredDays, getTotalReq, getTotalUser, addVisitor } = require('./database/premium');
const app = express();
const PORT = process.env.PORT || 5568;
function randomNomor(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const getUptime = () => {
	const uptimeInSeconds = Math.floor(process.uptime());
	const hours = Math.floor(uptimeInSeconds / 3600);
	const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
	const seconds = uptimeInSeconds % 60;
	return `${hours}h ${minutes}m ${seconds}s`;
  };

app.use(Limiter({
	windowMs: 1 * 60 * 1000,
	max: 1000,
	message: "Oops too many requests #HoseiAPIs."
}));

connectMongoDb();

app.enable("trust proxy", 1);
app.set("json spaces", 2);
app.set("view engine", "ejs");
app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

res.on("finish", () => {
		
	});
	next();
});	
app.use(responseTime());
app.use(expressLayout);
app.use(fileUpload());
app.use(compression());
app.use(favicon("./views/favicon.ico"));
app.use(express.static("assets"));
app.use(session({
	secret: "secret",
	resave: true,
	saveUninitialized: true,
	cookie: {
		maxAge: 86400000
	},
	store: new MemoryStore({
		checkPeriod: 86400000
	}),
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
require("./library/config")(passport);
app.use(flash());
app.use((req, res, next) => {
	const responseDuration = res.get('X-Response-Time');
	const responseTimeMs = parseFloat(responseDuration);
	const maintenanceMode = false; // Ganti nilai ini sesuai dengan kondisi maintenance (true/false)
	const threshold = 4000;
  
	if (maintenanceMode) {
	  return res.status(503).sendFile('503.html', { root: path.join(__dirname, 'views') });
	}
  
	req.startTime = Date.now();
	res.locals.success_msg = req.flash("success_msg");
	res.locals.warning_msg = req.flash("warning_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	res.locals.user = req.user || null;
  
	if (responseTimeMs > threshold) {
	  res.status(500).json({ message: 'Ping sedang tinggi, mohon untuk menunggu sebentar!' });
	} else {
	  next();
	}
  });

app.get('/', (req, res) => {
	 res.redirect('/users/login');
})
app.get('/pricing', isAuthenticated, async (req, res) => {
	let { apikey, username, email, premium, totalreq } = req.user
	const fsers = req.user;
    let users;
    if (!req.user) {
        users = {
            apikey: "APIKEY",
            url: "profilePath"  // Replace "profilePath" with the actual path you want to use
        };
    } else {
        users = req.user;
    }

    res.render('pricing', {
		username: username,
		apikey: apikey,
		email,
		limit: fsers.limit,
        profile: users.url,
        layout: "layouts/tick"
    });
});
app.get('/reedem-code', isAuthenticated, async (req, res) => {
	let { apikey, username, email, premium, totalreq } = req.user
	const fsers = req.user;
    let users;
    if (!req.user) {
        users = {
            apikey: "APIKEY",
            url: "profilePath"  // Replace "profilePath" with the actual path you want to use
        };
    } else {
        users = req.user;
    }

    res.render('reedem', {
		username: username,
		apikey: apikey,
		email,
		limit: fsers.limit,
        profile: users.url,
        layout: "layouts/reedem"
    });
});
app.get('/deposit', isAuthenticated, async (req, res) => {
	let { apikey, username, email, premium, totalreq } = req.user
	const fsers = req.user;
    let users;
    if (!req.user) {
        users = {
            apikey: "APIKEY",
            url: "profilePath"  // Replace "profilePath" with the actual path you want to use
        };
    } else {
        users = req.user;
    }

    res.render('deposit', {
		username: username,
		apikey: apikey,
		email,
		limit: fsers.limit,
        profile: users.url,
        layout: "layouts/depo"
    });
});
  app.get('/linktree', async (req, res) => {
    res.render('linktree', {
      layout: "layouts/linktree"
    })
    })
  app.get('/status', (req, res) => {
	const uptime = getUptime();
	const averageResponseTime = Date.now() - req.startTime;
	const response = {
	  developer: `Darmawan.`,
	  uptime: uptime,
	  latencia: `${averageResponseTime} ms`
	};
	const formattedResponse = JSON.stringify(response, null, 2);
	res.setHeader('Content-Type', 'application/json');
	res.end(formattedResponse);
  });
app.get('/docs', isAuthenticated, async (req, res) => { 
	let userjid = await getTotalUser();
	const announcements = await Announcement.find();
    let List = await User.find({})
	const fsers = req.user;
	const topUsers = await User.find().sort({ money: -1 }).limit(10);
	let users;
	let { apikey, username, email, premium, totalreq, money } = req.user
	if (!req.user) {
		users = {
			apikey: "APIKEY",
			url: profilePath
		};
	} else {
		users = req.user;
	}
	res.render('docs', {
	  username: username,
	  apikey: apikey,
	  limit: fsers.limit,
	  limiter: fsers.limiter,
	  totalreq,
	  money,
	  topUsers,
	  isAdmin: req.user.role === 'Admin',
	  url: fsers.url,
	  profile: users.url,
	  announcements: announcements,
	  email,
	  premium,
	  List,
	  user: userjid,
	  totalreq,
	  layout: "layouts/main"
	});
  });

  app.post('/submit', async (req, res) => {
    const formData = req.body;

    // Ganti URL webhook Discord dengan webhook Anda
    const discordWebhookURL = 'https://discord.com/api/webhooks/1198546784012746883/HdQ4SN7ZhlgVW7rqDqMUjQoBedzx7n2lOczFbSaf6pgOBAsg4_4zWKgSqCu7UgaMwtmc';

    try {
        // Kirim data ke Discord melalui webhook
        await axios.post(discordWebhookURL, {
            content: `Ada report baru dari web rest api :\n\`\`\`${JSON.stringify(formData, null, 2)}\`\`\``
        });

        // Kirim respons JSON ke klien
        res.json({ message: 'Ticket berhasil di kirimkan!' });
    } catch (error) {
        console.error('Error sending data to Discord:', error);
        // Kirim respons JSON ke klien dalam kasus error
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use("/api", apirouter);
app.use("/users", userRouters);
app.use('/admin', adminRouters);
app.use('/docs', featureRouters);

app.use(function (req, res, next) {
	res.status(404).sendFile('404.html', { root: path.join(__dirname, 'views') });
  });

app.listen(PORT, function () {
	console.log("Server running on port " + PORT);
});

const generateRandomKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const keyLength = 16; // Adjust the key length as needed
  let randomKey = '';

  for (let i = 0; i < keyLength; i++) {
    randomKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return randomKey;
};

cron.schedule('0 23 * * *', async () => {
  try {
    let users = await User.find({});
    
    for (const user of users) {
      let { username, limiter } = user;
      let daysUser = new Date(limiter).getTime();
      let daysNow = new Date().getTime();
      let result = Math.floor((daysUser - daysNow) / (1000 * 60 * 60 * 24));
  
      if (result <= 0) {
        const randomKey = generateRandomKey();
        await User.updateOne(
          { username: username },
          { apikey: randomKey, premium: null, limiter: 0, limit: limitCount } // Pastikan limitCount sudah didefinisikan
        );
        
        const embed = {
          title: 'PREMIUM EXPIRED',
          description: `Premium for user **${username}** has expired.`,
          fields: [
            {
              name: 'New API Key',
              value: 'HC-XXXXXXXXXX'
            }
          ],
          author: {
            name: 'Hosei APIs',
            icon_url: 'https://i.ibb.co.com/KDNkssr/IMG-20240603-173706-729.jpg'
          },
          image: {
            url: 'https://l.top4top.io/p_3048jydq51.gif' // Menampilkan URL QR code yang diterima
          },
          timestamp: new Date(),
          color: 0xFF0000 // Merah
        };
        
        // Kirim embed ke webhook Discord
        await axios.post(webhookURL, { embeds: [embed] });
      }
    }

    // Reset limit pengguna non-premium
    const allUsers = await User.find();
    for (const user of allUsers) {
      if (!user.premium) {
        await User.findOneAndUpdate(
          { email: user.email },
          { limit: 10 }
        );
      }
    }
  
    console.log(`[ ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Jakarta' })} ] Success Reset Limit`);
  } catch (error) {
    console.error(`Error in cron job: ${error.message}`);
  }
}, {
  scheduled: true,
  timezone: "Asia/Jakarta"
});