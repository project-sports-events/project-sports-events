const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    // location: {
    //   type: String,
    //   required: true,
    // },
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    numberOfRequiredPlayers: {
      type: Number,
    },
    location: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    players: [{ type: Schema.Types.ObjectId, ref: "User" }],
    typeOfSport: {
      type: String,
      enum: ["football", "basketball", "tennis"],
    },
  },

  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Event = model("Event", eventSchema);

module.exports = Event;
