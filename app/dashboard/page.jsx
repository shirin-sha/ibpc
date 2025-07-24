'use client';
import React from 'react';
import Card from '@/components/Card';
import { CardSkeleton } from '@/components/ui/LoadingSpinner';
import { useSession } from 'next-auth/react';
import useApi from '@/lib/hooks/useApi';
import { 
  UserIcon, 
  ChartBarIcon, 
  ClockIcon,
  PencilIcon,
  EyeIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const Dashboard = () => {
  const { data: session, status } = useSession();
  
  // Fetch user data for stats
  const { 
    data: users = [], 
    loading: usersLoading 
  } = useApi('/api/users');

  // Calculate stats with proper null checks
  const totalMembers = users ? users.filter(user => user.role !== 'admin').length : 0;
  const recentMembers = users ? users.filter(user => {
    if (!user.createdAt) return false;
    const memberDate = new Date(user.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return memberDate >= weekAgo && user.role !== 'admin';
  }).length : 0;

  const isLoading = status === 'loading' || usersLoading;

  const quickActions = [
    {
      title: 'View Profile',
      description: 'Check and update your profile information',
      href: `/dashboard/profile/edit/${session?.user?.id}`,
      icon: <EyeIcon className="w-5 h-5" />,
      color: 'primary'
    },
    {
      title: 'Members Directory',
      description: 'Browse all member profiles',
      href: '/dashboard/members',
      icon: <UserIcon className="w-5 h-5" />,
      color: 'success'
    },
    {
      title: 'Edit Profile',
      description: 'Update your personal information',
      href: `/dashboard/profile/edit/${session?.user?.id}`,
      icon: <PencilIcon className="w-5 h-5" />,
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
              Welcome back, {session?.user?.name || 'Member'}! 👋
            </h1>
            <p className="text-red-100 text-lg">
              Ready to connect with the IBPC community?
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
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
              icon={<ChartBarIcon className="w-6 h-6" />}
              variant="success"
            />
            <Card
              title="Profile Status"
              value="Complete"
              icon={<ClockIcon className="w-6 h-6" />}
              variant="success"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions Card */}
        <Card className="col-span-1">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BellIcon className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                    <div className={`p-2 rounded-lg bg-${action.color === 'primary' ? 'red' : action.color === 'success' ? 'green' : 'yellow'}-100 dark:bg-${action.color === 'primary' ? 'red' : action.color === 'success' ? 'green' : 'yellow'}-900/20 text-${action.color === 'primary' ? 'red' : action.color === 'success' ? 'green' : 'yellow'}-600 dark:text-${action.color === 'primary' ? 'red' : action.color === 'success' ? 'green' : 'yellow'}-400 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {action.title}
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
                Recent Activity
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Profile updated successfully
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    2 hours ago
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Joined the community
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    1 week ago
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Viewed member directory
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    3 days ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Get the most out of your membership
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Complete your profile and connect with other members to expand your network.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/dashboard/profile/edit/${session?.user?.id}`}>
            <Button variant="primary" size="lg">
              Complete Profile
            </Button>
          </Link>
          <Link href="/dashboard/members">
            <Button variant="outline" size="lg">
              Browse Members
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
