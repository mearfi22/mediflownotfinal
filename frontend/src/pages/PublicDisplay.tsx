import React, { useState, useEffect } from "react";
import { queueApi } from "../services/api";
import { Queue } from "../types";

const PublicDisplay: React.FC = () => {
  const [nowServing, setNowServing] = useState<Queue | null>(null);
  const [nextFive, setNextFive] = useState<Queue[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDisplayData();
    const dataInterval = setInterval(fetchDisplayData, 5000); // Refresh every 5 seconds
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchDisplayData = async () => {
    try {
      const response = await queueApi.display();
      setNowServing(response.data.now_serving || null);
      setNextFive(response.data.next_five || []);
    } catch (error) {
      console.error("Error fetching display data:", error);
    }
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      emergency: "bg-red-600",
      senior: "bg-purple-600",
      pwd: "bg-indigo-600",
      regular: "bg-gray-500",
    };

    const labels = {
      emergency: "EMERGENCY",
      senior: "SENIOR CITIZEN",
      pwd: "PWD",
      regular: "",
    };

    if (priority === "regular") return null;

    return (
      <span
        className={`inline-flex px-4 py-2 text-sm font-bold rounded-lg text-white ${
          badges[priority as keyof typeof badges] || badges.regular
        }`}
      >
        {labels[priority as keyof typeof labels] || ""}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">
          Roxas Memorial Provincial Hospital
        </h1>
        <p className="text-3xl font-semibold opacity-90">Queue Management System</p>
        <div className="mt-6 text-2xl opacity-80">
          <div className="mb-2">{formatDate()}</div>
          <div className="text-4xl font-mono">{formatTime()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Now Serving Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
          <h2 className="text-4xl font-bold mb-8 text-center pb-4 border-b-2 border-white/30">
            NOW SERVING
          </h2>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            {nowServing ? (
              <div className="text-center animate-pulse">
                <div className="mb-6">
                  <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-3xl px-16 py-8 shadow-2xl transform hover:scale-105 transition-transform">
                    <div className="text-8xl font-black text-white">
                      #{nowServing.queue_number}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-4xl font-bold text-yellow-300">
                    {nowServing.patient?.full_name}
                  </div>
                  {getPriorityBadge(nowServing.priority)}
                  <div className="mt-6 p-6 bg-white/10 rounded-2xl backdrop-blur">
                    <div className="text-xl opacity-80 mb-2">Department</div>
                    <div className="text-3xl font-semibold">
                      {nowServing.department?.name || "General"}
                    </div>
                  </div>
                  {nowServing.doctor && (
                    <div className="mt-4 p-6 bg-white/10 rounded-2xl backdrop-blur">
                      <div className="text-xl opacity-80 mb-2">Doctor</div>
                      <div className="text-3xl font-semibold">
                        {nowServing.doctor.full_name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-5xl font-bold text-white/60 mb-4">
                  No Patient Being Served
                </div>
                <div className="text-2xl text-white/40">Please wait...</div>
              </div>
            )}
          </div>
        </div>

        {/* Next in Queue Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
          <h2 className="text-4xl font-bold mb-8 text-center pb-4 border-b-2 border-white/30">
            NEXT IN QUEUE
          </h2>
          <div className="space-y-4">
            {nextFive.length > 0 ? (
              nextFive.map((queue, index) => (
                <div
                  key={queue.id}
                  className={`p-6 rounded-2xl border-2 transform transition-all hover:scale-102 ${
                    index === 0
                      ? "bg-gradient-to-r from-green-500/30 to-green-600/30 border-green-400"
                      : "bg-white/5 border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div
                        className={`text-4xl font-bold px-6 py-3 rounded-xl ${
                          index === 0
                            ? "bg-green-500 text-white"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        #{queue.queue_number}
                      </div>
                      <div>
                        <div className="text-2xl font-semibold mb-1">
                          {queue.patient?.full_name}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(queue.priority)}
                          {queue.estimated_wait_minutes !== null &&
                            queue.estimated_wait_minutes !== undefined && (
                              <span className="text-sm bg-yellow-500/30 px-3 py-1 rounded-lg">
                                ~{queue.estimated_wait_minutes} min
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="text-green-400 text-xl font-bold animate-bounce">
                        NEXT →
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-lg opacity-70">
                    {queue.department?.name || "General"} 
                    {queue.doctor && ` - ${queue.doctor.full_name}`}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-3xl font-bold text-white/60 mb-2">
                  No Patients in Queue
                </div>
                <div className="text-xl text-white/40">Queue is empty</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xl opacity-70">
        <p>Please wait for your queue number to be called</p>
        <p className="mt-2">Thank you for your patience</p>
      </div>
    </div>
  );
};

export default PublicDisplay;
