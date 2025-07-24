'use client';
import React from 'react';
import Card from '@/components/Card';
import { CardSkeleton } from '@/components/ui/LoadingSpinner';
import useApi from '@/lib/hooks/useApi';
import { 
  UserIcon, 
  UserPlusIcon, 
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const AdminDashboard = () => {
  // Fetch users data
  const { 
    data: users = [], 
    loading: usersLoading 
  } = useApi('/api/users');

  // Fetch registrations data
  const { 
    data: registrations = [], 
    loading: registrationsLoading 
  } = useApi('/api/register');

  const isLoading = usersLoading || registrationsLoading;

  // Calculate stats with proper null checks
  const totalMembers = users ? users.filter(user => user.role !== 'admin').length : 0;
  const recentMembers = users ? users.filter(user => {
    if (!user.createdAt) return false;
    const memberDate = new Date(user.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return memberDate >= weekAgo && user.role !== 'admin';
  }).length : 0;
  
  const pendingRegistrations = registrations ? registrations.filter(reg => reg.status === 'Pending').length : 0;
  const approvedToday = registrations ? registrations.filter(reg => {
    if (!reg.updatedAt) return false;
    const approvedDate = new Date(reg.updatedAt);
    const today = new Date();
    return approvedDate.toDateString() === today.toDateString() && reg.status === 'Approved';
  }).length : 0;

  const quickActions = [
    {
      title: 'Review Registrations',
      description: `${pendingRegistrations} pending applications`,
      href: '/dashboard/admin/registrations',
      icon: <ClockIcon className="w-5 h-5" />,
      color: 'warning',
      urgent: pendingRegistrations > 0
    },
    {
      title: 'Manage Members',
      description: 'View and edit member profiles',
      href: '/dashboard/members',
      icon: <UserIcon className="w-5 h-5" />,
      color: 'primary'
    },
    {
      title: 'System Settings',
      description: 'Configure application settings',
      href: '/dashboard/admin/settings',
      icon: <ChartBarIcon className="w-5 h-5" />,
      color: 'secondary'
    }
  ];

  const recentActivity = [
    {
      type: 'registration',
      message: `${approvedToday} registrations approved today`,
      time: 'Today',
      color: 'success'
    },
    {
      type: 'member',
      message: `${recentMembers} new members this week`,
      time: 'This week',
      color: 'primary'
    },
    {
      type: 'pending',
      message: `${pendingRegistrations} applications awaiting review`,
      time: 'Now',
      color: 'warning'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Admin Dashboard 🛡️
            </h1>
            <p className="text-red-100 text-lg">
              Manage members, review applications, and oversee the community.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card
              title="Total Members"
              value={totalMembers.toLocaleString()}
              icon={<UserIcon className="w-6 h-6" />}
              variant="primary"
              trend={{ value: `+${recentMembers}`, direction: 'up' }}
            />
            <Card
              title="New This Week"
              value={recentMembers.toString()}
              icon={<UserPlusIcon className="w-6 h-6" />}
              variant="success"
            />
            <Card
              title="Pending Registrations"
              value={pendingRegistrations.toString()}
              icon={<ClockIcon className="w-6 h-6" />}
              variant={pendingRegistrations > 0 ? "warning" : "default"}
              onClick={() => window.location.href = '/dashboard/admin/registrations'}
            />
            <Card
              title="Approved Today"
              value={approvedToday.toString()}
              icon={<CheckCircleIcon className="w-6 h-6" />}
              variant="success"
            />
          </>
        )}
      </div>

      {/* Alert for Pending Registrations */}
      {!isLoading && pendingRegistrations > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Action Required
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                You have {pendingRegistrations} pending registration{pendingRegistrations !== 1 ? 's' : ''} that need review.
              </p>
            </div>
            <Link href="/dashboard/admin/registrations">
              <Button variant="warning" size="sm">
                Review Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="col-span-1">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer group ${
                    action.urgent 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}>
                    <div className={`p-2 rounded-lg bg-${action.color === 'primary' ? 'red' : action.color}-100 dark:bg-${action.color === 'primary' ? 'red' : action.color}-900/20 text-${action.color === 'primary' ? 'red' : action.color}-600 dark:text-${action.color === 'primary' ? 'red' : action.color}-400 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                        <span>{action.title}</span>
                        {action.urgent && (
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                System Overview
              </h3>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className={`w-2 h-2 ${activity.color === 'success' ? 'bg-green-500' : activity.color === 'primary' ? 'bg-red-500' : 'bg-yellow-500'} rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.message}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              System Status
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800 dark:text-green-200">Database</div>
                <div className="text-sm text-green-600 dark:text-green-400">Connected</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800 dark:text-green-200">API</div>
                <div className="text-sm text-green-600 dark:text-green-400">Operational</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800 dark:text-green-200">Storage</div>
                <div className="text-sm text-green-600 dark:text-green-400">Available</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;