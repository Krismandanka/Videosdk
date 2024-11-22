const User = require("../models/User");

const Meeting = require("../models/Meeting");
const Participant = require("../models/Participant")
const ParticipantEvents = require("../models/PartEvent");
const Event = require("../models/Event");



exports.createMeet = async (req, res) => {
	try {
		
		

		
		// Hash the password
		
		const user = await Meeting.create();

		return res.status(200).json({
			success: true,
			user,
			message: "Meeet created successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Meet create issue",
		});
	}
};


exports.joinMeeting = async (req, res) => {
  const { meetingId } = req.params; // Meeting ID from the request URL
  const { userId, name } = req.body; // Participant details from the request body

  try {
    // Find the meeting by ID
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if participant already exists in the meeting
    let participant = await Participant.findOne({ user:userId });
    if (!participant) {
      // Create a new participant if they are not already part of the meeting
      participant = new Participant({
        user:userId,
        name,
        timelog: [],
        events: null, // Initialize the events field as null or an empty `partEvent`
      });

      // Save the new participant
      await participant.save();

      // Add the new participant to the meeting
      meeting.participantArray.push(participant._id);
      meeting.uniqueParticipantsCount = meeting.participantArray.length;
    }

    // Create a new active timelog for this join event
    const newTimelog = new Event({ start: new Date(), end: null });
    await newTimelog.save();

    // Add the timelog to the participant's timelog array
    participant.timelog.push(newTimelog._id);
    await participant.save();

    // Save the updated meeting
    await meeting.save();

    res.status(200).json({
      message: "Participant successfully joined the meeting.",
      meeting,
      participant,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};




// const Meeting = require("../models/meeting");
// const Participant = require("../models/participant");
// const Event = require("../models/event");

exports.leaveMeeting = async (req, res) => {
  const { meetingId, participantId } = req.params;
  const { end } = req.body; // End time provided in the request (ISO format)

  try {
    const meeting = await Meeting.findById(meetingId).populate("participantArray");
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Find the participant in the meeting
    const participant = await Participant.findById(participantId).populate("timelog");
    if (!participant) {
      return res.status(404).json({ message: "Participant not found in the meeting" });
    }

    // Check if participant has an active timelog
    const activeTimelog = participant.timelog.find((log) => !log.end);
    if (!activeTimelog) {
      return res.status(400).json({ message: "No active session found for the participant." });
    }

    // Update the end time of the active timelog
    activeTimelog.end = new Date(end);
    await activeTimelog.save();

    // Update the participant's timelog in the database
    await participant.save();

    // If this is the last participant, mark the meeting as ended
    if (meeting.participantArray.every((p) => p.timelog.every((log) => log.end))) {
      meeting.end = new Date(end); // Set meeting end time
      await meeting.save();
    }

    res.status(200).json({
      message: "Participant left the meeting successfully.",
      participant,
      meeting,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};


// const Participant = require("../models/participant");
// const Event = require("../models/event");
// const ParticipantEvents = require("../models/partEvent");

exports.updateEventStatus = async (req, res) => {
  const { participantId } = req.params; // Participant ID from the route
  const { eventType, action } = req.body; // Event type and action (on/off) from the request body
  const validEventTypes = ["mic", "webcam", "screenShare", "screenShareAudio"];

  try {
    // Validate event type
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ message: "Invalid event type." });
    }

    // Validate action
    if (!["on", "off"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'on' or 'off'." });
    }

    // Find the participant and populate the events
    const participant = await Participant.findById(participantId).populate("events");
    if (!participant) {
      return res.status(404).json({ message: "Participant not found." });
    }

    // If events are not initialized, create an empty ParticipantEvents document
    let participantEvents = participant.events;
    if (!participantEvents) {
      participantEvents = new ParticipantEvents({});
      await participantEvents.save();
      participant.events = participantEvents._id;
      await participant.save();
    }

    // Fetch the corresponding array from the participant events
    let eventArray = participantEvents[eventType];

    if (action === "on") {
      // Create a new Event document for the "on" action
      const newEvent = new Event({ start: new Date(), end: null });
      await newEvent.save();

      // Add the new Event to the array
      eventArray.push(newEvent._id);
    } else if (action === "off") {
      // Find the most recent event without an "end" timestamp
      const activeEvent = await Event.findOne({ _id: { $in: eventArray }, end: null }).sort({ start: -1 });
      if (!activeEvent) {
        return res.status(400).json({ message: `No active ${eventType} event to turn off.` });
      }

      // Set the "end" timestamp
      activeEvent.end = new Date();
      await activeEvent.save();
    }

    // Save the updated participant events
    await participantEvents.save();

    res.status(200).json({
      message: `${eventType} ${action === "on" ? "started" : "stopped"} successfully.`,
      events: participantEvents,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};




// const Meeting = require("../models/meeting");
// const Participant = require("../models/participant");
// const Event = require("../models/event");

exports.endMeeting = async (req, res) => {
  const { meetingId } = req.params; // Meeting ID from the route

  try {
    // Find the meeting by ID
    const meeting = await Meeting.findById(meetingId).populate({
      path: "participantArray",
      populate: {
        path: "events timelog",
      },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found." });
    }

    if (meeting.end) {
      return res.status(400).json({ message: "Meeting has already ended." });
    }

    // Set the end time for the meeting
    meeting.end = new Date();

    // Finalize participant timelogs
    for (const participant of meeting.participantArray) {
      // Close any open timelog for the participant
      for (const timelog of participant.timelog) {
        if (!timelog.end) {
          timelog.end = new Date();
          await timelog.save();
        }
      }

      // Finalize ongoing events (e.g., mic, webcam, etc.)
      if (participant.events) {
        for (const eventType of ["mic", "webcam", "screenShare", "screenShareAudio"]) {
          for (const eventId of participant.events[eventType]) {
            const event = await Event.findById(eventId);
            if (event && !event.end) {
              event.end = new Date();
              await event.save();
            }
          }
        }
      }
    }

    // Save the meeting
    await meeting.save();

    res.status(200).json({
      message: "Meeting ended successfully.",
      meeting,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};

// module.exports = { endMeeting };
