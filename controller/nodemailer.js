const time = require("moment-timezone");
const {
	getHashedPassword
} = require("../library/functions");
const {
	myEmail
} = require("../library/settings");
const {
	sendEmail
} = require("../library/nodemailer");
const {
	htmlPassword
} = require("./config");
const nodemailer = require('nodemailer');
const { WebhookClient } = require('discord.js');
const mailTransporter = nodemailer.createTransport({
	service: 'gmail', // use a valid email service, e.g., 'gmail', 'yahoo', 'outlook'
	auth: {
	  user: 'iketutdharmawan2007@gmail.com', // replace with your email address
	  pass: 'qncnyhnppejywppg' // replace with your email password or an app-specific password
	},
    tls: {
        rejectUnauthorized: false
    }
});

const sendLogToDiscord = (logMessage) => {
    const webhookURL = 'https://discord.com/api/webhooks/1238946142494916608/fp77le-szknnrVLNrGx04tEj9Vy8zibXiNVVo1SAAyQt_FmzWJXTHFKOKOmKcl_aBCt5'; // Ganti dengan URL webhook Discord Anda
    const webhookClient = new WebhookClient({ url: webhookURL });

    webhookClient.send(logMessage)
        .then(() => console.log('Log telah dikirim ke Discord'))
        .catch(console.error);
};
const sendLogToDiscord2 = (logMessage2) => {
    const webhookURL = 'https://discord.com/api/webhooks/1238946638253527160/HeG-qXpOjJnZ3ru-qZ5cCuOLhpE04N_V0XowZBbuWDsEf6-dnbkcuhJHmJbLAdmRJ2r2'; // Ganti dengan URL webhook Discord Anda
    const webhookClient = new WebhookClient({ url: webhookURL });

    webhookClient.send(logMessage2)
        .then(() => console.log('Log telah dikirim ke Discord'))
        .catch(console.error);
};
module.exports.sendMailRegister = (mailOptions) => {
	sendEmail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			const logMessage = `[ ${time.tz("Asia/Jakarta").format("HH:mm")} ] Success register email: ${info.accepted}`;
			sendLogToDiscord(logMessage);
		}
	});
};

module.exports.sendMailPassword = (email, url) => {
	mailTransporter.sendMail({
	  from: 'iketutdharmawan2007@email.com',
	  to: email,
	  subject: 'HOSEI API || CHANGE PASSWORD',
	  html: htmlPassword(url)
	}, function (error, response) {
	  if (error) {
		console.log(error);
	  } else {
		const logMessage2 = `[ ${time.tz("Asia/Jakarta").format("HH:mm")} ] Email: ${email} wants to change password`;
		sendLogToDiscord2(logMessage2);
	  }
	});
  };