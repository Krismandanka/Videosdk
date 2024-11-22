
mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date
     
    },
  });

  module.exports = mongoose.model("event", eventSchema);