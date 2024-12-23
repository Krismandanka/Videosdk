import React from 'react'
import TimelineWithIcons from "./TimelineWithIcons";
import { useState,useEffect } from "react";
import { useParams } from 'react-router-dom';
const MainEl = () => {
  const { id } = useParams(); 
    const [meetingData, setMeetingData] = useState(null);

    useEffect(() => {
      const fetchMeetingData = async () => {
        try {
          const response = await fetch(
            `http://localhost:4000/api/meetings/getmeet/${id}`
          );
          const data = await response.json();
  
          const mappedParticipants = data.meeting.participantArray.map((participant) => ({
            id: participant._id,
            name: participant.name,
            duration: Math.round(
              (new Date(data.meeting.end) - new Date(data.meeting.start)) / 60000
            ),
            timelog: participant.timelog.map((log) => ({
              start: log.start,
              end: log.end,
            })),
            events: participant.events,
          }));
  
          setMeetingData({
            startTime: data.meeting.start,
            endTime: data.meeting.end,
            participants: mappedParticipants,
          });
        } catch (error) {
          console.error("Error fetching meeting data:", error);
        }
      };
  
      fetchMeetingData();
    }, []);
  
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        {meetingData ? (
          <TimelineWithIcons
            startTime={meetingData.startTime}
            endTime={meetingData.endTime}
            participants={meetingData.participants}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
}

export default MainEl