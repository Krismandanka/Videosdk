const User = require("../models/User");

const Meeting = require("../models/Meeting");
const Participant = require("../models/Participant")
const ParticipantEvents = require("../models/PartEvent");
const Event = require("../models/Event");



exports.leaveMeetingcreateMeet = async (req, res) => {
    const { start, end, uniqueParticipantsCount, participantArray } = req.body;
  
    try {
      const newMeeting = await Meeting.create({
        start: start || new Date(), 
        end: end || null,          
        uniqueParticipantsCount: uniqueParticipantsCount || 0,
        participantArray: participantArray || [],
      });
  
      return res.status(201).json({
        message: "Meeting created successfully.",
        meeting: newMeeting,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while creating the meeting.",
        error: error.message,
      });
    }
  };

exports.joinMeeting = async (req, res) => {
  const { meetingId } = req.params; 
  const { userId, name } = req.body; 
  try {
    const meeting = await Meeting.findById({_id:meetingId});
    console.log("huiiiiiii",meeting);


    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    let participant = await Participant.findOne({ user:userId });
    if (!participant) {
        console.log("pppppp",userId)
        participant = await Participant.create({
            user:userId,
            name,
            timelog: [],
            events: null, 
        });
        

      await participant.save();

      meeting.participantArray.push(participant._id);
      meeting.uniqueParticipantsCount = meeting.participantArray.length;


    }

    




    const newTimelog = await Event.create({ start: new Date(), end: null });
    await newTimelog.save();

    console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh")

    participant.timelog.push(newTimelog._id);
    await participant.save();

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





exports.leaveMeeting = async (req, res) => {
  const { meetingId, participantId } = req.params;
  const { end } = req.body; 

  try {
    const meeting = await Meeting.findById(meetingId).populate("participantArray");
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }



    const participant = await Participant.findById(participantId).populate("timelog");
    if (!participant) {
      return res.status(404).json({ message: "Participant not found in the meeting" });
    }


    const activeTimelog =  participant.timelog.find((log) => !log.end);

    if (!activeTimelog) {
      return res.status(400).json({ message: "No active session found for the participant." });
    }

    console.log("huuuuuuuuu")
    activeTimelog.end = new Date();
    await activeTimelog.save();
    await participant.save();

    if (meeting.participantArray.every((p) => p.timelog.every((log) => log.end))) {
      meeting.end = new Date(end); 
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




exports.updateEventStatus = async (req, res) => {
  const { participantId ,eventType} = req.params; 
  const { action } = req.body; 
  const validEventTypes = ["mic", "webcam", "screenShare", "screenShareAudio"];

  try {
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ message: "Invalid event type." });
    }

    if (!["on", "off"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'on' or 'off'." });
    }

    const participant = await Participant.findById(participantId).populate("events");
    if (!participant) {
      return res.status(404).json({ message: "Participant not found." });
    }

    let participantEvents = participant.events;
    if (!participantEvents) {
      participantEvents = await ParticipantEvents.create({});
      await participantEvents.save();
      participant.events = participantEvents._id;
      await participant.save();
    }

    let eventArray = participantEvents[eventType];

    if (action === "on") {
      const newEvent = await Event.create({ start: new Date(), end: null });
      await newEvent.save();

      eventArray.push(newEvent._id);
    } else if (action === "off") {
      const activeEvent = await Event.findOne({ _id: { $in: eventArray }, end: null }).sort({ start: -1 });
      if (!activeEvent) {
        return res.status(400).json({ message: `No active ${eventType} event to turn off.` });
      }

      activeEvent.end = new Date();
      await activeEvent.save();
    }

    await participantEvents.save();

    res.status(200).json({
      message: `${eventType} ${action === "on" ? "started" : "stopped"} successfully.`,
      events: participantEvents,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};





exports.endMeeting = async (req, res) => {
  const { meetingId } = req.params; 
  try {
    // Find the meeting by ID
    const meeting = await Meeting.findById(meetingId).populate({
      path: "participantArray",
      populate: {
        path: "events timelog",
      },
    });


    console.log("meetind",meeting);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found." });
    }

    if (meeting.end) {
      return res.status(400).json({ message: "Meeting has already ended." });
    }

    meeting.end = new Date();

    for (const participant of meeting.participantArray) {
      for (const timelog of participant.timelog) {
        if (!timelog.end) {
          timelog.end = new Date();
          await timelog.save();
        }
      }

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

    await meeting.save();

    res.status(200).json({
      message: "Meeting ended successfully.",
      meeting,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};


exports.getMeetingDetails = async (req, res) => {
    const { meetingId } = req.params;
  
    try {
      // Find the meeting and populate related data
      const meetingDetails = await Meeting.findById(meetingId)
        .populate({
          path: "participantArray",
          populate: [
            {
              path: "events",
              populate: [
                { path: "mic", model: "event" },
                { path: "webcam", model: "event" },
                { path: "screenShare", model: "event" },
                { path: "screenShareAudio", model: "event" },
              ],
            },
            {
              path: "timelog",
              model: "event", // Fully populate timelog event details
            },
          ],
        });
  
      if (!meetingDetails) {
        return res.status(404).json({
          message: "Meeting not found.",
        });
      }
  
      return res.status(200).json({
        message: "Meeting details fetched successfully.",
        meeting: meetingDetails,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred while fetching meeting details.",
        error: error.message,
      });
    }
  };