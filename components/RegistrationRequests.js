import { useState } from 'react';
import { useMemo } from 'react';
import { useSession } from "next-auth/react";

export default function RegistrationTable({ data, refreshData, loading }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [validityEdit, setValidityEdit] = useState("");
  const [rowLoading, setRowLoading] = useState({}); // id -> 'approve' | 'reject'

  const handleApprove = async (id) => {
    try {
      setRowLoading((s) => ({ ...s, [id]: 'approve' }));
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
    } finally {
      setRowLoading((s) => ({ ...s, [id]: undefined }));
    }
  };

  const handleReject = async (id) => {
    try {
      setRowLoading((s) => ({ ...s, [id]: 'reject' }));
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
    } finally {
      setRowLoading((s) => ({ ...s, [id]: undefined }));
    }
  };

  // Filter data based on status and search query
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filterStatus !== 'all' && row.status !== filterStatus) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          row.name?.toLowerCase().includes(query) ||
          row.email?.toLowerCase().includes(query) ||
          row.companyName?.toLowerCase().includes(query) ||
          row.civilId?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [data, filterStatus, searchQuery]);

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
      <div>
        <table className="min-w-full bg-white dark:bg-gray-800">
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
                            alt={`${row.name}'s photo`}
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
                          {row.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {row.name}
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
                    <div className="flex  space-x-2">
                      {/* View Details Button */}
                      <div className="group relative">
                        <button 
                          onClick={() => setSelectedRegistration(row)}
                          className="inline-block p-2 rounded-lg transition-colors hover:opacity-80"
                          style={{ color: '#061E3E' }}
                          disabled={Boolean(rowLoading[row._id])}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View Details
                          </span>
                        </button>
                      </div>

                      {/* Approve Button (only for pending) */}
                      {row.status !== 'Approved' && (
                        <div className="group relative">
                          <button 
                            onClick={() => handleApprove(row._id)}
                            className="inline-flex items-center gap-2 p-2 text-green-500 hover:text-green-600 rounded-lg transition-colors disabled:opacity-50"
                            disabled={rowLoading[row._id] === 'approve'}
                          >
                            {rowLoading[row._id] === 'approve' ? (
                              <svg className="animate-spin h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
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

      {/* Details Modal */}
{selectedRegistration && (
  <div className="fixed inset-0 backdrop-blur-md bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#061E3E' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Registration Details - {selectedRegistration.name}
        </h2>
        <button
          onClick={() => setSelectedRegistration(null)}
          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Body - Sectioned with Cards */}
      <div className="p-6 space-y-8">
        {/* Personal & Business Info Card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Applicant Photo - Positioned at the top */}
            {selectedRegistration.photo && (
              <div className="flex flex-col items-center mb-4 md:mb-0">
                <img
                  src={selectedRegistration.photo}
                  alt={`${selectedRegistration.name}'s photo`}
                  loading="lazy"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 cursor-pointer transition-transform duration-200 hover:scale-105"
                  onClick={() => window.open(selectedRegistration.photo, '_blank')}
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Applicant Photo</p>
              </div>
            )}
            
            {/* Personal & Business Information */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal & Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Full Name :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.name}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Profession & Designation :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.profession}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Nationality :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.nationality || 'N/A'}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Membership Type :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.membershipType || 'N/A'}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Industry Sector :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.industrySector}</p>
                  {selectedRegistration.alternateIndustrySector && (
                    <>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Alternate Industry Sector :</p>
                      <p className="text-gray-900 dark:text-white">{selectedRegistration.alternateIndustrySector}</p>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Company Name :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.companyName}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Company Address :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.companyAddress}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Company Website :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.companyWebsite}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Business Activity Type :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.businessActivity}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Kuwaiti Sponsor/Partner Name :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.sponsorName}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Supporting Documents Section (Only passport and civil ID) */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-4">
              {selectedRegistration.passportCopy && (
                <div className="group">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Passport Copy</p>
                  <img
                    src={selectedRegistration.passportCopy}
                    alt={`${selectedRegistration.name}'s passport`}
                    className="w-32 h-auto rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer transition-transform duration-200 group-hover:scale-105"
                    onClick={() => window.open(selectedRegistration.passportCopy, '_blank')}
                  />
                </div>
              )}
              {selectedRegistration.civilIdCopy && (
                <div className="group">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Civil ID Copy</p>
                  <img
                    src={selectedRegistration.civilIdCopy}
                    alt={`${selectedRegistration.name}'s civil ID`}
                    className="w-32 h-auto rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer transition-transform duration-200 group-hover:scale-105"
                    onClick={() => window.open(selectedRegistration.civilIdCopy, '_blank')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Identification Details Card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Identification Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Indian Passport Number :</p>
              <p className="text-gray-900 dark:text-white">{selectedRegistration.passportNumber}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Kuwait Civil ID Number :</p>
              <p className="text-gray-900 dark:text-white">{selectedRegistration.civilId}</p>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Address in Kuwait :</p>
              <p className="text-gray-900 dark:text-white">{selectedRegistration.address}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Mobile Number :</p>
              <p className="text-gray-900 dark:text-white">{selectedRegistration.mobile}</p>
              {selectedRegistration.alternateMobile && (
                <>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Alternate Mobile :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.alternateMobile}</p>
                </>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Office Phone :</p>
              <p className="text-gray-900 dark:text-white">{selectedRegistration.officePhone}</p>
              {selectedRegistration.alternateEmail && (
                <>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Alternate Email :</p>
                  <p className="text-gray-900 dark:text-white">{selectedRegistration.alternateEmail}</p>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Email Address :</p>
            <p className="text-gray-900 dark:text-white">{selectedRegistration.email}</p>
          </div>
        </div>

        {/* Application Details Card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-6 4h6m-6 4h6m-6 4h6" />
            </svg>
            Application Details
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">How would you benefit from IBPC membership? (Applicant's response):</p>
              <p className="text-gray-900 dark:text-white">{selectedRegistration.benefitFromIbpc}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">How can you contribute to IBPC's objectives? (Applicant's response):</p>
              <p className="text-gray-900 dark:text-white">{selectedRegistration.contributeToIbpc}</p>
            </div>
          </div>
        </div>

        {/* Sponsorship Card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Sponsorship
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">First IBPC Member Proposer :</p>
              <p className="text-gray-900 dark:text-white">{selectedRegistration.proposer1}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Second IBPC Member Proposer :</p>
              <p className="text-gray-900 dark:text-white">{selectedRegistration.proposer2}</p>
            </div>
          </div>
        </div>

        {/* Membership Validity (Admin only) */}
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Membership Validity:</span>
          
              <span className="text-gray-900 dark:text-white">{selectedRegistration.membershipValidity || "Not set"}</span>
          
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0 z-10">
        <button
          onClick={() => setSelectedRegistration(null)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          title="Close this modal"
        >
          Close
        </button>
        {selectedRegistration?.status !== 'Approved' && selectedRegistration?.status !== 'rejected' && (
          <>
            <button
              onClick={() => handleApprove(selectedRegistration._id)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              title="Approve this registration"
              disabled={rowLoading[selectedRegistration._id] === 'approve'}
            >
              {rowLoading[selectedRegistration._id] === 'approve' ? 'Approving...' : 'Approve'}
            </button>
          </>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}