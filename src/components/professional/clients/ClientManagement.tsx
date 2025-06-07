import React, { useState } from 'react';
import { Search, User, MessageSquare } from 'lucide-react';
import { ClientProfile } from '../../../types/client';
import { ClientDetailsModal } from '../../components/ClientDetailsModal';

export const ClientManagement = () => {
  const [clients, setClients] = useState<ClientProfile[]>([
    // Your mock data here
  ]);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'medical' | 'preference' | 'warning'>('general');
  const [noteVisibility, setNoteVisibility] = useState<'private' | 'shared'>('private');

  const filteredClients = clients.filter(client =>
    client.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNote = () => {
    if (!selectedClient || !newNote.trim()) return;

    const note = {
      id: Date.now().toString(),
      professionalId: 'currentProfessionalId',
      professionalName: 'Current Professional Name',
      date: new Date().toISOString(),
      note: newNote.trim(),
      type: noteType,
      visibility: noteVisibility,
    };

    const updatedClient = {
      ...selectedClient,
      professionalNotes: [...selectedClient.professionalNotes, note],
    };

    setClients(prev => prev.map(c => (c.id === selectedClient.id ? updatedClient : c)));
    setSelectedClient(updatedClient);
    setNewNote('');
  };

  const openModal = (client: ClientProfile) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setSelectedClient(null);
    setShowDetailsModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Client Management</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="pl-3 pr-10 py-2 rounded-md border-gray-300 sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Clients</option>
          <option value="recent">Recent</option>
          <option value="frequent">Frequent</option>
          <option value="new">New</option>
        </select>
      </div>

      {/* Client List */}
      <div className="bg-white shadow rounded-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {filteredClients.map(client => (
            <li key={client.id} className="px-4 py-4 flex justify-between items-center sm:px-6">
              <div className="flex items-center">
                {client.photoURL ? (
                  <img src={client.photoURL} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 flex items-center justify-center rounded-full">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="ml-4">
                  <div className="font-medium text-gray-900">{client.displayName}</div>
                  <div className="text-sm text-gray-500">{client.email}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(client)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  View
                </button>
                <button className="inline-flex items-center px-3 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Client Details Modal */}
      {showDetailsModal && selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={closeModal}
          newNote={newNote}
          onNoteChange={setNewNote}
          onAddNote={handleAddNote}
          noteType={noteType}
          onNoteTypeChange={setNoteType}
          noteVisibility={noteVisibility}
          onNoteVisibilityChange={setNoteVisibility}
        />
      )}
    </div>
  );
};
