import { useState } from 'react';

export default function RegistrationTable({ data, refreshData }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleApprove = async (id) => {
    try {
      const response = await fetch('/api/register', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        alert('Registration approved successfully! Credentials sent to the user.');
        refreshData();
      } else {
        const errorData = await response.json();
        alert(`Error approving: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve registration. Please try again.');
    }
  };

  // Filter data based on status and search query
  const filteredData = data.filter((row) => {
    if (filterStatus !== 'all' && row.status !== filterStatus) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        row.fullName?.toLowerCase().includes(query) ||
        row.email?.toLowerCase().includes(query) ||
        row.companyName?.toLowerCase().includes(query) ||
        row.civilId?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Table Header */}
   {/* Table Header */}
<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
      Registration Requests ({filteredData.length})
    </h2>
    <div className="flex items-center space-x-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-400 focus:border-transparent transition-all"
        />
        <svg 
          className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* Status Filter */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <span>Status:</span>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-400"
        >
          <option value="all">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
        </select>
      </div>
    </div>
  </div>
</div>
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Company Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                ID Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Proposers
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {searchQuery ? 'No requests match your search' : 'No registration requests found'}
                  </h3>
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {row.photo ? (
                          <img
                            src={row.photo}
                            alt={`${row.fullName}'s photo`}
                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback avatar */}
                        <div 
                          className={`h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-lg ${
                            row.photo ? 'hidden' : 'flex'
                          }`}
                        >
                          {row.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {row.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {row.profession}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {row.companyName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {row.businessActivity}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Sponsor: {row.sponsorName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {row.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      M: {row.mobile}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      O: {row.officePhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Civil ID: {row.civilId}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Passport: {row.passportNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div>1. {row.proposer1}</div>
                      <div>2. {row.proposer2}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.status === 'Approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : row.status === 'rejected' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}>
                      {row.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {/* View Details Button */}
                      <div className="group relative">
                        {/* <button className="inline-block p-2 text-blue-500 hover:text-blue-600 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View Details
                          </span>
                        </button> */}
                      </div>

                      {/* Approve Button (only for pending) */}
                      {row.status !== 'Approved' && (
                        <div className="group relative">
                          <button 
                            onClick={() => handleApprove(row._id)}
                            className="inline-block p-2 text-green-500 hover:text-green-600 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Approve
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}