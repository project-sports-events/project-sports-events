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
      const eventDatesPending = [];
      const eventDatesConfirmed = [];
      const differencePending = [];
      const differenceConfirmed = [];
      let date_2 = new Date();

      userEvents.pendingEvents.forEach((element) => {
        eventDatesPending.push(new Date(element.date));
      });

      eventDatesPending.forEach((element) => {
        differencePending.push(element.getTime() - date_2.getTime());
      });
      const totalDaysPending = [];
      differencePending.forEach((element) => {
        let totalDaysCalc = Math.ceil(element / (1000 * 3600 * 24));
        totalDaysPending.push(totalDaysCalc);
      });
      for (let i = 0; i < userEvents.pendingEvents.length; i++) {
        userEvents.pendingEvents[i].daysLeft = totalDaysPending[i];
        // console.log(userEvents.pendingEvents[i].daysLeft);
      }

      userEvents.pendingEvents.sort((a, b) => a.daysLeft - b.daysLeft);

      //SORT CONFIRMED PENDING DATES
      userEvents.confirmedEvents.forEach((element) => {
        eventDatesConfirmed.push(new Date(element.date));
      });

      eventDatesConfirmed.forEach((element) => {
        differenceConfirmed.push(element.getTime() - date_2.getTime());
      });
      const totalDaysConfirmed = [];
      differenceConfirmed.forEach((element) => {
        let totalDaysCalc = Math.ceil(element / (1000 * 3600 * 24));
        totalDaysConfirmed.push(totalDaysCalc);
      });
      for (let i = 0; i < userEvents.confirmedEvents.length; i++) {
        userEvents.confirmedEvents[i].daysLeft = totalDaysConfirmed[i];
        // console.log(userEvents.pendingEvents[i].daysLeft);
      }

      userEvents.confirmedEvents.sort((a, b) => a.daysLeft - b.daysLeft);

      return userEvents;
    })
    .then((userEvents) => {
      res.render("profile", userEvents);
    });
});

module.exports = router;
