import { BarChart3, Users, BookOpen } from 'lucide-react';

const menuItems = [
  { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
  { id: 'employees', label: 'Xodimlar', icon: Users },
  { id: 'blogs', label: 'Bloglar', icon: BookOpen },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">WebGrade</h1>
        <p className="text-sm text-slate-400">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
