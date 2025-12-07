import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadAPI, websiteAPI, formAPI } from '../services/api';

const Leads: React.FC = () => {
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: websitesData } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      const response = await websiteAPI.getAll();
      return response.data.websites;
    },
  });

  // Get all forms for filtering
  const allForms = websitesData?.flatMap((w: any) => w.forms || []) || [];

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', selectedFormId, startDate, endDate],
    queryFn: async () => {
      const params: any = {};
      if (selectedFormId) params.formId = selectedFormId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await leadAPI.getAll(params);
      return response.data.leads;
    },
  });

  const clearFilters = () => {
    setSelectedFormId('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Leads</h1>

      {/* Filters */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Form</label>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="input"
            >
              <option value="">All Forms</option>
              {allForms.map((form: any) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex items-end">
            <button onClick={clearFilters} className="btn btn-secondary w-full">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Form</th>
                <th className="text-left py-3 px-4">Website</th>
                <th className="text-left py-3 px-4">Data</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {leadsData?.map((lead: any) => (
                <tr key={lead.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{lead.formName}</td>
                  <td className="py-3 px-4">
                    {lead.website?.name || lead.website?.url}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {Object.entries(lead.data).map(([key, value]: any) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              
              {(!leadsData || leadsData.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    No leads captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leads;
