import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Calendar, 
  MessageSquare, 
  Clock,
  AlertTriangle,
  FileText,
  Star
} from 'lucide-react';
import { ClientProfile } from '../../../types/client';

export const ClientManagement = () => {
  const [clients, setClients] = useState<ClientProfile[]>([
    {
      id: '1',
      displayName: 'Emma Wilson',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      email: 'emma.w@example.com',
      phoneNumber: '+1234567890',
      preferences: {
        skinType: 'combination',
        hairType: 'wavy',
        allergies: ['latex'],
        sensitivities: ['fragrance'],
        communicationPreferences: {
          reminders: true,
          method: 'sms',
          frequency: 'day_before'
        }
      },
      serviceHistory: [
        {
          id: 'sh1',
          date: '2024-03-15T10:00:00Z',
          serviceName: 'Bridal Makeup',
          professionalId: 'p1',
          professionalName: 'Sarah Johnson',
          notes: 'Preferred natural look',
          products: ['Foundation X', 'Lipstick Y']
        }
      ],
      professionalNotes: [
        {
          id: 'n1',
          professionalId: 'p1',
          professionalName: 'Sarah Johnson',
          date: '2024-03-15T10:00:00Z',
          note: 'Prefers natural makeup looks',
          type: 'preference',
          visibility: 'private'
        }
      ],
      reviews: [],
      lastUpdated: '2024-03-15T10:00:00Z'
    }
  ]);

  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'medical' | 'preference' | 'warning'>('general');
  const [noteVisibility, setNoteVisibility] = useState<'private' | 'shared'>('private');

  const handleAddNote = () => {
    if (!selectedClient || !newNote.trim()) return;

    const note = {
      id: Date.now().toString(),
      professionalId: 'currentProfessionalId',
      professionalName: 'Current Professional Name',
      date: new Date().toISOString(),
      note: newNote.trim(),
      type: noteType,
      visibility: noteVisibility
    };

    const updatedClient = {
      ...selectedClient,
      professionalNotes: [...selectedClient.professionalNotes, note]
    };

    setClients(clients.map(c => 
      c.id === selectedClient.id ? updatedClient : c
    ));

    setSelectedClient(updatedClient);
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Client Management</h2>
          <p className="text-sm text-gray-500">Manage your client relationships and history</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search clients..."
            />
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Clients</option>
            <option value="recent">Recent</option>
            <option value="frequent">Frequent</option>
            <option value="new">New</option>
          </select>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {clients.map((client) => (
            <li key={client.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {client.photoURL ? (
                        <img
                          className="h-12 w-12 rounded-full"
                          src={client.photoURL}
                          alt=""
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{client.displayName}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetailsModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Profile
                      </button>
                      <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Client Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                {selectedClient.photoURL ? (
                  <img
                    src={selectedClient.photoURL}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedClient.displayName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedClient(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Preferences */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Preferences</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Skin Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedClient.preferences.skinType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Hair Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedClient.preferences.hairType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedClient.preferences.allergies?.join(', ') || 'None'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Service History */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Services</h4>
                <div className="space-y-4">
                  {selectedClient.serviceHistory.map((service) => (
                    <div key={service.id} className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {service.serviceName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(service.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Notes */}
              <div className="sm:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Professional Notes</h4>
                  
                  {/* Add Note Form */}
                  <div className="mb-4">
                    <div className="flex space-x-4 mb-2">
                      <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value as any)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="general">General</option>
                        <option value="medical">Medical</option>
                        <option value="preference">Preference</option>
                        <option value="warning">Warning</option>
                      </select>
                      <select
                        value={noteVisibility}
                        onChange={(e) => setNoteVisibility(e.target.value as any)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="private">Private</option>
                        <option value="shared">Shared</option>
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Add a note..."
                      />
                      <button
                        onClick={handleAddNote}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-4">
                    {selectedClient.professionalNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3 rounded-lg ${
                          note.type === 'warning'
                            ? 'bg-red-50'
                            : note.type === 'medical'
                            ? 'bg-yellow-50'
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start">
                          {note.type === 'warning' && (
                            <AlertTriangle className="h-5 w-5 text-red-400 mt-1" />
                          )}
                          {note.type === 'medical' && (
                            <FileText className="h-5 w-5 text-yellow-400 mt-1" />
                          )}
                          {note.type === 'preference' && (
                            <Star className="h-5 w-5 text-blue-400 mt-1" />
                          )}
                          <div className="ml-3">
                            <p className="text-sm text-gray-900">{note.note}</p>
                            <div className="mt-1 text-xs text-gray-500">
                              <span>{note.professionalName}</span>
                              <span className="mx-1">•</span>
                              <span>{new Date(note.date).toLocaleDateString()}</span>
                              <span className="mx-1">•</span>
                              <span className="capitalize">{note.visibility}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};