//Requries
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const disasterRoutes = require('./routes/disasterRoutes');
const registerRoutes = require('./routes/registerRoutes');
const fetchAndStoreGdacsData = require('./utils/fetchGdacs');
const Alert = require('./models/Disaster');
const cron = require("node-cron");
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');
const {IsLoggedIn} = require("./middlewares/isLoggedIn");
const LocalStrategy = require('passport-local').Strategy;


dotenv.config();

//Middlewares
const app = express();

//Port Set-up
const port = process.env.PORT || 8080;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

//Handling Post Request
app.use(express.urlencoded({ extended: true })); 

//Sessions and passport
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false
}));
  
// Passport Configuration
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());
  
app.use((req, res, next) => {
    res.locals.user = req.user;  // Make the user object available in all views
    next();
});


//Routes
app.use('/api/disasters',disasterRoutes);
app.use('/auth',registerRoutes);

//Database Set-up
const db = mongoose.connect(process.env.MONGO_URL);
db.then(()=>{
    console.log(`Connection to database is successful`);
}).catch((err)=>{
    console.log(err);
})
app.get("/", async (req, res) => {
    res.send("hi");
  });

  // Run once at startup
  fetchAndStoreGdacsData();
  //Every 10min refresh
  cron.schedule("*/10 * * * *", async () => {
    console.log('Fetching and storing GDACS data...');
    await fetchAndStoreGdacsData();
  });
//Running server
app.listen(port,()=>{
    console.log(`Server is listening on port ${port}`);
})

require('./utils/emailScheduler'); 