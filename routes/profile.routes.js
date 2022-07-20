const router = require("express").Router();
const User = require("../models/User.model");
const userLogin = require("../middleware/isLoggedIn");
const Event = require("../models/Event.model");

/* GET home page */
router.get("/", userLogin, (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.session.user._id;

  const userEvents = [];

  Event.find()
    .then((data) => {
      // console.log(data);
      // console.log(data.length);
      data.forEach((element) => {
        if (element.players.indexOf(userId) > -1) {
          // console.log("user is in this event ", element);
          userEvents.push(element);
          // console.log("this is array of user events ", userEvents);
        }
      });
      // console.log("this is all user events", userEvents);
    })
    .then(() => {
      console.log(userEvents);
      res.render("profile", userEvents);
    });
});

module.exports = router;
