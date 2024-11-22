import React from "react";


const calculatePosition = (eventTime, startTime, endTime) => {
    const eventDate = new Date(eventTime);
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
  
    const totalDuration = endDate - startDate;
    const eventOffset = eventDate - startDate;
  
    return (eventOffset / totalDuration) * 100; // Position as a percentage
  };
  
  const TimelineWithIcons = ({ startTime, endTime, participants }) => {
    return (
      <div className="bg-gray-100 p-6 rounded-md w-full">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Participant-Wise Session Timeline
        </h2>
  
        {/* Top Time Range */}
        <div className="relative w-full h-12 mb-8">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
          <div className="flex justify-between text-gray-600 text-xs">
            {[...Array(12)].map((_, i) => {
              const intervalTime = new Date(
                new Date(startTime).getTime() +
                  (i * (new Date(endTime) - new Date(startTime))) / 11
              );
              return (
                <span key={i} className="relative">
                  {intervalTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              );
            })}
          </div>
        </div>
  
        {/* Participant Timelines */}
        {participants.map((participant, index) => (
          <div key={index} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-800 font-medium">
                {participant.name} ({participant.id})
              </span>
              <span className="text-gray-600 text-sm">
                Duration: {participant.duration} mins
              </span>
            </div>
  
            <div className="relative w-full h-12 bg-gray-200 rounded-md">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
  
              {/* Timelog Events */}
              {participant.timelog.map((log, idx) => (
                <div
                  key={idx}
                  className="absolute h-2 bg-blue-500"
                  style={{
                    left: `${calculatePosition(log.start, startTime, endTime)}%`,
                    width: `${
                      log.end
                        ? calculatePosition(log.end, startTime, endTime) -
                          calculatePosition(log.start, startTime, endTime)
                        : 5
                    }%`,
                  }}
                ></div>
              ))}
  
              {/* Mic/Webcam/ScreenShare Events */}
              {
                console.log(participant.events)
              }
              {participant.events &&
                Object.entries(participant.events).map(([type, eventArray]) =>
                    Array.isArray(eventArray) // Ensure it's an array
                    ? eventArray.map((event, idx) => (
                    <div
                        key={idx}
                        className="absolute -translate-x-1/2"
                        style={{
                        left: `${calculatePosition(event.start, startTime, endTime)}%`,
                        }}
                    >
                        <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-white ${
                            type === "mic"
                            ? "bg-blue-500"
                            : type === "webcam"
                            ? "bg-green-500"
                            : type === "screenShare"
                            ? "bg-red-500"
                            : type === "screenShareAudio"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                        title={`${type} - ${new Date(event.start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}`}
                        >
                        {type === "mic" ? "🎤" : ""}
                        {type === "webcam" ? "🎥" : ""}
                        {type === "screenShare" ? "📺" : ""}
                        {type === "screenShareAudio" ? "🔊" : ""}
                        </div>
                    </div>
                    ))
                : null // Skip if the eventArray is not valid
  )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  export default TimelineWithIcons;  