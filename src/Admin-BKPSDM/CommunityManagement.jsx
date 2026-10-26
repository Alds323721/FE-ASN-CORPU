import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

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

import AdminLoadingSkeleton from '../components/AdminLoadingSkeleton';
import AdminBkpsdmProfile from '../components/AdminBkpsdmProfile';
import { logout } from '../utils/auth';
import { 
  Users, LayoutDashboard, ShieldCheck, BarChart3, LogOut,
  Search, Menu, X, Plus, CheckCircle, ClipboardList, 
  Edit, Trash2, Upload, Image as ImageIcon, Layers,
  Check, Clock, Eye, AlertCircle, Award, UserCheck, CheckCircle2, AlertTriangle,
  FileText, FileSpreadsheet, ChevronLeft, ChevronRight
} from 'lucide-react';

const AdminSidebar = ({ activeMenu = 'community-management', onNavigate, onLogout, isOpen, setIsOpen }) => {
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
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
            Bantuan Teknis
          </button>
          <button 
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
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
            placeholder="Cari komunitas atau pengurus..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AdminBkpsdmProfile onNavigate={onNavigate} variant="header" />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass, iconColorClass, onClick, isActive }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
      isActive 
        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md' 
        : 'border-gray-100 shadow-sm hover:border-gray-300'
    } flex items-center gap-4`}
  >
    <div className={`p-3 sm:p-3.5 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColorClass}`} />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="text-gray-500 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-0.5 truncate">{title}</h3>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{value}</h2>
    </div>
  </div>
);

const CommunityManagement = ({ onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'menunggu_persetujuan', 'aktif', 'nonaktif'
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    menunggu_persetujuan: 0,
    aktif: 0,
    nonaktif: 0,
  });
  const [exportLoading, setExportLoading] = useState({ pdf: false, excel: false });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const [formData, setFormData] = useState({
    nama_komunitas: '',
    nama_ketua: '',
    nip_ketua: '',
    nama_admin: '',
    nip_admin: '',
    rumpun_jabatan: 'JF',
    jumlah_anggota: '10',
    deskripsi: '',
    status: 'aktif'
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState('');

  // Debounce search agar responsif dan tidak membebani server
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCommunities = async (page = currentPage, status = statusFilter, search = debouncedSearch) => {
    try {
      setTableLoading(true);
      const params = {
        page: page,
        per_page: 10,
      };
      if (status && status !== 'all') {
        params.status = status;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get('/admin-bkpsdm/komunitas', { params });
      const res = response.data;
      const resData = res?.data;
      setCommunities(Array.isArray(resData) ? resData : []);

      if (res?.meta) {
        setPaginationMeta(res.meta);
      }
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      setCommunities([]);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities(currentPage, statusFilter, debouncedSearch);
  }, [currentPage, statusFilter, debouncedSearch]);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const totalPages = paginationMeta.last_page || 1;
    const current = currentPage;
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleExportPdf = async () => {
    try {
      setExportLoading(prev => ({ ...prev, pdf: true }));
      Toast.fire({
        icon: 'info',
        title: 'Menyiapkan dokumen PDF...'
      });

      const params = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (debouncedSearch && debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await api.get('/admin-bkpsdm/komunitas/export/pdf', {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.setAttribute('download', `Laporan_Komunitas_BKPSDM_${dateStr}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Toast.fire({
        icon: 'success',
        title: 'Dokumen PDF berhasil diunduh'
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengekspor PDF',
        text: 'Terjadi kesalahan saat membuat dokumen PDF.',
        confirmButtonColor: '#0f766e'
      });
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportLoading(prev => ({ ...prev, excel: true }));
      Toast.fire({
        icon: 'info',
        title: 'Menyiapkan file spreadsheet...'
      });

      const params = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (debouncedSearch && debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await api.get('/admin-bkpsdm/komunitas/export/excel', {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.setAttribute('download', `Laporan_Komunitas_BKPSDM_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Toast.fire({
        icon: 'success',
        title: 'Data Excel berhasil diekspor'
      });
    } catch (error) {
      console.error('Failed to export Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengekspor Excel',
        text: 'Terjadi kesalahan saat mengekspor data ke Excel.',
        confirmButtonColor: '#0f766e'
      });
    } finally {
      setExportLoading(prev => ({ ...prev, excel: false }));
    }
  };

  const handleThumbnailChange = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Terlalu Besar',
        text: 'Ukuran file thumbnail maksimal 2MB.',
        confirmButtonColor: '#0f766e'
      });
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (isEdit) {
      setEditThumbnailFile(file);
      setEditThumbnailPreview(previewUrl);
    } else {
      setThumbnailFile(file);
      setThumbnailPreview(previewUrl);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      nama_komunitas: '',
      nama_ketua: '',
      nip_ketua: '',
      nama_admin: '',
      nip_admin: '',
      rumpun_jabatan: 'JF',
      jumlah_anggota: '10',
      deskripsi: '',
      status: 'aktif'
    });
    setThumbnailFile(null);
    setThumbnailPreview('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (community) => {
    setSelectedCommunity({ ...community });
    setEditThumbnailFile(null);
    setEditThumbnailPreview(community.thumbnail_url || '');
    setShowEditModal(true);
  };

  const handleOpenDetailModal = (community) => {
    setSelectedCommunity({ ...community });
    setShowDetailModal(true);
  };

  const handleApprove = async (community) => {
    const confirm = await Swal.fire({
      title: 'Setujui Komunitas Ini?',
      html: `
        <div class="text-left text-sm text-gray-600 mt-2 space-y-2">
          <p>Anda akan menyetujui (ACC) komunitas <b>"${community.nama_komunitas}"</b>.</p>
          <div class="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 text-xs">
            <p>• Status komunitas akan berubah menjadi <b>Aktif</b>.</p>
            <p>• Komunitas akan langsung tampil di halaman Komunitas User.</p>
            ${community.nip_admin ? `<p>• NIP Admin <b>${community.nip_admin}</b> akan disinkronkan hak aksesnya.</p>` : ''}
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Setujui (ACC)',
      cancelButtonText: 'Batal'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api.post(`/admin-bkpsdm/komunitas/${community.komunitas_id}/approve`);
        Toast.fire({
          icon: 'success',
          title: res.data?.message || 'Komunitas berhasil disetujui (ACC)'
        });
        if (showDetailModal) setShowDetailModal(false);
        fetchCommunities();
      } catch (error) {
        console.error('Failed to approve community:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyetujui',
          text: error.response?.data?.message || 'Terjadi kesalahan saat menyetujui komunitas.',
          confirmButtonColor: '#0f766e'
        });
      }
    }
  };

  const handleReject = async (community) => {
    const { value: reason } = await Swal.fire({
      title: 'Tolak Pendaftaran Komunitas',
      input: 'textarea',
      inputLabel: `Alasan penolakan untuk "${community.nama_komunitas}":`,
      inputPlaceholder: 'Tuliskan catatan alasan penolakan atau revisi...',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Tolak Permohonan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Alasan penolakan wajib diisi.';
        }
      }
    });

    if (reason) {
      try {
        await api.post(`/admin-bkpsdm/komunitas/${community.komunitas_id}/reject`, {
          alasan_penolakan: reason
        });
        Toast.fire({
          icon: 'success',
          title: 'Pendaftaran komunitas telah ditolak'
        });
        if (showDetailModal) setShowDetailModal(false);
        fetchCommunities();
      } catch (error) {
        console.error('Failed to reject community:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menolak',
          text: error.response?.data?.message || 'Gagal menolak komunitas.',
          confirmButtonColor: '#0f766e'
        });
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('nama_komunitas', formData.nama_komunitas);
      data.append('nama_ketua', formData.nama_ketua || '');
      data.append('nip_ketua', formData.nip_ketua || '');
      data.append('nama_admin', formData.nama_admin || '');
      data.append('nip_admin', formData.nip_admin || '');
      data.append('rumpun_jabatan', formData.rumpun_jabatan);
      data.append('jumlah_anggota', formData.jumlah_anggota || 0);
      data.append('deskripsi', formData.deskripsi || '');
      data.append('status', formData.status);
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }

      await api.post('/admin-bkpsdm/komunitas', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowAddModal(false);
      fetchCommunities();
      Toast.fire({
        icon: 'success',
        title: 'Komunitas berhasil ditambahkan'
      });
    } catch (error) {
      console.error('Failed to add community:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menambahkan',
        text: error.response?.data?.message || 'Gagal menambahkan komunitas.',
        confirmButtonColor: '#0f766e'
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('nama_komunitas', selectedCommunity.nama_komunitas);
      data.append('nama_ketua', selectedCommunity.nama_ketua || '');
      data.append('nip_ketua', selectedCommunity.nip_ketua || '');
      data.append('nama_admin', selectedCommunity.nama_admin || '');
      data.append('nip_admin', selectedCommunity.nip_admin || '');
      data.append('rumpun_jabatan', selectedCommunity.rumpun_jabatan);
      data.append('jumlah_anggota', selectedCommunity.jumlah_anggota || 0);
      data.append('deskripsi', selectedCommunity.deskripsi || '');
      data.append('status', selectedCommunity.status);
      if (editThumbnailFile) {
        data.append('thumbnail', editThumbnailFile);
      }

      await api.post(`/admin-bkpsdm/komunitas/${selectedCommunity.komunitas_id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowEditModal(false);
      setSelectedCommunity(null);
      setEditThumbnailFile(null);
      setEditThumbnailPreview('');
      fetchCommunities();
      Toast.fire({
        icon: 'success',
        title: 'Komunitas berhasil diperbarui'
      });
    } catch (error) {
      console.error('Failed to update community:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memperbarui',
        text: error.response?.data?.message || 'Gagal memperbarui komunitas.',
        confirmButtonColor: '#0f766e'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Ingin menghapus komunitas ini secara permanen?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin-bkpsdm/komunitas/${id}`);
        fetchCommunities();
        Toast.fire({
          icon: 'success',
          title: 'Komunitas berhasil dihapus'
        });
      } catch (error) {
        console.error('Failed to delete community:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus',
          text: error.response?.data?.message || 'Gagal menghapus komunitas',
          confirmButtonColor: '#0f766e'
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'aktif':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            Aktif
          </span>
        );
      case 'menunggu_persetujuan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Menunggu ACC
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Ditolak
          </span>
        );
      case 'nonaktif':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            Nonaktif
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
            {status}
          </span>
        );
    }
  };

  const totalCount = stats.total || paginationMeta.total || communities.length;
  const pendingCount = stats.menunggu_persetujuan || 0;
  const activeCount = stats.aktif || 0;
  const inactiveCount = stats.nonaktif || 0;

  if (loading) return <AdminLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar activeMenu="community-management" onNavigate={onNavigate} onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full overflow-hidden">
        <AdminHeader setIsOpen={setIsSidebarOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full relative">
          
          {/* Header Title & Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1D315F] mb-1">Manajemen Komunitas</h1>
              <p className="text-sm text-gray-500">Kelola daftar komunitas belajar, verifikasi permohonan pendaftaran, dan penetapan admin komunitas.</p>
            </div>
            <button 
              onClick={handleOpenAddModal}
              className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Tambah Komunitas Baru
            </button>
          </div>
          
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
            <StatCard 
              title="TOTAL KOMUNITAS" 
              value={totalCount} 
              icon={Users}
              colorClass="bg-blue-50"
              iconColorClass="text-blue-500"
              onClick={() => handleStatusFilterChange('all')}
              isActive={statusFilter === 'all'}
            />
            <StatCard 
              title="MENUNGGU ACC" 
              value={pendingCount} 
              icon={Clock}
              colorClass="bg-amber-50"
              iconColorClass="text-amber-500"
              onClick={() => handleStatusFilterChange('menunggu_persetujuan')}
              isActive={statusFilter === 'menunggu_persetujuan'}
            />
            <StatCard 
              title="KOMUNITAS AKTIF" 
              value={activeCount} 
              icon={CheckCircle}
              colorClass="bg-green-50"
              iconColorClass="text-green-500"
              onClick={() => handleStatusFilterChange('aktif')}
              isActive={statusFilter === 'aktif'}
            />
            <StatCard 
              title="NONAKTIF / DITOLAK" 
              value={inactiveCount} 
              icon={ClipboardList}
              colorClass="bg-gray-100"
              iconColorClass="text-gray-500"
              onClick={() => handleStatusFilterChange('nonaktif')}
              isActive={statusFilter === 'nonaktif'}
            />
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            
            {/* Filter Tabs, Search & Export Actions */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              
              {/* Status Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0">
                <button
                  onClick={() => handleStatusFilterChange('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === 'all' 
                      ? 'bg-teal-700 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Semua ({totalCount})
                </button>
                <button
                  onClick={() => handleStatusFilterChange('menunggu_persetujuan')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'menunggu_persetujuan' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <span>Menunggu ACC</span>
                  {pendingCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      statusFilter === 'menunggu_persetujuan' ? 'bg-white text-amber-700' : 'bg-amber-600 text-white'
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleStatusFilterChange('aktif')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === 'aktif' 
                      ? 'bg-teal-700 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Aktif ({activeCount})
                </button>
                <button
                  onClick={() => handleStatusFilterChange('nonaktif')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === 'nonaktif' 
                      ? 'bg-teal-700 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Nonaktif ({inactiveCount})
                </button>
              </div>

              {/* Action Cluster: Search & Export Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
                {/* Search input in table */}
                <div className="relative flex-1 sm:w-64 min-w-[200px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
                    placeholder="Cari komunitas atau pengurus..."
                  />
                </div>

                {/* Tombol Ekspor Excel */}
                <button
                  onClick={handleExportExcel}
                  disabled={exportLoading.excel || exportLoading.pdf}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  title="Ekspor seluruh data komunitas terfilter ke file Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{exportLoading.excel ? 'Mengekspor...' : 'Ekspor Excel'}</span>
                </button>

                {/* Tombol Ekspor PDF */}
                <button
                  onClick={handleExportPdf}
                  disabled={exportLoading.pdf || exportLoading.excel}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  title="Ekspor seluruh data komunitas terfilter ke dokumen PDF resmi BKPSDM"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>{exportLoading.pdf ? 'Mengekspor...' : 'Ekspor PDF'}</span>
                </button>
              </div>
            </div>
            
            {/* Table with Loading Overlay */}
            <div className="overflow-x-auto relative">
              {tableLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 text-sm font-medium text-teal-700">
                    <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    Memuat data...
                  </div>
                </div>
              )}
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">KOMUNITAS</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">PENGURUS (KETUA & ADMIN)</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">RUMPUN & ANGGOTA</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {communities.map((community) => {
                    const isPending = community.status === 'menunggu_persetujuan';

                    return (
                      <tr 
                        key={community.komunitas_id} 
                        className={`transition-colors ${isPending ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-gray-50/50'}`}
                      >
                        {/* Komunitas Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <img 
                              src={community.thumbnail_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop'} 
                              alt={community.nama_komunitas} 
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0 mt-0.5" 
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 leading-snug">{community.nama_komunitas}</p>
                              {community.deskripsi && (
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{community.deskripsi}</p>
                              )}
                              <p className="text-[11px] text-gray-400 mt-1">
                                ID: #{community.komunitas_id} {community.dibuat_pada && `• ${new Date(community.dibuat_pada).toLocaleDateString('id-ID')}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Pengurus Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="font-bold text-gray-800">Ketua:</span>
                              <span className="truncate">{community.nama_ketua || '-'}</span>
                              {community.nip_ketua && (
                                <span className="text-[11px] text-gray-400 font-mono">({community.nip_ketua})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span className="font-bold text-gray-800">Admin:</span>
                              <span className="truncate">{community.nama_admin || '-'}</span>
                              {community.nip_admin && (
                                <span className="text-[11px] text-gray-400 font-mono">({community.nip_admin})</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Rumpun & Anggota */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div>
                              {community.rumpun_jabatan === 'UMUM' ? (
                                <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-300">
                                  UMUM (Semua Rumpun)
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {community.rumpun_jabatan}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Users className="w-3 h-3 text-gray-400" />
                              <span>{community.jumlah_anggota || 0} Anggota</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(community.status)}
                          {community.status === 'ditolak' && community.alasan_penolakan && (
                            <p className="text-[11px] text-red-500 mt-1 line-clamp-1 italic">
                              "{community.alasan_penolakan}"
                            </p>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Tombol Khusus Komunitas Menunggu ACC */}
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(community)}
                                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                                  title="Setujui (ACC) Komunitas"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>ACC</span>
                                </button>
                                <button
                                  onClick={() => handleReject(community)}
                                  className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Tolak Permohonan"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}

                            {/* Tombol Detail Preview */}
                            <button
                              onClick={() => handleOpenDetailModal(community)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="Lihat Detail Permohonan"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Tombol Edit */}
                            <button 
                              onClick={() => handleOpenEditModal(community)}
                              className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                              title="Edit Komunitas"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Tombol Hapus */}
                            {community.nama_komunitas === 'Komunitas Umum' ? (
                              <button 
                                type="button"
                                disabled
                                className="p-1.5 text-gray-300 cursor-not-allowed rounded-md"
                                title="Komunitas Umum utama tidak dapat dihapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleDelete(community.komunitas_id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="Hapus Komunitas"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {communities.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <div className="max-w-xs mx-auto text-center space-y-2">
                          <Users className="w-10 h-10 mx-auto text-gray-300" />
                          <p className="font-semibold text-gray-600">
                            {searchTerm 
                              ? 'Tidak ada komunitas yang cocok dengan kata kunci pencarian.' 
                              : statusFilter === 'menunggu_persetujuan' 
                              ? 'Tidak ada permohonan komunitas yang menunggu persetujuan.' 
                              : 'Belum ada data komunitas.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (10 data per halaman/tab) */}
            {paginationMeta.total > 0 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50">
                <div className="text-xs sm:text-sm text-gray-500 text-center md:text-left">
                  Menampilkan <span className="font-semibold text-gray-700">{paginationMeta.from || 0}</span> - <span className="font-semibold text-gray-700">{paginationMeta.to || 0}</span> dari <span className="font-semibold text-gray-700">{paginationMeta.total?.toLocaleString('id-ID') || 0}</span> komunitas
                </div>
                
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage <= 1 || tableLoading}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-white hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors bg-white shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  {getPageNumbers().map((pageItem, idx) => (
                    pageItem === '...' ? (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 text-xs sm:text-sm select-none">...</span>
                    ) : (
                      <button
                        key={pageItem}
                        onClick={() => setCurrentPage(pageItem)}
                        disabled={tableLoading}
                        className={`min-w-8 h-8 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                          currentPage === pageItem
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-white hover:text-teal-700 border border-gray-200 bg-white'
                        }`}
                      >
                        {pageItem}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationMeta.last_page || 1))}
                    disabled={currentPage >= (paginationMeta.last_page || 1) || tableLoading}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-white hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors bg-white shadow-xs cursor-pointer"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================= MODAL DETAIL KOMUNITAS ================= */}
          {showDetailModal && selectedCommunity && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800">Detail Permohonan Komunitas</h2>
                    {getStatusBadge(selectedCommunity.status)}
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Thumbnail Preview */}
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img 
                      src={selectedCommunity.thumbnail_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop'} 
                      alt={selectedCommunity.nama_komunitas}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info Basic */}
                  <div>
                    <h3 className="text-xl font-bold text-[#1D315F]">{selectedCommunity.nama_komunitas}</h3>
                    <p className="text-xs text-gray-500 mt-1">{selectedCommunity.deskripsi || 'Tidak ada deskripsi.'}</p>
                  </div>

                  {/* Grid 2 Kolom */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Rumpun Jabatan</span>
                      <span className="font-bold text-gray-800">{selectedCommunity.rumpun_jabatan}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Jumlah Anggota</span>
                      <span className="font-bold text-gray-800">{selectedCommunity.jumlah_anggota || 0} Orang</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Ketua Komunitas</span>
                      <span className="font-bold text-gray-800 block">{selectedCommunity.nama_ketua || '-'}</span>
                      <span className="text-gray-500 font-mono text-[11px]">NIP: {selectedCommunity.nip_ketua || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Admin Komunitas</span>
                      <span className="font-bold text-gray-800 block">{selectedCommunity.nama_admin || '-'}</span>
                      <span className="text-gray-500 font-mono text-[11px]">NIP: {selectedCommunity.nip_admin || '-'}</span>
                    </div>
                  </div>

                  {/* Catatan Penolakan jika ada */}
                  {selectedCommunity.status === 'ditolak' && selectedCommunity.alasan_penolakan && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      <span className="font-bold block mb-1">Alasan Penolakan:</span>
                      <p>{selectedCommunity.alasan_penolakan}</p>
                    </div>
                  )}
                </div>

                {/* Footer Modal */}
                <div className="pt-5 mt-5 border-t border-gray-100 flex justify-end gap-2">
                  {selectedCommunity.status === 'menunggu_persetujuan' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReject(selectedCommunity)}
                        className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedCommunity)}
                        className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        Setujui & Publikasikan (ACC)
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDetailModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Tutup
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= MODAL TAMBAH KOMUNITAS BARU ================= */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Tambah Komunitas Baru</h2>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail / Gambar Sampul</label>
                    <div className="flex items-center gap-4">
                      {thumbnailPreview ? (
                        <div className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden shrink-0 group">
                          <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setThumbnailFile(null); setThumbnailPreview(''); }}
                            className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-gray-50">
                          <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                          <span className="text-[10px]">No Image</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          id="thumbnail-add"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={(e) => handleThumbnailChange(e, false)}
                          className="hidden"
                        />
                        <label
                          htmlFor="thumbnail-add"
                          className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Pilih File Gambar
                        </label>
                        <p className="text-[11px] text-gray-400 mt-1">Format: JPG, PNG, WEBP. Maksimal 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Komunitas *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.nama_komunitas} 
                      onChange={e => setFormData({...formData, nama_komunitas: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      placeholder="Masukkan nama komunitas" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Ketua</label>
                      <input 
                        type="text" 
                        value={formData.nama_ketua} 
                        onChange={e => setFormData({...formData, nama_ketua: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                        placeholder="Nama ketua" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">NIP Ketua</label>
                      <input 
                        type="text" 
                        maxLength="18"
                        value={formData.nip_ketua} 
                        onChange={e => setFormData({...formData, nip_ketua: e.target.value.replace(/\D/g, '')})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                        placeholder="18 digit NIP" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Admin Komunitas</label>
                      <input 
                        type="text" 
                        value={formData.nama_admin} 
                        onChange={e => setFormData({...formData, nama_admin: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                        placeholder="Nama admin" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">NIP Admin Komunitas</label>
                      <input 
                        type="text" 
                        maxLength="18"
                        value={formData.nip_admin} 
                        onChange={e => setFormData({...formData, nip_admin: e.target.value.replace(/\D/g, '')})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                        placeholder="18 digit NIP" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Rumpun Jabatan *</label>
                      <select 
                        value={formData.rumpun_jabatan} 
                        onChange={e => setFormData({...formData, rumpun_jabatan: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="JPT">JPT</option>
                        <option value="JA">JA</option>
                        <option value="JF">JF</option>
                        <option value="JP">JP (Pelaksana)</option>
                        <option value="UMUM">Umum (Semua Rumpun)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Anggota</label>
                      <input 
                        type="number" 
                        min="1"
                        value={formData.jumlah_anggota} 
                        onChange={e => setFormData({...formData, jumlah_anggota: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                    <textarea 
                      rows="2"
                      value={formData.deskripsi} 
                      onChange={e => setFormData({...formData, deskripsi: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      placeholder="Deskripsi singkat komunitas"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status Awal</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="menunggu_persetujuan">Menunggu Persetujuan</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
                    <button type="submit" className="px-5 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-sm font-semibold">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= MODAL EDIT KOMUNITAS ================= */}
          {showEditModal && selectedCommunity && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Edit Komunitas</h2>
                  <button onClick={() => {setShowEditModal(false); setSelectedCommunity(null);}} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail / Gambar Sampul</label>
                    <div className="flex items-center gap-4">
                      {editThumbnailPreview ? (
                        <div className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden shrink-0 group">
                          <img src={editThumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                          {editThumbnailFile && (
                            <button
                              type="button"
                              onClick={() => { 
                                setEditThumbnailFile(null); 
                                setEditThumbnailPreview(selectedCommunity.thumbnail_url || ''); 
                              }}
                              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-gray-50">
                          <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                          <span className="text-[10px]">No Image</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          id="thumbnail-edit"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={(e) => handleThumbnailChange(e, true)}
                          className="hidden"
                        />
                        <label
                          htmlFor="thumbnail-edit"
                          className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" /> Ganti Gambar
                        </label>
                        <p className="text-[11px] text-gray-400 mt-1">Format: JPG, PNG, WEBP. Maksimal 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Komunitas *</label>
                    <input 
                      required 
                      type="text" 
                      value={selectedCommunity.nama_komunitas} 
                      onChange={e => setSelectedCommunity({...selectedCommunity, nama_komunitas: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Ketua</label>
                      <input 
                        type="text" 
                        value={selectedCommunity.nama_ketua || ''} 
                        onChange={e => setSelectedCommunity({...selectedCommunity, nama_ketua: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">NIP Ketua</label>
                      <input 
                        type="text" 
                        maxLength="18"
                        value={selectedCommunity.nip_ketua || ''} 
                        onChange={e => setSelectedCommunity({...selectedCommunity, nip_ketua: e.target.value.replace(/\D/g, '')})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Admin</label>
                      <input 
                        type="text" 
                        value={selectedCommunity.nama_admin || ''} 
                        onChange={e => setSelectedCommunity({...selectedCommunity, nama_admin: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">NIP Admin</label>
                      <input 
                        type="text" 
                        maxLength="18"
                        value={selectedCommunity.nip_admin || ''} 
                        onChange={e => setSelectedCommunity({...selectedCommunity, nip_admin: e.target.value.replace(/\D/g, '')})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Rumpun Jabatan</label>
                      <select 
                        disabled={selectedCommunity.nama_komunitas === 'Komunitas Umum'}
                        value={selectedCommunity.rumpun_jabatan} 
                        onChange={e => setSelectedCommunity({...selectedCommunity, rumpun_jabatan: e.target.value})} 
                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${selectedCommunity.nama_komunitas === 'Komunitas Umum' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      >
                        <option value="JPT">JPT</option>
                        <option value="JA">JA</option>
                        <option value="JF">JF</option>
                        <option value="JP">JP (Pelaksana)</option>
                        <option value="UMUM">Umum (Semua Rumpun)</option>
                      </select>
                      {selectedCommunity.nama_komunitas === 'Komunitas Umum' && (
                        <p className="text-[11px] text-amber-600 mt-1">Rumpun jabatan Komunitas Umum utama tidak dapat diubah.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Anggota</label>
                      <input 
                        type="number" 
                        min="0"
                        value={selectedCommunity.jumlah_anggota || 0} 
                        onChange={e => setSelectedCommunity({...selectedCommunity, jumlah_anggota: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                    <textarea 
                      rows="2"
                      value={selectedCommunity.deskripsi || ''} 
                      onChange={e => setSelectedCommunity({...selectedCommunity, deskripsi: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select 
                      disabled={selectedCommunity.nama_komunitas === 'Komunitas Umum'}
                      value={selectedCommunity.status} 
                      onChange={e => setSelectedCommunity({...selectedCommunity, status: e.target.value})} 
                      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${selectedCommunity.nama_komunitas === 'Komunitas Umum' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="menunggu_persetujuan">Menunggu Persetujuan</option>
                      <option value="nonaktif">Nonaktif</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                    {selectedCommunity.nama_komunitas === 'Komunitas Umum' && (
                      <p className="text-[11px] text-amber-600 mt-1">Status Komunitas Umum utama harus selalu aktif.</p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                    <button type="button" onClick={() => {setShowEditModal(false); setSelectedCommunity(null);}} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
                    <button type="submit" className="px-5 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-sm font-semibold">Update</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CommunityManagement;
