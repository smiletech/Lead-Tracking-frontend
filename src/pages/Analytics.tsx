import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';

const Analytics: React.FC = () => {
  const { data: leadsPerForm } = useQuery({
    queryKey: ['analytics', 'leads-per-form'],
    queryFn: async () => {
      const response = await analyticsAPI.getLeadsPerForm();
      return response.data.data;
    },
  });

  const { data: leadsPerDay } = useQuery({
    queryKey: ['analytics', 'leads-per-day'],
    queryFn: async () => {
      const response = await analyticsAPI.getLeadsPerDay(30);
      return response.data.data;
    },
  });

  const totalLeads = leadsPerForm?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Leads</h3>
          <p className="text-4xl font-bold">{totalLeads}</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Active Forms</h3>
          <p className="text-4xl font-bold">{leadsPerForm?.length || 0}</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Avg. Leads/Day</h3>
          <p className="text-4xl font-bold">
            {leadsPerDay && leadsPerDay.length > 0
              ? (
                  leadsPerDay.reduce((sum: number, item: any) => sum + item.count, 0) /
                  leadsPerDay.length
                ).toFixed(1)
              : 0}
          </p>
        </div>
      </div>

      {/* Leads per Form */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Leads per Form</h2>
        {leadsPerForm && leadsPerForm.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Form Name</th>
                  <th className="text-right py-3 px-4">Total Leads</th>
                  <th className="py-3 px-4">Progress</th>
                </tr>
              </thead>
              <tbody>
                {leadsPerForm.map((item: any) => {
                  const percentage = totalLeads > 0 ? (item.count / totalLeads) * 100 : 0;
                  return (
                    <tr key={item.formId} className="border-b">
                      <td className="py-3 px-4">{item.formName}</td>
                      <td className="text-right py-3 px-4 font-semibold">{item.count}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No data available</p>
        )}
      </div>

      {/* Leads per Day Chart */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Leads Over Time (Last 30 Days)</h2>
        {leadsPerDay && leadsPerDay.length > 0 ? (
          <div className="space-y-2">
            {leadsPerDay
              .slice(-10)
              .reverse()
              .map((item: any) => {
                const maxCount = Math.max(...leadsPerDay.map((d: any) => d.count), 1);
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 flex items-center">
                      <div
                        className="bg-primary-600 h-8 rounded-full flex items-center justify-end px-3 text-white text-sm font-medium"
                        style={{ width: `${Math.max(percentage, 10)}%` }}
                      >
                        {item.count > 0 && item.count}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No data available</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
