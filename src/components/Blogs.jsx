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
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    description: '',
    keywords: ''
  });
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
      formDataObj.append('description', formData.description);
      formDataObj.append('keywords', formData.keywords);
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
        setFormData({ title: '', content: '', image: null, description: '', keywords: '' });
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 md:gap-4">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Bloglar</h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Blog postlarini boshqaring</p>
        </div>
        <Button
          onClick={() => {
            setSelectedBlog(null);
            setFormData({ title: '', content: '', image: null, description: '', keywords: '' });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yangi Blog
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 flex-shrink-0" />
        <input
          placeholder="Blogni qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Table - Desktop */}
      <Card className="hidden md:block overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Sarlavha</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Mazmun</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Ko'rishlar</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Yaratilgan</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-slate-900 dark:text-white truncate">{blog.title}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{blog.content}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      {blog.views}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    {new Date(blog.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedBlog(blog);
                          setFormData({
                            title: blog.title,
                            content: blog.content,
                            image: null,
                            description: blog.description || '',
                            keywords: blog.keywords || ''
                          });
                          setShowModal(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 p-1 md:p-2"
                      >
                        <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(blog.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 md:p-2"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
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
            <p className="text-slate-500 dark:text-slate-400 text-sm">Hozircha bloglar yo'q</p>
          </div>
        )}
      </Card>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredBlogs.map((blog) => (
          <Card key={blog.id} className="p-4 bg-white dark:bg-slate-800 dark:border-slate-700">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{blog.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{blog.content}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {blog.views}
                </div>
                <span>{new Date(blog.createdAt).toLocaleDateString('uz-UZ')}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setSelectedBlog(blog);
                    setFormData({
                      title: blog.title,
                      content: blog.content,
                      image: null,
                      description: blog.description || '',
                      keywords: blog.keywords || ''
                    });
                    setShowModal(true);
                  }}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Tahrirlash
                </Button>
                <Button
                  onClick={() => handleDelete(blog.id)}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  O'chirish
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Hozircha bloglar yo'q</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-full sm:max-w-lg md:max-w-2xl dark:bg-slate-800 dark:border-slate-700 mx-0 sm:mx-4 max-h-screen sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-lg w-full sm:w-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="dark:text-white text-base md:text-lg">{selectedBlog ? 'Blogni Tahrirlash' : 'Yangi Blog'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Sarlavha</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Blog sarlavhasi"
                className="w-full px-3 py-2.5 md:py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Mazmun</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Blog mazmuni"
                className="w-full px-3 py-2.5 md:py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Rasm</label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file?.type.startsWith('image/')) {
                    setFormData({ ...formData, image: file });
                  }
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {formData.image ? (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ✓ {formData.image.name}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p>Rasm tanlang yoki shu yerga tashlang</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Meta Description (SEO)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Blog haqida qisqacha ma'lumot (160 belgi)"
                className="w-full px-3 py-2.5 md:py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={2}
                maxLength={160}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formData.description.length}/160</p>
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">SEO Keywords</label>
              <input
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-3 py-2.5 md:py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-2.5 md:py-2"
              >
                {submitting ? 'Yuklanmoqda...' : selectedBlog ? 'Yangilash' : 'Yaratish'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 text-sm py-2.5 md:py-2"
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
