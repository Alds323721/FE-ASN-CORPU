import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import AdminLoadingSkeleton from '../components/AdminLoadingSkeleton';
import AdminBkpsdmProfile from '../components/AdminBkpsdmProfile';
import { logout } from '../utils/auth';
import {
  Users, LayoutDashboard, ShieldCheck, BarChart3, LogOut,
  Search, ChevronRight, Menu, X, Plus, Layers, Edit, Trash2,
  HelpCircle, AlertCircle, RefreshCw, Tag, ListOrdered
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

const DEFAULT_FAQ_CATEGORIES = [
  'Umum',
  'Akun & Login',
  'Pelatihan & Materi',
  'Sertifikat',
  'Admin Komunitas',
  'Kendala Teknis',
];

const AdminSidebar = ({ activeMenu = 'faq-management', onNavigate, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'admin', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'user-management', label: 'Manajemen Pengguna', icon: Users },
    { id: 'community-management', label: 'Manajemen Komunitas', icon: Users },
    { id: 'category-management', label: 'Kategori Kursus', icon: Layers },
    { id: 'course-validation', label: 'Validasi Kursus', icon: ShieldCheck },
    { id: 'monitoring-reports', label: 'Monitoring & Laporan', icon: BarChart3 },
    { id: 'faq-management', label: 'Kelola FAQ', icon: HelpCircle },
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
          <button type="button" onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 p-1 cursor-pointer">
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
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
            type="button"
            onClick={() => {
              if (typeof onLogout === 'function') {
                onLogout();
              } else {
                logout(() => {
                  if (typeof onNavigate === 'function') {
                    onNavigate('portal');
                  } else {
                    window.location.href = '/';
                  }
                });
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
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
        <button type="button" onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden cursor-pointer">
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
            placeholder="Cari pertanyaan atau jawaban FAQ..."
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

export default function FaqManagement({ onNavigate, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    pertanyaan: '',
    jawaban: '',
    kategori: '',
    urutan: '0',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await api.get('/admin-bkpsdm/faq');
      setFaqs(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setFetchError(err.response?.data?.message || 'Gagal memuat daftar FAQ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, submitting]);

  const availableCategories = Array.from(
    new Set(faqs.map((f) => f.kategori).filter(Boolean))
  ).sort();

  const filteredFaqs = faqs.filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (item.pertanyaan && item.pertanyaan.toLowerCase().includes(q)) ||
      (item.jawaban && item.jawaban.toLowerCase().includes(q)) ||
      (item.kategori && item.kategori.toLowerCase().includes(q));
    const matchesCategory = !selectedKategori || item.kategori === selectedKategori;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    const maxUrutan = faqs.reduce((max, item) => Math.max(max, Number(item.urutan) || 0), 0);
    setEditingFaq(null);
    setFormData({
      pertanyaan: '',
      jawaban: '',
      kategori: 'Umum',
      urutan: String(maxUrutan + 1),
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      pertanyaan: faq.pertanyaan || '',
      jawaban: faq.jawaban || '',
      kategori: faq.kategori || '',
      urutan: String(faq.urutan ?? 0),
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedPertanyaan = formData.pertanyaan.trim();
    const trimmedJawaban = formData.jawaban.trim();
    const parsedUrutan = formData.urutan === '' ? 0 : Number(formData.urutan);

    if (!trimmedPertanyaan) {
      setErrorMsg('Pertanyaan FAQ wajib diisi.');
      return;
    }
    if (!trimmedJawaban) {
      setErrorMsg('Jawaban FAQ wajib diisi.');
      return;
    }
    if (Number.isNaN(parsedUrutan) || parsedUrutan < 0 || !Number.isInteger(parsedUrutan)) {
      setErrorMsg('Urutan FAQ harus berupa bilangan bulat minimal 0.');
      return;
    }

    const payload = {
      pertanyaan: trimmedPertanyaan,
      jawaban: trimmedJawaban,
      kategori: formData.kategori.trim() || null,
      urutan: parsedUrutan,
    };

    try {
      setSubmitting(true);
      if (editingFaq) {
        await api.put(`/admin-bkpsdm/faq/${editingFaq.faq_id}`, payload);
        Toast.fire({
          icon: 'success',
          title: 'FAQ berhasil diperbarui',
        });
      } else {
        await api.post('/admin-bkpsdm/faq', payload);
        Toast.fire({
          icon: 'success',
          title: 'FAQ baru berhasil ditambahkan',
        });
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err) {
      console.error('Error saving FAQ:', err);
      const msg =
        err.response?.data?.errors?.pertanyaan?.[0] ||
        err.response?.data?.errors?.jawaban?.[0] ||
        err.response?.data?.errors?.urutan?.[0] ||
        err.response?.data?.message ||
        'Gagal menyimpan FAQ.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (faq) => {
    Swal.fire({
      title: 'Hapus FAQ?',
      text: `FAQ "${faq.pertanyaan}" akan dihapus dari Pusat Bantuan peserta dan admin komunitas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/admin-bkpsdm/faq/${faq.faq_id}`);
          Toast.fire({
            icon: 'success',
            title: 'FAQ berhasil dihapus',
          });
          fetchFaqs();
        } catch (err) {
          Swal.fire({
            title: 'Gagal',
            text: err.response?.data?.message || 'Gagal menghapus FAQ.',
            icon: 'error',
            confirmButtonColor: '#0f766e',
          });
        }
      }
    });
  };

  if (loading && faqs.length === 0 && !fetchError) {
    return <AdminLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        activeMenu="faq-management"
        onNavigate={onNavigate}
        onLogout={onLogout}
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
                <span className="text-teal-700 font-medium">Kelola FAQ</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen FAQ Pusat Bantuan</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Tambah, ubah, dan hapus pertanyaan yang tampil di Pusat Bantuan Peserta dan Admin Komunitas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchFaqs}
                title="Muat Ulang"
                aria-label="Muat ulang daftar FAQ"
                className="p-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tambah FAQ</span>
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total FAQ Aktif</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{faqs.length}</h3>
                <p className="text-xs text-teal-600 mt-0.5">Tampil di Pusat Bantuan</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Kategori FAQ</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{availableCategories.length}</h3>
                <p className="text-xs text-blue-600 mt-0.5">Kelompok topik bantuan</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ListOrdered className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Hasil Tampil</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{filteredFaqs.length}</h3>
                <p className="text-xs text-emerald-600 mt-0.5">Sesuai filter saat ini</p>
              </div>
            </div>
          </div>

          {/* FAQ Table Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Daftar FAQ</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Menampilkan {filteredFaqs.length} dari {faqs.length} FAQ (diurutkan berdasarkan nomor urutan)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter kategori FAQ"
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="">Semua Kategori</option>
                  {availableCategories.map((kat) => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
                {(searchTerm || selectedKategori) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedKategori('');
                    }}
                    className="text-xs text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            </div>

            {fetchError ? (
              <div role="alert" className="p-10 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto" aria-hidden="true" />
                <p className="font-semibold text-gray-800 text-sm">Gagal Memuat Data FAQ</p>
                <p className="text-xs text-gray-500">{fetchError}</p>
                <button
                  type="button"
                  onClick={fetchFaqs}
                  className="mt-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-20 text-center">Urutan</th>
                      <th className="py-3.5 px-4">Pertanyaan & Jawaban</th>
                      <th className="py-3.5 px-4 hidden md:table-cell w-44">Kategori</th>
                      <th className="py-3.5 px-4 hidden lg:table-cell w-36">Dibuat</th>
                      <th className="py-3.5 px-4 text-right w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredFaqs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400">
                          <HelpCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" aria-hidden="true" />
                          <p className="font-medium text-gray-600">Belum ada FAQ ditemukan</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {searchTerm || selectedKategori
                              ? 'Coba ubah kata kunci atau filter kategori.'
                              : 'Klik tombol "Tambah FAQ" untuk membuat pertanyaan pertama.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredFaqs.map((faq) => (
                        <tr key={faq.faq_id} className="hover:bg-gray-50/80 transition-colors align-top">
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-md bg-gray-100 text-gray-700 text-xs font-bold">
                              {faq.urutan ?? 0}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-gray-900 mb-1">{faq.pertanyaan}</p>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{faq.jawaban}</p>
                            {faq.kategori && (
                              <span className="inline-block md:hidden mt-2 px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[11px] font-semibold">
                                {faq.kategori}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 hidden md:table-cell">
                            {faq.kategori ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                                {faq.kategori}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Tanpa kategori</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-500 hidden lg:table-cell whitespace-nowrap">
                            {faq.dibuat_pada
                              ? new Date(faq.dibuat_pada).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(faq)}
                                title="Edit FAQ"
                                aria-label={`Edit FAQ ${faq.pertanyaan}`}
                                className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(faq)}
                                title="Hapus FAQ"
                                aria-label={`Hapus FAQ ${faq.pertanyaan}`}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Add / Edit FAQ */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="faq-modal-title"
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-teal-800 flex items-center justify-between border-b border-teal-900/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-700/60 border border-teal-600/40 flex items-center justify-center text-teal-100 shrink-0">
                  <HelpCircle className="w-4 h-4 text-teal-200" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="faq-modal-title" className="font-bold text-base !text-white leading-tight">
                    {editingFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}
                  </h3>
                  <p className="text-xs !text-teal-100/90 font-normal mt-0.5">
                    Perubahan akan langsung tampil di Pusat Bantuan Peserta & Admin Komunitas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setIsModalOpen(false)}
                aria-label="Tutup modal FAQ"
                className="p-1.5 rounded-lg text-teal-100 hover:!text-white hover:bg-teal-700/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label htmlFor="faq-pertanyaan-input" className="block text-xs font-semibold text-gray-700 mb-1">
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <input
                  id="faq-pertanyaan-input"
                  type="text"
                  required
                  maxLength={255}
                  value={formData.pertanyaan}
                  onChange={(e) => setFormData({ ...formData, pertanyaan: e.target.value })}
                  placeholder="Contoh: Bagaimana cara mengunduh sertifikat pelatihan?"
                  className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="faq-jawaban-input" className="block text-xs font-semibold text-gray-700 mb-1">
                  Jawaban <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="faq-jawaban-input"
                  required
                  rows={4}
                  value={formData.jawaban}
                  onChange={(e) => setFormData({ ...formData, jawaban: e.target.value })}
                  placeholder="Tuliskan penjelasan atau langkah-langkah penyelesaian secara jelas..."
                  className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="faq-kategori-input" className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori (Opsional)
                  </label>
                  <input
                    id="faq-kategori-input"
                    type="text"
                    list="faq-category-suggestions"
                    maxLength={100}
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    placeholder="Contoh: Sertifikat"
                    className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                  <datalist id="faq-category-suggestions">
                    {DEFAULT_FAQ_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="faq-urutan-input" className="block text-xs font-semibold text-gray-700 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    id="faq-urutan-input"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 !text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin text-white" aria-hidden="true" />}
                  <span className="!text-white">{editingFaq ? 'Simpan Perubahan' : 'Tambah FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
