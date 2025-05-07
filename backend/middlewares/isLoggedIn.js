module.exports.isLoggedIn = (req, res, next) =>{
    console.log("noptlogged")
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
}
  