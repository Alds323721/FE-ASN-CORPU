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
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});
import AdminLoadingSkeleton from '../components/AdminLoadingSkeleton';
import AdminBkpsdmProfile from '../components/AdminBkpsdmProfile';
import {
  Users, BookOpen, MessageSquare, Award, CheckCircle,
  TrendingUp, TrendingDown, ArrowRight, LayoutDashboard,
  ShieldCheck, BarChart3, HelpCircle, LogOut, Bell, Settings,
  Search, ChevronRight, Clock, Book, Menu, X, Plus,
  ClipboardList, Edit, Download, ChevronLeft, Trash2, Key, Layers
} from 'lucide-react';

const AdminSidebar = ({ activeMenu = 'user-management', onNavigate, isOpen, setIsOpen }) => {
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
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
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-gray-50"
            placeholder="Cari pengguna..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <AdminBkpsdmProfile onNavigate={onNavigate} variant="header" />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass, iconColorClass }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 sm:p-4 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColorClass}`} />
    </div>
    <div>
      <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{title}</h3>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{value}</h2>
    </div>
  </div>
);

const UserManagement = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [komunitasList, setKomunitasList] = useState([]);
  const [filterBelumAktivasi, setFilterBelumAktivasi] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    nip: '', nama_lengkap: '', email: '', roles: ['peserta'],
    jabatan: '', rumpun_jabatan: 'JP', unit_kerja: '', komunitas_id: ''
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin-bkpsdm/pengguna');
      const resData = response.data?.data;
      if (Array.isArray(resData)) {
        setUsers(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setUsers(resData.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchKomunitas = async () => {
    try {
      const response = await api.get('/admin-bkpsdm/komunitas');
      const kData = response.data?.data;
      setKomunitasList(Array.isArray(kData) ? kData : (kData?.data || []));
    } catch (error) {
      console.error('Failed to fetch komunitas:', error);
      setKomunitasList([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchKomunitas();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.roles || formData.roles.length === 0) {
        Toast.fire({ icon: 'error', title: 'Pilih minimal satu peran untuk pengguna.' });
        return;
      }
      if (!formData.email || !formData.email.trim()) {
        Toast.fire({ icon: 'error', title: 'Email wajib diisi untuk aktivasi dan pengiriman kode OTP.' });
        return;
      }
      const payload = { ...formData };
      payload.email = payload.email.trim();

      if (!payload.roles.includes('admin_komunitas')) {
        delete payload.komunitas_id;
      } else if (!payload.komunitas_id) {
        Toast.fire({ icon: 'error', title: 'Komunitas harus dipilih jika memiliki peran Admin Komunitas.' });
        return;
      }

      await api.post('/admin-bkpsdm/pengguna', payload);
      setShowAddModal(false);
      setFormData({ nip: '', nama_lengkap: '', email: '', roles: ['peserta'], jabatan: '', rumpun_jabatan: 'JP', unit_kerja: '', komunitas_id: '' });
      fetchUsers();
      Toast.fire({
        icon: 'success',
        title: 'Pengguna berhasil ditambahkan. Minta pengguna membuat kata sandi via Lupa Kata Sandi.'
      });
    } catch (error) {
      console.error('Failed to add user:', error);
      Toast.fire({
        icon: 'error',
        title: error.response?.data?.message || 'Gagal menambahkan pengguna. Periksa kembali NIP/Email.'
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentRoles = selectedUser.roles && selectedUser.roles.length > 0
        ? selectedUser.roles
        : (selectedUser.peran ? [selectedUser.peran] : ['peserta']);

      if (currentRoles.length === 0) {
        Toast.fire({ icon: 'error', title: 'Pilih minimal satu peran untuk pengguna.' });
        return;
      }

      if (currentRoles.includes('admin_komunitas') && !selectedUser.komunitas_id) {
        Toast.fire({ icon: 'error', title: 'Komunitas harus dipilih jika memiliki peran Admin Komunitas.' });
        return;
      }

      const payload = {
        roles: currentRoles,
        status: selectedUser.status,
        email: selectedUser.email ? selectedUser.email.trim() : null,
        komunitas_id: currentRoles.includes('admin_komunitas') ? selectedUser.komunitas_id : null
      };
      
      await api.put(`/admin-bkpsdm/pengguna/${selectedUser.pengguna_id}`, payload);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
      Toast.fire({
        icon: 'success',
        title: 'Pengguna berhasil diperbarui'
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      Toast.fire({
        icon: 'error',
        title: error.response?.data?.message || 'Gagal memperbarui pengguna.'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Ingin menghapus pengguna ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin-bkpsdm/pengguna/${id}`);
        fetchUsers();
        Toast.fire({
          icon: 'success',
          title: 'Pengguna berhasil dihapus'
        });
      } catch (error) {
        console.error('Failed to delete user:', error);
        Toast.fire({
          icon: 'error',
          title: error.response?.data?.message || 'Gagal menghapus pengguna'
        });
      }
    }
  };

  const handleResetPassword = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Kata sandi lama pengguna akan dinonaktifkan dan semua sesi loginnya dihapus. Pengguna harus memakai Lupa Kata Sandi untuk membuat kata sandi baru. Lanjutkan?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Lanjutkan!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/admin-bkpsdm/pengguna/${id}/reset-password`);
        Toast.fire({
          icon: 'success',
          title: 'Kata sandi dinonaktifkan. Minta pengguna memakai Lupa Kata Sandi.'
        });
        fetchUsers();
      } catch (error) {
        console.error('Failed to reset password:', error);
        Toast.fire({
          icon: 'error',
          title: error.response?.data?.message || 'Gagal mereset kata sandi'
        });
      }
    }
  };

  const getRoleBadge = (rolesOrRole) => {
    const roles = Array.isArray(rolesOrRole) && rolesOrRole.length > 0 ? rolesOrRole : [rolesOrRole || 'peserta'];
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => {
          switch (role) {
            case 'admin_bkpsdm':
              return <span key={role} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">Admin BKPSDM</span>;
            case 'admin_komunitas':
              return <span key={role} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Admin Komunitas</span>;
            default:
              return <span key={role} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Peserta</span>;
          }
        })}
      </div>
    );
  };

  const getStatusBadge = (user) => {
    const status = typeof user === 'object' ? user.status : user;
    const sudahAktivasi = typeof user === 'object' ? user.sudah_aktivasi : true;

    return (
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${status === 'aktif' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-700 font-medium capitalize">{status || 'nonaktif'}</span>
        </div>
        {sudahAktivasi === false && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Belum aktivasi
          </span>
        )}
      </div>
    );
  };

  const userList = Array.isArray(users) ? users : [];

  const filteredUsers = userList.filter(u => {
    const matchesSearch = 
      (u.nama_lengkap && u.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (u.nip && u.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.rumpun_jabatan && u.rumpun_jabatan.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterBelumAktivasi) {
      return matchesSearch && u.sudah_aktivasi === false;
    }
    return matchesSearch;
  });

  if (loading) return <AdminLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebar activeMenu="user-management" onNavigate={onNavigate} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full overflow-hidden">
        <AdminHeader setIsOpen={setIsSidebarOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onNavigate={onNavigate} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full relative">

          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Manajemen Pengguna</h1>
              <p className="text-sm text-gray-500">Kelola data, peran, dan status seluruh pengguna platform.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Tambah Pengguna Baru
            </button>
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Pengguna"
              value={userList.length}
              icon={Users}
              colorClass="bg-blue-100"
              iconColorClass="text-blue-600"
            />
            <StatCard
              title="Pengguna Aktif"
              value={userList.filter(u => u.status === 'aktif').length}
              icon={CheckCircle}
              colorClass="bg-emerald-100"
              iconColorClass="text-emerald-500"
            />
            <StatCard
              title="Admin Komunitas"
              value={userList.filter(u => u.peran === 'admin_komunitas').length}
              icon={ClipboardList}
              colorClass="bg-orange-100"
              iconColorClass="text-orange-500"
            />
          </div>

          {/* Table section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari pengguna / rumpun..."
                  className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 w-full sm:w-64"
                />
                <button
                  type="button"
                  onClick={() => setFilterBelumAktivasi(!filterBelumAktivasi)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                    filterBelumAktivasi
                      ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {filterBelumAktivasi ? '✓ Filter: Belum Aktivasi' : 'Filter: Belum Aktivasi'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NAMA & NIP</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">EMAIL</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PERAN</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">RUMPUN JABATAN</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">UNIT KERJA</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.pengguna_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-blue-100 text-blue-700`}>
                            {user.nama_lengkap.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{user.nama_lengkap}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{user.nip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.email ? (
                          <p className="text-sm text-gray-600 font-medium">{user.email}</p>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Email belum ada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.roles || user.peran)}
                      </td>
                      <td className="px-6 py-4">
                        {user.rumpun_jabatan ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                            {user.rumpun_jabatan}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-medium">{user.unit_kerja || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleResetPassword(user.pengguna_id)}
                          title="Reset Kata Sandi"
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const userRoles = Array.isArray(user.roles) && user.roles.length > 0
                              ? user.roles
                              : (user.peran ? [user.peran] : ['peserta']);
                            setSelectedUser({ ...user, roles: userRoles, email: user.email || '' });
                            setShowEditModal(true);
                          }}
                          title="Edit Pengguna"
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.pengguna_id)}
                          title="Hapus Pengguna"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? 'Tidak ada pengguna yang sesuai dengan pencarian.' : 'Belum ada pengguna terdaftar.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Tambah Pengguna Baru</h2>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">NIP</label>
                    <input required type="text" value={formData.nip} onChange={e => setFormData({ ...formData, nip: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Masukkan NIP" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                    <input required type="text" value={formData.nama_lengkap} onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Gelar, Nama Lengkap, Gelar" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="email@instansi.go.id" />
                    <p className="text-xs text-gray-500 mt-1">Email dipakai untuk kode OTP. Kata sandi awal dibuat acak oleh sistem; pengguna membuat kata sandi sendiri lewat Lupa Kata Sandi.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Peran Pengguna <span className="text-xs text-gray-500 font-normal">(Bisa dipilih lebih dari satu)</span>
                    </label>
                    <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes('peserta')}
                          onChange={(e) => {
                            const newRoles = e.target.checked
                              ? [...formData.roles, 'peserta']
                              : formData.roles.filter(r => r !== 'peserta');
                            setFormData({ ...formData, roles: newRoles });
                          }}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-800">Peserta</span>
                          <span className="text-xs text-gray-500 block">Mengikuti kursus & pelatihan</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes('admin_komunitas')}
                          onChange={(e) => {
                            const newRoles = e.target.checked
                              ? [...formData.roles, 'admin_komunitas']
                              : formData.roles.filter(r => r !== 'admin_komunitas');
                            setFormData({ ...formData, roles: newRoles });
                          }}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-800">Admin Komunitas</span>
                          <span className="text-xs text-gray-500 block">Mengelola konten pelatihan komunitas</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes('admin_bkpsdm')}
                          onChange={(e) => {
                            const newRoles = e.target.checked
                              ? [...formData.roles, 'admin_bkpsdm']
                              : formData.roles.filter(r => r !== 'admin_bkpsdm');
                            setFormData({ ...formData, roles: newRoles });
                          }}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-800">Admin BKPSDM</span>
                          <span className="text-xs text-gray-500 block">Super admin pengelolaan platform</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  {formData.roles.includes('admin_komunitas') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Komunitas</label>
                      <select required value={formData.komunitas_id} onChange={e => setFormData({ ...formData, komunitas_id: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
                        <option value="" disabled>Pilih Komunitas...</option>
                        {komunitasList.filter(k => k.rumpun_jabatan !== 'UMUM').map(k => (
                          <option key={k.komunitas_id} value={k.komunitas_id}>{k.nama_komunitas}</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-500 mt-1">Admin Komunitas otomatis dapat mengelola Komunitas Umum.</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jabatan</label>
                    <input type="text" value={formData.jabatan} onChange={e => setFormData({ ...formData, jabatan: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Pranata Komputer Ahli Pertama" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rumpun Jabatan</label>
                    <select value={formData.rumpun_jabatan} onChange={e => setFormData({ ...formData, rumpun_jabatan: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
                      <option value="JPT">JPT</option>
                      <option value="JA">JA</option>
                      <option value="JF">JF</option>
                      <option value="JP">JP (Pelaksana)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Kerja</label>
                    <input type="text" value={formData.unit_kerja} onChange={e => setFormData({ ...formData, unit_kerja: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Dinas Komunikasi dan Informatika" />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditModal && selectedUser && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Edit Pengguna</h2>
                  <button onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-gray-800">{selectedUser.nama_lengkap}</p>
                  <p className="text-sm text-gray-500">{selectedUser.nip}</p>
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" value={selectedUser.email || ''} onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="email@instansi.go.id" />
                    <p className="text-xs text-gray-500 mt-1">Pastikan email benar dan aktif agar pengguna dapat menerima kode OTP aktivasi/reset kata sandi.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Peran Pengguna <span className="text-xs text-gray-500 font-normal">(Bisa dipilih lebih dari satu)</span>
                    </label>
                    <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(selectedUser.roles || [selectedUser.peran]).includes('peserta')}
                          onChange={(e) => {
                            const current = selectedUser.roles || [selectedUser.peran];
                            const newRoles = e.target.checked
                              ? [...current, 'peserta']
                              : current.filter(r => r !== 'peserta');
                            setSelectedUser({ ...selectedUser, roles: newRoles });
                          }}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-800">Peserta</span>
                          <span className="text-xs text-gray-500 block">Mengikuti kursus & pelatihan</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(selectedUser.roles || [selectedUser.peran]).includes('admin_komunitas')}
                          onChange={(e) => {
                            const current = selectedUser.roles || [selectedUser.peran];
                            const newRoles = e.target.checked
                              ? [...current, 'admin_komunitas']
                              : current.filter(r => r !== 'admin_komunitas');
                            setSelectedUser({ ...selectedUser, roles: newRoles });
                          }}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-800">Admin Komunitas</span>
                          <span className="text-xs text-gray-500 block">Mengelola konten pelatihan komunitas</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(selectedUser.roles || [selectedUser.peran]).includes('admin_bkpsdm')}
                          onChange={(e) => {
                            const current = selectedUser.roles || [selectedUser.peran];
                            const newRoles = e.target.checked
                              ? [...current, 'admin_bkpsdm']
                              : current.filter(r => r !== 'admin_bkpsdm');
                            setSelectedUser({ ...selectedUser, roles: newRoles });
                          }}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-800">Admin BKPSDM</span>
                          <span className="text-xs text-gray-500 block">Super admin pengelolaan platform</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  {(selectedUser.roles || [selectedUser.peran]).includes('admin_komunitas') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Komunitas</label>
                      <select required value={selectedUser.komunitas_id || ''} onChange={e => setSelectedUser({ ...selectedUser, komunitas_id: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
                        <option value="" disabled>Pilih Komunitas...</option>
                        {komunitasList.filter(k => k.rumpun_jabatan !== 'UMUM').map(k => (
                          <option key={k.komunitas_id} value={k.komunitas_id}>{k.nama_komunitas}</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-500 mt-1">Admin Komunitas otomatis dapat mengelola Komunitas Umum.</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status Akun</label>
                    <select value={selectedUser.status} onChange={e => setSelectedUser({ ...selectedUser, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none">
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800">Update</button>
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

export default UserManagement;
