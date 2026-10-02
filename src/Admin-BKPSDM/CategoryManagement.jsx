import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import AdminLoadingSkeleton from '../components/AdminLoadingSkeleton';
import AdminBkpsdmProfile from '../components/AdminBkpsdmProfile';
import { 
  Users, LayoutDashboard, ShieldCheck, BarChart3, LogOut, Bell, Settings,
  Search, ChevronRight, Menu, X, Plus, Layers, Edit, Trash2, 
  BookOpen, FolderCheck, AlertCircle, RefreshCw
} from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

const AdminSidebar = ({ activeMenu = 'category-management', onNavigate, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'admin', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'user-management', label: 'Manajemen Pengguna', icon: Users },
    { id: 'community-management', label: 'Manajemen Komunitas', icon: Users },
    { id: 'category-management', label: 'Kategori Kursus', icon: Layers },
    { id: 'course-validation', label: 'Validasi Kursus', icon: ShieldCheck },
    { id: 'monitoring-reports', label: 'Monitoring & Laporan', icon: BarChart3 },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div className={`w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <AdminBkpsdmProfile onNavigate={onNavigate} variant="sidebar" />
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onNavigate) onNavigate(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-teal-700 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-left truncate leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button 
            onClick={() => onNavigate && onNavigate('landing')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
};

const AdminHeader = ({ setIsOpen, searchTerm, setSearchTerm, onNavigate }) => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-40 sm:w-64 md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kategori kursus..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AdminBkpsdmProfile onNavigate={onNavigate} variant="header" />
      </div>
    </div>
  );
};

export default function CategoryManagement({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nama_kategori: '',
    deskripsi: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-bkpsdm/kategori-kursus');
      if (res.data?.success || res.data?.data) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      Toast.fire({
        icon: 'error',
        title: 'Gagal memuat kategori kursus'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      (c.nama_kategori && c.nama_kategori.toLowerCase().includes(q)) ||
      (c.deskripsi && c.deskripsi.toLowerCase().includes(q))
    );
  });

  const totalCourses = categories.reduce((acc, curr) => acc + (curr.pembelajaran_count || 0), 0);
  const topCategory = [...categories].sort((a, b) => (b.pembelajaran_count || 0) - (a.pembelajaran_count || 0))[0];

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({ nama_kategori: '', deskripsi: '' });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      nama_kategori: cat.nama_kategori,
      deskripsi: cat.deskripsi || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nama_kategori.trim()) {
      setErrorMsg('Nama kategori wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await api.put(`/admin-bkpsdm/kategori-kursus/${editingCategory.kategori_id}`, {
          nama_kategori: formData.nama_kategori.trim(),
          deskripsi: formData.deskripsi.trim()
        });
        Toast.fire({
          icon: 'success',
          title: 'Kategori berhasil diperbarui'
        });
      } else {
        await api.post('/admin-bkpsdm/kategori-kursus', {
          nama_kategori: formData.nama_kategori.trim(),
          deskripsi: formData.deskripsi.trim()
        });
        Toast.fire({
          icon: 'success',
          title: 'Kategori baru berhasil ditambahkan'
        });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.nama_kategori?.[0] || 'Gagal menyimpan kategori';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (cat) => {
    if (cat.pembelajaran_count > 0) {
      Swal.fire({
        title: 'Tidak Dapat Dihapus',
        html: `Kategori <b>"${cat.nama_kategori}"</b> saat ini masih terhubung dengan <b>${cat.pembelajaran_count} kursus</b>.<br/><br/><span class="text-sm text-gray-600">Silakan ubah kategori pada kursus terkait terlebih dahulu sebelum menghapus kategori ini.</span>`,
        icon: 'warning',
        confirmButtonColor: '#0f766e',
        confirmButtonText: 'Mengerti'
      });
      return;
    }

    Swal.fire({
      title: 'Hapus Kategori?',
      text: `Apakah Anda yakin ingin menghapus kategori "${cat.nama_kategori}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin-bkpsdm/kategori-kursus/${cat.kategori_id}`);
          Toast.fire({
            icon: 'success',
            title: 'Kategori berhasil dihapus'
          });
          fetchCategories();
        } catch (err) {
          const msg = err.response?.data?.message || 'Gagal menghapus kategori.';
          Swal.fire({
            title: 'Gagal',
            text: msg,
            icon: 'error',
            confirmButtonColor: '#0f766e'
          });
        }
      }
    });
  };

  if (loading && categories.length === 0) {
    return <AdminLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        activeMenu="category-management"
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <AdminHeader
          setIsOpen={setSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onNavigate={onNavigate}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span>Admin BKPSDM</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-teal-700 font-medium">Kategori Kursus</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori Kursus</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Kelola kategori katalog pelatihan yang dapat dipilih oleh Admin Komunitas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchCategories}
                title="Muat Ulang"
                className="p-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Kategori</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{categories.length}</h3>
                <p className="text-xs text-teal-600 mt-0.5">Kategori aktif di sistem</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Kursus Terkait</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{totalCourses}</h3>
                <p className="text-xs text-blue-600 mt-0.5">Terkategori dalam katalog</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FolderCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Kategori Terpopuler</p>
                <h3 className="text-lg font-bold text-gray-800 mt-0.5 truncate">
                  {topCategory ? topCategory.nama_kategori : '-'}
                </h3>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {topCategory ? `${topCategory.pembelajaran_count || 0} kursus` : 'Belum ada kursus'}
                </p>
              </div>
            </div>
          </div>

          {/* Categories Table Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Daftar Kategori Kursus</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Menampilkan {filteredCategories.length} dari {categories.length} kategori
                </p>
              </div>

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-teal-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Pencarian</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Nama Kategori</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Deskripsi</th>
                    <th className="py-3.5 px-4 text-center">Jumlah Kursus</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Terakhir Diperbarui</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <Layers className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="font-medium text-gray-600">Tidak ada kategori ditemukan</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {searchTerm ? 'Coba cari dengan kata kunci lain.' : 'Mulai dengan menambahkan kategori baru.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat, idx) => (
                      <tr key={cat.kategori_id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-4 text-center text-xs text-gray-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                            <span>{cat.nama_kategori}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-600 hidden md:table-cell max-w-xs truncate">
                          {cat.deskripsi || <span className="italic text-gray-400">Tidak ada deskripsi</span>}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            (cat.pembelajaran_count || 0) > 0 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {cat.pembelajaran_count || 0} Kursus
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500 hidden lg:table-cell">
                          {cat.diperbarui_pada ? new Date(cat.diperbarui_pada).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(cat)}
                              title="Edit Kategori"
                              className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat)}
                              title="Hapus Kategori"
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
            <div className="px-6 py-4 bg-teal-800 flex items-center justify-between border-b border-teal-900/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-700/60 border border-teal-600/40 flex items-center justify-center text-teal-100 shrink-0">
                  <Layers className="w-4 h-4 text-teal-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base !text-white leading-tight">
                    {editingCategory ? 'Edit Kategori Kursus' : 'Tambah Kategori Kursus Baru'}
                  </h3>
                  <p className="text-xs !text-teal-100/90 font-normal mt-0.5">
                    {editingCategory ? 'Perbarui informasi kategori kursus' : 'Kelola kategori untuk katalog pelatihan'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-teal-100 hover:!text-white hover:bg-teal-700/60 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_kategori}
                  onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })}
                  placeholder="Contoh: Tata Kelola Pemerintahan"
                  className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deskripsi Kategori (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Jelaskan ruang lingkup materi atau sasaran kursus dalam kategori ini..."
                  className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 !text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                  <span className="!text-white">{editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
