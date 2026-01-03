"use strict";
const axios = require("axios");
const cheerio = require("cheerio");

async function fastCheck(url) {
	const resp = await axios.get(url);
	return resp.headers["content-type"];
}
function urlPost(input) {
    const regex = /(https?:\/\/(?:www\.)?instagram\.com\/(p|reel|tv)\/([^/?#&]+)).*/;
    return regex.test(input);
  }

function urlStory(input) {
    const regex = /(https?:\/\/(?:www\.)?instagram\.com\/(s|stories)\/([^/?#&]+)).*/;
    return regex.test(input);
  }

async function instaPost(url) {
    let res = await axios("https://indown.io/");
    let _$ = cheerio.load(res.data);
    let referer = _$("input[name=referer]").val();
    let locale = _$("input[name=locale]").val();
    let _token = _$("input[name=_token]").val();
    let {
        data
    } = await axios.post(
        "https://indown.io/download",
        new URLSearchParams({
            link: url,
            referer,
            locale,
            _token,
        }), {
            headers: {
                cookie: res.headers["set-cookie"].join("; "),
            },
        }
    );
    let $ = cheerio.load(data);
    let result = [];
    let __$ = cheerio.load($("#result").html());
    __$("video").each(function () {
        let $$ = $(this);
        result.push({
            type: "video",
            // thumbnail: $$.attr("poster"),
            url: $$.find("source").attr("src"),
        });
    });
    __$("img").each(function () {
        let $$ = $(this);
        result.push({
            type: "image",
            url: $$.attr("src"),
        });
    });

    return result;
}

async function instaStory(url_media) {
    return new Promise(async (resolve, reject) => {
        
        const insta = await axios.get("https://instasupersave.com/api/ig/story?url="+url_media)
        const result = insta.data.result[0]

        if ('video_versions' in result) {
            const type = await fastCheck(result.video_versions[0].url);
			const tinyUrl = await (await fetch(`https://tinyurl.com/api-create.php?url=${result.video_versions[0].url}`)).text();
            resolve({type: type, hasil: tinyUrl})
        } else {
            const type = await fastCheck(result?.image_versions2?.candidates[0].url);
            return resolve({type: type, url: result?.image_versions2?.candidates[0].url})
        }


    });
}

module.exports = { instaStory, instaPost };