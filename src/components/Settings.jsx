import { Sun, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/themeStore';

export default function Settings() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sozlamalar</h2>
        <p className="text-slate-600 dark:text-slate-400">Tizim sozlamalarini boshqaring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {theme === 'dark' ? (
              <Moon className="w-6 h-6 text-blue-600" />
            ) : (
              <Sun className="w-6 h-6 text-orange-600" />
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rang rejimi</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {theme === 'dark' ? 'Qorong\'i rejim yoqilgan' : 'Yorug\' rejim yoqilgan'}
          </p>
          <Button onClick={toggleTheme} className="w-full">
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 mr-2" />
                Yorug' rejimga o'tish
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Qorong'i rejimga o'tish
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
