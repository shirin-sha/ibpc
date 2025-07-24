'use client';
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  EyeIcon, 
  PencilIcon, 
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner, { TableSkeleton } from './ui/LoadingSpinner';
import Button from './ui/Button';
import Input from './ui/Input';

const MembersTable = ({ members = [], isAdmin = false, loading = false, onRefresh }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Memoized filtered and sorted data
  const processedMembers = useMemo(() => {
    if (!members?.length) return [];

    // Filter members based on search query
    const filtered = members.filter((member) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      
      return (
        member.name?.toLowerCase().includes(query) ||
        member.mobile?.toLowerCase().includes(query) ||
        member._id?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.companyName?.toLowerCase().includes(query) ||
        member.designation?.toLowerCase().includes(query)
      );
    });

    // Sort members
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() || '';
      const bValue = b[sortField]?.toString().toLowerCase() || '';

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return sorted;
  }, [members, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedMembers.length / itemsPerPage);
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedMembers, currentPage]);

  // Handle sorting
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Handle search
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Sort Icon Component
  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <div className="w-4 h-4 text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronUpIcon className="w-4 h-4" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 text-primary-600" />
    );
  };

  // Avatar Component
  const Avatar = ({ member }) => {
    const [imageError, setImageError] = useState(false);
    
    if (member.photo && !imageError) {
      return (
        <img
          src={member.photo}
          alt={`${member.name}'s photo`}
          className="w-10 h-10 rounded-full object-cover border-2 border-secondary-200 dark:border-secondary-600"
          onError={() => setImageError(true)}
        />
      );
    }
    
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
        {member.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  };

  // Social Links Component
  const SocialLinks = ({ member }) => {
    const social = member.social || {};
    const links = [
      { key: 'linkedin', url: social.linkedin, label: 'LinkedIn' },
      { key: 'twitter', url: social.twitter, label: 'Twitter' },
      { key: 'facebook', url: social.facebook, label: 'Facebook' },
    ].filter(link => link.url);

    if (!links.length) return <span className="text-secondary-400">-</span>;

    return (
      <div className="flex space-x-2">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 transition-colors"
            title={link.label}
          >
            <span className="text-xs font-medium">{link.key.charAt(0).toUpperCase()}</span>
          </a>
        ))}
      </div>
    );
  };

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-secondary-200 dark:border-secondary-700">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedMembers.length)} of {processedMembers.length} members
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + Math.max(1, currentPage - 2);
            if (pageNum > totalPages) return null;
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-soft border border-secondary-100 dark:border-secondary-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Members Directory
            </h2>
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full">
              {processedMembers.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={handleSearch}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              className="w-64"
            />
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                loading={loading}
              >
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 dark:bg-secondary-700/30 border-b border-secondary-200 dark:border-secondary-600">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="group px-6 py-4 text-left text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-600/50 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Member</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                onClick={() => handleSort('email')}
                className="group px-6 py-4 text-left text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-600/50 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Contact</span>
                  <SortIcon field="email" />
                </div>
              </th>
              <th
                onClick={() => handleSort('companyName')}
                className="group px-6 py-4 text-left text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 dark:hover:bg-secondary-600/50 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Company</span>
                  <SortIcon field="companyName" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                Social
              </th>
              {isAdmin && (
                <th className="px-6 py-4 text-center text-xs font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="p-0">
                  <TableSkeleton rows={5} columns={isAdmin ? 5 : 4} />
                </td>
              </tr>
            ) : processedMembers.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <UserIcon className="w-12 h-12 text-secondary-400" />
                    <div className="text-secondary-900 dark:text-secondary-100 font-medium">
                      {searchQuery ? 'No members match your search' : 'No members found'}
                    </div>
                    <p className="text-secondary-500 dark:text-secondary-400 text-sm">
                      {searchQuery ? 'Try adjusting your search terms' : 'Members will appear here once they are added'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedMembers.map((member) => (
                <tr 
                  key={member._id} 
                  className="hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar member={member} />
                      <div>
                        <div className="font-medium text-secondary-900 dark:text-secondary-100">
                          {member.name || 'N/A'}
                        </div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          ID: {member.memberId || member._id?.slice(-6) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <EnvelopeIcon className="w-4 h-4 text-secondary-400" />
                        <span className="text-secondary-900 dark:text-secondary-100">
                          {member.email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <PhoneIcon className="w-4 h-4 text-secondary-400" />
                        <span className="text-secondary-600 dark:text-secondary-400">
                          {member.mobile || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-secondary-400" />
                        <span className="font-medium text-secondary-900 dark:text-secondary-100">
                          {member.companyName || 'N/A'}
                        </span>
                      </div>
                      <div className="text-sm text-secondary-600 dark:text-secondary-400">
                        {member.designation || 'N/A'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <SocialLinks member={member} />
                  </td>
                  
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link href={`/dashboard/profile/${member._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<EyeIcon className="w-4 h-4" />}
                          >
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/profile/edit/${member._id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PencilIcon className="w-4 h-4" />}
                          >
                            Edit
                          </Button>
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

      {/* Pagination */}
      <Pagination />
    </div>
  );
};

export default MembersTable;