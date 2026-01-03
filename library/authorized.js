module.exports = {
	isAuthenticated: function (req, res, next) {
	  if (req.isAuthenticated()) {
		return next();
	  }
	  req.flash("error_msg", "Please login to continue");
	  res.redirect("/users/login");
	},
	notAuthenticated: function (req, res, next) {
	  if (!req.isAuthenticated()) {
		return next();
	  }
	  res.redirect("/docs");
	},
	reCaptchaLogin: function (req, res, next) {
	  if (!req.recaptcha.error) {
		return next();
	  }
	  req.flash("error_msg", "ReCaptcha Incorrect");
	  res.redirect("/users/login");
	},
	isAdmin: function (req, res, next) {
	  if (req.user.role === "Admin") {
		return next();
	  } else {
		req.flash("error_msg", "You do not have permission to access this page.");
		res.redirect("/docs");
	  }
	},
  };