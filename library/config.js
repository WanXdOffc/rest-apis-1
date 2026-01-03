const LocalStrategy = require("passport-local").Strategy;
const { getHashedPassword } = require("./functions");
const { User } = require("../database/model");

module.exports = function (passport) {
    passport.use(
        new LocalStrategy(
            {
                usernameField: "identifier", // Change the usernameField to identifier
                passwordField: "password", // Add passwordField to specify the password field
            },
            function (identifier, password, done) {
                let hashed = getHashedPassword(password);
                // Check if the identifier is an email or username
                User.findOne({
                    $or: [{ username: identifier }, { email: identifier }],
                }).then((user) => {
                    if (!user)
                        return done(null, false, {
                            message: "Invalid username or email",
                        });

                    if (!user.verif)
                        return done(null, false, {
                            message: "Your email is not verified. Please check your email.",
                        });

                    if (
                        (identifier === user.username || identifier === user.email) &&
                        hashed === user.password
                    )
                        return done(null, user, {
                            message: "Login Success",
                        });
                    else
                        return done(null, false, {
                            message: "Invalid password",
                        });
                });
            }
        )
    );

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};