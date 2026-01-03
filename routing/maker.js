const { Router } = require("express");
const { default: axios, isAxiosError } = require("axios");
const cheerio = require("cheerio");
const canvafy = require("../library/canvafy-wrapper");
const { fromBuffer } = require("file-type");
const ameClient = require("./../scrapping/amethyste");
const ameApi = new ameClient("015e9ee6d55d7ec9b6643c67d0b11487da81cca6d32a221fb4559739705c0d7b50caddfc508fb6fc4bd60f5ece4323b39bd4efeb414c545e192c1facd0fdfb91");
const {
	regexUrl,
	getBuffer,
	getJson,
	resSukses,
	resError,
	loghandler
} = require("../library/functions");
const { Sticker } = require("./../scrapping/semoji");
const { Tools } = require("./../scrapping/tools");
const sticker = new Sticker();
const tools = new Tools();
const apikeyAndLimit = require("../library/apikeyAndLimit");
const developer = "Darmawan";
router = Router();

router.get("/meme", apikeyAndLimit, async (req, res) => {
	const { text, text2, url } = req.query;
	if (!text) return res.json(loghandler.nottext)
	if (!text2) return res.json(loghandler.nottext2);
	if (!url) return res.json(loghandler.noturl)
	if (!regexUrl(url)) return res.json(loghandler.urlInvalid);
	const { data } = await axios.request({
		url: 'https://api.memegen.link/images/custom',
		method: 'POST',
		data: {
			"background": url,
			"style": "default",
			"text_lines": [
				text,
				text2
			],
			"extension": "png",
			"redirect": false
		}
	});
	if (isAxiosError()) return res.json(loghandler.error);
	await getBuffer(data.url).then(async buffer => {
		res.type("png").send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
router.get("/spotify", apikeyAndLimit, async (req, res) => {
	const { author, album, image, title } = req.query;
	if (!author) return res.json(loghandler.notauthor)
	if (!album) return res.json(loghandler.notalbum)
	if (!image) return res.json(loghandler.notimage)
	if (!title) return res.json(loghandler.nottitle)
    const rank = await new canvafy.Spotify()
	.setAuthor(author)
    .setAlbum(album)
    .setTimestamp(121000,263400)
    .setImage(image)
    .setTitle(title)
    .setBlur(5)
    .setOverlayOpacity(0.7)
    .build();
    res.type("png")
	res.send(rank)
});

router.get("/rank", apikeyAndLimit, async (req, res) => {
    const { avatar, username, image, level, xp, xp2 , rank } = req.query;

    if (!avatar) return res.json(loghandler.notavatar);
    if (!username) return res.json(loghandler.notusername);
    if (!level) return res.json(loghandler.notlevel);
    if (!xp) return res.json(loghandler.notxp);
    if (!xp2) return res.json(loghandler.notxp2);

    const numericLevel = parseInt(level, 10); 
    const ranks = parseInt(rank, 10);
    const xps = parseInt(xp, 10);
    const xpsd = parseInt(xp2, 10);


    const rankd = await new canvafy.Rank()
	.setAvatar(avatar)
    .setBackground("image", "https://telegra.ph/file/eb946edaba7e45504691c.jpg")
    .setUsername(username)
    .setBorder("#FC0000")
    .setLevel(numericLevel)
    .setCurrentXp(xps)
    .setRequiredXp(xpsd)
    .build();

    res.type("png");
    res.send(rankd);
});
router.get("/levelup", apikeyAndLimit, async (req, res) => {
    const { avatar, username, image, level, level2 } = req.query;

    if (!avatar) return res.json(loghandler.notavatar);
    if (!username) return res.json(loghandler.notusername);
    if (!image) return res.json(loghandler.notimage);
    if (!level) return res.json(loghandler.notlevel);
    if (!level2) return res.json(loghandler.notlevel2);

    const numericLevel = parseInt(level, 10); 
    const numericLevel2 = parseInt(level2, 10);

    const rank = await new canvafy.LevelUp()
        .setAvatar(avatar)
        .setBackground("image", image)
        .setUsername(username)
        .setBorder("#000000")
        .setAvatarBorder("#ff0000")
        .setOverlayOpacity(0.7)
        .setLevels(numericLevel, numericLevel2)
        .build();

    res.type("png");
    res.send(rank);
});
router.get("/ship", apikeyAndLimit, async (req, res) => {
    const { avatar, avatar2, image, number, number2 } = req.query;

    // Check if required parameters are present
    if (!avatar) return res.json(loghandler.notavatar);
    if (!avatar2) return res.json(loghandler.notavatar2);
    if (!number) return res.json(loghandler.notnumber);
    if (!image) return res.json(loghandler.notimage);

    // Convert number and number2 to integers and normalize to the range [0, 1]
    const numericopac = Math.max(0, Math.min(1, parseFloat(number)));

    // Create the canvafy Ship object
    const rank = await new canvafy.Ship()
        .setAvatars(avatar, avatar2)
        .setBackground("image", image)
        .setBorder("#f0f0f0")
        .setOverlayOpacity(numericopac)
        .build();

    // Set response type and send the generated rank
    res.type("png");
    res.send(rank);
});
router.get("/captcha", apikeyAndLimit, async (req, res) => {
    const { image, key } = req.query;

    // Check if required parameters are present
    if (!key) return res.json(loghandler.notkey);
    if (!image) return res.json(loghandler.notimage);

    // Create the canvafy Ship object
    const rank = await new canvafy.Captcha()
	.setBackground("image", image)
    .setCaptchaKey(key) // canvafy captcha key generator "15" is key length
    .setBorder("#f0f0f0")
    .setOverlayOpacity(0.7)
    .build();

    // Set response type and send the generated rank
    res.type("png");
    res.send(rank);
});
router.get("/welcomeleave", apikeyAndLimit, async (req, res) => {
    const { avatar, title, image, text } = req.query;

    // Check if required parameters are present
    if (!avatar) return res.json(loghandler.notavatar);
    if (!title) return res.json(loghandler.nottitle);
    if (!text) return res.json(loghandler.nottext);
    if (!image) return res.json(loghandler.notimage);

    // Convert number and number2 to integers and normalize to the range [0, 1]

    // Create the canvafy Ship object
    const rank = await new canvafy.WelcomeLeave()
	.setAvatar(avatar)
	.setBackground("image", image)
	.setTitle(title)
	.setDescription(text)
	.setBorder("#2a2e35")
	.setAvatarBorder("#2a2e35")
	.setOverlayOpacity(0.3)
	.build();

    // Set response type and send the generated rank
    res.type("png");
    res.send(rank);
});
router.get("/carbontext", apikeyAndLimit, async (req, res) => {
	if (!req.query.text) return res.json(loghandler.nottext)
	await getBuffer(`https://thiccyscarbonapi.herokuapp.com/?code=${req.query.text}&language=Nodejs&theme=dark&exportSize=3x`).then(buffer => {
		res.type("png").send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
router.get("/affect", apikeyAndLimit, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.json(loghandler.noturl)
	if (!regexUrl(url)) return res.json(loghandler.urlInvalid);
	await canvafy.Image.affect(url).then(buffer => {
		res.type("png")
		res.send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
router.get("/batslap", apikeyAndLimit, async (req, res) => {
    const { avatar, avatar2 } = req.query;
    if (!avatar) return res.json(loghandler.notavatar);
    if (!avatar2) return res.json(loghandler.notavatar2);

	await canvafy.Image.batslap(avatar, avatar2).then(buffer => {
		res.type("png")
		res.send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
router.get("/darkness", apikeyAndLimit, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.json(loghandler.noturl)
	if (!regexUrl(url)) return res.json(loghandler.urlInvalid);
	await canvafy.Image.darkness(url, 100).then(buffer => {
		res.type("png")
		res.send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
router.get("/delete", apikeyAndLimit, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.json(loghandler.noturl)
	if (!regexUrl(url)) return res.json(loghandler.urlInvalid);
	await canvafy.Image.delete(url).then(buffer => {
		res.type("png")
		res.send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
router.get("/gay", apikeyAndLimit, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.json(loghandler.noturl)
	if (!regexUrl(url)) return res.json(loghandler.urlInvalid);
	await canvafy.Image.gay(url).then(buffer => {
		res.type("png")
		res.send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
router.get("/greyscale", apikeyAndLimit, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.json(loghandler.noturl)
	if (!regexUrl(url)) return res.json(loghandler.urlInvalid);
	await canvafy.Image.greyscale(url).then(buffer => {
		res.type("png")
		res.send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
router.get("/invert", apikeyAndLimit, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.json(loghandler.noturl)
	if (!regexUrl(url)) return res.json(loghandler.urlInvalid);
	await canvafy.Image.invert(url).then(buffer => {
		res.type("png")
		res.send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
router.get("/ssweb", apikeyAndLimit, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.json(loghandler.noturl)
	if (!regexUrl(url)) return res.json(loghandler.urlInvalid);
	await getBuffer(`https://api.apiflash.com/v1/urltoimage?access_key=06ce7f1d5e3d41edaee385b749ef0e33&url=${url}`).then(buffer => {
		res.type("png")
		res.send(buffer)
	}).catch(e => {
		console.error(e);
		res.json(loghandler.error);
	});
})
module.exports = router;