


mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
    participantId: {
      type: String,
      required: true,
    },
    user: {
		type: mongoose.Schema.Types.ObjectId,
		// required: true,
		ref: "user",
	},
    name: {
      type: String,
      required: true,
    },
    events: {
        
              type: mongoose.Schema.Types.ObjectId,
              ref: "partEvent",
              default: () => ({}),
    },
    timelog: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "event",
            },
          ],
    },
    
        
    
  });


  


  module.exports = mongoose.model("participant", participantSchema);