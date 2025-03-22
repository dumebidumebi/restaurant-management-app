// components/TimeSelector.tsx
import { useState } from "react";
import { useLocationStore } from "../stores/useLocationStore";
import { Badge } from "./ui/badge";

export default function TimeSelector() {
  const { timeOption, setTimeOption, selectedLocation } = useLocationStore();

  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <div>
      {selectedLocation && (
        <div className="rounded-lg overflow-hidden border">
          {/* ASAP Option */}
          <div
            className={`p-4 flex justify-between items-center cursor-pointer ${
              timeOption === "asap" ? "bg-gray-100" : ""
            }`}
            onClick={() => setTimeOption("asap")}
          >
            <div className="flex items-center justify-center">
              <div
                className={`w-5 h-5 rounded-full border mr-3 ${
                  timeOption === "asap"
                    ? "border-black bg-black"
                    : "border-gray-300"
                }`}
              >
                {timeOption === "asap" && (
                  <div className="w-2 h-2 mx-auto mt-1.5 rounded-full bg-white"></div>
                )}
              </div>
              <div>
                <p className="font-medium">ASAP</p>
                <p className="text-sm text-gray-500">15 minutes</p>
              </div>
            </div>
          </div>

          {/* Schedule Option */}
          <div
            className={`p-4 border-t flex justify-between items-center cursor-pointer ${
              timeOption === "scheduled" ? "bg-gray-100" : ""
            }`}
            onClick={() => {
              setTimeOption("scheduled");
              setShowScheduleModal(true);
            }}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border mr-3 ${
                  timeOption === "scheduled"
                    ? "border-black bg-black"
                    : "border-gray-300"
                }`}
              >
                {timeOption === "scheduled" && (
                  <div className="w-2 h-2 mx-auto mt-1.5 rounded-full bg-white"></div>
                )}
              </div>
              <div className="">
                <p className="font-medium">Schedule your pickup</p>{" "}
                <Badge>coming soon</Badge>
              </div>
            </div>
            <div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* {showScheduleModal && (
        <ScheduleModal onClose={() => setShowScheduleModal(false)} />
      )} */}
    </div>
  );
}

interface ScheduleModalProps {
  onClose: () => void;
}

function ScheduleModal({ onClose }: ScheduleModalProps) {
  const { scheduledDate, scheduledTime, setScheduledDate, setScheduledTime } =
    useLocationStore();

  const [activeView, setActiveView] = useState("date"); // 'date' or 'time'

  // Generate dates for the next week
  const dates = [
    { day: "Today", date: "Mar 14" },
    { day: "Tomorrow", date: "Mar 15" },
    { day: "Sun", date: "Mar 16" },
    { day: "Mon", date: "Mar 17" },
    { day: "Tue", date: "Mar 18" },
    { day: "Wed", date: "Mar 19" },
    { day: "Thu", date: "Mar 20" },
    { day: "Fri", date: "Mar 21" },
    { day: "Sat", date: "Mar 22" },
  ];

  // Generate time slots
  const generateTimeSlots = () => {
    const slots: string[] = [];
    // AM slots
    for (let i = 0; i < 24; i++) {
      const hour = i % 12 || 12;
      const period = i < 12 ? "AM" : "PM";
      slots.push(`${hour}:00 ${period}`);
      slots.push(`${hour}:15 ${period}`);
      slots.push(`${hour}:30 ${period}`);
      slots.push(`${hour}:45 ${period}`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDateSelect = (day: string, date: string) => {
    setScheduledDate(`${day}, ${date}`);
    setActiveView("time");
  };

  const handleTimeSelect = (time: string) => {
    setScheduledTime(time);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg overflow-hidden">
        <div className="p-4 flex items-center border-b">
          <button onClick={onClose} className="mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
          <h2 className="text-xl font-bold">Schedule order</h2>
        </div>

        {activeView === "date" ? (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {dates.map((item, index) => (
                <button
                  key={index}
                  className="p-4 border rounded-lg flex flex-col items-start hover:bg-gray-50"
                  onClick={() => handleDateSelect(item.day, item.date)}
                >
                  <span className="font-medium">{item.day}</span>
                  <span className="text-gray-500">{item.date}</span>
                </button>
              ))}
            </div>
            <button
              className="w-full mt-4 p-4 border rounded-lg text-center"
              onClick={() => setActiveView("less")}
            >
              Show less ↑
            </button>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map((time, index) => (
              <button
                key={index}
                className="w-full p-4 border-b flex items-center hover:bg-gray-50"
                onClick={() => handleTimeSelect(time)}
              >
                <div className="w-6 h-6 rounded-full border border-gray-300 mr-4"></div>
                <span>{time}</span>
              </button>
            ))}
          </div>
        )}

        <div className="p-4 border-t">
          <button
            className="w-full p-3 bg-gray-200 rounded-lg text-gray-700 font-medium"
            onClick={onClose}
          >
            Schedule Order →
          </button>
        </div>
      </div>
    </div>
  );
}
