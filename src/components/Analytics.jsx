import { useState, useEffect } from 'react';
import { Eye, TrendingUp, Users, BookOpen, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalEmployees: 0,
    totalViews: 0,
    recentBlogs: []
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [blogsRes, employeesRes] = await Promise.all([
        fetch(`${API_URL}/blog`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/employee`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const blogsData = await blogsRes.json();
      const employeesData = await employeesRes.json();

      if (blogsData.success && employeesData.success) {
        const totalViews = blogsData.data.reduce((sum, blog) => sum + blog.views, 0);
        setStats({
          totalBlogs: blogsData.data.length,
          totalEmployees: employeesData.data.length,
          totalViews,
          recentBlogs: blogsData.data.slice(0, 5)
        });
      }
    } catch (err) {
      toast.error('Ma\'lumotlar yuklashda xato');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const chartData = stats.recentBlogs.map((blog) => ({
    name: blog.title.substring(0, 12),
    views: blog.views,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400">Tizim statistikasi va umumiy ma'lumotlar</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Jami bloglar</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalBlogs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Jami xodimlar</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Jami ko'rishlar</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalViews}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Blog Ko'rishlar
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="views" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Ko'rishlar Taqsimoti</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, views }) => `${name}: ${views}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="views"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Blogs */}
      <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">So'nggi bloglar</h3>
        <div className="space-y-4">
          {stats.recentBlogs.map((blog) => (
            <div key={blog.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">{blog.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(blog.createdAt).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{blog.views}</span>
              </div>
            </div>
          ))}
          {stats.recentBlogs.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">Hozircha bloglar yo'q</p>
          )}
        </div>
      </Card>
    </div>
  );
}
