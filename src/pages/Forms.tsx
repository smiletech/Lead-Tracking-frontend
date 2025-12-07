import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { formAPI, websiteAPI } from '../services/api';

const Forms: React.FC = () => {
  const { websiteId } = useParams<{ websiteId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDetectModal, setShowDetectModal] = useState(false);
  const [detectUrl, setDetectUrl] = useState('');
  const [detectedForms, setDetectedForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [showSnippet, setShowSnippet] = useState(false);
  const [snippet, setSnippet] = useState('');

  const { data: website } = useQuery({
    queryKey: ['website', websiteId],
    queryFn: async () => {
      const response = await websiteAPI.getAll();
      return response.data.websites.find((w: any) => w.id === websiteId);
    },
  });

  const { data: forms, isLoading } = useQuery({
    queryKey: ['forms', websiteId],
    queryFn: async () => {
      const response = await formAPI.getByWebsite(websiteId!);
      return response.data.forms;
    },
    enabled: !!websiteId,
  });

  const detectMutation = useMutation({
    mutationFn: (url: string) => formAPI.detect({ websiteId: websiteId!, url }),
    onSuccess: (response) => {
      setDetectedForms(response.data.forms);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => formAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms', websiteId] });
      setSelectedForm(null);
      setDetectedForms([]);
      setShowDetectModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (formId: string) => formAPI.delete(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms', websiteId] });
    },
  });

  const handleDetect = () => {
    detectMutation.mutate(detectUrl);
  };

  const handleCreateForm = (detectedForm: any, index: number) => {
    const formData = {
      websiteId: websiteId!,
      name: `Form ${index + 1}`,
      url: detectedForm.url,
      fields: detectedForm.fields,
    };
    createMutation.mutate(formData);
  };

  const handleShowSnippet = async (formId: string) => {
    try {
      const response = await formAPI.getSnippet(formId);
      setSnippet(response.data.snippet);
      setShowSnippet(true);
    } catch (error) {
      console.error('Failed to get snippet:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate('/websites')} className="text-primary-600 hover:underline mb-2">
          ← Back to Websites
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{website?.name || website?.url}</h1>
            <p className="text-gray-600">{website?.url}</p>
          </div>
          <button onClick={() => setShowDetectModal(true)} className="btn btn-primary">
            + Detect Forms
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {forms?.map((form: any) => (
            <div key={form.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{form.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{form.url}</p>
                  <div className="text-sm text-gray-500">
                    Fields: {form.fields?.length || 0} | Leads: {form._count?.leads || 0}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShowSnippet(form.id)}
                    className="btn btn-primary"
                  >
                    Get Snippet
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this form?')) {
                        deleteMutation.mutate(form.id);
                      }
                    }}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Form Fields:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {form.fields?.map((field: any) => (
                    <div key={field.id} className="text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">{field.name}</span>
                      <span className="text-gray-500"> ({field.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {(!forms || forms.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              No forms detected yet. Click "Detect Forms" to scan for forms.
            </div>
          )}
        </div>
      )}

      {/* Detect Forms Modal */}
      {showDetectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="card max-w-4xl w-full my-8">
            <h2 className="text-2xl font-bold mb-4">Detect Forms</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Page URL to Scan</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={detectUrl}
                  onChange={(e) => setDetectUrl(e.target.value)}
                  className="input flex-1"
                  placeholder={website?.url || 'https://example.com/contact'}
                />
                <button
                  onClick={handleDetect}
                  disabled={detectMutation.isPending}
                  className="btn btn-primary"
                >
                  {detectMutation.isPending ? 'Scanning...' : 'Scan'}
                </button>
              </div>
            </div>

            {detectedForms.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Detected Forms:</h3>
                {detectedForms.map((form, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Form {index + 1}</h4>
                        <p className="text-sm text-gray-600">{form.url}</p>
                      </div>
                      <button
                        onClick={() => handleCreateForm(form, index)}
                        disabled={createMutation.isPending}
                        className="btn btn-primary"
                      >
                        Save Form
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {form.fields.map((field: any, idx: number) => (
                        <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                          <span className="font-medium">{field.name}</span>
                          <span className="text-gray-500"> ({field.type})</span>
                          {field.label && (
                            <div className="text-xs text-gray-400">Label: {field.label}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={() => {
                  setShowDetectModal(false);
                  setDetectedForms([]);
                  setDetectUrl('');
                }}
                className="btn btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snippet Modal */}
      {showSnippet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Integration Snippet</h2>
            <p className="text-sm text-gray-600 mb-4">
              Copy and paste this code into your website's HTML, just before the closing {'</body>'} tag:
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto mb-4">
              <code>{snippet}</code>
            </pre>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(snippet);
                  alert('Copied to clipboard!');
                }}
                className="btn btn-primary flex-1"
              >
                Copy to Clipboard
              </button>
              <button onClick={() => setShowSnippet(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms;
