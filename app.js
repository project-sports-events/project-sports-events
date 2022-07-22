// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

//isloggedin
const isLoggedIn = require("./middleware/isLoggedIn");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const capitalized = require("./utils/capitalized");
const projectName = "project-sports-event";

// app.locals.appTitle = `${capitalized(projectName)} created with IronLauncher`;

const findUserSession = require("./middleware/checkUserLoginDetails");
app.use("/", findUserSession);

// 👇 Start handling routes here
const index = require("./routes/index.routes");
app.use("/", index);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const eventRoutes = require("./routes/events.routes");

app.use("/events", isLoggedIn, eventRoutes);

const profileRoutes = require("./routes/profile.routes");
app.use("/profile", profileRoutes);
// app.use("/profile", userLogin);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
