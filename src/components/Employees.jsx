import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    role: '',
    about: '',
    image: null
  });
  const [submitting, setSubmitting] = useState(false);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/employee`);
      const data = await res.json();
      if (data.success) setEmployees(data.data);
    } catch (err) {
      toast.error('Xodimlarni yuklashda xato');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = selectedEmployee ? 'PUT' : 'POST';
      const url = selectedEmployee ? `${API_URL}/employee/${selectedEmployee.id}` : `${API_URL}/employee`;

      const formDataObj = new FormData();
      formDataObj.append('fullName', formData.fullName);
      formDataObj.append('position', formData.position);
      formDataObj.append('role', formData.role);
      formDataObj.append('about', formData.about);
      if (formData.image) formDataObj.append('image', formData.image);

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      });

      if (res.ok) {
        toast.success(selectedEmployee ? 'Xodim yangilandi' : 'Xodim qo\'shildi');
        fetchEmployees();
        setShowModal(false);
        setFormData({ fullName: '', position: '', role: '', about: '', image: null });
        setSelectedEmployee(null);
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
      const res = await fetch(`${API_URL}/employee/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Xodim o\'chirildi');
        fetchEmployees();
      }
    } catch (err) {
      toast.error('O\'chirishda xato');
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
    employee.position.toLowerCase().includes(search.toLowerCase())
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
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Xodimlar</h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">Kompaniya xodimlarini boshqaring</p>
        </div>
        <Button
          onClick={() => {
            setSelectedEmployee(null);
            setFormData({ fullName: '', position: '', role: '', about: '', image: null });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yangi Xodim
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400 flex-shrink-0" />
        <input
          placeholder="Xodimni qidirish..."
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
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Ismi</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Lavozimi</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Roli</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Haqida</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-slate-900 dark:text-white truncate">{employee.fullName}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 truncate">{employee.position}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                    {employee.role ? (
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{employee.role}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{employee.about || '-'}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setFormData({
                            fullName: employee.fullName,
                            position: employee.position,
                            role: employee.role || '',
                            about: employee.about || '',
                            image: null
                          });
                          setShowModal(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 p-1 md:p-2"
                      >
                        <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(employee.id)}
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
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Hozircha xodimlar yo'q</p>
          </div>
        )}
      </Card>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="p-4 bg-white dark:bg-slate-800 dark:border-slate-700">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{employee.fullName}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{employee.position}</p>
                {employee.role && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">{employee.role}</p>
                )}
              </div>
              {employee.about && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{employee.about}</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setFormData({
                      fullName: employee.fullName,
                      position: employee.position,
                      role: employee.role || '',
                      about: employee.about || '',
                      image: null
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
                  onClick={() => handleDelete(employee.id)}
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
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Hozircha xodimlar yo'q</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-full sm:max-w-lg md:max-w-2xl dark:bg-slate-800 dark:border-slate-700 mx-0 sm:mx-4 max-h-screen sm:max-h-[90vh] overflow-y-auto rounded-none sm:rounded-lg w-full sm:w-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-white text-base md:text-lg">{selectedEmployee ? 'Xodimni Tahrirlash' : 'Yangi Xodim'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">To'liq ismi</label>
              <input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Xodim ismi"
                className="w-full px-3 py-2.5 md:py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Lavozimi</label>
              <input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Frontend Developer, Backend Developer..."
                className="w-full px-3 py-2.5 md:py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Roli (ixtiyoriy)</label>
              <input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="CEO, CTO, COO..."
                className="w-full px-3 py-2.5 md:py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Haqida</label>
              <textarea
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                placeholder="Xodim haqida qisqacha ma'lumot"
                className="w-full px-3 py-2.5 md:py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={3}
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
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-2.5 md:py-2"
              >
                {submitting ? 'Yuklanmoqda...' : selectedEmployee ? 'Yangilash' : 'Qo\'shish'}
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
