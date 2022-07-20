const router = require("express").Router();
const User = require("../models/User.model");
const userLogin = require("../middleware/isLoggedIn");
const Event = require("../models/Event.model");

/* GET home page */
router.get("/", userLogin, (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.session.user._id;

  const userEvents = {
    pendingEvents: [],
    confirmedEvents: [],
  };

  Event.find()
    .then((data) => {
      data.forEach((element) => {
        if (
          element.players.indexOf(userId) > -1 &&
          element.numberOfRequiredPlayers > 0
        ) {
          userEvents.pendingEvents.push(element);
        } else if (
          element.players.indexOf(userId) > -1 &&
          element.numberOfRequiredPlayers === 0
        ) {
          userEvents.confirmedEvents.push(element);
        }
      });
      return userEvents;
    })
    .then((userEvents) => {
      console.log(userEvents);
      res.render("profile", userEvents);
    });
});

module.exports = router;
