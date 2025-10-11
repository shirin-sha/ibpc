'use client';
import { useMemo, useState } from 'react';
import React from 'react';
import Link from 'next/link';
import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline';

function MembersTable({ members, isAdmin ,loading, page = 1, totalPages = 1, onPageChange = () => {}, size = 20, onSizeChange = () => {}, totalCount = 0 }) {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (members || []).filter((member) => {
      return (
        member.name?.toLowerCase().includes(query) ||
        member.mobile?.toLowerCase().includes(query) ||
        member._id?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.companyName?.toLowerCase().includes(query) ||
        member.designation?.toLowerCase().includes(query)
      );
    });
  }, [members, searchQuery]);

  // Sort members
  const sortedMembers = useMemo(() => {
    const list = [...filteredMembers];
    return list.sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() || '';
      const bValue = b[sortField]?.toString().toLowerCase() || '';
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  }, [filteredMembers, sortField, sortDirection]);

  // Sort Icon Component
  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-gray-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-gray-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Pagination helpers
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const PageButton = ({ disabled, onClick, children }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
        disabled
          ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
          : 'text-gray-700 border-gray-300 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  const sizeOptions = [10, 20, 50, 100, 'all'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Members ({sortedMembers.length}{size === 'all' && totalCount ? ` of ${totalCount}` : ''})
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search in page"
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
            {isAdmin && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-gray-300">Rows</label>
                  <select
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={size}
                    onChange={(e) => onSizeChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                  >
                    {sizeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                {size !== 'all' && (
                  <div className="flex items-center gap-2">
                    <PageButton disabled={!canPrev || loading} onClick={() => onPageChange(1)}>{'<<'}</PageButton>
                    <PageButton disabled={!canPrev || loading} onClick={() => onPageChange(page - 1)}>{'Prev'}</PageButton>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Page {page} of {totalPages}
                    </span>
                    <PageButton disabled={!canNext || loading} onClick={() => onPageChange(page + 1)}>{'Next'}</PageButton>
                    <PageButton disabled={!canNext || loading} onClick={() => onPageChange(totalPages)}>{'>>'}</PageButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-sm:max-h-[60vh] max-sm:overflow-y-auto slim-scroll">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {isAdmin ? (
                <>
                  {/* Admin Columns (unchanged) */}
                  <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center">
                      <span>Name</span>
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('memberId')} className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center">
                      <span>Member ID</span>
                      <SortIcon field="memberId" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('phone')} className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center">
                      <span>Phone</span>
                      <SortIcon field="phone" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('email')} className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center">
                      <span>Email</span>
                      <SortIcon field="email" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('companyName')} className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center">
                      <span>Company</span>
                      <SortIcon field="companyName" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('designation')} className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center">
                      <span>Designation</span>
                      <SortIcon field="designation" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Social</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                </>
              ) : (
                <>
                  {/* Member Columns */}
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Industry Sector</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="animate-spin h-8 w-8 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: '#061E3E' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span className="text-gray-500 dark:text-gray-300">Loading members...</span>
                  </div>
                </td>
              </tr>
            ) : sortedMembers.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 6} className="px-6 py-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {searchQuery ? 'No members match your search' : 'No members found'}
                  </h3>
                </td>
              </tr>
            ) : (
              sortedMembers.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {isAdmin ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={`${member.name}'s photo`}
                                loading="lazy"
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
                                member.photo ? 'hidden' : 'flex'
                              }`}
                            >
                              {member.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.memberId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.mobile}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.profession}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {/* Social Icons */}
                          {member.social?.linkedin && (
                            <a
                              href={member.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="LinkedIn"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-blue-600">
                                <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.3h.1c.5-.9 1.6-2.3 3.9-2.3 4.2 0 5 2.7 5 6.2V24h-4v-8.3c0-2-.1-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.5V24h-4V8z" />
                              </svg>
                            </a>
                          )}
                          {member.social?.instagram && (
                            <a href={member.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-pink-600">
                                <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2zm0 1.5A4.26 4.26 0 0 0 3.5 7.75v8.5A4.26 4.26 0 0 0 7.75 20.5h8.5a4.26 4.26 0 0 0 4.25-4.25v-8.5A4.26 4.26 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.88a1.13 1.13 0 1 1-2.26 0 1.13 1.13 0 0 1 2.26 0z" />
                              </svg>
                            </a>
                          )}
                          {member.social?.twitter && (
                            <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-sky-500">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.1 9.1 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.5 0c-2.5 0-4.5 2-4.5 4.5 0 .35.04.69.11 1.02A12.94 12.94 0 0 1 3 1.6a4.48 4.48 0 0 0-.61 2.27c0 1.56.8 2.94 2.02 3.75a4.52 4.52 0 0 1-2.05-.57v.06c0 2.18 1.56 4 3.64 4.42a4.52 4.52 0 0 1-2.04.08c.58 1.81 2.26 3.13 4.25 3.17A9.05 9.05 0 0 1 2 19.54a12.94 12.94 0 0 0 7 2.05c8.4 0 13-7 13-13v-.59A9.18 9.18 0 0 0 23 3z" />
                              </svg>
                            </a>
                          )}
                          {member.social?.facebook && (
                            <a href={member.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-blue-700">
                                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h3l-.5 3h-2.5v7A10 10 0 0 0 22 12z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center space-x-3">
                          <Link href={`/member/profile/${member._id}`}>
                            <div className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors">
                              <EyeIcon className="w-5 h-5" />
                            </div>
                          </Link>
                          <Link href={`/member/profile/edit/${member._id}`}>
                            <div className="text-yellow-500 hover:text-yellow-600 cursor-pointer transition-colors">
                              <PencilIcon className="w-5 h-5" />
                            </div>
                          </Link>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={`${member.name}'s photo`}
                                loading="lazy"
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
                                member.photo ? 'hidden' : 'flex'
                              }`}
                            >
                              {member.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.profession}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{member.industrySector || 'N/A'}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center space-x-3">
                          <Link href={`/member/profile/${member._id}`}>
                            <div className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors">
                              <EyeIcon className="w-5 h-5" />
                            </div>
                          </Link>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer pagination (duplicate for convenience on small screens) */}
      {size !== 'all' && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-500">Showing {members.length} {members.length === 1 ? 'result' : 'results'}</span>
          <div className="flex items-center gap-2">
            <PageButton disabled={!canPrev || loading} onClick={() => onPageChange(1)}>{'<<'}</PageButton>
            <PageButton disabled={!canPrev || loading} onClick={() => onPageChange(page - 1)}>{'Prev'}</PageButton>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <PageButton disabled={!canNext || loading} onClick={() => onPageChange(page + 1)}>{'Next'}</PageButton>
            <PageButton disabled={!canNext || loading} onClick={() => onPageChange(totalPages)}>{'>>'}</PageButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(MembersTable);