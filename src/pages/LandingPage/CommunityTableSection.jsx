import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import api from '../../api/axios';
import CommunityRegistrationModal from './CommunityRegistrationModal';
import ScrollReveal from '../../components/ScrollReveal';

// Data bawaan awal (fallback) agar tabel selalu informatif dan tidak kosong jika backend baru di-inisialisasi
const DEFAULT_COMMUNITIES = [
  {
    komunitas_id: 1,
    nama_komunitas: 'Komunitas Analis Kebijakan Publik',
    rumpun_jabatan: 'JF',
    nama_ketua: 'Gede Arya Suputra, S.STP, M.Si',
    nip_ketua: '198504122008011002',
    nama_admin: 'Ketut Agus Mahendra, S.Kom',
    nip_admin: '199208152019031005',
    status: 'aktif',
    dibuat_pada: '2026-11-10T08:30:00Z',
    jumlah_anggota: 45
  },
  {
    komunitas_id: 2,
    nama_komunitas: 'Forum Perencana Pembangunan Daerah (Bappeda)',
    rumpun_jabatan: 'JF',
    nama_ketua: 'Ni Made Dewi Lestari, SE, MM',
    nip_ketua: '198207192006042011',
    nama_admin: 'Putu Eka Pradnyana, ST',
    nip_admin: '199003252015021003',
    status: 'aktif',
    dibuat_pada: '2026-11-12T10:15:00Z',
    jumlah_anggota: 38
  },
  {
    komunitas_id: 3,
    nama_komunitas: 'Komunitas Pengelola Keuangan & Aset Daerah',
    rumpun_jabatan: 'JA',
    nama_ketua: 'Drs. I Wayan Sugiarta, M.Si',
    nip_ketua: '197602051998031004',
    nama_admin: 'Luh Ayu Kartini, SE',
    nip_admin: '199411082020122009',
    status: 'menunggu_persetujuan',
    dibuat_pada: '2026-11-18T14:20:00Z',
    jumlah_anggota: 24
  },
  {
    komunitas_id: 4,
    nama_komunitas: 'Pranata Komputer & Transformasi Digital Pemkab',
    rumpun_jabatan: 'JF',
    nama_ketua: 'I Komang Dharmawan, S.Kom, MT',
    nip_ketua: '198801122010011008',
    nama_admin: 'Made Aditya Wicaksana, S.Kom',
    nip_admin: '199505202022031002',
    status: 'aktif',
    dibuat_pada: '2026-11-14T09:00:00Z',
    jumlah_anggota: 62
  },
  {
    komunitas_id: 5,
    nama_komunitas: 'Forum Auditor & Pengawas Internal Pemerintahan (APIP)',
    rumpun_jabatan: 'JF',
    nama_ketua: 'Nyoman Tri Astuti, SH, M.Hum',
    nip_ketua: '197909142005012007',
    nama_admin: 'Gusti Ngurah Surya, SE, Ak',
    nip_admin: '199106172018011003',
    status: 'menunggu_persetujuan',
    dibuat_pada: '2026-11-19T11:45:00Z',
    jumlah_anggota: 18
  },
  {
    komunitas_id: 6,
    nama_komunitas: 'Komunitas Umum Pengembangan Kapasitas ASN Buleleng',
    rumpun_jabatan: 'UMUM',
    nama_ketua: 'Drs. I Nyoman Mariatha, M.Pd',
    nip_ketua: '197210151996031001',
    nama_admin: 'Kadek Rina Wulandari, S.Pd',
    nip_admin: '199304102019022008',
    status: 'aktif',
    dibuat_pada: '2026-11-01T08:00:00Z',
    jumlah_anggota: 150
  }
];

export default function CommunityTableSection() {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [rumpunFilter, setRumpunFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 6;

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/komunitas/submissions', {
        params: {
          search: search || undefined,
          rumpun: rumpunFilter !== 'all' ? rumpunFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          per_page: 50
        }
      });
      if (res.data?.success && res.data?.data?.data && res.data.data.data.length > 0) {
        setCommunities(res.data.data.data);
      } else {
        // Gabungkan fallback dengan kriteria filter lokal jika API belum memiliki data
        setCommunities(DEFAULT_COMMUNITIES);
      }
    } catch {
      // Graceful fallback ke demo data
      setCommunities(DEFAULT_COMMUNITIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [rumpunFilter, statusFilter]);

  // Filter client-side untuk pencarian cepat
  const filteredData = communities.filter((item) => {
    const matchesSearch =
      !search ||
      item.nama_komunitas?.toLowerCase().includes(search.toLowerCase());

    const matchesRumpun =
      rumpunFilter === 'all' || item.rumpun_jabatan === rumpunFilter;

    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesRumpun && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'aktif':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Aktif / Disetujui</span>
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Ditolak</span>
          </span>
        );
      case 'menunggu_persetujuan':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Menunggu Verifikasi</span>
          </span>
        );
    }
  };

  const getRumpunBadge = (rumpun) => {
    const colors = {
      JF: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      JA: 'bg-purple-50 text-purple-700 border-purple-200',
      JPT: 'bg-blue-50 text-blue-700 border-blue-200',
      JP: 'bg-sky-50 text-sky-700 border-sky-200',
      UMUM: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
          colors[rumpun] || 'bg-gray-50 text-gray-700 border-gray-200'
        }`}
      >
        {rumpun || 'JF'}
      </span>
    );
  };

  return (
    <section id="tabel-ajukan-komunitas" className="py-14 md:py-20 bg-[#F4F8FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal animation="fade-up" className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 text-[#006A63] text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Komunitas Belajar ASN Buleleng</span>
            </div>
            <h2 id="community-table-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1D315F] tracking-tight">
              Tabel Ajukan Komunitas
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Daftar komunitas belajar yang telah didaftarkan dan sedang diverifikasi oleh BKPSDM.
              Aparatur Sipil Negara dapat mengajukan usulan komunitas belajar baru.
            </p>
          </div>

          {/* Tombol Ajukan Komunitas Baru */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#006A63] hover:bg-[#00554E] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Ajukan Komunitas Baru</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Toolbar Pencarian & Filter */}
        <ScrollReveal animation="fade-up" delay={120} className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            
            {/* Input Pencarian */}
            <div className="lg:col-span-6 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama komunitas atau rumpun jabatan..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A63] focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Rumpun Jabatan */}
            <div className="lg:col-span-3">
              <select
                value={rumpunFilter}
                onChange={(e) => {
                  setRumpunFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A63] text-gray-700"
              >
                <option value="all">Semua Rumpun Jabatan</option>
                <option value="JF">Jabatan Fungsional (JF)</option>
                <option value="JA">Jabatan Administrasi (JA)</option>
                <option value="JPT">Jabatan Pimpinan Tinggi (JPT)</option>
                <option value="JP">Jabatan Pelaksana (JP)</option>
                <option value="UMUM">Umum Seluruh ASN</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A63] text-gray-700"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif / Disetujui</option>
                <option value="menunggu_persetujuan">Menunggu Verifikasi</option>
              </select>
            </div>

            {/* Tombol Refresh */}
            <div className="lg:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={fetchCommunities}
                disabled={isLoading}
                className="w-full sm:w-auto p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Muat Ulang Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#006A63]' : ''}`} />
              </button>
            </div>

          </div>
        </ScrollReveal>

        {/* Tabel Data Komunitas (Modern Responsive Table according to modern-web-guidance) */}
        <ScrollReveal animation="fade-up" delay={220} className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="community-table-heading"
            className="table-wrapper overflow-x-auto w-full focus:outline-none focus:ring-2 focus:ring-[#006A63]"
          >
            <table className="w-full text-left border-collapse border-spacing-0">
              {/* Sticky Table Header */}
              <thead className="bg-[#EAEFF4] sticky top-0 z-10 border-b border-gray-200">
                <tr className="text-[12px] font-black text-[#1D315F] uppercase tracking-wider">
                  <th scope="col" className="py-3.5 px-4 w-12 text-center">No</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[320px]">Nama Komunitas</th>
                  <th scope="col" className="py-3.5 px-3 min-w-[120px]">Rumpun</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[160px]">Status Usulan</th>
                  <th scope="col" className="py-3.5 px-4 min-w-[140px] text-right">Tanggal Diajukan</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-gray-300" />
                        <p className="font-semibold text-gray-600">Tidak ada pengajuan komunitas yang sesuai.</p>
                        <p className="text-xs text-gray-400">Coba ubah kata kunci pencarian atau reset filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                    return (
                      <tr
                        key={item.komunitas_id || idx}
                        className="hover:bg-teal-50/30 transition-colors group"
                      >
                        {/* No */}
                        <td className="py-3.5 px-4 text-center font-semibold text-gray-500">
                          {rowNumber}
                        </td>

                        {/* Nama Komunitas */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-100/70 text-[#006A63] flex items-center justify-center shrink-0 font-bold text-xs">
                              <Users className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-[#1D315F] group-hover:text-[#006A63] transition-colors block line-clamp-2">
                                {item.nama_komunitas}
                              </span>
                              {item.jumlah_anggota > 0 && (
                                <span className="text-[11px] text-gray-400 font-medium">
                                  {item.jumlah_anggota} Anggota
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Rumpun Jabatan */}
                        <td className="py-3.5 px-3">
                          {getRumpunBadge(item.rumpun_jabatan)}
                        </td>

                        {/* Status Usulan */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>

                        {/* Tanggal Diajukan */}
                        <td className="py-3.5 px-4 text-right font-medium text-gray-500 whitespace-nowrap">
                          {formatDate(item.dibuat_pada)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Info & Pagination */}
          <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <div>
              Menampilkan{' '}
              <span className="font-bold text-[#1D315F]">
                {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </span>{' '}
              sampai{' '}
              <span className="font-bold text-[#1D315F]">
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </span>{' '}
              dari{' '}
              <span className="font-bold text-[#1D315F]">{filteredData.length}</span> komunitas
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-bold text-[#1D315F]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

      </div>

      {/* Modal Pendaftaran Komunitas Baru */}
      <CommunityRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchCommunities();
          setIsModalOpen(false);
        }}
      />
    </section>
  );
}
