import { BarChart3, Users, BookOpen, Settings, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

const menuItems = [
  { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
  { id: 'employees', label: 'Xodimlar', icon: Users },
  { id: 'blogs', label: 'Bloglar', icon: BookOpen },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const { theme, toggleTheme } = useThemeStore();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">WebGrade</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Admin Panel</p>
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
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
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

      {/* Settings */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            variant="ghost"
            className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings className="w-5 h-5 mr-3" />
            Sozlamalar
          </Button>

          {showThemeMenu && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
              <button
                onClick={() => {
                  toggleTheme();
                  setShowThemeMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    Light Mode
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
