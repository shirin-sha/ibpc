'use client';
import { useState } from 'react';

export default function RegistrationTable({ data = [], refreshData, loading }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);

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
        setSelectedRegistration(null); // Close modal after action
      } else {
        const errorData = await response.json();
        alert(`Error approving: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve registration. Please try again.');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch('/api/register', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: 'rejected' }), // Assuming API supports status update
      });

      if (response.ok) {
        alert('Registration rejected successfully!');
        refreshData();
        setSelectedRegistration(null); // Close modal after action
      } else {
        const errorData = await response.json();
        alert(`Error rejecting: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Rejection error:', error);
      alert('Failed to reject registration. Please try again.');
    }
  };

  // Filter data based on status and search query with null checks
  const filteredData = (data || []).filter((row) => {
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
              {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    {/* Spinner SVG */}
                    <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span className="text-gray-500 dark:text-gray-300">Loading registrations...</span>
                  </div>
                </td>
              </tr>
            ) :
            filteredData.length === 0 ? (
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
                          {row.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {row.profession || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="font-medium">{row.companyName || 'N/A'}</div>
                      <div className="text-gray-500 dark:text-gray-400">{row.designation || 'N/A'}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{row.businessActivity || 'N/A'}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>{row.email || 'N/A'}</div>
                      <div className="text-gray-500 dark:text-gray-400">{row.mobile || 'N/A'}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Office: {row.officePhone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>Civil ID: {row.civilId || 'N/A'}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Passport: {row.passportNumber || 'N/A'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>1. {row.proposer1 || 'N/A'}</div>
                      <div>2. {row.proposer2 || 'N/A'}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      row.status === 'Approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : row.status === 'Rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {row.status || 'Pending'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => setSelectedRegistration(row)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                      >
                        View Details
                      </button>
                      {row.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(row._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(row._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Registration Details */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Registration Details - {selectedRegistration.fullName}
                </h3>
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Full Name:</span> {selectedRegistration.fullName || 'N/A'}</div>
                    <div><span className="font-medium">Profession:</span> {selectedRegistration.profession || 'N/A'}</div>
                    <div><span className="font-medium">Civil ID:</span> {selectedRegistration.civilId || 'N/A'}</div>
                    <div><span className="font-medium">Passport:</span> {selectedRegistration.passportNumber || 'N/A'}</div>
                    <div><span className="font-medium">Address:</span> {selectedRegistration.address || 'N/A'}</div>
                  </div>
                </div>
                
                {/* Company Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Company Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Company:</span> {selectedRegistration.companyName || 'N/A'}</div>
                    <div><span className="font-medium">Designation:</span> {selectedRegistration.designation || 'N/A'}</div>
                    <div><span className="font-medium">Business Activity:</span> {selectedRegistration.businessActivity || 'N/A'}</div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Email:</span> {selectedRegistration.email || 'N/A'}</div>
                    <div><span className="font-medium">Mobile:</span> {selectedRegistration.mobile || 'N/A'}</div>
                    <div><span className="font-medium">Office Phone:</span> {selectedRegistration.officePhone || 'N/A'}</div>
                    <div><span className="font-medium">Residence Phone:</span> {selectedRegistration.residencePhone || 'N/A'}</div>
                  </div>
                </div>
                
                {/* Proposers */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Proposers</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Proposer 1:</span> {selectedRegistration.proposer1 || 'N/A'}</div>
                    <div><span className="font-medium">Proposer 2:</span> {selectedRegistration.proposer2 || 'N/A'}</div>
                    <div><span className="font-medium">Sponsor Name:</span> {selectedRegistration.sponsorName || 'N/A'}</div>
                  </div>
                </div>
                
                {/* IBPC Sections */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">IBPC Information</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">How can you benefit from IBPC:</span>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedRegistration.benefitFromIbpc || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">How can you contribute to IBPC:</span>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedRegistration.contributeToIbpc || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedRegistration.status === 'Pending' && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => handleReject(selectedRegistration._id)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedRegistration._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}