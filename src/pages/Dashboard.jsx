import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Analytics from '@/components/Analytics';
import Blogs from '@/components/Blogs';
import Employees from '@/components/Employees';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('analytics');

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <Analytics />;
      case 'blogs':
        return <Blogs />;
      case 'employees':
        return <Employees />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
