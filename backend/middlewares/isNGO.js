module.exports.isNGO = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'ngo') {
      return next();
    }
    res.redirect('/ngo/login'); // If not NGO, redirect to login
  };
  