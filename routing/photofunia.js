const routes = require("express");
const router = routes.Router();
const {
	photofunia_text,
	photofunia_TextImage,
	photofunia_image
} = require("./../scrapping/photofunia");
const {
	loghandler,
	resSukses
} = require("../library/functions");
const apikeyAndLimit = require("../library/apikeyAndLimit");

router.get("/concrete", apikeyAndLimit, async (req, res) => {
	const url = req.query.url;
	if (!url) return res.json(loghandler.noturl);
	await photofunia_image("https://photofunia.com/categories/all_effects/concrete-jungle", url).then(async result => {
		resSukses(res, {
			img: result
		});
	})
});
module.exports = router;
