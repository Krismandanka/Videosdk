// Import the Mongoose library
const mongoose = require("mongoose");

// Define the user schema using the Mongoose Schema constructor
// const meetingSchema = new mongoose.Schema(
// 	{
// 		startTime: {
//             type: Date, 
//             required: true, 
//         },
//         endTime: {
//             type: Date, 
//         },
//         uniqueParticipantCount: {
//             type: Number,
//             default: 0,
//         },
		
// 	},
// 	{ timestamps: true }
// );




  const meetingSchema = new mongoose.Schema({
    
    start: {
      type: Date,
      default:  Date.now
    //   required: true,
    },
    end: {
      type: Date,
      
    },
    uniqueParticipantsCount: {
      type: Number,
      default: 0,
    },
    participantArray: {
      type: [
        {
			type: mongoose.Schema.Types.ObjectId,
			ref: "participant",
		},
      ],
      default: [], // Default to an empty array
    },
  });

// Export the Mongoose model for the user schema, using the name "user"
module.exports = mongoose.model("meeting", meetingSchema);