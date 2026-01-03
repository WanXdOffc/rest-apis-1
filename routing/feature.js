const { isAuthenticated } = require('../library/authorized');
const { User } = require("../database/model");
const { cekExpiredDays, getTotalReq, getTotalUser, addVisitor } = require('../database/premium');

  router.get('/:featureType(ephoto|stalker|photooxy|downloader|top|textpro|maker|game|anime|random|searching|information|primbon|ai|tools)', isAuthenticated, async (req, res) => {
    try {
        let userjid = await getTotalUser();
    	const topUsers = await User.find().sort({ money: -1 }).limit(10);
        let List = await User.find({});
        const fsers = req.user;
        let users;
        let { apikey, username, email, premium, totalreq, money } = req.user;

        if (!req.user) {
            users = {
                apikey: "APIKEY",
                url: profilePath
            };
        } else {
            users = req.user;
        }

        let featureTemplate;
        
        switch (req.params.featureType) {
            case 'ephoto':
                featureTemplate = 'feature/ephoto';
                break;
            case 'tools':
                featureTemplate = 'feature/tools';
                break;
            case 'ai':
                featureTemplate = 'feature/ai';
                break;
            case 'searching':
                featureTemplate = 'feature/searching';
                break;
            case 'information':
                featureTemplate = 'feature/information';
                break;
            case 'primbon':
                featureTemplate = 'feature/primbon';
                break;
            case 'stalker':
                featureTemplate = 'feature/stalker';
                break;
            case 'random':
                featureTemplate = 'feature/random';
                break;
            case 'photooxy':
                featureTemplate = 'feature/photooxy';
                break;
            case 'game':
                featureTemplate = 'feature/game';
                break;
            case 'anime':
                featureTemplate = 'feature/anime';
                break;
            case 'downloader':
                featureTemplate = 'feature/downloader';
                break;
            case 'textpro':
                featureTemplate = 'feature/textpro';
                break;
            case 'top':
                featureTemplate = 'feature/topmoney';
                break;
            case 'maker':
                featureTemplate = 'feature/maker';
                break;
            default:
                featureTemplate = 'feature/default'; // Atur template default jika diperlukan
                break;
        }

        res.render(featureTemplate, {
            username: username,
            apikey: apikey,
            limit: fsers.limit,
            limiter: fsers.limiter,
            totalreq,
            money,
            topUsers,
            url: fsers.url,
            profile: users.url,
            email,
            premium,
            List,
            user: userjid,
            totalreq,
            layout: "layouts/main"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;