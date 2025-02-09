import React from 'react';
import { Bot, MessageSquare, Settings } from 'lucide-react';

export const AIConsultations = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">AI Pre-Consultations</h2>
            <p className="text-sm text-gray-500">
              Automate initial client consultations with AI assistance
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Settings className="h-4 w-4 mr-2" />
            Configure AI
          </button>
        </div>

        {/* Coming Soon Message */}
        <div className="mt-8 text-center py-12 px-4">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">AI Consultations Coming Soon</h3>
          <p className="mt-1 text-sm text-gray-500">
            Our AI-powered consultation system will help streamline your client onboarding process,
            gather important information, and provide personalized recommendations before the appointment.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-900">Features will include:</h4>
              <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                <li>Automated client questionnaires</li>
                <li>Style preference analysis</li>
                <li>Service recommendations</li>
                <li>Preliminary consultation reports</li>
                <li>Integration with booking system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};