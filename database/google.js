const { db } = require("./model")

const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const config = require("../../config")

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
    clientId: "855077106553-mcabh21glhbft8k35pa1oslu39gius0k.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "https://hosei.xyz/users/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
    	const users = await db.findOne({ email: profile.emails[0].value }) 
    	if (users) {
    		return done(null, users)
    	} else {
    		const keys = await randomText(12)
    		const obj = {
    			googleId: profile.id,
    			username: profile.displayName,
    			email: profile.emails[0].value,
    			limit: 30,
    			profile: profile.photos[0].value,
    			apikey: "HC-" + keys,
    			premium: false,
    			premiumTime: 0
    		}
    		
    		await db.create(obj)
    		return done(null, obj);
    	} 
    } catch (err) {
    	return done(err, false);
    }
  }));
  
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(async function(obj, done) {
    try {
      const user = await db.findById(obj._id);
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  });
}

function randomText (length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let txt = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    txt += characters.charAt(randomIndex);
  }

  return txt;
};
