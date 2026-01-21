import { useState, useEffect } from 'react';
import { Eye, TrendingUp, Users, BookOpen, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalEmployees: 0,
    totalViews: 0,
    recentBlogs: []
  });
  const [analyticsData, setAnalyticsData] = useState({
    dailyViews: [],
    totalViews: 0
  });
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

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

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/blog/analytics/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (err) {
      toast.error('Analitika yuklashda xato');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatChartData = () => {
    if (!analyticsData.dailyViews || analyticsData.dailyViews.length === 0) return [];

    if (period === 'daily') {
      return analyticsData.dailyViews.map(item => {
        const date = new Date(item.date);
        const dayName = date.toLocaleDateString('uz-UZ', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
        return {
          name: `${dayName}, ${dateStr}`,
          fullDate: item.displayDate || dateStr,
          views: item.views
        };
      });
    } else if (period === 'weekly') {
      const weeks = [];
      const weeksCount = Math.ceil(analyticsData.dailyViews.length / 7);
      for (let i = 0; i < weeksCount; i++) {
        const weekData = analyticsData.dailyViews.slice(i * 7, (i + 1) * 7);
        if (weekData.length === 0) continue;

        const weekViews = weekData.reduce((sum, day) => sum + day.views, 0);
        const startDate = new Date(weekData[0].date);
        const endDate = new Date(weekData[weekData.length - 1].date);
        const weekLabel = `${startDate.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })}`;

        weeks.push({
          name: `${i + 1}-hafta`,
          fullDate: weekLabel,
          views: weekViews
        });
      }
      return weeks;
    } else if (period === 'monthly') {
      const monthlyData = {};
      const monthOrder = [];

      analyticsData.dailyViews.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { name: monthName, views: 0 };
          monthOrder.push(monthKey);
        }
        monthlyData[monthKey].views += item.views;
      });

      return monthOrder.map(key => monthlyData[key]);
    } else if (period === 'yearly') {
      const yearlyData = {};
      analyticsData.dailyViews.forEach(item => {
        const year = new Date(item.date).getFullYear().toString();
        yearlyData[year] = (yearlyData[year] || 0) + item.views;
      });
      return Object.entries(yearlyData)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([name, views]) => ({ name: `${name}-yil`, views }));
    }
    return [];
  };

  const chartData = formatChartData();
  const pieData = stats.recentBlogs.slice(0, 5).map((blog) => ({
    name: blog.title.substring(0, 15),
    views: blog.views,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const periodLabels = {
    daily: 'Kunlik',
    weekly: 'Haftalik',
    monthly: 'Oylik',
    yearly: 'Yillik'
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Dashboard</h2>
        <p className="text-xs md:text-sm text-slate-400">Tizim statistikasi va umumiy ma'lumotlar</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <Card className="p-3 md:p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-slate-400 truncate">Jami bloglar</p>
              <p className="text-xl md:text-3xl font-bold text-white mt-1">{stats.totalBlogs}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-slate-400 truncate">Jami xodimlar</p>
              <p className="text-xl md:text-3xl font-bold text-white mt-1">{stats.totalEmployees}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-6 bg-slate-800 border-slate-700 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-slate-400 truncate">Jami ko'rishlar</p>
              <p className="text-xl md:text-3xl font-bold text-white mt-1">{stats.totalViews}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* Views Chart with Period Selector */}
        <Card className="p-3 md:p-6 bg-slate-800 border-slate-700 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
            <h3 className="text-sm md:text-lg font-semibold text-white flex items-center gap-2 flex-shrink-0 min-w-0">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
              <span className="truncate">Blog Ko'rishlari</span>
            </h3>
            <div className="flex gap-1 md:gap-2 flex-wrap">
              {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <Button
                  key={p}
                  onClick={() => setPeriod(p)}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 ${period === p
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                    }`}
                >
                  {periodLabels[p]}
                </Button>
              ))}
            </div>
          </div>
          <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 -mx-3 md:-mx-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  style={{ fontSize: '10px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: '10px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(value, name, props) => {
                    if (props.payload.fullDate) {
                      return [`${value} ko'rish`, props.payload.fullDate];
                    }
                    return [value, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Ko'rishlar"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 md:mt-4 p-2 md:p-4 bg-slate-700 rounded-lg">
            <p className="text-xs md:text-sm text-slate-400">
              Jami ko'rishlar ({periodLabels[period].toLowerCase()}):
              <span className="text-base md:text-xl font-bold text-white ml-2">
                {analyticsData.totalViews || 0}
              </span>
            </p>
          </div>
        </Card>

        {/* Pie Chart - Top 5 Blogs */}
        <Card className="p-3 md:p-6 bg-slate-800 border-slate-700 overflow-hidden">
          <h3 className="text-sm md:text-lg font-semibold text-white mb-3 md:mb-4">Top 5 Bloglar</h3>
          <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 -mx-3 md:-mx-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, views }) => `${name}: ${views}`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="views"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Blogs */}
      <Card className="p-3 md:p-6 bg-slate-800 border-slate-700">
        <h3 className="text-sm md:text-lg font-semibold text-white mb-3 md:mb-4">So'nggi bloglar</h3>
        <div className="space-y-2 md:space-y-4">
          {stats.recentBlogs.map((blog) => (
            <div key={blog.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 md:p-4 bg-slate-700 rounded-lg">
              <div className="min-w-0">
                <h4 className="font-medium text-white text-sm md:text-base truncate">{blog.title}</h4>
                <p className="text-xs md:text-sm text-slate-400 flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                  {new Date(blog.createdAt).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">{blog.views}</span>
              </div>
            </div>
          ))}
          {stats.recentBlogs.length === 0 && (
            <p className="text-slate-400 text-center py-6 md:py-8 text-sm">Hozircha bloglar yo'q</p>
          )}
        </div>
      </Card>
    </div>
  );
}
