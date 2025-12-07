import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { websiteAPI, formAPI } from '../services/api';

const Websites: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: websitesData, isLoading } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      const response = await websiteAPI.getAll();
      return response.data.websites;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { url: string; name?: string }) => websiteAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      setShowAddModal(false);
      setUrl('');
      setName('');
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Failed to add website');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => websiteAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ url, name });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Websites</h1>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          + Add Website
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websitesData?.map((website: any) => (
            <div key={website.id} className="card">
              <h3 className="text-lg font-semibold mb-2">
                {website.name || website.url}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{website.url}</p>
              <div className="text-sm text-gray-500 mb-4">
                Forms: {website.forms?.length || 0}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/websites/${website.id}/forms`)}
                  className="btn btn-primary flex-1"
                >
                  Manage Forms
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this website?')) {
                      deleteMutation.mutate(website.id);
                    }
                  }}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {(!websitesData || websitesData.length === 0) && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No websites added yet. Click "Add Website" to get started.
            </div>
          )}
        </div>
      )}

      {/* Add Website Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Website</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="My Website"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">
                  {createMutation.isPending ? 'Adding...' : 'Add Website'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Websites;
