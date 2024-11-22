const express = require("express");
const router = express.Router();




const {leaveMeetingcreateMeet,endMeeting,joinMeeting,leaveMeeting,updateEventStatus,getMeetingDetails} = require("../controllers/MeetCreate")


router.post("/startMeeting", leaveMeetingcreateMeet);

router.post("/endMeeting/:meetingId", endMeeting);

router.post("/joinMeeting/:meetingId", joinMeeting);

router.post("/leaveMeeting/:meetingId/:participantId", leaveMeeting);

// router.post("/leaveMeeting/:meetingId", leaveMeeting);

router.post("/updateEventStatus/:participantId/:eventType", updateEventStatus);

router.get("/getmeet/:meetingId", getMeetingDetails);


module.exports = router;
