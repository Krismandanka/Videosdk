
mongoose = require("mongoose");


const participantEventsSchema = new mongoose.Schema({
    mic: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "event",
    },],
      default: [], // Default to an empty array
    },
    webcam: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "event",
    },],
      default: [],
    },
    screenShare: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "event",
    },],
      default: [],
    },
    screenShareAudio: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "event",
    },],
      default: [],
    },
  });

  module.exports = mongoose.model("partEvent", participantEventsSchema);



  