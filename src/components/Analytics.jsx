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
  const [period, setPeriod] = useState('daily'); // daily, weekly, monthly, yearly
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
      // Show last 7 days with day name
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
      // Group by weeks (last 4 weeks)
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
      // Group by months (last 12 months)
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
      // Group by years
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-slate-400">Tizim statistikasi va umumiy ma'lumotlar</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Jami bloglar</p>
              <p className="text-3xl font-bold text-white">{stats.totalBlogs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Jami xodimlar</p>
              <p className="text-3xl font-bold text-white">{stats.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Jami ko'rishlar</p>
              <p className="text-3xl font-bold text-white">{stats.totalViews}</p>
            </div>
            <div className="w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Views Chart with Period Selector */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Blog Ko'rishlari - {periodLabels[period]}
            </h3>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <Button
                  key={p}
                  onClick={() => setPeriod(p)}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  className={period === p 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                  }
                >
                  {periodLabels[p]}
                </Button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569', 
                  borderRadius: '8px', 
                  color: '#fff' 
                }}
                formatter={(value, name, props) => {
                  if (props.payload.fullDate) {
                    return [`${value} ko'rish`, props.payload.fullDate];
                  }
                  return [value, name];
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#94a3b8' }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Ko'rishlar"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-400">
              Jami ko'rishlar ({periodLabels[period].toLowerCase()}): 
              <span className="text-xl font-bold text-white ml-2">
                {analyticsData.totalViews || 0}
              </span>
            </p>
          </div>
        </Card>

        {/* Pie Chart - Top 5 Blogs */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top 5 Bloglar (Jami Ko'rishlar)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, views }) => `${name}: ${views}`}
                outerRadius={100}
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
                  color: '#fff' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Blogs */}
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">So'nggi bloglar</h3>
        <div className="space-y-4">
          {stats.recentBlogs.map((blog) => (
            <div key={blog.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <h4 className="font-medium text-white">{blog.title}</h4>
                <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(blog.createdAt).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{blog.views}</span>
              </div>
            </div>
          ))}
          {stats.recentBlogs.length === 0 && (
            <p className="text-slate-400 text-center py-8">Hozircha bloglar yo'q</p>
          )}
        </div>
      </Card>
    </div>
  );
}
