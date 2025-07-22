import Link from 'next/link';
import { useState } from 'react';

export default function MembersTable({ members, isAdmin }) {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter members based on search query
  const filteredMembers = members?.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(query) ||
      member.phone?.toLowerCase().includes(query) ||
      member._id?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  });

  // Sort the filtered members array based on the current sort field and direction
  const sortedMembers = [...filteredMembers]?.sort((a, b) => {
    const aValue = a[sortField]?.toString().toLowerCase() || '';
    const bValue = b[sortField]?.toString().toLowerCase() || '';
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Component to display sort icons
  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
   {/* Table Header */}
<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
      Members ({sortedMembers.length})
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
    </div>
  </div>
</div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white dark:bg-gray-800">
         <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
  <tr>
    <th 
      onClick={() => handleSort('name')}
      className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      <div className="flex items-center space-x-1">
        <span>Member</span>
        <SortIcon field="name" />
      </div>
    </th>
    <th 
      onClick={() => handleSort('companyName')}
      className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      <div className="flex items-center space-x-1">
        <span>Company</span>
        <SortIcon field="companyName" />
      </div>
    </th>
    <th 
      onClick={() => handleSort('profession')}
      className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      <div className="flex items-center space-x-1">
        <span>Role</span>
        <SortIcon field="profession" />
      </div>
    </th>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
      Contact
    </th>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
      Company Brief
    </th>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
      Social Media
    </th>
    {isAdmin && (
      <th className="px-6 py-3 text-center text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
        Actions
      </th>
    )}
  </tr>
</thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedMembers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {searchQuery ? 'No members match your search' : 'No members found'}
                  </h3>
                </td>
              </tr>
            ) : (
              sortedMembers.map((member) => (
                <tr 
                  key={member._id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Member Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          src={member.photo || '/logo.png'}
                          alt={member.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {member._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.companyName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {member.businessActivity}
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.profession}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.designation}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.email}
                    </div>
                    {member.phone && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.phone}
                      </div>
                    )}
                  </td>

                  {/* Company Brief */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {member.companyBrief}
                    </div>
                  </td>

                  {/* Social Media */}
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {member.social?.linkedin && (
                        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.822 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      )}
                      {member.social?.instagram && (
                        <a href={member.social.instagram} target="_blank" rel="noopener noreferrer">
                          <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.625-.07-1.644-.07-4.849 0-3.259.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                      {member.social?.twitter && (
                        <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        </a>
                      )}
                      {member.social?.facebook && (
                        <a href={member.social.facebook} target="_blank" rel="noopener noreferrer">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.408.593 24 1.324 24h11.494v-9.294H9.689v-3.621h3.129V8.412c0-3.099 1.894-4.787 4.659-4.787 1.325 0 2.464.1 2.796.144v3.24l-1.918.001c-1.503 0-1.794.715-1.794 1.762v2.31h3.587l-.468 3.622h-3.119V24h6.116c.73 0 1.324-.593 1.324-1.324V1.324C24 .593 23.408 0 22.676 0z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Actions - Only visible to admin users */}
                  {isAdmin && (
                    <td className="px-4 py-4 text-center">
                      <div className="group relative">
                        <Link 
                          href={`/dashboard/profile/${member._id}`}
                          className="inline-block p-2 text-yellow-500 hover:text-yellow-600 rounded-lg transition-colors"
                          aria-label="Edit profile"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Edit
                          </span>
                        </Link>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}