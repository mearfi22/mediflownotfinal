import React, { useState, useEffect } from "react";
import { queueApi } from "../services/api";
import { Queue } from "../types";
import { ClockIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const QueueDisplay: React.FC = () => {
  const [nowServing, setNowServing] = useState<Queue | null>(null);
  const [nextThree, setNextThree] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchQueueDisplay();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchQueueDisplay();
    }, 10000);

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchQueueDisplay = async () => {
    try {
      setLoading(true);
      const data = await queueApi.getDisplay();
      setNowServing(data.now_serving || null);
      setNextThree(data.next_three || []);
    } catch (error) {
      console.error("Error fetching queue display:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-red-600 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-primary font-bold text-3xl">R</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
            Roxas Memorial Provincial Hospital
          </h1>
          <p className="text-lg md:text-xl text-red-100 mb-4">
            Queue Display System
          </p>
          <div className="text-red-100">
            <p className="text-base md:text-lg">{formatDate(currentTime)}</p>
            <p className="text-xl md:text-2xl font-mono">
              {formatTime(currentTime)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
            <p className="mt-4 text-white text-xl">
              Loading queue information...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Now Serving - Large Display */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
                  🔔 NOW SERVING
                </h2>

                {nowServing ? (
                  <div className="space-y-6">
                    {/* Large Queue Number */}
                    <div className="bg-gradient-to-r from-primary to-red-500 rounded-3xl p-8 md:p-12 text-white shadow-xl">
                      <div className="text-8xl md:text-9xl lg:text-[12rem] font-black mb-4 leading-none">
                        #{nowServing.queue_number}
                      </div>
                      <div className="text-2xl md:text-4xl font-bold mb-2">
                        {nowServing.patient?.full_name}
                      </div>
                      <div className="text-lg md:text-xl text-red-100">
                        Please proceed to the consultation room
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <p className="text-gray-600 text-sm uppercase tracking-wide mb-2 font-semibold">
                        Reason for Visit
                      </p>
                      <p className="text-gray-900 font-medium text-lg">
                        {nowServing.reason_for_visit}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ClockIcon className="h-16 w-16 text-gray-400" />
                    </div>
                    <p className="text-3xl md:text-4xl text-gray-500 font-bold">
                      No Patient Currently Serving
                    </p>
                    <p className="text-gray-400 mt-4 text-lg">
                      Please wait for the next announcement
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Next in Line - Horizontal Layout */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  ⏳ NEXT IN LINE
                </h2>
                <p className="text-gray-600 mt-2">
                  Please prepare your documents
                </p>
              </div>

              {nextThree.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {nextThree.map((queueItem, index) => (
                    <div
                      key={queueItem.id}
                      className={`p-6 rounded-2xl border-3 text-center transform transition-all duration-300 hover:scale-105 ${
                        index === 0
                          ? "border-yellow-400 bg-yellow-50 shadow-lg"
                          : index === 1
                          ? "border-blue-400 bg-blue-50 shadow-md"
                          : "border-gray-300 bg-gray-50 shadow-sm"
                      }`}
                    >
                      {/* Queue Number Badge */}
                      <div
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-2xl md:text-3xl mx-auto mb-4 ${
                          index === 0
                            ? "bg-yellow-200 text-yellow-800 ring-4 ring-yellow-300"
                            : index === 1
                            ? "bg-blue-200 text-blue-800 ring-4 ring-blue-300"
                            : "bg-gray-200 text-gray-700 ring-4 ring-gray-300"
                        }`}
                      >
                        #{queueItem.queue_number}
                      </div>

                      {/* Patient Name */}
                      <p className="font-bold text-gray-900 text-lg md:text-xl mb-2">
                        {queueItem.patient?.full_name}
                      </p>

                      {/* Reason */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {queueItem.reason_for_visit}
                      </p>

                      {/* Position Badge */}
                      {index === 0 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-200 text-yellow-800">
                          🥇 Next
                        </div>
                      )}
                      {index === 1 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-200 text-blue-800">
                          🥈 Second
                        </div>
                      )}
                      {index === 2 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-800">
                          🥉 Third
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-2xl text-gray-500 font-bold">
                    No Patients Waiting
                  </p>
                  <p className="text-gray-400 mt-2 text-lg">
                    Queue is currently empty
                  </p>
                </div>
              )}
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instructions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  📋 Patient Instructions
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Listen for your queue number announcement
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Have your documents ready when called
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Proceed to consultation room immediately
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Please maintain social distancing
                  </li>
                </ul>
              </div>

              {/* Queue Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  📊 Queue Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Currently Serving:</span>
                    <span className="font-bold text-primary">
                      {nowServing ? `#${nowServing.queue_number}` : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Patients Waiting:</span>
                    <span className="font-bold text-blue-600">
                      {nextThree.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-mono text-sm text-gray-500">
                      {formatTime(currentTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-red-100 text-lg">
            Thank you for your patience • Roxas Memorial Provincial Hospital
          </p>
          <p className="text-red-200 text-sm mt-2">
            🔄 This display updates automatically every 10 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;
