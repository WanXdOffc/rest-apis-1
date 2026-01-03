const nodemailer = require("nodemailer");
const { passEmailApp, myEmail } = require("./settings");

async function sendEmail(dataEmail, req, res, path1, path2) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        requireTLS: true,
        auth: {
          user: myEmail, 
          pass: passEmailApp, 
        },
        from: myEmail,
        tls: {
            rejectUnauthorized: false
        }
    });

    const callback = typeof req === 'function' ? req : null;

    transporter.sendMail(dataEmail, (err, info) => {
        if (callback) {
            return callback(err, info);
        }
        if (err) {
            console.log(err)
            if (req && typeof req.flash === 'function') req.flash('error_msg', 'Something Wrong');
            if (res && typeof res.redirect === 'function') return res.redirect(path1);
        } else {
            if (req && typeof req.flash === 'function') req.flash('success_msg', `Success Send Email to : ${dataEmail.to}, Check Your Mail Box/Spam Box`);
            if (res && typeof res.redirect === 'function') return res.redirect(path2);
        }
    })
}

module.exports = { sendEmail }
