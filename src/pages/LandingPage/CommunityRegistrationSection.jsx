import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserCheck, Award, Briefcase, Upload, Image as ImageIcon, 
  CheckCircle2, AlertCircle, X, Loader2, HelpCircle, ChevronDown,
  Search, Check, RefreshCw
} from 'lucide-react';
import api from '../../api/axios';
import Swal from 'sweetalert2';

export default function CommunityRegistrationSection() {
  const [formData, setFormData] = useState({
    nama_komunitas: '',
    nama_ketua: '',
    nip_ketua: '',
    nama_admin: '',
    nip_admin: '',
    rumpun_jabatan: 'JF',
    jumlah_anggota: '10',
    deskripsi: ''
  });

  const [availableNames, setAvailableNames] = useState([]);
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [nameFilterSearch, setNameFilterSearch] = useState('');

  // Auto-fill state untuk Ketua
  const [isLookingUpKetua, setIsLookingUpKetua] = useState(false);
  const [ketuaVerified, setKetuaVerified] = useState(null);
  const [ketuaSuggestions, setKetuaSuggestions] = useState([]);
  const [showKetuaSuggestions, setShowKetuaSuggestions] = useState(false);

  // Auto-fill state untuk Admin
  const [isLookingUpAdmin, setIsLookingUpAdmin] = useState(false);
  const [adminVerified, setAdminVerified] = useState(null);
  const [adminSuggestions, setAdminSuggestions] = useState([]);
  const [showAdminSuggestions, setShowAdminSuggestions] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const dropdownRef = useRef(null);
  const ketuaRef = useRef(null);
  const adminRef = useRef(null);

  // 1. Fetch Daftar Nama Komunitas Master yang Belum Terpakai
  const fetchAvailableNames = async () => {
    try {
      setIsLoadingNames(true);
      const res = await api.get('/komunitas/available-names');
      if (res.data?.data) {
        setAvailableNames(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load available names:', err);
    } finally {
      setIsLoadingNames(false);
    }
  };

  useEffect(() => {
    fetchAvailableNames();
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (ketuaRef.current && !ketuaRef.current.contains(e.target)) {
        setShowKetuaSuggestions(false);
      }
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setShowAdminSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Lookup NIP Ketua (Otomatis panggil saat 18 digit)
  const handleNipKetuaChange = async (val) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 18);
    setFormData(prev => ({ ...prev, nip_ketua: numericVal }));
    if (errors.nip_ketua) setErrors(prev => ({ ...prev, nip_ketua: null }));

    if (numericVal.length === 18) {
      setIsLookingUpKetua(true);
      try {
        const res = await api.get('/pegawai/lookup', { params: { nip: numericVal } });
        if (res.data?.found && res.data?.data) {
          const p = res.data.data;
          setFormData(prev => ({ ...prev, nama_ketua: p.nama_lengkap }));
          setKetuaVerified(p);
          if (errors.nama_ketua) setErrors(prev => ({ ...prev, nama_ketua: null }));
        } else {
          setKetuaVerified(null);
        }
      } catch {
        setKetuaVerified(null);
      } finally {
        setIsLookingUpKetua(false);
      }
    } else {
      setKetuaVerified(null);
    }
  };

  // 3. Autocomplete Nama Ketua (Searchable)
  useEffect(() => {
    if (!formData.nama_ketua || formData.nama_ketua.trim().length < 3 || (ketuaVerified && ketuaVerified.nama_lengkap === formData.nama_ketua)) {
      setKetuaSuggestions([]);
      setShowKetuaSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/pegawai/lookup', { params: { nama: formData.nama_ketua.trim() } });
        if (res.data?.found && res.data?.data?.length > 0) {
          setKetuaSuggestions(res.data.data);
          setShowKetuaSuggestions(true);
        } else {
          setKetuaSuggestions([]);
          setShowKetuaSuggestions(false);
        }
      } catch {
        setKetuaSuggestions([]);
        setShowKetuaSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.nama_ketua]);

  const selectKetuaSuggestion = (p) => {
    setFormData(prev => ({
      ...prev,
      nama_ketua: p.nama_lengkap,
      nip_ketua: String(p.nip).slice(0, 18)
    }));
    setKetuaVerified(p);
    setShowKetuaSuggestions(false);
    if (errors.nama_ketua) setErrors(prev => ({ ...prev, nama_ketua: null }));
    if (errors.nip_ketua) setErrors(prev => ({ ...prev, nip_ketua: null }));
  };

  // 4. Lookup NIP Admin (Otomatis panggil saat 18 digit)
  const handleNipAdminChange = async (val) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 18);
    setFormData(prev => ({ ...prev, nip_admin: numericVal }));
    if (errors.nip_admin) setErrors(prev => ({ ...prev, nip_admin: null }));

    if (numericVal.length === 18) {
      setIsLookingUpAdmin(true);
      try {
        const res = await api.get('/pegawai/lookup', { params: { nip: numericVal } });
        if (res.data?.found && res.data?.data) {
          const p = res.data.data;
          setFormData(prev => ({ ...prev, nama_admin: p.nama_lengkap }));
          setAdminVerified(p);
          if (errors.nama_admin) setErrors(prev => ({ ...prev, nama_admin: null }));
        } else {
          setAdminVerified(null);
        }
      } catch {
        setAdminVerified(null);
      } finally {
        setIsLookingUpAdmin(false);
      }
    } else {
      setAdminVerified(null);
    }
  };

  // 5. Autocomplete Nama Admin (Searchable)
  useEffect(() => {
    if (!formData.nama_admin || formData.nama_admin.trim().length < 3 || (adminVerified && adminVerified.nama_lengkap === formData.nama_admin)) {
      setAdminSuggestions([]);
      setShowAdminSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/pegawai/lookup', { params: { nama: formData.nama_admin.trim() } });
        if (res.data?.found && res.data?.data?.length > 0) {
          setAdminSuggestions(res.data.data);
          setShowAdminSuggestions(true);
        } else {
          setAdminSuggestions([]);
          setShowAdminSuggestions(false);
        }
      } catch {
        setAdminSuggestions([]);
        setShowAdminSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.nama_admin]);

  const selectAdminSuggestion = (p) => {
    setFormData(prev => ({
      ...prev,
      nama_admin: p.nama_lengkap,
      nip_admin: String(p.nip).slice(0, 18)
    }));
    setAdminVerified(p);
    setShowAdminSuggestions(false);
    if (errors.nama_admin) setErrors(prev => ({ ...prev, nama_admin: null }));
    if (errors.nip_admin) setErrors(prev => ({ ...prev, nip_admin: null }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectCommunityName = (item) => {
    setFormData(prev => ({
      ...prev,
      nama_komunitas: item.nama_komunitas,
      rumpun_jabatan: item.rumpun_jabatan || 'JF'
    }));
    setIsDropdownOpen(false);
    setNameFilterSearch('');
    if (errors.nama_komunitas) setErrors(prev => ({ ...prev, nama_komunitas: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'warning',
        title: 'Format File Tidak Sesuai',
        text: 'Hanya format gambar JPG, PNG, atau WEBP yang diperbolehkan.',
        confirmButtonColor: '#006A63'
      });
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Terlalu Besar',
        text: 'Ukuran foto thumbnail maksimal 2MB. Silakan pilih gambar lain yang lebih kecil.',
        confirmButtonColor: '#006A63'
      });
      e.target.value = '';
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    if (errors.thumbnail) setErrors(prev => ({ ...prev, thumbnail: null }));
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    const input = document.getElementById('community-thumbnail-input');
    if (input) input.value = '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama_komunitas.trim()) {
      newErrors.nama_komunitas = 'Silakan pilih nama komunitas dari daftar dropdown.';
    }

    if (!formData.nama_ketua.trim()) {
      newErrors.nama_ketua = 'Nama ketua komunitas wajib diisi.';
    }
    if (!formData.nip_ketua || formData.nip_ketua.length !== 18) {
      newErrors.nip_ketua = 'NIP ketua harus berjumlah 18 digit angka.';
    }

    if (!formData.nama_admin.trim()) {
      newErrors.nama_admin = 'Nama admin komunitas wajib diisi.';
    }
    if (!formData.nip_admin || formData.nip_admin.length !== 18) {
      newErrors.nip_admin = 'NIP admin harus berjumlah 18 digit angka.';
    }

    if (!formData.rumpun_jabatan) {
      newErrors.rumpun_jabatan = 'Rumpun jabatan wajib dipilih.';
    }

    if (!formData.jumlah_anggota || parseInt(formData.jumlah_anggota, 10) < 1) {
      newErrors.jumlah_anggota = 'Jumlah anggota minimal 1 orang.';
    }

    if (!thumbnailFile) {
      newErrors.thumbnail = 'Foto thumbnail wajib diunggah (maks 2MB).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulir Belum Lengkap',
        text: 'Mohon periksa kembali kolom yang bertanda merah.',
        confirmButtonColor: '#006A63'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('nama_komunitas', formData.nama_komunitas.trim());
      payload.append('nama_ketua', formData.nama_ketua.trim());
      payload.append('nip_ketua', formData.nip_ketua);
      payload.append('nama_admin', formData.nama_admin.trim());
      payload.append('nip_admin', formData.nip_admin);
      payload.append('rumpun_jabatan', formData.rumpun_jabatan);
      payload.append('jumlah_anggota', formData.jumlah_anggota);
      payload.append('deskripsi', formData.deskripsi.trim());
      payload.append('thumbnail', thumbnailFile);

      await api.post('/komunitas/register', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil Diajukan!',
        html: `
          <div class="text-left text-sm text-gray-600 mt-2 space-y-2">
            <p>Pendaftaran komunitas <b>${formData.nama_komunitas}</b> telah diterima sistem.</p>
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
              <span class="font-bold">Status:</span> Menunggu Verifikasi & Approval Admin BKPSDM.
            </div>
            <p class="text-xs text-gray-500">
              Nama komunitas ini sementara otomatis tidak tersedia di menu pilihan pendaftaran. Setelah disetujui (ACC) oleh Admin BKPSDM, komunitas akan otomatis tayang di Halaman Komunitas User.
            </p>
          </div>
        `,
        confirmButtonColor: '#006A63',
        confirmButtonText: 'Selesai'
      });

      // Reset form & reload daftar nama komunitas (nama yang baru didaftarkan akan otomatis hilang dari dropdown)
      setFormData({
        nama_komunitas: '',
        nama_ketua: '',
        nip_ketua: '',
        nama_admin: '',
        nip_admin: '',
        rumpun_jabatan: 'JF',
        jumlah_anggota: '10',
        deskripsi: ''
      });
      setKetuaVerified(null);
      setAdminVerified(null);
      handleRemoveThumbnail();
      setErrors({});
      fetchAvailableNames();

    } catch (error) {
      console.error('Registration failed:', error);
      const serverMsg = error.response?.data?.message || 'Terjadi kesalahan saat mengirim pendaftaran.';
      const serverErrors = error.response?.data?.errors;
      
      let detailedMsg = serverMsg;
      if (serverErrors) {
        detailedMsg = Object.values(serverErrors).flat().join('<br/>');
      }

      Swal.fire({
        icon: 'error',
        title: 'Gagal Mendaftarkan',
        html: detailedMsg,
        confirmButtonColor: '#006A63'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredNames = availableNames.filter(item => 
    item.nama_komunitas.toLowerCase().includes(nameFilterSearch.toLowerCase())
  );

  return (
    <section id="form-register-komunitas" className="py-14 md:py-20 bg-gradient-to-b from-[#EFF5F3] to-[#E6F0ED] relative overflow-hidden">
      {/* Decorative Blur Circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1D315F] leading-tight mb-3">
            Formulir Pendaftaran Komunitas
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
            Daftarkan komunitas belajar instansi atau rumpun jabatan Anda. Setiap permohonan akan diverifikasi oleh 
            <span className="font-semibold text-[#1D315F]"> Admin BKPSDM</span> sebelum aktif di portal peserta.
          </p>
        </div>

        {/* Main Card Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#006A63] via-[#3FCDC1] to-[#1D315F]" />
          
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 space-y-8">
            
            {/* Bagian 1: Identitas Komunitas */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#006A63]" />
                  <h3 className="text-base sm:text-lg font-bold text-[#1D315F]">1. Informasi Dasar Komunitas</h3>
                </div>
                <button
                  type="button"
                  onClick={fetchAvailableNames}
                  className="text-xs text-teal-700 hover:text-teal-800 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                  title="Muat ulang daftar nama tersedia"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNames ? 'animate-spin' : ''}`} />
                  <span>Refresh Nama</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Nama Komunitas (Searchable Dropdown dari Excel JF) */}
                <div className="md:col-span-2 relative" ref={dropdownRef}>
                  <label className="block text-xs sm:text-sm font-bold text-[#1D315F] mb-1.5 flex justify-between items-center">
                    <span>Nama Komunitas (Master Jabatan Fungsional) <span className="text-red-500">*</span></span>
                    <span className="text-[11px] font-normal text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Tersedia: {availableNames.length} Komunitas
                    </span>
                  </label>

                  {/* Trigger Box Dropdown */}
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm flex items-center justify-between cursor-pointer transition-colors bg-gray-50/50 hover:bg-white ${
                      errors.nama_komunitas 
                        ? 'border-red-400 bg-red-50/40' 
                        : isDropdownOpen 
                        ? 'border-[#006A63] ring-1 ring-[#006A63] bg-white' 
                        : 'border-gray-200'
                    }`}
                  >
                    <span className={formData.nama_komunitas ? 'font-bold text-[#1D315F]' : 'text-gray-400'}>
                      {formData.nama_komunitas || (isLoadingNames ? 'Memuat daftar komunitas...' : '-- Pilih Nama Komunitas JF --')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {errors.nama_komunitas && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.nama_komunitas}
                    </p>
                  )}

                  {/* Dropdown Menu Popup with Search */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
                      
                      {/* Search box inside dropdown */}
                      <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={nameFilterSearch}
                            onChange={(e) => setNameFilterSearch(e.target.value)}
                            placeholder="Ketik untuk mencari nama komunitas..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-[#006A63] focus:ring-1 focus:ring-[#006A63]"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                        {filteredNames.length > 0 ? (
                          filteredNames.map((item) => {
                            const isSelected = formData.nama_komunitas === item.nama_komunitas;
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleSelectCommunityName(item)}
                                className={`px-4 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors flex items-center justify-between ${
                                  isSelected 
                                    ? 'bg-teal-50 font-bold text-[#006A63]' 
                                    : 'hover:bg-teal-50/60 text-gray-800'
                                }`}
                              >
                                <span>{item.nama_komunitas}</span>
                                {isSelected && <Check className="w-4 h-4 text-[#006A63] shrink-0" />}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-400">
                            {nameFilterSearch ? 'Tidak ada komunitas yang cocok dengan pencarian.' : 'Semua komunitas sudah diajukan atau aktif.'}
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 text-center">
                        Nama yang sedang menunggu verifikasi atau sudah aktif disembunyikan otomatis.
                      </div>
                    </div>
                  )}
                </div>

                {/* Rumpun Jabatan (Terkunci ke JF saat nama dipilih) */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1D315F] mb-1.5">
                    Rumpun Jabatan Komunitas <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="rumpun_jabatan"
                    value={formData.rumpun_jabatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#006A63] focus:ring-1 focus:ring-[#006A63] transition-colors cursor-pointer"
                  >
                    <option value="JF">JF (Jabatan Fungsional)</option>
                    <option value="JP">JP (Jabatan Pelaksana)</option>
                    <option value="JA">JA (Jabatan Administrasi)</option>
                    <option value="JPT">JPT (Jabatan Pimpinan Tinggi)</option>
                    <option value="UMUM">UMUM (Terbuka untuk Seluruh Rumpun ASN)</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Otomatis terpilih JF sesuai master nama komunitas.</p>
                </div>

                {/* Jumlah Anggota Awal */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1D315F] mb-1.5">
                    Jumlah Anggota Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="jumlah_anggota"
                    min="1"
                    value={formData.jumlah_anggota}
                    onChange={handleInputChange}
                    placeholder="Contoh: 25"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 focus:outline-none transition-colors ${
                      errors.jumlah_anggota 
                        ? 'border-red-400 bg-red-50/40 focus:ring-1 focus:ring-red-400' 
                        : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#006A63] focus:ring-1 focus:ring-[#006A63]'
                    }`}
                  />
                  {errors.jumlah_anggota ? (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.jumlah_anggota}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-400 mt-1">Perkiraan jumlah anggota awal yang akan bergabung.</p>
                  )}
                </div>

                {/* Deskripsi Singkat */}
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-[#1D315F] mb-1.5">
                    Deskripsi Singkat Komunitas <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    name="deskripsi"
                    rows="2"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    placeholder="Jelaskan fokus pembelajaran, tujuan, dan ruang lingkup kegiatan komunitas ini..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#006A63] focus:ring-1 focus:ring-[#006A63] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Pengurus (Ketua & Admin Komunitas dengan Auto-Fill Dua Arah) */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#006A63]" />
                  <h3 className="text-base sm:text-lg font-bold text-[#1D315F]">2. Pengurus Komunitas</h3>
                </div>
                <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                  ⚡ Auto-fill NIP & Nama Pegawai aktif
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Ketua Komunitas Box */}
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/80 space-y-4 relative" ref={ketuaRef}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#006A63]">
                      <Award className="w-4 h-4" />
                      <span>Ketua Komunitas</span>
                    </div>
                    {ketuaVerified && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" /> Terverifikasi
                      </span>
                    )}
                  </div>

                  {/* NIP Ketua */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                      <span>NIP Ketua (18 Digit) <span className="text-red-500">*</span></span>
                      {isLookingUpKetua && (
                        <span className="text-[10px] text-teal-700 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Mencari data...
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nip_ketua"
                        maxLength="18"
                        value={formData.nip_ketua}
                        onChange={(e) => handleNipKetuaChange(e.target.value)}
                        placeholder="198001012005011001"
                        className={`w-full px-3.5 py-2 rounded-lg border text-sm text-gray-800 bg-white focus:outline-none transition-colors font-mono ${
                          errors.nip_ketua ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-200 focus:border-[#006A63]'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      {errors.nip_ketua ? (
                        <span className="text-red-500">{errors.nip_ketua}</span>
                      ) : (
                        <span className="text-gray-400">Masukkan 18 digit untuk auto-fill nama</span>
                      )}
                      <span className="text-gray-400">{formData.nip_ketua.length}/18</span>
                    </div>
                  </div>

                  {/* Nama Ketua dengan Search Suggestions */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Lengkap & Gelar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_ketua"
                      value={formData.nama_ketua}
                      onChange={handleInputChange}
                      placeholder="Ketik nama untuk mencari..."
                      className={`w-full px-3.5 py-2 rounded-lg border text-sm text-gray-800 bg-white focus:outline-none transition-colors ${
                        errors.nama_ketua ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-200 focus:border-[#006A63]'
                      }`}
                    />
                    {errors.nama_ketua && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.nama_ketua}</p>
                    )}

                    {/* Autocomplete Suggestion Dropdown */}
                    {showKetuaSuggestions && ketuaSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-48 overflow-y-auto divide-y divide-gray-100">
                        {ketuaSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectKetuaSuggestion(item)}
                            className="p-2.5 text-xs hover:bg-teal-50 cursor-pointer transition-colors"
                          >
                            <p className="font-bold text-gray-800">{item.nama_lengkap}</p>
                            <p className="text-[11px] text-gray-500 font-mono">NIP: {item.nip} {item.jabatan ? `• ${item.jabatan}` : ''}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {ketuaVerified && (
                      <p className="text-[11px] text-teal-700 mt-1 line-clamp-1">
                        {ketuaVerified.jabatan ? `${ketuaVerified.jabatan} - ` : ''}{ketuaVerified.unit_kerja || ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Komunitas Box */}
                <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-4 relative" ref={adminRef}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#006A63]">
                      <UserCheck className="w-4 h-4" />
                      <span>Admin Komunitas</span>
                    </div>
                    {adminVerified && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" /> Terverifikasi
                      </span>
                    )}
                  </div>

                  {/* NIP Admin */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                      <span>NIP Admin (18 Digit) <span className="text-red-500">*</span></span>
                      {isLookingUpAdmin && (
                        <span className="text-[10px] text-teal-700 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Mencari data...
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="nip_admin"
                      maxLength="18"
                      value={formData.nip_admin}
                      onChange={(e) => handleNipAdminChange(e.target.value)}
                      placeholder="199205152015021002"
                      className={`w-full px-3.5 py-2 rounded-lg border text-sm text-gray-800 bg-white focus:outline-none transition-colors font-mono ${
                        errors.nip_admin ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-200 focus:border-[#006A63]'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      {errors.nip_admin ? (
                        <span className="text-red-500">{errors.nip_admin}</span>
                      ) : (
                        <span className="text-gray-400">Masukkan 18 digit untuk auto-fill nama</span>
                      )}
                      <span className="text-gray-400">{formData.nip_admin.length}/18</span>
                    </div>
                  </div>

                  {/* Nama Admin dengan Search Suggestions */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Lengkap Admin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_admin"
                      value={formData.nama_admin}
                      onChange={handleInputChange}
                      placeholder="Ketik nama untuk mencari..."
                      className={`w-full px-3.5 py-2 rounded-lg border text-sm text-gray-800 bg-white focus:outline-none transition-colors ${
                        errors.nama_admin ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-200 focus:border-[#006A63]'
                      }`}
                    />
                    {errors.nama_admin && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.nama_admin}</p>
                    )}

                    {/* Autocomplete Suggestion Dropdown */}
                    {showAdminSuggestions && adminSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-48 overflow-y-auto divide-y divide-gray-100">
                        {adminSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectAdminSuggestion(item)}
                            className="p-2.5 text-xs hover:bg-teal-50 cursor-pointer transition-colors"
                          >
                            <p className="font-bold text-gray-800">{item.nama_lengkap}</p>
                            <p className="text-[11px] text-gray-500 font-mono">NIP: {item.nip} {item.jabatan ? `• ${item.jabatan}` : ''}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {adminVerified && (
                      <p className="text-[11px] text-teal-700 mt-1 line-clamp-1">
                        {adminVerified.jabatan ? `${adminVerified.jabatan} - ` : ''}{adminVerified.unit_kerja || ''}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Bagian 3: Foto Thumbnail Sampul (Maks 2MB) */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-100">
                <Upload className="w-5 h-5 text-[#006A63]" />
                <h3 className="text-base sm:text-lg font-bold text-[#1D315F]">3. Foto Thumbnail Komunitas (Maks. 2MB)</h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/60">
                {/* Image Preview Box */}
                <div className="relative w-40 h-28 sm:w-44 sm:h-32 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0 flex items-center justify-center shadow-sm">
                  {thumbnailPreview ? (
                    <>
                      <img src={thumbnailPreview} alt="Preview Thumbnail" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                        title="Hapus Gambar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-3 text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
                      <span className="text-[11px]">Belum ada thumbnail</span>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 w-full text-center sm:text-left">
                  <label className="inline-block cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#006A63] text-[#006A63] hover:bg-[#006A63] hover:text-white rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm">
                      <Upload className="w-4 h-4" />
                      Pilih Foto Thumbnail
                    </span>
                    <input
                      type="file"
                      id="community-thumbnail-input"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p className="font-semibold text-gray-700">Persyaratan Gambar:</p>
                    <p>• Format: JPG, JPEG, PNG, atau WEBP</p>
                    <p>• Ukuran maksimal: <span className="font-bold text-[#006A63]">2 MB (2048 KB)</span></p>
                    <p>• Disarankan rasio 16:9 atau 4:3 untuk hasil optimal di halaman katalog.</p>
                  </div>

                  {errors.thumbnail && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1 justify-center sm:justify-start">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.thumbnail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Note & Action Submit */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Pendaftaran akan diperiksa oleh Admin BKPSDM sebelum dipublikasikan.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-[#006A63] hover:bg-[#00524d] hover:shadow-teal-900/20 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Pendaftaran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Daftarkan Komunitas Sekarang</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
}
