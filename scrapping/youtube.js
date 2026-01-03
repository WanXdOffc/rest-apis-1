const ytdl = require("ytdl-core");
const yts = require("yt-search");
const { TiktokStalk } = require("@tobyg74/tiktok-api-dl")
const axios = require("axios");
const cheerio = require("cheerio");
const sesid = "44781279213%3AeWv6JOePezg9vV%3A11"
process.env['SPOTIFY_CLIENT_ID'] = '4c4fc8c3496243cbba99b39826e2841f'
process.env['SPOTIFY_CLIENT_SECRET'] = 'd598f89aba0946e2b85fb8aefa9ae4c8'

const bytesToSize = (bytes) => {
  return new Promise((resolve, reject) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "n/a";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) resolve(`${bytes} ${sizes[i]}`);
    resolve(`${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`);
  });
};

const shortUrl = async (url) => {
  let res = await fetch("https://arifzyn.xyz/create", {
    method: "POST",
    body: new URLSearchParams(
      Object.entries({
        url: url,
        costum: "",
      }),
    ),
    headers: {
      "context-type": "application/json",
    },
  });
  let response = await res.json();
  return "https://arifzyn.xyz/" + response.result.id;
};

const formated = (ms) => {
  let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}; 

class YouTube {
  ytMp4 = (url) => {
    return new Promise(async (resolve, reject) => {
      ytdl
        .getInfo(url)
        .then(async (getUrl) => {
          let result = [];
          for (let i = 0; i < getUrl.formats.length; i++) {
            let item = getUrl.formats[i];
            if (
              item.container == "mp4" &&
              item.hasVideo == true &&
              item.hasAudio == true
            ) {
              let { qualityLabel, contentLength, approxDurationMs } = item;
              let bytes = await bytesToSize(contentLength);
              result[i] = {
                video: item.url,
                quality: qualityLabel,
                size: bytes,
                duration: formated(parseInt(approxDurationMs)),
              };
            }
          }
          let resultFix = result.filter(
            (x) =>
              x.video != undefined &&
              x.size != undefined &&
              x.quality != undefined,
          );
          
          const tinyUrl = await (await fetch(`https://tinyurl.com/api-create.php?url=${resultFix[0].video}`)).text();
          let title = getUrl.videoDetails.title;
          let desc = getUrl.videoDetails.description;
          let views = parseInt(getUrl.videoDetails.viewCount || 0);
          let likes = getUrl.videoDetails.likes;
          let dislike = getUrl.videoDetails.dislikes;
          let channel = getUrl.videoDetails.ownerChannelName;
          let uploadDate = getUrl.videoDetails.uploadDate;
          let thumb =
            getUrl.player_response.microformat.playerMicroformatRenderer
              .thumbnail.thumbnails[0].url;
          resolve({
            title,
            video: tinyUrl,
            quality: resultFix[0].quality,
            size: resultFix[0].size,
            duration: resultFix[0].duration,
            thumb,
            views,
            likes,
            dislike,
            channel: channel ? channel.replace(/\s(\-\sTopic)/, "") : "Unknown",
            uploadDate,
            desc,
          });
        })
        .catch(reject);
    });
  };
  
  async blackbox(text) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await axios.post('https://www.useblackbox.io/chat-request-v4', {
                text: text,
                allMessages: [{
                    user: text
                }],
                stream: '',
                clickedContinue: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux x86_64) Gecko/20130401 Firefox/71.3',
                }
            });
          let message = data.response[0][0]
          resolve(message);
        } catch (e) {
          resolve({ msg: 'Error!'})
        }
    })
}
   aoi(Query) {
    return new Promise(async(resolve, reject) => {
      try {
      const formData = new FormData();
      formData.append("locale", 'id-ID');
      formData.append("content", `<voice name="ja-JP-AoiNeural">${Query}</voice>`);
      formData.append("ip", '38.46.219.162');
      const response = await fetch('https://app.micmonster.com/restapi/create', {
          method: 'POST',
          body: formData
      });
      resolve(Buffer.from(('data:audio/mpeg;base64,' + await response.text()).split(',')[1], 'base64'));
          
    } catch (error) {
    resolve({creator: global.creator, status: false, mssg: 'error bang'})
  }
    })
  }
  async igStalk2s(username) {
    try {
      const { data, status } = await axios.get(`https://snapinst.com/api/ig/userInfoByUsername/${username}`);
  
      let pronoun = "";
      if (data.result.user.pronouns.length > 0) {
        const addSlash = data.result.user.pronouns.join("/");
        pronoun = addSlash;
      }
  
      const res = data.result.user;
      const result = {
        username: res.username,
        fullName: res.full_name,
        followers: res.follower_count,
        following: res.following_count,
        pronouns: pronoun,
        verified: res.is_verified,
        private: res.is_private,
        totalPosts: res.media_count,
        bio: res.biography,
        externalUrl: res.external_url,
        urlAcc: `https://instagram.com/${username}`,
        profilePic: res.hd_profile_pic_url_info.url,
        pkId: res.pk_id
      };
  
      return result;
    } catch (err) {
      return {
        message: "Tidak dapat menemukan akun"
      };
    }
  }
  
  async twitterdlv(url) {
    try {
      const { data } = await axios.get(`https://twitsave.com/info?url=${url}`);
      const $ = cheerio.load(data);
      const result = [];
  
      $("div.origin-top-right > ul > li").each(function () {
        const resolutionText = $(this).find("a > div > div > div").text().split("Resolution: ")[1];
        if (resolutionText) {
          const [width, height] = resolutionText.split("x");
          const videoUrl = $(this).find("a").attr("href");
          result.push({
            width: width,
            height: height,
            url: videoUrl
          });
        }
      });
  
      if (result.length === 0) {
        const errorMessage = {
          message: "Tidak dapat menemukan video"
        };
        return errorMessage;
      }
  
      const sortedResult = result.sort((a, b) => a.height - b.height);
      const maxResolution = sortedResult[sortedResult.length - 1].width;
      
      const filteredResult = result.filter(video => video.width === maxResolution);
  
      const finalResult = filteredResult.length > 0 ? filteredResult[0] : {};
      return finalResult;
    } catch (error) {
      console.error("An error occurred:", error.message);
      return {
        message: "Error occurred while processing the request"
      };
    }
  }
  

  async aiimage(text) {
    try {
      const { data } = await axios.get("https://tti.photoleapapp.com/api/v1/generate?prompt=" + text)
      const result = {
        status: true,
        url: data.result_url
      }
      return result
    } catch (err) {
      const result = {
        status: false,
        message: String(err)
      }
      console.log(result)
      return result
    }
  }
  
   animeFilter(image) {
    return new Promise(async (resolve, reject) => {
      axios("https://akhaliq-animeganv2.hf.space/api/queue/push/", {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
        },
        data: {
          "fn_index": 0,
          "data": [
            "data:image/jpeg;base64," + image.toString('base64'),
            "version 2 (🔺 robustness,🔻 stylization)"
          ],
          "action": "predict",
          "session_hash": "38qambhlxa8"
        },
        method: "POST"
      }).then(a => {
        let id = a.data.hash;
        axios("https://akhaliq-animeganv2.hf.space/api/queue/status/", {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
          },
          data: {
            "hash": id
          },
          method: "POST"
        }).then(tes => {
          resolve(tes.data.data.data);
        });
      });
    });
  };
  spotify(url) {
    return new Promise(async (resolve, reject) => {
      try {
        const getToken = await axios("https://spotifymate.com/", {
          method: "GET",
          headers: {
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0",
            cookie: "session_data=f7932165d6219264628ca85bd26d468f",
          },
        });
        const $$ = cheerio.load(getToken.data);
        const a = $$("#get_video").html();
        const tokenRegex = /<input name="([^"]*)" type="hidden" value="([^"]*)">/g;
        const tokenMatch = tokenRegex.exec(a);
        let config = { url: url };
        config[tokenMatch[1]] = tokenMatch[2];

        const { data } = await axios("https://spotifymate.com/action", {
          method: "POST",
          data: new URLSearchParams(Object.entries(config)),
          headers: {
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0",
            cookie: "session_data=f7932165d6219264628ca85bd26d468f",
          },
        });

        const $ = cheerio.load(data);
        let _data = [];
        let img = $("div.spotifymate-downloader.mb-10").find("img").attr("src");
        let title = $("div.spotifymate-downloader-middle.text-center").find("h3").text().trim();
        let artis = $("div.spotifymate-downloader-middle.text-center").find("p").text().trim();
        $("#download-block").each((i, u) => {
          _data.push($(u).find("a").attr("href"));
        });

        let res = {
          img: img,
          title: title,
          artis: artis,
          mp3: _data,
        };
        resolve(res);
      } catch (err) {
        console.log(err);
      }
    });
  }
  fbs(url){
    return new Promise(async(resolve, reject) => {
      try {
        const config = {
          'id': url,
          'locale': 'id'
        }
        const { data, status } = await axios('https://getmyfb.com/process', {
          method: 'POST',
          data: new URLSearchParams(Object.entries(config)),
          headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
            "cookie": "PHPSESSID=914a5et39uur28e84t9env0378; popCookie=1; prefetchAd_4301805=true"
          }
        })
        if (status === 200) {
          const $ = cheerio.load(data)
          const thumb = $('div.container > div.results-item > div.results-item-image-wrapper').find('img').attr('src')
          const desc = $('div.container > div.results-item > div.results-item-text').text().trim()
          const video_hd = $('div.container > div.results-download > ul > li:nth-child(1) > a').attr('href')
          const video_sd = $('div.container > div.results-download > ul > li:nth-child(2) > a').attr('href')
          const lele = await (await fetch(`https://tinyurl.com/api-create.php?url=${video_hd}`)).text();
          const leles = await (await fetch(`https://tinyurl.com/api-create.php?url=${video_sd}`)).text();
          const leless = await (await fetch(`https://tinyurl.com/api-create.php?url=${thumb}`)).text();
          const hasil = {
            desc: desc,
            thumb: leless,
            video_sd: leles,
            video_hd: lele
          };
          resolve(hasil)
        } else {
          console.log('No result found')
        }
      } catch (error) {
        console.error(error)
      }
    })
  }
  async generateQuoteImage (text, pic, name) {
    const obj = {
       "type": "quote",
       "format": "png",
       "backgroundColor": "#FFFFFF",
       "width": 512,
       "height": 768,
       "scale": 2,
       "messages": [{
          "entities": [],
          "avatar": true,
          "from": {
             "id": 1,
             "name": name,
             "photo": {
                "url": pic
             }
          },
          "text": text,
          "replyMessage": {}
       }]
    };
 
    try {
       const json = await axios.post('https://quote.btch.bz/generate', obj, {
          headers: {
             'Content-Type': 'application/json'
          }
       });
       return json.data.result.image;
    } catch (error) {
       console.log(error);
       throw new Error("Unable to generate sticker.");
    }
 }
 musically(URL) {
	return new Promise((resolve, rejecet) => {
        axios.get('https://musicaldown.com/id', {
            headers: {
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            }
        }).then(res => {
            const $ = cheerio.load(res.data)
            const url_name = $("#link_url").attr("name")
            const token_name = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("name")
            const token_ = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(2)").attr("value")
            const verify = $("#submit-form > div").find("div:nth-child(1) > input[type=hidden]:nth-child(3)").attr("value")
            let data = {
                [`${url_name}`]: URL,
                [`${token_name}`]: token_,
                verify: verify
            }
        axios.request({
            url: 'https://musicaldown.com/id/download',
            method: 'post',
            data: new URLSearchParams(Object.entries(data)),
            headers: {
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                'cookie': res.headers["set-cookie"]
            }
        }).then(respon => {
            const ch = cheerio.load(respon.data)

		if(!ch('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l4.center-align > div > div > img').attr('src')){
			
			let hasil = []
            ch('body > div.welcome.section > div > div:nth-child(3) > div > div.row > div').each(function (a, b) {
                hasil.push({
                    url: ch(b).find('img').attr('src'),
					url_download: ch(b).find('a').attr('href')
                })
            })
			
			let result = {
				audio: ch('body > div.welcome.section > div > div:nth-child(3) > div > a.btn.waves-effect.waves-light.orange.download').attr('href'),
				photo: hasil
			}
			if (!result.photo[0]){
			resolve()
			}else{
			resolve(result)	
			}
		
		}else{

        axios.request({
            url: 'https://musicaldown.com/id/mp3',
            method: 'post',
            headers: {
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                'cookie': res.headers["set-cookie"]
            }
        }).then(resaudio => { 
            const hc = cheerio.load(resaudio.data)       
            const result = {
				pp: ch('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l4.center-align > div > div > img').attr('src'),
				username: ch('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l4.center-align > div > h2:nth-child(2) > b').text(),
				description: ch('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l4.center-align > div > h2:nth-child(3)').text(),
				video: ch('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a:nth-child(3)').attr('href'),
				video2: ch('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a:nth-child(5)').attr('href'),
                video_HD: ch('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a:nth-child(7)').attr('href'),
				video_watermark: ch('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a:nth-child(9)').attr('href'),
				audio: hc('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a:nth-child(6)').attr('href'), 
				audio_Download: hc('body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a.btn.waves-effect.waves-light.orange.download').attr('href')
            }
        resolve(result)
		})
	  }
   })
})
})
}

  ytMp3 = (url) => {
    return new Promise((resolve, reject) => {
      ytdl
        .getInfo(url)
        .then(async (getUrl) => {
          let result = [];
          for (let i = 0; i < getUrl.formats.length; i++) {
            let item = getUrl.formats[i];
            if (item.mimeType == 'audio/webm; codecs="opus"') {
              let { contentLength, approxDurationMs } = item;
              let bytes = await bytesToSize(contentLength);
              result[i] = {
                audio: item.url,
                size: bytes,
                duration: formated(parseInt(approxDurationMs)),
              };
            }
          }
          let resultFix = result.filter(
            (x) => x.audio != undefined && x.size != undefined,
          );
          
          const tinyUrl = await (await fetch(`https://tinyurl.com/api-create.php?url=${resultFix[0].audio}`)).text();
          let title = getUrl.videoDetails.title;
          let desc = getUrl.videoDetails.description;
          let views = parseInt(getUrl.videoDetails.viewCount || 0);
          let likes = getUrl.videoDetails.likes;
          let dislike = getUrl.videoDetails.dislikes;
          let channel = getUrl.videoDetails.ownerChannelName;
          let uploadDate = getUrl.videoDetails.uploadDate;
          let thumb =
            getUrl.player_response.microformat.playerMicroformatRenderer
              .thumbnail.thumbnails[0].url;
          resolve({
            title,
            mp3: tinyUrl,
            size: resultFix[0].size,
            duration: resultFix[0].duration,
            thumb,
            views,
            likes,
            dislike,
            channel: channel ? channel.replace(/\s(\-\sTopic)/, "") : "Unknown",
            uploadDate,
            desc,
          });
        })
        .catch(reject);
    });
  };

  ytPlay = (query) => {
    return new Promise((resolve, reject) => {
      yts(query)
        .then(async (getData) => {
          let result = getData.videos.slice(0, 5);
          let url = [];
          for (let i = 0; i < result.length; i++) {
            url.push(result[i].url);
          }
          let random = url[0];
          let getAudio = await this.ytMp3(random);
          resolve(getAudio);
        })
        .catch(reject);
    });
  };
  tiktok = (query) => {
    return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post("https://tikwm.com/api/feed/search", {
        keywords: query,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1
      }, {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "cookie": "current_language=en",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
        }
      });

      const videoUrls = response.data.data.videos.map(video => `https://tikwm.com${video.play}`);
      resolve(videoUrls);
    } catch (error) {
      reject(error);
    }
  });
  };
  ytplay = async (input) => {
    try {
      if (!input) {
        throw new Error('Input not specified');
      }
      let info;
      let isSearch = false;
      if (input.startsWith('https://www.youtube.com/') || input.startsWith('https://youtu.be/')) {
        info = await ytdl.getInfo(input, { lang: 'en' });
      } else {
        // Treat the input as a search query
        const searchResults = await yts(input);
        if (!searchResults.videos.length) {
          throw new Error('No videos found for the search query');
        }
        info = await ytdl.getInfo(searchResults.videos[0].url, { lang: 'en' });
        isSearch = true;
      }
  
      const { videoDetails } = info;
      const audioURL = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' }).url;
      const videoURL = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' }).url;
      const shortAudioURL = await (await fetch(`https://tinyurl.com/api-create.php?url=${audioURL}`)).text();
      const shortVideoURL = await (await fetch(`https://tinyurl.com/api-create.php?url=${videoURL}`)).text();
  
      return {
          channelUrl: videoDetails.author.channel_url,
          views: videoDetails.viewCount,
          category: videoDetails.category,
          id: videoDetails.videoId,
          url: videoDetails.video_url,
          publicDate: videoDetails.publishDate,
          uploadDate: videoDetails.uploadDate,
          keywords: videoDetails.keywords,
          title: videoDetails.title,
          channel: videoDetails.author.name,
          seconds: videoDetails.lengthSeconds,
          description: videoDetails.description,
          image: videoDetails.thumbnails.slice(-1)[0].url,
          download: {
            audio: isSearch ? shortAudioURL : audioURL,
            video: isSearch ? shortVideoURL : videoURL,
        },
      };
    } catch (error) {
      throw error;
    }
  };
  async convert(ms) {
    var minutes = Math.floor(ms / 60000)
    var seconds = ((ms % 60000) / 1000).toFixed(0)
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
 }
  async spotifyCreds() {
    return new Promise(async resolve => {
        try {
            const json = await (await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
                headers: {
                    Authorization: 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
                }
            })).data;
            if (!json.access_token) return resolve({
                msg: 'Can\'t generate token!'
            });
            resolve({
                status: true,
                data: json
            });
        } catch (e) {
            resolve({
                status: false,
                msg: e.message
            });
        }
    });
}

async spotifySearch(query, type = 'track', limit = 20) {
    return new Promise(async resolve => {
        try {
            const creds = await this.spotifyCreds(); // Fix: Prefix with 'this'
            if (!creds.status) return resolve(creds);
            const json = await (await axios.get('https://api.spotify.com/v1/search?query=' + query + '&type=' + type + '&offset=0&limit=' + limit, {
                headers: {
                    Authorization: 'Bearer ' + creds.data.access_token
                }
            })).data;
            if (!json.tracks.items || json.tracks.items.length < 1) return resolve({
                msg: 'Music not found!'
            });
            resolve(
              json.tracks.items.map(v => ({
                title: v.album.artists[0].name + ' - ' + v.name,
                duration: this.convert(v.duration_ms),
                popularity: v.popularity + '%',
                preview: v.preview_url,
                url: v.external_urls.spotify
              }))
            );
        } catch (e) {
            resolve({
                msg: e.message
            });
        }
    });
}
tiktoks(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: {
          keywords: query,
          count: 10,
          cursor: 0,
          HD: 1
        }
      });
      const videos = response.data.data.videos;
      if (videos.length === 0) {
        reject("Tidak ada video ditemukan.");
      } else {
        const gywee = Math.floor(Math.random() * videos.length);
        const videorndm = videos[gywee]; 

        const result = {
          title: videorndm.title,
          cover: videorndm.cover,
          origin_cover: videorndm.origin_cover,
          no_watermark: videorndm.play,
          watermark: videorndm.wmplay,
          music: videorndm.music
        };
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}
  async mediafire(url){
    return new Promise(async(resolve, reject) => {
    try {
    const { data, status } = await axios.get(url)
    const $ = cheerio.load(data);
    let filename = $('.dl-info > div > div.filename').text();
    let filetype = $('.dl-info > div > div.filetype').text();
    let filesize = $('a#downloadButton').text().split("(")[1].split(")")[0];
    let uploadAt = $('ul.details > li:nth-child(2)').text().split(": ")[1];
    let link = $('#downloadButton').attr('href');
    let desc = $('div.description > p.description-subheading').text();
    if (typeof link === undefined) return resolve({ status: false, msg: 'No result found' })
    let result = {
    filename: filename,
    filetype: filetype,
    filesize: filesize,
    uploadAt: uploadAt,
    link: link,
    desc: desc
    }
    resolve(result)
    } catch (err) {
    resolve({ msg: 'No result found' })
    }
    })
    }
  ttimg = async (link) => {
    if (!link) return { data: '*[❗] Link not found.*' };
    try {    
        let url = `https://dlpanda.com/es?url=${link}&token=G7eRpMaa`;    
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        let imgSrc = [];
        $('div.col-md-12 > img').each((index, element) => {
            imgSrc.push($(element).attr('src'));
        });
        if (imgSrc.length === 0) {
            return { data: '*[❗] No images found in the link provided.*' };
        }
        return imgSrc 
    } catch (error) {
        console.log(error);
        return { data: '*[❗] No response from the page, try again later.*'};
    }
};
  async tiktokDownloader(url) {
    try {
        let tiktokdl = await fetch(`https://www.tikwm.com/api/?url=${url}?hd=1`);
        let res = await tiktokdl.json();

        let response = {
        };

        if (res.data.images) {
            response = {
                username: res.data.author.unique_id,
                nickname: res.data.author.nickname,
                region: res.data.region,
                commentCount: res.data.comment_count,
                shareCount: res.data.share_count,
                downloadCount: res.data.download_count,
                imagesCount: res.data.images.length,
                musicInfo: {
                    title: res.data.music_info.title,
                    album: res.data.music_info.album || ""
                },
                title: res.data.title || "",
                imagesUrl: res.data.images
            };
        } else {
            response = {
                username: res.data.author.unique_id,
                nickname: res.data.author.nickname,
                region: res.data.region,
                commentCount: res.data.comment_count,
                shareCount: res.data.share_count,
                downloadCount: res.data.download_count,
                musicInfo: {
                    title: res.data.music_info.title,
                    album: res.data.music_info.album || ""
                },
                title: res.data.title || "",
                videoUrl: res.data.play
            };
        }

        return response;
    } catch (e) {
        return e.message;
    }
}

  douyin = (url) => {
    return new Promise(async (resolve, reject) => {
      const { data } = await axios("https://www.tikdd.cc/g1.php", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        },
        data: "url=" + url + "&count=12&cursor=0&web=1&hd=1",
        method: "POST",
      });
      resolve(data);
    });
  };
  LikeDown = (url) => {
    return new Promise(async (resolve, reject) => {
      const { data } = await axios.request(
        "https://likeedownloader.com/process",
        {
          method: "post",
          data: new URLSearchParams(Object.entries({ id: url, locale: "en" })),
          headers: {
            cookie:
              "_ga=GA1.2.553951407.1656223884; _gid=GA1.2.1157362698.1656223884; __gads=ID=0fc4d44a6b01b1bc-22880a0efed2008c:T=1656223884:RT=1656223884:S=ALNI_MYp2ZXD2vQmWnXc2WprkU_p6ynfug; __gpi=UID=0000069517bf965e:T=1656223884:RT=1656223884:S=ALNI_Map47wQbMbbf7TaZLm3TvZ1eI3hZw; PHPSESSID=e3oenugljjabut9egf1gsji7re; _gat_UA-3524196-10=1",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
          },
        },
      );
      const $ = cheerio.load(data.template);
      const asds = {
        status: 200,
        title: $("p.infotext").eq(0).text().trim(),
        thumbnail: $(".img_thumb img").attr("src"),
        watermark: $(".with_watermark").attr("href"),
        no_watermark: $(".without_watermark").attr("href"),
      };
      resolve(asds);
    });
  };
  tiktokDL = async url => {
    let domain = 'https://www.tikwm.com/';
    let res = await axios.post(domain+'api/', {}, {
        headers: {
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            // 'cookie': 'current_language=en; _ga=GA1.1.115940210.1660795490; _gcl_au=1.1.669324151.1660795490; _ga_5370HT04Z3=GS1.1.1660795489.1.1.1660795513.0.0.0',
            'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        },
        params: {
            url: url,
            count: 12,
            cursor: 0,
            web: 1,
            hd: 1
        }
    })

    return {
        nowm: domain+res.data.data.play, 
        wm: domain+res.data.data.wmplay, 
        music: domain+res.data.data.music, 
    }
}
ytsearch = async (searchText) => {
  if (!searchText) {
    throw new Error('Texto de búsqueda no especificado');
  }

  const results = await yts(searchText);

  const formattedResults = results.all.map((video) => {
    if (video.type === 'video') {
      return {
        title: video.title,
        url: video.url,
        duration: video.timestamp,
        uploaded: video.ago,
        views: video.views,
        thumbnail: video.thumbnail
     };
    }
    return null;
  }).filter(Boolean);

  return formattedResults;
};

 ytPlayMp3(query) {
  return new Promise((resolve, reject) => {
      try {
          const search = yts(query)
          .then((data) => {
              const url = []
              const pormat = data.all
              for (let i = 0; i < pormat.length; i++) {
                  if (pormat[i].type == 'video') {
                      let dapet = pormat[i]
                      url.push(dapet.url)
                  }
              }
              const id = ytdl.getVideoID(url[0])
              const yutub = ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`)
              .then((data) => {
                  let pormat = data.formats
                  let audio = []
                  let video = []
                  for (let i = 0; i < pormat.length; i++) {
                  if (pormat[i].mimeType == 'audio/webm; codecs=\"opus\"') {
                      let aud = pormat[i]
                      audio.push(aud.url)
                  }
                  }
                  const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
                  const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
                  const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
                  const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
                  const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
                  const result = {
                  title: title,
                  thumb: thumb,
                  channel: channel,
                  published: published,
                  views: views,
                  url: audio[0]
                  }
                  return(result)
              })
              return(yutub)
          })
          resolve(search)
      } catch (error) {
          reject(error)
      }
      console.log(error)
  })
}
 
  snackVideo = (url) => {
    return new Promise(async (resolve, reject) => {
      await axios
        .post("https://api.teknogram.id/v1/snackvideo", {
          url: url,
        })
        .then(({ data }) => {
          resolve(data);
        })
        .catch((e) => {
          reject(e.data);
        });
    });
  };
  soundCloude = (search) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, status } = await axios.get(
          `https://soundcloud.com/search?q=${search}`,
        );
        const $ = cheerio.load(data);
        const ajg = [];
        $("#app > noscript").each((u, i) => {
          ajg.push($(i).html());
        });
        const _$ = cheerio.load(ajg[1]);
        const hasil = [];
        _$("ul > li > h2 > a").each((i, u) => {
          if ($(u).attr("href").split("/").length === 3) {
            const linkk = $(u).attr("href");
            const judul = $(u).text();
            const link = linkk ? linkk : "Tidak ditemukan";
            const jdi = `https://soundcloud.com${link}`;
            const jadu = judul ? judul : "Tidak ada judul";
            hasil.push({
              link: jdi,
              judul: jadu,
            });
          }
        });
        if (hasil.every((x) => x === undefined))
          return { developer: "@xorizn", mess: "no result found" };
        resolve(hasil);
      } catch (err) {
        console.error(err);
      }
    });
  };
   async searchMp3(q) {
    const url = 'https://justnaija.com/search?q=' + q + '&SearchIt='; 
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const articles = [];

        $('article.result').each((index, element) => {
            const title = $(element).find('h3.result-title a').text().trim();
            const url = $(element).find('h3.result-title a').attr('href');
            const thumb = $(element).find('div.result-img img').attr('src');
            const desc = $(element).find('p.result-desc').text().trim();

            const article = {
                title,
                url,
                thumb,
                desc
            };
            articles.push(article);
        });

        return articles;
    } catch (err) {
        console.error(err);
    }
}
async GenerateCC(query) {
  try {
      const response = await fetch("https://tools.revesery.com/vcc/revesery.php?bin=" + parseInt(query), {
          method: "GET",
          headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
          }
      });

      if (!response.ok) {
          throw new Error("Gagal mengambil data.");
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const cards = [];
      $('hr').each((index, element) => {
          const [cardNumber, expirationDate, cvv] = $(element).prevAll('p').map((i, el) => $(el).text().split(': ')[1]);
          cards.push({
              card_number: cardNumber,
              expired_date: expirationDate,
              cvv: cvv
          });
      });

      return cards;
  } catch (error) {
      console.error(error);
      throw new Error("Failed to perform the search");
  }
}
  async getApp(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
  
      const $ = cheerio.load(html);
  
      const data = {
        title: $('h1.name').text().trim(),
        image: $('.icon').attr('src'),
        name: $('.app-name span').text().trim(),
        score: $('.score').text().trim(),
        edisi: $('.edition').text().trim(),
        size: $('.size .operate-cstTime').text().trim(),
        create: $('.size span').text().trim(),
        link: $('a.a_download').attr('href'),
        detail: $('.game-describe-gs').text().trim(),
        screenshots: $('.swiper-slide img').map((index, element) => $(element).attr('data-src')).get(),
        describe: $('.datail-describe-pre div').text().trim(),
      };
  
      return data;
    } catch (error) {
      console.log(error);
    }
  }
   async searchApp(q) {
    try {
      const url = 'https://m.playmods.net/id/search/' + q; // Ganti dengan URL sumber HTML
  
      const response = await fetch(url);
      const html = await response.text();
  
      const $ = cheerio.load(html);
  
      const dataArray = [];
  
      $('a.beautify.ajax-a-1').each((index, element) => {
        const $element = $(element);
  
        const data = {
          link: 'https://m.playmods.net' + $element.attr('href'),
          title: $element.find('.common-exhibition-list-detail-name').text().trim(),
          menu: $element.find('.common-exhibition-list-detail-menu').text().trim(),
          detail: $element.find('.common-exhibition-list-detail-txt').text().trim(),
          image: $element.find('.common-exhibition-list-icon img').attr('data-src'),
          downloadText: $element.find('.common-exhibition-line-download').text().trim(),
        };
  
        dataArray.push(data);
      });
      return dataArray;
    } catch (error) {
      console.log(error);
    }
  }
  playStore = (search) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, status } = await axios.get(
          `https://play.google.com/store/search?q=${search}&c=apps`,
        );
        const hasil = [];
        const $ = cheerio.load(data);
        $(
          ".ULeU3b > .VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.Y8RQXd > .VfPpkd-aGsRMb > .VfPpkd-EScbFb-JIbuQc.TAQqTe > a",
        ).each((i, u) => {
          const linkk = $(u).attr("href");
          const nama = $(u).find(".j2FCNc > .cXFu1 > .ubGTjb > .DdYX5").text();
          const developer = $(u)
            .find(".j2FCNc > .cXFu1 > .ubGTjb > .wMUdtb")
            .text();
          const img = $(u).find(".j2FCNc > img").attr("src");
          const rate = $(u)
            .find(".j2FCNc > .cXFu1 > .ubGTjb > div")
            .attr("aria-label");
          const rate2 = $(u)
            .find(".j2FCNc > .cXFu1 > .ubGTjb > div > span.w2kbF")
            .text();
          const link = `https://play.google.com${linkk}`;

          hasil.push({
            link: link,
            nama: nama ? nama : "No name",
            developer: developer ? developer : "No Developer",
            img: img ? img : "https://i.ibb.co/G7CrCwN/404.png",
            rate: rate ? rate : "No Rate",
            rate2: rate2 ? rate2 : "No Rate",
            link_dev: `https://play.google.com/store/apps/developer?id=${developer
              .split(" ")
              .join("+")}`,
          });
        });
        if (hasil.every((x) => x === undefined))
          return resolve({ developer: "@xorizn", mess: "no result found" });
        resolve(hasil);
      } catch (err) {
        console.error(err);
      }
    });
  };
  Steam = (search) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data, status } = await axios.get(
          "https://store.steampowered.com/search/?term=" + search,
        );
        const $ = cheerio.load(data);
        const hasil = [];
        $("#search_resultsRows > a").each((a, b) => {
          const link = $(b).attr("href");
          const judul = $(b)
            .find(
              `div.responsive_search_name_combined > div.col.search_name.ellipsis > span`,
            )
            .text();
          const harga = $(b)
            .find(
              `div.responsive_search_name_combined > div.col.search_price_discount_combined.responsive_secondrow > div.col.search_price.responsive_secondrow `,
            )
            .text()
            .replace(/ /g, "")
            .replace(/\n/g, "");
          var rating = $(b)
            .find(
              `div.responsive_search_name_combined > div.col.search_reviewscore.responsive_secondrow > span`,
            )
            .attr("data-tooltip-html");
          const img = $(b).find(`div.col.search_capsule > img`).attr("src");
          const rilis = $(b)
            .find(
              `div.responsive_search_name_combined > div.col.search_released.responsive_secondrow`,
            )
            .text();

          if (typeof rating === "undefined") {
            var rating = "no ratings";
          }
          if (rating.split("<br>")) {
            let hhh = rating.split("<br>");
            var rating = `${hhh[0]} ${hhh[1]}`;
          }
          hasil.push({
            judul: judul,
            img: img,
            link: link,
            rilis: rilis,
            harga: harga ? harga : "no price",
            rating: rating,
          });
        });
        if (hasil.every((x) => x === undefined))
          return resolve({ developer: "@xorizn", mess: "no result found" });
        resolve(hasil);
      } catch (err) {
        console.error(err);
      }
    });
  };
  roboguru = async (pertayaan) => {
    return new Promise(async (resolve, reject) => {
      axios.get("https://roboguru.ruangguru.com/api/v3/roboguru-discovery/search/question?gradeSerial=3GAWQ3PJRB&subjectName=Bahasa%20Indonesia&withVideo=true&text=" + pertayaan + "&imageURL=&singleQuestion=false", {
        "headers": {
          "content-type": "application/json",
          "country": "id",
          "disable-node-proxy": "false",
          "platform": "web",
          "with-auth": "true",
          "cookie": "__rg_cookie_id__=5dfa07d3-b70d-4f55-9b87-de807d217c5a; role=student; isLoggedIn=false; _fbp=fb.1.1692430424111.1265232896; _ga=GA1.2.2016682901.1692430419; _ga_XXZDPTKN3B=GS1.2.1692481599.4.1.1692481627.0.0.0; _ga_CM5DLCK5E0=GS1.2.1692481599.4.1.1692481627.0.0.0; _ga_M3WCHJPBC6=GS1.2.1692481600.4.1.1692481627.33.0.0; _ga_2FWJ6H3WGT=GS1.2.1692481600.4.1.1692481627.33.0.0; _ga_MZNBZXV2VM=GS1.1.1692481597.4.1.1692481631.0.0.0; _ga_KGEN8KBRBW=GS1.1.1692481598.4.1.1692481631.0.0.0; _ga_EN706YSJ4M=GS1.1.1692481598.4.1.1692481631.27.0.0; __gads=ID=9b2f716c07448102:T=1692432625:RT=1692481639:S=ALNI_MYfgMGMtvKqXukFIr4bFzfDR9OkTw; __gpi=UID=00000c2f116e7701:T=1692432625:RT=1692481639:S=ALNI_Ma67IvFbfhGFxwYx5N_gFknJqEz1w; userID=user76G04RAHAKI1; __cf_bm=O5NIBn2hVeo8tkcyaTmFiVmy0p7rj1Lijw0QH4bpuwA-1694247717-0-AT5tS8p0iirsVJfVLkZ8aEEVZldFeZGTiYFvNQWbCro8siqBcNEY7c2M2ssbJtR1szNHsxtDYu//gnI5ycZX1EM=; _roboguruSession=29212bfe-65e6-460c-b416-d1634ac14640; __tracker_session_id__=ea0ef080-b5f1-473c-8fe7-2ac5276ea98f; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJydCI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpoYm05dUlqcDBjblZsTENKbGVIQWlPakUyT1RZNE16azNNalVzSW5Wdll5STZJblZ6WlhJM05rY3dORkpCU0VGTFNURWlMQ0p5SWpvaWMzUjFaR1Z1ZENJc0luUnZhMlZ1U1VRaU9pSXhOamt5TkRNd05EQTVOVGszT1RFeU1qUXdJbjAuaUFPVlFfWFB2MWdyVzY3WFRoWGc3YmdNNU9ZT2dMTklVUm9qWWVKaXkwOCIsImFub24iOnRydWUsImV4cCI6MTY5NDMzNDEyNSwidW9jIjoidXNlcjc2RzA0UkFIQUtJMSIsInIiOiJzdHVkZW50IiwidG9rZW5JRCI6IjE2OTI0MzA0MDk1OTc5MTIyNDAifQ.OT51MzlNFoVkudFB0RZz2bujaRRR4lWIdokagdG2EeY; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbm9uIjp0cnVlLCJleHAiOjE2OTY4Mzk3MjUsInVvYyI6InVzZXI3NkcwNFJBSEFLSTEiLCJyIjoic3R1ZGVudCIsInRva2VuSUQiOiIxNjkyNDMwNDA5NTk3OTEyMjQwIn0.iAOVQ_XPv1grW67XThXg7bgM5OYOgLNIURojYeJiy08; expireToken=1694333945000"
        }
      }).then(({ data }) => {
        let result = data.data.questions
        var azfir = result[Math.floor(Math.random() * (result.length))]
        let hasil = azfir.contentDefinition
        resolve(hasil)
      })
    })
  }
  xnxxdl(URL) {
    return new Promise((resolve, reject) => {
      fetch(`${URL}`, {method: 'get'}).then((res) => res.text()).then((res) => {
        const $ = cheerio.load(res, {xmlMode: false});
        const title = $('meta[property="og:title"]').attr('content');
        const duration = $('meta[property="og:duration"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');
        const videoType = $('meta[property="og:video:type"]').attr('content');
        const videoWidth = $('meta[property="og:video:width"]').attr('content');
        const videoHeight = $('meta[property="og:video:height"]').attr('content');
        const info = $('span.metadata').text();
        const videoScript = $('#video-player-bg > script:nth-child(6)').html();
        const files = {
          low: (videoScript.match('html5player.setVideoUrlLow\\(\'(.*?)\'\\);') || [])[1],
          high: videoScript.match('html5player.setVideoUrlHigh\\(\'(.*?)\'\\);' || [])[1],
          HLS: videoScript.match('html5player.setVideoHLS\\(\'(.*?)\'\\);' || [])[1],
          thumb: videoScript.match('html5player.setThumbUrl\\(\'(.*?)\'\\);' || [])[1],
          thumb69: videoScript.match('html5player.setThumbUrl169\\(\'(.*?)\'\\);' || [])[1],
          thumbSlide: videoScript.match('html5player.setThumbSlide\\(\'(.*?)\'\\);' || [])[1],
          thumbSlideBig: videoScript.match('html5player.setThumbSlideBig\\(\'(.*?)\'\\);' || [])[1]};
        resolve({status: true, result: {title, URL, duration, image, videoType, videoWidth, videoHeight, info, files}});
      }).catch((err) => reject({status: false, result: err}));
    });
  }
  async tiktokStalk(username, options) {
    try {
      username = username.replace("@", "");
      const data = await TiktokStalk(username);
      if (!data || !data?.result || !data?.result?.users || !data?.result?.stats) return { status: false, message: 'Username not found, check again.' };
      const userData = data.result.users;
      const statsData = data.result.stats;
      return {
            username: userData.username,
            nickname: userData.nickname,
            pp_thumbnail: userData.avatarLarger,
            description: userData.signature,
            isVerify: userData.verified,
            isPrivate: userData.privateAccount,
            isUserCommerce: userData.commerceUser,
            region: userData.region,
            followers: statsData.followerCount,
            following: statsData.followingCount,
            friends: statsData.friendCount,
            totalLikes: statsData.heartCount,
            totalVideos: statsData.videoCount,
            totalPosts: statsData.postCount,
            LastUsernameModification: userData.usernameModifyTime,
            LastNicknameModification: userData.nicknameModifyTime
      };
    } catch (e) {
      return e.message;
    }
  }
  async getpesan(correoCompleto) {
    const [id, dominio] = correoCompleto.split('@');
    const link = `https://www.1secmail.com/api/v1/?action=getMessages&login=${id}&domain=${dominio}`;

    try {
        let respuesta = await fetch(link);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP!: ${respuesta.status}`);
        }
        let datos = await respuesta.json();

        if (datos.length === 0) {
            return {
                msg: 'There are no emails received so far.'
            };
        }

        return {
            status: true,
            correos: datos
        };
    } catch (error) {
        console.log(error);
        return {
            error: "An error occurred while fetching messages."
        };
    }
}
  async getemail() {
    const enlace = "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1";

    try {
        let respuesta = await fetch(enlace);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP!: ${respuesta.status}`);
        }
        let datos = await respuesta.json();
        return {
            mail: datos[0]
        };
    } catch (error) {
        console.log(error);
        return {
            error: "An error occurred while generating the random email."
        };
    }
}
  musixmatch = async (query) => {
    return new Promise(async (resolve, reject) => {
      var head = {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 9; CPH1923) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.62 Mobile Safari/537.36",
        cookie:
          '_ga=GA1.2.441416655.1634297437;mxm_bab=AA;translate_lang=%7B%22key%22%3A%22en%22%2C%22name%22%3A%22English%22%7D;musixmatchUserGuid=52e1d4e2-d43b-4967-8e59-1ef509587670;_fbp=fb.1.1634297482993.1340831124;__gads=ID=0ccb6c42e7f8313c:T=1634297495:S=ALNI_MZayOdokwd1yBB_nvZsZyeSipObRA;OB-USER-TOKEN=c2924a56-8a80-43c4-9a07-1c5436f81df1;cto_bundle=HN5V619DYzElMkYwcHg5TTBHZ1A3aVBrVGE0dm1IQ0JjSElBNlJLZHZnUnRmajBkTHJzZFlDJTJCeEhZNXFLdXhDd0lzSk1iYUdhelpGWiUyRmhTcGhFeUtsUm9kc2sxcmNObmxnWXhNSlNTWndlandzME9qUW5RejBkeU1wODN1dGdUNU9Camh3ZkxIblJOZWRRMXZ3VXZWN2Zpd1k1bVElM0QlM0Q;_gid=GA1.2.1759477921.1634405633;FCCDCF=[null,null,["[[],[],[],[],null,null,true]",1634405633077],null];FCNEC=[["AKsRol-gRsxKEL-RmoS4K6so7IKZfHZKJHy7Woat0wLwYrsww6PoSZro61n7_XLCNN2V5Rp7oJ-Lp6jrmIKJ4XigsgEBL82KOVvdKa0IwzpwLNSUwnenmJPufFoFpY5lE482Yyrr43YLfRDVngc2q4WtOnLdBJqa_g=="]]',
      };
      await axios
        .request({
          method: "GET",
          url: `https://www.musixmatch.com/search/${encodeURIComponent(query)}`,
          headers: head,
        })
        .then(async (anu) => {
          const $ = cheerio.load(anu.data);
          const urlnya =
            "https://www.musixmatch.com" +
            $("meta[itemProp='url']").attr("content");
          let resulter = new Array();
          await axios
            .request({
              method: "get",
              url: urlnya,
              headers: head,
            })
            .then((result) => {
              const _ = cheerio.load(result.data);
              let parse;
              for (let aw of _("script").eq(5).get()) {
                const json = aw.children[0].data;
                parse = JSON.parse(json);
              }
              const resulter = {
                url: parse.mainEntityOfPage,
                title: parse.headline,
                thumb: parse.thumbnailUrl,
                lyrics: _("p.mxm-lyrics__content > span").text().trim(),
              };
              resolve(resulter);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  };

  aigpt(text) {
    return new Promise(async (resolve, reject) => {
      axios("https://www.chatgptdownload.org/wp-json/mwai-ui/v1/chats/submit", {
        "headers": {
          "content-type": "application/json",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
        },
        data: {
          "id": null,
          "botId": "default",
          "session": "y2cog0j45q",
          "clientId": "7tzjniqtrgx",
          "contextId": 443,
          "messages": [{
            "id": "fkzhaikd7vh",
            "role": "assistant",
            "content": "Ini adalah Ai, yang diciptakan oleh perusaan Rokumo Enterpise",
            "who": "AI: ",
            "timestamp": 1695725910365
          }],
          "newMessage": text,
          "stream": false
        },
        "method": "POST"
      }).then(response => {
        resolve(response.data);
      });
    });
  };



  quotesAnime() {
    return new Promise((resolve, reject) => {
    const page = Math.floor(Math.random() * 184)
    axios.get('https://otakotaku.com/quote/feed/'+page)
    .then(({ data }) => {
    const $ = cheerio.load(data)
    const hasil = []
    $('div.kotodama-list').each(function(l, h) {
    hasil.push({
    link: $(h).find('a').attr('href'),
    gambar: $(h).find('img').attr('data-src'),
    karakter: $(h).find('div.char-name').text().trim(),
    anime: $(h).find('div.anime-title').text().trim(),
    episode: $(h).find('div.meta').text(),
    up_at: $(h).find('small.meta').text(),
    quotes: $(h).find('div.quote').text().trim()
    })
    })
    resolve(hasil)
    }).catch(reject)
    })
    }
  ytPlayVid = (query) => {
    return new Promise((resolve, reject) => {
      yts(query)
        .then(async (getData) => {
          let result = getData.videos.slice(0, 5);
          let url = [];
          for (let i = 0; i < result.length; i++) {
            url.push(result[i].url);
          }
          let random = url[0];
          let getVideo = await this.ytMp4(random);
          resolve(getVideo);
        })
        .catch(reject);
    });
  };
}

class YoutubeConverter {
  async analyzeAndConvert(videoUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        const searchData = `query=${encodeURIComponent(videoUrl)}&vt=home`;
        const searchResponse = await axios.post("https://9convert.com/api/ajaxSearch/index", searchData, { headers: this.searchHeaders });

        const json = searchResponse.data
        const video = {};
        Object.values(json.links.mp4).forEach(({ q, size, k }) => {
          video[q] = {
            quality: q,
            fileSizeH: size,
            fileSize: parseFloat(size) * (/MB$/.test(size) ? 1000 : 1),
            download: () => this.convert(json.vid, k)
          };
        });
        const audio = {};
        Object.values(json.links.mp3).forEach(({ q, size, k }) => {
          audio[q] = {
            quality: q,
            fileSizeH: size,
            fileSize: parseFloat(size) * (/MB$/.test(size) ? 1000 : 1),
            download: () => this.convert(json.vid, k)
          };
        });
        const res = {
          id: json.vid,
          title: json.title,
          thumbnail: `https://i.ytimg.com/vi/${json.vid}/0.jpg`,
          video,
          audio
        };
        resolve(res)
      } catch (error) {
        reject(error)
      }
    })
  }

  async convert(vid, k) {
    return new Promise(async (resolve, reject) => {
      const params = `vid=${vid}&k=${k}`;
      const { data } = await axios.post("https://9convert.com/api/ajaxConvert/convert", params, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        },
      })
      if (data.c_status == "CONVERTING") {
        const param = `vid=${vid}&b_id=${data.b_id}`
        const json = (await axios.post("https://9convert.com/api/ajaxConvert/checkTask", params, {
          headers: {
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          },
        }))
        resolve(json.data.dlink)
      } else {
        resolve(data.dlink)
      }
    })
  }
}

const YouTubeConvert = async (url) => {
  return new Promise(async (resolve, reject) => {
    try {
    const converter = new YoutubeConverter();
    const data = await converter.analyzeAndConvert('https://youtu.be/jsAn9AKWK40?si=6BtmluLIcbhwLTEs')
    resolve(data)
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = { YouTube };
	
