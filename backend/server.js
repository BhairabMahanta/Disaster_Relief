// Requires
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const disasterRoutes = require('./routes/disasterRoutes');
const registerRoutes = require('./routes/registerRoutes');
const homeRoutes = require('./routes/homeRoutes');
const droneRoutes = require('./routes/droneRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const chatBotRoutes = require('./routes/chatBotRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const citizenRoutes = require('./routes/citizenRoutes');
const fetchAndStoreGdacsData = require('./utils/fetchGdacs');
const Alert = require('./models/Disaster');
const cron = require("node-cron");
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');
const bodyParser = require('body-parser');
const Mission = require('./models/Mission');
const cors = require('cors');
const { IsLoggedIn } = require("./middlewares/isLoggedIn");
const LocalStrategy = require('passport-local').Strategy;
const { getGraphData, getDeathsData } = require('./utils/fetchGraph'); 
const { sendDroneDispatchEmail, sendDroneCompletionEmail } = require('./utils/sendDroneEmail');
const methodOverride = require('method-override');
const emergencyRoutes = require("./routes/emergency");

dotenv.config();

// Middlewares
const app = express();

// Port Set-up
const port = process.env.PORT || 8080;
app.use(cors());
app.use(bodyParser.json());
// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(express.static('public'));
app.use("/uploads", express.static("uploads"));

//Handling method-override
app.use(methodOverride('_method'));

// Handling Post Request
app.use(express.urlencoded({ extended: true }));

// Sessions and passport
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10 * 60 * 1000 }
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

// Routes
app.use('/api/disasters', disasterRoutes);
app.use('/auth', registerRoutes);
app.use('/drone', droneRoutes);
app.use('/ngo', ngoRoutes);
app.use('/citizen', citizenRoutes);
app.use('/admin', adminRoutes);
app.use('/resources', resourceRoutes);
app.use('/chatBot', chatBotRoutes);
app.use('/weather', weatherRoutes);
app.use("/emergency", emergencyRoutes);
app.use('/', homeRoutes);

// Database Set-up
const db = mongoose.connect(process.env.MONGO_URL);
db.then(() => {
  console.log(`Connection to database is successful`);
}).catch((err) => {
  console.log(err);
});

// Run once at startup
fetchAndStoreGdacsData();
// Every 10min refresh
cron.schedule("*/10 * * * *", async () => {
  console.log('Fetching and storing GDACS data...');
  await fetchAndStoreGdacsData();
});

app.get("/api/graph-data", getGraphData);
app.get('/api/deaths-data', getDeathsData);

// Running server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

require('./utils/emailScheduler');
