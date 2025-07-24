import Card from '@/components/Card';
import React from 'react'

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Members" value="1000" icon="👥" />
          <Card 
        title="New (Last 7 days)" 
        value="56" 
        icon="📈"  // Chart increasing emoji for growth
      />
      <Card 
        title="Pending Registrations" 
        value="45" 
        icon="⏳"  // Hourglass emoji for pending/waiting
      />
      </div>
  )
}

export default Dashboard;