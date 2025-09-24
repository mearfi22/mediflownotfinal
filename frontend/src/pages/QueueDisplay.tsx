import React, { useState, useEffect } from 'react';
import { queueApi } from '../services/api';
import { Queue } from '../types';
import { ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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
      console.error('Error fetching queue display:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-red-600 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-primary font-bold text-3xl">R</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
            Roxas Memorial Provincial Hospital
          </h1>
          <p className="text-xl text-red-100 mb-4">Queue Display System</p>
          <div className="text-red-100">
            <p className="text-lg">{formatDate(currentTime)}</p>
            <p className="text-2xl font-mono">{formatTime(currentTime)}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
            <p className="mt-4 text-white text-xl">Loading queue information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Now Serving */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                  Now Serving
                </h2>
                
                {nowServing ? (
                  <div className="space-y-6">
                    <div className="bg-primary rounded-2xl p-8 text-white">
                      <div className="text-6xl md:text-8xl font-bold mb-4">
                        #{nowServing.queue_number}
                      </div>
                      <div className="text-xl md:text-2xl font-semibold">
                        {nowServing.patient?.full_name}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
                        Reason for Visit
                      </p>
                      <p className="text-gray-900 font-medium">
                        {nowServing.reason_for_visit}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClockIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-2xl text-gray-500">No one is being served</p>
                    <p className="text-gray-400 mt-2">Please wait for the next patient</p>
                  </div>
                )}
              </div>
            </div>

            {/* Next in Line */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <ClockIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Next in Line
                </h2>
              </div>

              {nextThree.length > 0 ? (
                <div className="space-y-4">
                  {nextThree.map((queueItem, index) => (
                    <div 
                      key={queueItem.id} 
                      className={`p-6 rounded-xl border-2 ${
                        index === 0 
                          ? 'border-yellow-300 bg-yellow-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                            index === 0 
                              ? 'bg-yellow-200 text-yellow-800' 
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            #{queueItem.queue_number}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">
                              {queueItem.patient?.full_name}
                            </p>
                            <p className="text-sm text-gray-600 truncate max-w-48">
                              {queueItem.reason_for_visit}
                            </p>
                          </div>
                        </div>
                        {index === 0 && (
                          <div className="text-yellow-600 font-semibold text-sm">
                            Next
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xl text-gray-500">No patients waiting</p>
                  <p className="text-gray-400 mt-2">Queue is currently empty</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-red-100 text-lg">
            Thank you for your patience • Roxas Memorial Provincial Hospital
          </p>
          <p className="text-red-200 text-sm mt-2">
            This display updates automatically every 10 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;