const axios = require("axios");

class SpotifyWrapper {
    constructor() {
        this._author = "";
        this._album = "";
        this._startTimestamp = 0;
        this._endTimestamp = 0;
        this._image = "";
        this._title = "";
        this._blur = 0;
        this._overlayOpacity = 0.7;
    }
    setAuthor(author) { this._author = author; return this; }
    setAlbum(album) { this._album = album; return this; }
    setTimestamp(start, end) { this._startTimestamp = start; this._endTimestamp = end; return this; }
    setImage(image) { this._image = image; return this; }
    setTitle(title) { this._title = title; return this; }
    setBlur(blur) { this._blur = blur; return this; }
    setOverlayOpacity(opacity) { this._overlayOpacity = opacity; return this; }
    async build() {
        const params = new URLSearchParams({
            author: this._author,
            album: this._album,
            image: this._image,
            title: this._title
        });
        const response = await axios.get(`https://some-random-api.com/canvas/misc/spotify?${params.toString()}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    }
}

class RankWrapper {
    constructor() {
        this._avatar = "";
        this._background = "";
        this._username = "";
        this._border = "";
        this._level = 0;
        this._currentXp = 0;
        this._requiredXp = 0;
        this._rank = 1;
    }
    setAvatar(avatar) { this._avatar = avatar; return this; }
    setBackground(type, url) { this._background = url; return this; }
    setUsername(username) { this._username = username; return this; }
    setBorder(border) { this._border = border; return this; }
    setLevel(level) { this._level = level; return this; }
    setCurrentXp(xp) { this._currentXp = xp; return this; }
    setRequiredXp(xp) { this._requiredXp = xp; return this; }
    setRank(rank) { this._rank = rank; return this; }
    async build() {
        const params = new URLSearchParams({
            username: this._username,
            avatar: this._avatar,
            level: this._level.toString(),
            currentxp: this._currentXp.toString(),
            reqxp: this._requiredXp.toString()
        });
        const response = await axios.get(`https://some-random-api.com/canvas/misc/rankcard?${params.toString()}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    }
}

class LevelUpWrapper {
    constructor() {
        this._avatar = "";
        this._background = "";
        this._username = "";
        this._border = "";
        this._avatarBorder = "";
        this._overlayOpacity = 0.7;
        this._levelBefore = 0;
        this._levelAfter = 0;
    }
    setAvatar(avatar) { this._avatar = avatar; return this; }
    setBackground(type, url) { this._background = url; return this; }
    setUsername(username) { this._username = username; return this; }
    setBorder(border) { this._border = border; return this; }
    setAvatarBorder(border) { this._avatarBorder = border; return this; }
    setOverlayOpacity(opacity) { this._overlayOpacity = opacity; return this; }
    setLevels(before, after) { this._levelBefore = before; this._levelAfter = after; return this; }
    async build() {
        const params = new URLSearchParams({
            avatar: this._avatar,
            username: this._username,
            before: this._levelBefore.toString(),
            after: this._levelAfter.toString()
        });
        try {
            const response = await axios.get(`https://some-random-api.com/canvas/misc/levelup?${params.toString()}`, { responseType: "arraybuffer" });
            return Buffer.from(response.data);
        } catch (e) {
            const response = await axios.get(`https://some-random-api.com/canvas/misc/rankcard?username=${this._username}&avatar=${this._avatar}&level=${this._levelAfter}&currentxp=0&reqxp=100`, { responseType: "arraybuffer" });
            return Buffer.from(response.data);
        }
    }
}

class ShipWrapper {
    constructor() {
        this._avatar1 = "";
        this._avatar2 = "";
        this._background = "";
        this._border = "";
        this._overlayOpacity = 0.5;
    }
    setAvatars(avatar1, avatar2) { this._avatar1 = avatar1; this._avatar2 = avatar2; return this; }
    setBackground(type, url) { this._background = url; return this; }
    setBorder(border) { this._border = border; return this; }
    setOverlayOpacity(opacity) { this._overlayOpacity = opacity; return this; }
    async build() {
        const response = await axios.get(`https://some-random-api.com/canvas/misc/ship?avatar=${encodeURIComponent(this._avatar1)}&avatar2=${encodeURIComponent(this._avatar2)}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    }
}

class CaptchaWrapper {
    constructor() {
        this._background = "";
        this._captchaKey = "";
        this._border = "";
        this._overlayOpacity = 0.7;
    }
    setBackground(type, url) { this._background = url; return this; }
    setCaptchaKey(key) { this._captchaKey = key; return this; }
    setBorder(border) { this._border = border; return this; }
    setOverlayOpacity(opacity) { this._overlayOpacity = opacity; return this; }
    async build() {
        const response = await axios.get(`https://some-random-api.com/canvas/misc/captcha?avatar=${encodeURIComponent(this._background)}&text=${encodeURIComponent(this._captchaKey)}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    }
}

class WelcomeLeaveWrapper {
    constructor() {
        this._avatar = "";
        this._background = "";
        this._title = "";
        this._description = "";
        this._border = "";
        this._avatarBorder = "";
        this._overlayOpacity = 0.3;
    }
    setAvatar(avatar) { this._avatar = avatar; return this; }
    setBackground(type, url) { this._background = url; return this; }
    setTitle(title) { this._title = title; return this; }
    setDescription(desc) { this._description = desc; return this; }
    setBorder(border) { this._border = border; return this; }
    setAvatarBorder(border) { this._avatarBorder = border; return this; }
    setOverlayOpacity(opacity) { this._overlayOpacity = opacity; return this; }
    async build() {
        const params = new URLSearchParams({
            avatar: this._avatar,
            username: this._title,
            discriminator: this._description.substring(0, 4) || "0001",
            guildName: this._description,
            memberCount: "1"
        });
        const response = await axios.get(`https://some-random-api.com/welcome/img/7/stars?${params.toString()}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    }
}

const Image = {
    async affect(url) {
        const response = await axios.get(`https://some-random-api.com/canvas/overlay/comrade?avatar=${encodeURIComponent(url)}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    },
    async batslap(avatar1, avatar2) {
        const response = await axios.get(`https://some-random-api.com/canvas/misc/batslap?avatar=${encodeURIComponent(avatar1)}&avatar2=${encodeURIComponent(avatar2)}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    },
    async darkness(url, level = 100) {
        const response = await axios.get(`https://some-random-api.com/canvas/filter/brightness?avatar=${encodeURIComponent(url)}&brightness=10`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    },
    async delete(url) {
        const response = await axios.get(`https://some-random-api.com/canvas/misc/nobitches?no=${encodeURIComponent(url)}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    },
    async gay(url) {
        const response = await axios.get(`https://some-random-api.com/canvas/overlay/gay?avatar=${encodeURIComponent(url)}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    },
    async greyscale(url) {
        const response = await axios.get(`https://some-random-api.com/canvas/filter/greyscale?avatar=${encodeURIComponent(url)}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    },
    async invert(url) {
        const response = await axios.get(`https://some-random-api.com/canvas/filter/invert?avatar=${encodeURIComponent(url)}`, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    }
};

module.exports = {
    Spotify: SpotifyWrapper,
    Rank: RankWrapper,
    LevelUp: LevelUpWrapper,
    Ship: ShipWrapper,
    Captcha: CaptchaWrapper,
    WelcomeLeave: WelcomeLeaveWrapper,
    Image
};
