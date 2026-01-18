import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ title: '', content: '', image: null });
  const [submitting, setSubmitting] = useState(false);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_URL}/blog?limit=100`);
      const data = await res.json();
      if (data.success) setBlogs(data.data);
    } catch (err) {
      toast.error('Bloglarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = selectedBlog ? 'PUT' : 'POST';
      const url = selectedBlog ? `${API_URL}/blog/${selectedBlog.id}` : `${API_URL}/blog`;

      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('content', formData.content);
      if (formData.image) formDataObj.append('image', formData.image);

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

      if (res.ok) {
        toast.success(selectedBlog ? 'Blog yangilandi' : 'Blog yaratildi');
        fetchBlogs();
        setShowModal(false);
        setFormData({ title: '', content: '', image: null });
        setSelectedBlog(null);
      }
    } catch (err) {
      toast.error('Xato yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Rostdan ham o\'chirmoqchisiz?')) return;
    try {
      const res = await fetch(`${API_URL}/blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Blog o\'chirildi');
        fetchBlogs();
      }
    } catch (err) {
      toast.error('O\'chirishda xato');
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bloglar</h2>
          <p className="text-slate-600 dark:text-slate-400">Blog postlarini boshqaring</p>
        </div>
        <Button
          onClick={() => {
            setSelectedBlog(null);
            setFormData({ title: '', content: '', image: null });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yangi Blog
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          placeholder="Blogni qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Sarlavha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Mazmun</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Ko'rishlar</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Yaratilgan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{blog.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{blog.content}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Eye className="w-4 h-4" />
                      {blog.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(blog.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedBlog(blog);
                          setFormData({ title: blog.title, content: blog.content, image: null });
                          setShowModal(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(blog.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Hozircha bloglar yo'q</p>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{selectedBlog ? 'Blogni Tahrirlash' : 'Yangi Blog'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Sarlavha</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Blog sarlavhasi"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Mazmun</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Blog mazmuni"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Rasm</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Yuklanmoqda...' : selectedBlog ? 'Yangilash' : 'Yaratish'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Bekor qilish
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
