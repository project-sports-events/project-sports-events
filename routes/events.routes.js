const router = require("express").Router();
const { events } = require("../models/Event.model");
const Event = require("../models/Event.model");
// const isLoggedIn = require("../middleware/isLoggedIn");
/* GET home page */

router.get("/", (req, res, next) => {
  Event.find()
    .then((data) => {
      const eventsPending = [];
      data.forEach((element) => {
        if (element.numberOfRequiredPlayers > 0) {
          eventsPending.push(element);
        }
      });
      return eventsPending;
    })
    .then((eventsPending) => {
      const chosenSportsArr = [];

      eventsPending.forEach((element) => {
        if (element.typeOfSport === "football") {
          chosenSportsArr.push("9917");
        } else if (element.typeOfSport === "tennis") {
          chosenSportsArr.push("127934");
        } else if (element.typeOfSport === "basketball") {
          chosenSportsArr.push("127936");
        }
      });

      const eventDates = [];
      const difference = [];
      let date_2 = new Date();

      eventsPending.forEach((element) => {
        eventDates.push(new Date(element.date));
      });

      eventDates.forEach((element) => {
        difference.push(element.getTime() - date_2.getTime());
      });

      const totalDays = [];
      difference.forEach((element) => {
        let totalDaysCalc = Math.ceil(element / (1000 * 3600 * 24));
        totalDays.push(totalDaysCalc);
      });

      for (let i = 0; i < eventsPending.length; i++) {
        eventsPending[i].daysLeft = totalDays[i];
        eventsPending[i].chosenSport = chosenSportsArr[i];
      }
      //CHECK TYPE OF SPORT

      res.render("events", { eventsPending });
    });
});

router.get("/search", (req, res, next) => {
  const { typeOfSport, location, price } = req.query;

  const filterObj = {};

  if (location) {
    filterObj.location = location;
  }

  if (typeOfSport) {
    filterObj.typeOfSport = typeOfSport;
  }

  if (price) {
    filterObj.price = price;
  }

  if (!filterObj) {
    res.redirect("/events");
  } else {
    Event.find(filterObj)
      .then((data) => {
        const eventsPending = [];
        data.forEach((element) => {
          if (element.numberOfRequiredPlayers > 0) {
            eventsPending.push(element);
          }
        });
        return eventsPending;
      })
      .then((eventsPending) => {
        const eventDates = [];
        const difference = [];
        let date_2 = new Date();

        eventsPending.forEach((element) => {
          eventDates.push(new Date(element.date));
        });

        eventDates.forEach((element) => {
          difference.push(element.getTime() - date_2.getTime());
        });

        const totalDays = [];
        difference.forEach((element) => {
          let totalDaysCalc = Math.ceil(element / (1000 * 3600 * 24));
          totalDays.push(totalDaysCalc);
        });

        for (let i = 0; i < eventsPending.length; i++) {
          eventsPending[i].daysLeft = totalDays[i];
        }
        res.render("events", { eventsPending });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.get("/sort", (req, res, next) => {
  const { sortEvent } = req.query;

  Event.find({})
    .sort(sortEvent)
    .then((data) => {
      const eventsPending = [];
      data.forEach((element) => {
        eventsPending.push(element);
      });
      return eventsPending;
    })
    .then((eventsPending) => {
      const eventDates = [];
      const difference = [];
      let date_2 = new Date();

      eventsPending.forEach((element) => {
        eventDates.push(new Date(element.date));
      });

      eventDates.forEach((element) => {
        difference.push(element.getTime() - date_2.getTime());
      });

      const totalDays = [];
      difference.forEach((element) => {
        let totalDaysCalc = Math.ceil(element / (1000 * 3600 * 24));
        totalDays.push(totalDaysCalc);
      });

      for (let i = 0; i < eventsPending.length; i++) {
        eventsPending[i].daysLeft = totalDays[i];
      }
      res.render("events", { eventsPending });
    });
});

router.get("/create", (req, res, next) => {
  res.render("create-event");
});

router.post("/create", (req, res, next) => {
  const {
    typeOfSport,
    title,
    location,
    numberOfRequiredPlayers,
    price,
    date,
    time,
  } = req.body;
  const author = req.session.user._id;

  Event.create({
    typeOfSport,
    title,
    location,
    numberOfRequiredPlayers,
    price,
    author,
    date,
    time,
  })
    .then((data) => {
      data.players.push(data.author);
      data.save();
      Event.find().then((data) => {
        res.redirect("/events"), { data };
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  const userId = req.session.user._id;

  Event.findById(id)
    .populate("players")
    .populate("author")
    .then((data) => {
      let isCreator = false;

      if (data.author._id == userId) {
        isCreator = true;
      }
      const playersArr = data.players;
      let isBooked = false;
      playersArr.forEach((element) => {
        if (element._id == userId) {
          isBooked = true;
        }
      });

      data.isBooked = isBooked;
      data.isCreator = isCreator;

      res.render("event-details", data);
    });
});

router.post("/:id/book", (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.session.user._id;

  Event.findById(eventId).then((data) => {
    const playersArr = data.players;

    //check if user has already booked
    let isBooked = false;
    if (data.numberOfRequiredPlayers > 0) {
      if (playersArr.indexOf(userId) === -1) {
        data.players.push(userId);
        data.numberOfRequiredPlayers -= 1;
        data.save();
        res.redirect(`/events/${eventId}`);
        // res.redirect("/profile");
      } else {
        res.redirect(`/events/${eventId}`);
      }
    } else {
      res.redirect(`/events/${eventId}`);
    }
  });
});

//Remove user from booking

router.post("/:id/cancel", (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.session.user._id;

  Event.findById(eventId).then((data) => {
    const playersArr = data.players;
    let isCreator = false;

    if (playersArr.indexOf(userId) > -1) {
      let userIndexPosition = playersArr.indexOf(userId);
      data.players.splice(userIndexPosition, 1);
      data.numberOfRequiredPlayers += 1;
      data.save();
      res.redirect(`/events/${eventId}`);
    }
  });
});

// form edit:
router.get("/:id/edit", (req, res, next) => {
  const eventId = req.params.id;

  Event.findById(eventId)
    .then((data) => {
      res.render("event-edit", data);
    })
    .catch((error) => next(error));
});

router.post("/:id/edit", (req, res, next) => {
  const eventId = req.params.id;
  const {
    typeOfSport,
    title,
    location,
    numberOfRequiredPlayers,
    price,
    author,
    date,
    time,
  } = req.body;
  Event.findByIdAndUpdate(
    eventId,
    {
      typeOfSport,
      title,
      location,
      numberOfRequiredPlayers,
      price,
      author,
      date,
      time,
    },
    { new: true }
  )
    .then((data) => res.redirect(`/events/${eventId}`))
    .catch((error) => next(error));
});

// form delete:
router.post("/:id/delete", (req, res, next) => {
  const eventId = req.params.id;
  Event.findByIdAndDelete(eventId)
    .then(() => res.redirect("/events"))
    .catch((error) => next(error));
});

module.exports = router;
