import React from 'react';
import { ClientProfile } from '../../../types/client';
import { Calendar, AlertTriangle, FileText, Star, X } from 'lucide-react';

interface ClientDetailsModalProps {
  client: ClientProfile;
  onClose: () => void;
  newNote: string;
  onNoteChange: (value: string) => void;
  onAddNote: () => void;
  noteType: 'general' | 'medical' | 'preference' | 'warning';
  onNoteTypeChange: (value: 'general' | 'medical' | 'preference' | 'warning') => void;
  noteVisibility: 'private' | 'shared';
  onNoteVisibilityChange: (value: 'private' | 'shared') => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  client,
  onClose,
  newNote,
  onNoteChange,
  onAddNote,
  noteType,
  onNoteTypeChange,
  noteVisibility,
  onNoteVisibilityChange
}) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {client.photoURL ? (
              <img src={client.photoURL} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="h-16 w-16 bg-gray-200 flex items-center justify-center rounded-full">
                <X className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{client.displayName}</h3>
              <p className="text-sm text-gray-500">{client.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Preferences */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Preferences</h4>
            <dl className="space-y-2 text-sm text-gray-700">
              <div>Skin Type: {client.preferences.skinType}</div>
              <div>Hair Type: {client.preferences.hairType}</div>
              <div>Allergies: {client.preferences.allergies?.join(', ') || 'None'}</div>
            </dl>
          </div>

          {/* Service History */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Service History</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {client.serviceHistory.map(service => (
                <div key={service.id} className="flex items-start">
                  <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="ml-2">
                    {service.serviceName}
                    <div className="text-gray-400 text-xs">{new Date(service.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Professional Notes</h4>

          <div className="flex space-x-2">
            <select
              value={noteType}
              onChange={(e) => onNoteTypeChange(e.target.value as any)}
              className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="general">General</option>
              <option value="medical">Medical</option>
              <option value="preference">Preference</option>
              <option value="warning">Warning</option>
            </select>
            <select
              value={noteVisibility}
              onChange={(e) => onNoteVisibilityChange(e.target.value as any)}
              className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={onAddNote}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {client.professionalNotes.map(note => (
              <div key={note.id} className="flex items-start bg-white p-3 rounded-md shadow-sm">
                {note.type === 'warning' && <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />}
                {note.type === 'medical' && <FileText className="h-4 w-4 text-yellow-500 mt-1" />}
                {note.type === 'preference' && <Star className="h-4 w-4 text-blue-500 mt-1" />}
                <div className="ml-2 text-sm">
                  {note.note}
                  <div className="text-xs text-gray-400">
                    {note.professionalName} • {new Date(note.date).toLocaleDateString()} • {note.visibility}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
