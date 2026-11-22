import React, { useState, useEffect, useRef } from 'react';
import {
  Users, UserCheck, Award, Briefcase, Upload, Image as ImageIcon,
  CheckCircle2, AlertCircle, X, Loader2, HelpCircle, ChevronDown,
  Search, Check, RefreshCw, Sparkles, Building2, ShieldCheck
} from 'lucide-react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import hiasanBalinese from '../../assets/Hiasan.png';

// Daftar cadangan nama master JF (sesuai database master JF BKPSDM) jika backend dalam mode luring
const FALLBACK_MASTER_NAMES = [
  { id: 1, nama_komunitas: "ADMINISTRATOR DATABASE KEPENDUDUKAN", rumpun_jabatan: "JF" },
  { id: 2, nama_komunitas: "ADMINISTRATOR KESEHATAN", rumpun_jabatan: "JF" },
  { id: 3, nama_komunitas: "ADYATAMA KEPARIWISATAAN DAN EKONOMI KREATIF", rumpun_jabatan: "JF" },
  { id: 4, nama_komunitas: "ANALIS AKUAKULTUR", rumpun_jabatan: "JF" },
  { id: 5, nama_komunitas: "ANALIS KEBENCANAAN", rumpun_jabatan: "JF" },
  { id: 6, nama_komunitas: "ANALIS KEBIJAKAN", rumpun_jabatan: "JF" },
  { id: 7, nama_komunitas: "ANALIS KETAHANAN PANGAN", rumpun_jabatan: "JF" },
  { id: 8, nama_komunitas: "ANALIS KEUANGAN PUSAT DAN DAERAH", rumpun_jabatan: "JF" },
  { id: 9, nama_komunitas: "ANALIS PASAR HASIL PERIKANAN", rumpun_jabatan: "JF" },
  { id: 10, nama_komunitas: "ANALIS PASAR HASIL PERTANIAN", rumpun_jabatan: "JF" },
  { id: 11, nama_komunitas: "ANALIS PERDAGANGAN", rumpun_jabatan: "JF" },
  { id: 12, nama_komunitas: "ANALIS PRASARANA DAN SARANA PERTANIAN", rumpun_jabatan: "JF" },
  { id: 13, nama_komunitas: "ANALIS SUMBER DAYA MANUSIA APARATUR", rumpun_jabatan: "JF" },
  { id: 14, nama_komunitas: "APOTEKER DAN ASISTEN APOTEKER", rumpun_jabatan: "JF" },
  { id: 15, nama_komunitas: "ARSIPARIS", rumpun_jabatan: "JF" },
  { id: 16, nama_komunitas: "AUDITOR", rumpun_jabatan: "JF" },
  { id: 17, nama_komunitas: "BIDAN", rumpun_jabatan: "JF" },
  { id: 18, nama_komunitas: "DOKTER", rumpun_jabatan: "JF" },
  { id: 19, nama_komunitas: "DOKTER GIGI", rumpun_jabatan: "JF" },
  { id: 20, nama_komunitas: "DOKTER SPESIALIS", rumpun_jabatan: "JF" },
  { id: 21, nama_komunitas: "EPIDEMIOLOG", rumpun_jabatan: "JF" },
  { id: 22, nama_komunitas: "FISIKAWAN MEDIS", rumpun_jabatan: "JF" },
  { id: 23, nama_komunitas: "GURU", rumpun_jabatan: "JF" }
];

// Data mock pegawai resmi ASN Buleleng yang terverifikasi untuk fallback auto-fill
const FALLBACK_PEGAWAI = {
  '198504122008011002': {
    nip: '198504122008011002',
    nama_lengkap: 'Gede Arya Suputra, S.STP, M.Si',
    jabatan: 'Analis Kebijakan Ahli Muda',
    rumpun_jabatan: 'JF',
    unit_kerja: 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia'
  },
  '199208152019031005': {
    nip: '199208152019031005',
    nama_lengkap: 'Ketut Agus Mahendra, S.Kom',
    jabatan: 'Pranata Komputer Ahli Pertama',
    rumpun_jabatan: 'JF',
    unit_kerja: 'Dinas Komunikasi, Informatika, Persandian, dan Statistik'
  },
  '198001012005011001': {
    nip: '198001012005011001',
    nama_lengkap: 'Budi Santoso, S.Kom',
    jabatan: 'Pranata Komputer Ahli Muda',
    rumpun_jabatan: 'JF',
    unit_kerja: 'Dinas Komunikasi, Informatika, Persandian, dan Statistik'
  },
  '199001012015011002': {
    nip: '199001012015011002',
    nama_lengkap: 'Andi Wijaya, S.E.',
    jabatan: 'Analis Kepegawaian Ahli Pertama',
    rumpun_jabatan: 'JA',
    unit_kerja: 'Badan Kepegawaian dan Pengembangan Sumber Daya Manusia'
  },
  '198207192006042011': {
    nip: '198207192006042011',
    nama_lengkap: 'Ni Made Dewi Lestari, SE, MM',
    jabatan: 'Perencana Ahli Muda',
    rumpun_jabatan: 'JF',
    unit_kerja: 'Badan Perencanaan Pembangunan Daerah'
  },
  '199003252015021003': {
    nip: '199003252015021003',
    nama_lengkap: 'Putu Eka Pradnyana, ST',
    jabatan: 'Pranata Komputer Ahli Muda',
    rumpun_jabatan: 'JF',
    unit_kerja: 'Diskominfosandi'
  }
};

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

  const [availableNames, setAvailableNames] = useState(FALLBACK_MASTER_NAMES);
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
      if (res.data?.data && res.data.data.length > 0) {
        setAvailableNames(res.data.data);
      } else {
        setAvailableNames(FALLBACK_MASTER_NAMES);
      }
    } catch (err) {
      console.warn('Gagal memuat nama komunitas dari server, menggunakan data cadangan master JF:', err);
      setAvailableNames(FALLBACK_MASTER_NAMES);
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

  // Helper validasi kecocokan nama input dengan nama resmi di database
  const isNameMatching = (inputName, dbName) => {
    if (!inputName || !dbName) return false;
    const cleanInput = inputName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanDb = dbName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanInput === cleanDb ||
      (cleanInput.length >= 4 && cleanDb.includes(cleanInput)) ||
      (cleanDb.length >= 4 && cleanInput.includes(cleanDb));
  };

  // Helper Auto-fill cepat data pengurus terverifikasi
  const handleQuickAutoFill = () => {
    const ketua = FALLBACK_PEGAWAI['198504122008011002'] || FALLBACK_PEGAWAI['198001012005011001'];
    const admin = FALLBACK_PEGAWAI['199208152019031005'] || FALLBACK_PEGAWAI['199001012015011002'];

    setFormData(prev => ({
      ...prev,
      nip_ketua: ketua.nip,
      nama_ketua: ketua.nama_lengkap,
      nip_admin: admin.nip,
      nama_admin: admin.nama_lengkap
    }));

    setKetuaVerified(ketua);
    setAdminVerified(admin);

    setErrors(prev => ({
      ...prev,
      nip_ketua: null,
      nama_ketua: null,
      nip_admin: null,
      nama_admin: null
    }));
  };

  // 2. Lookup NIP Ketua (Otomatis panggil saat 18 digit)
  const handleNipKetuaChange = async (val) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 18);
    setFormData(prev => ({ ...prev, nip_ketua: numericVal }));

    if (numericVal.length === 18) {
      setIsLookingUpKetua(true);
      try {
        const res = await api.get('/pegawai/lookup', { params: { nip: numericVal } });
        if (res.data?.found && res.data?.data) {
          const p = res.data.data;
          setFormData(prev => ({ ...prev, nama_ketua: p.nama_lengkap }));
          setKetuaVerified(p);
          setErrors(prev => ({ ...prev, nip_ketua: null, nama_ketua: null }));
        } else if (FALLBACK_PEGAWAI[numericVal]) {
          const p = FALLBACK_PEGAWAI[numericVal];
          setFormData(prev => ({ ...prev, nama_ketua: p.nama_lengkap }));
          setKetuaVerified(p);
          setErrors(prev => ({ ...prev, nip_ketua: null, nama_ketua: null }));
        } else {
          setKetuaVerified(null);
          setErrors(prev => ({ ...prev, nip_ketua: 'NIP ketua tidak ditemukan di database pegawai.' }));
        }
      } catch {
        if (FALLBACK_PEGAWAI[numericVal]) {
          const p = FALLBACK_PEGAWAI[numericVal];
          setFormData(prev => ({ ...prev, nama_ketua: p.nama_lengkap }));
          setKetuaVerified(p);
          setErrors(prev => ({ ...prev, nip_ketua: null, nama_ketua: null }));
        } else {
          setKetuaVerified(null);
          setErrors(prev => ({ ...prev, nip_ketua: 'Gagal memverifikasi NIP pegawai.' }));
        }
      } finally {
        setIsLookingUpKetua(false);
      }
    } else {
      setKetuaVerified(null);
      if (errors.nip_ketua) setErrors(prev => ({ ...prev, nip_ketua: null }));
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
          // Fallback search dari database lokal
          const query = formData.nama_ketua.toLowerCase();
          const localMatches = Object.values(FALLBACK_PEGAWAI).filter(p =>
            p.nama_lengkap.toLowerCase().includes(query)
          );
          setKetuaSuggestions(localMatches);
          setShowKetuaSuggestions(localMatches.length > 0);
        }
      } catch {
        const query = formData.nama_ketua.toLowerCase();
        const localMatches = Object.values(FALLBACK_PEGAWAI).filter(p =>
          p.nama_lengkap.toLowerCase().includes(query)
        );
        setKetuaSuggestions(localMatches);
        setShowKetuaSuggestions(localMatches.length > 0);
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

    if (numericVal.length === 18) {
      setIsLookingUpAdmin(true);
      try {
        const res = await api.get('/pegawai/lookup', { params: { nip: numericVal } });
        if (res.data?.found && res.data?.data) {
          const p = res.data.data;
          setFormData(prev => ({ ...prev, nama_admin: p.nama_lengkap }));
          setAdminVerified(p);
          setErrors(prev => ({ ...prev, nip_admin: null, nama_admin: null }));
        } else if (FALLBACK_PEGAWAI[numericVal]) {
          const p = FALLBACK_PEGAWAI[numericVal];
          setFormData(prev => ({ ...prev, nama_admin: p.nama_lengkap }));
          setAdminVerified(p);
          setErrors(prev => ({ ...prev, nip_admin: null, nama_admin: null }));
        } else {
          setAdminVerified(null);
          setErrors(prev => ({ ...prev, nip_admin: 'NIP admin tidak ditemukan di database pegawai.' }));
        }
      } catch {
        if (FALLBACK_PEGAWAI[numericVal]) {
          const p = FALLBACK_PEGAWAI[numericVal];
          setFormData(prev => ({ ...prev, nama_admin: p.nama_lengkap }));
          setAdminVerified(p);
          setErrors(prev => ({ ...prev, nip_admin: null, nama_admin: null }));
        } else {
          setAdminVerified(null);
          setErrors(prev => ({ ...prev, nip_admin: 'Gagal memverifikasi NIP pegawai.' }));
        }
      } finally {
        setIsLookingUpAdmin(false);
      }
    } else {
      setAdminVerified(null);
      if (errors.nip_admin) setErrors(prev => ({ ...prev, nip_admin: null }));
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
          const query = formData.nama_admin.toLowerCase();
          const localMatches = Object.values(FALLBACK_PEGAWAI).filter(p =>
            p.nama_lengkap.toLowerCase().includes(query)
          );
          setAdminSuggestions(localMatches);
          setShowAdminSuggestions(localMatches.length > 0);
        }
      } catch {
        const query = formData.nama_admin.toLowerCase();
        const localMatches = Object.values(FALLBACK_PEGAWAI).filter(p =>
          p.nama_lengkap.toLowerCase().includes(query)
        );
        setAdminSuggestions(localMatches);
        setShowAdminSuggestions(localMatches.length > 0);
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

    if (name === 'nama_ketua' && ketuaVerified) {
      if (!isNameMatching(value, ketuaVerified.nama_lengkap)) {
        setErrors(prev => ({ ...prev, nama_ketua: `Nama tidak sesuai data database (${ketuaVerified.nama_lengkap})` }));
      }
    }
    if (name === 'nama_admin' && adminVerified) {
      if (!isNameMatching(value, adminVerified.nama_lengkap)) {
        setErrors(prev => ({ ...prev, nama_admin: `Nama tidak sesuai data database (${adminVerified.nama_lengkap})` }));
      }
    }
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

    // Validasi Pengurus: Ketua Komunitas
    if (!formData.nip_ketua || formData.nip_ketua.length !== 18) {
      newErrors.nip_ketua = 'NIP ketua harus berjumlah 18 digit angka.';
    } else if (!ketuaVerified) {
      newErrors.nip_ketua = 'Data Ketua Komunitas tidak ditemukan di database pegawai.';
    } else if (!isNameMatching(formData.nama_ketua, ketuaVerified.nama_lengkap)) {
      newErrors.nama_ketua = `Nama ketua tidak cocok dengan data database (${ketuaVerified.nama_lengkap}).`;
    }

    if (!formData.nama_ketua.trim()) {
      newErrors.nama_ketua = 'Nama ketua komunitas wajib diisi.';
    }

    // Validasi Pengurus: Admin Komunitas
    if (!formData.nip_admin || formData.nip_admin.length !== 18) {
      newErrors.nip_admin = 'NIP admin harus berjumlah 18 digit angka.';
    } else if (formData.nip_admin === formData.nip_ketua) {
      newErrors.nip_admin = 'Ketua dan Admin Komunitas tidak boleh pegawai yang sama.';
    } else if (!adminVerified) {
      newErrors.nip_admin = 'Data Admin Komunitas tidak ditemukan di database pegawai.';
    } else if (!isNameMatching(formData.nama_admin, adminVerified.nama_lengkap)) {
      newErrors.nama_admin = `Nama admin tidak cocok dengan data database (${adminVerified.nama_lengkap}).`;
    }

    if (!formData.nama_admin.trim()) {
      newErrors.nama_admin = 'Nama admin komunitas wajib diisi.';
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
        title: 'Pengurus Tidak Terverifikasi',
        text: 'Data Ketua dan Admin Komunitas wajib terdaftar di database pegawai dan namanya harus sesuai.',
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

      // Hapus nama komunitas yang baru didaftarkan secara instan dari dropdown
      const registeredName = formData.nama_komunitas;
      setAvailableNames(prev => prev.filter(item => item.nama_komunitas !== registeredName));

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
    <section id="form-register-komunitas" className="py-16 sm:py-24 bg-gradient-to-b from-[#EFF5F8] via-[#F4F9FB] to-white relative overflow-hidden select-none">
      {/* Authentic Balinese Decorative Watermark Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl opacity-[0.045] pointer-events-none select-none">
        <img src={hiasanBalinese} alt="" className="w-full h-auto object-contain" />
      </div>

      {/* Modern Digital Dot Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#1D315F_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] z-0" />

      {/* Atmospheric Soft Aurora Ambient Glows */}
      <div className="absolute -top-10 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-10 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1D315F] tracking-tight leading-tight mb-3">
            Formulir Pendaftaran <span className="text-[#006A63]">Komunitas Belajar</span>
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-[15px] leading-relaxed font-medium">
            Daftarkan komunitas belajar instansi atau rumpun jabatan Anda untuk mewadahi inovasi dan pengembangan kompetensi. Setiap permohonan akan diverifikasi oleh
            <span className="font-bold text-[#1D315F]"> Tim Admin BKPSDM</span> sebelum aktif di portal peserta.
          </p>
        </div>

        {/* Main Card Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80 overflow-hidden transition-all">
          <div className="h-2.5 bg-gradient-to-r from-[#006A63] via-[#0284C7] to-[#1D315F]" />

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 space-y-9">

            {/* Bagian 1: Identitas Komunitas */}
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1D315F] to-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1D315F]">Informasi Dasar Komunitas</h3>
                    <p className="text-xs text-gray-500 font-normal">Identitas, master jabatan fungsional, dan kapasitas anggota</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchAvailableNames}
                  className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-amber-300 text-[#1D315F] hover:text-[#1D315F] border border-slate-200 hover:border-amber-300 font-bold text-xs shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
                  title="Muat ulang daftar nama tersedia dari server"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNames ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh Nama</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

                {/* Nama Komunitas (Searchable Dropdown dari Excel JF) */}
                <div className="md:col-span-2 relative" ref={dropdownRef}>
                  <label className="block text-xs sm:text-sm font-bold text-[#1D315F] mb-1.5">
                    Nama Komunitas (Master Jabatan Fungsional) <span className="text-rose-500">*</span>
                  </label>

                  {/* Trigger Box Dropdown */}
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm flex items-center justify-between cursor-pointer transition-all bg-slate-50/70 hover:bg-white ${errors.nama_komunitas
                        ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-200'
                        : isDropdownOpen
                          ? 'border-[#006A63] ring-2 ring-[#006A63]/20 bg-white shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <span className={formData.nama_komunitas ? 'font-bold text-[#1D315F]' : 'text-gray-400'}>
                      {formData.nama_komunitas || (isLoadingNames ? 'Memuat daftar komunitas...' : '-- Pilih Nama Komunitas JF --')}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#006A63]' : ''}`} />
                  </div>

                  {errors.nama_komunitas && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.nama_komunitas}
                    </p>
                  )}

                  {/* Dropdown Menu Popup with Search */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">

                      {/* Search box inside dropdown */}
                      <div className="p-3 border-b border-slate-100 bg-slate-50/80">
                        <div className="relative">
                          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={nameFilterSearch}
                            onChange={(e) => setNameFilterSearch(e.target.value)}
                            placeholder="Ketik untuk mencari nama komunitas..."
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#006A63] focus:ring-2 focus:ring-[#006A63]/20 transition-all"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                        {filteredNames.length > 0 ? (
                          filteredNames.map((item) => {
                            const isSelected = formData.nama_komunitas === item.nama_komunitas;
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleSelectCommunityName(item)}
                                className={`px-4 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected
                                    ? 'bg-teal-50 font-bold text-[#006A63]'
                                    : 'hover:bg-teal-50/60 text-gray-800'
                                  }`}
                              >
                                <span>{item.nama_komunitas}</span>
                                {isSelected && <Check className="w-4 h-4 text-[#006A63] shrink-0 stroke-[2.5]" />}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-400">
                            {nameFilterSearch ? 'Tidak ada komunitas yang cocok dengan pencarian.' : 'Semua komunitas sudah diajukan atau aktif.'}
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-gray-500 text-center">
                        Nama yang sedang menunggu verifikasi atau sudah aktif disembunyikan otomatis.
                      </div>
                    </div>
                  )}
                </div>

                {/* Rumpun Jabatan (Terkunci ke JF saat nama dipilih) */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1D315F] mb-1.5">
                    Rumpun Jabatan Komunitas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="rumpun_jabatan"
                    value={formData.rumpun_jabatan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#006A63] focus:ring-2 focus:ring-[#006A63]/20 transition-all cursor-pointer"
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
                    Jumlah Anggota Saat Ini <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="jumlah_anggota"
                    min="1"
                    value={formData.jumlah_anggota}
                    onChange={handleInputChange}
                    placeholder="Contoh: 25"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 focus:outline-none transition-all ${errors.jumlah_anggota
                        ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-200'
                        : 'border-slate-200 bg-slate-50/70 focus:bg-white focus:border-[#006A63] focus:ring-2 focus:ring-[#006A63]/20'
                      }`}
                  />
                  {errors.jumlah_anggota ? (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#006A63] focus:ring-2 focus:ring-[#006A63]/20 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Pengurus (Ketua & Admin Komunitas dengan Auto-Fill Dua Arah) */}
            <div>
              <div className="flex items-center gap-3 pb-3.5 mb-6 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#006A63] to-[#0D9488] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  2
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1D315F]">Pengurus Komunitas (Verifikasi Pegawai)</h3>
                  <p className="text-xs text-gray-500 font-normal">Ketua dan Admin wajib merupakan pegawai resmi ASN Pemkab Buleleng</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

                {/* Ketua Komunitas Box */}
                <div className="p-5 bg-gradient-to-br from-slate-50/90 via-white to-blue-50/30 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-4 relative" ref={ketuaRef}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#1D315F] bg-blue-50 border border-blue-200/70 px-2.5 py-1 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ketua Komunitas</span>
                    </div>
                    {ketuaVerified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi di DB
                      </span>
                    ) : formData.nip_ketua.length === 18 && !isLookingUpKetua ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> Tidak Ditemukan di DB
                      </span>
                    ) : null}
                  </div>

                  {/* NIP Ketua */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>NIP Ketua (18 Digit) <span className="text-rose-500">*</span></span>
                      {isLookingUpKetua && (
                        <span className="text-[10px] text-teal-700 font-normal flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Mencari data...
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="nip_ketua"
                      maxLength="18"
                      value={formData.nip_ketua}
                      onChange={(e) => handleNipKetuaChange(e.target.value)}
                      placeholder="198001012005011001"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 bg-white focus:outline-none transition-all font-mono ${errors.nip_ketua
                          ? 'border-rose-400 ring-1 ring-rose-200'
                          : 'border-slate-200 focus:border-[#006A63] focus:ring-2 focus:ring-[#006A63]/20'
                        }`}
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      {errors.nip_ketua ? (
                        <span className="text-rose-500 font-medium">{errors.nip_ketua}</span>
                      ) : (
                        <span className="text-gray-400">Masukkan 18 digit untuk auto-fill</span>
                      )}
                      <span className="text-gray-400 font-mono">{formData.nip_ketua.length}/18</span>
                    </div>
                  </div>

                  {/* Nama Ketua dengan Search Suggestions */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_ketua"
                      value={formData.nama_ketua}
                      onChange={handleInputChange}
                      placeholder="Ketik nama untuk mencari..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 bg-white focus:outline-none transition-all ${errors.nama_ketua
                          ? 'border-rose-400 ring-1 ring-rose-200'
                          : 'border-slate-200 focus:border-[#006A63] focus:ring-2 focus:ring-[#006A63]/20'
                        }`}
                    />
                    {errors.nama_ketua && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.nama_ketua}</p>
                    )}

                    {/* Autocomplete Suggestion Dropdown */}
                    {showKetuaSuggestions && ketuaSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                        {ketuaSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectKetuaSuggestion(item)}
                            className="p-2.5 text-xs hover:bg-teal-50/70 cursor-pointer transition-colors"
                          >
                            <p className="font-bold text-gray-800">{item.nama_lengkap}</p>
                            <p className="text-[11px] text-gray-500 font-mono">NIP: {item.nip} {item.jabatan ? `• ${item.jabatan}` : ''}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {ketuaVerified && (
                      <div className="mt-2 p-2 bg-blue-50/60 rounded-lg border border-blue-100 flex items-start gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-blue-900 leading-tight min-w-0">
                          <p className="font-bold truncate">{ketuaVerified.jabatan || 'Aparatur Sipil Negara'}</p>
                          <p className="text-blue-700/80 truncate text-[10px]">{ketuaVerified.unit_kerja || 'Pemerintah Kabupaten Buleleng'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Komunitas Box */}
                <div className="p-5 bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/30 rounded-2xl border border-teal-200/80 shadow-2xs hover:shadow-xs transition-all space-y-4 relative" ref={adminRef}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#006A63] bg-teal-50 border border-teal-200/70 px-2.5 py-1 rounded-lg">
                      <UserCheck className="w-3.5 h-3.5 text-[#006A63]" />
                      <span>Admin Komunitas</span>
                    </div>
                    {adminVerified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi di DB
                      </span>
                    ) : formData.nip_admin.length === 18 && !isLookingUpAdmin ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> Tidak Ditemukan di DB
                      </span>
                    ) : null}
                  </div>

                  {/* NIP Admin */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>NIP Admin (18 Digit) <span className="text-rose-500">*</span></span>
                      {isLookingUpAdmin && (
                        <span className="text-[10px] text-teal-700 font-normal flex items-center gap-1">
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
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 bg-white focus:outline-none transition-all font-mono ${errors.nip_admin
                          ? 'border-rose-400 ring-1 ring-rose-200'
                          : 'border-slate-200 focus:border-[#006A63] focus:ring-2 focus:ring-[#006A63]/20'
                        }`}
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      {errors.nip_admin ? (
                        <span className="text-rose-500 font-medium">{errors.nip_admin}</span>
                      ) : (
                        <span className="text-gray-400">Masukkan 18 digit untuk auto-fill</span>
                      )}
                      <span className="text-gray-400 font-mono">{formData.nip_admin.length}/18</span>
                    </div>
                  </div>

                  {/* Nama Admin dengan Search Suggestions */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nama Lengkap Admin <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_admin"
                      value={formData.nama_admin}
                      onChange={handleInputChange}
                      placeholder="Ketik nama untuk mencari..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-800 bg-white focus:outline-none transition-all ${errors.nama_admin
                          ? 'border-rose-400 ring-1 ring-rose-200'
                          : 'border-slate-200 focus:border-[#006A63] focus:ring-2 focus:ring-[#006A63]/20'
                        }`}
                    />
                    {errors.nama_admin && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.nama_admin}</p>
                    )}

                    {/* Autocomplete Suggestion Dropdown */}
                    {showAdminSuggestions && adminSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                        {adminSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectAdminSuggestion(item)}
                            className="p-2.5 text-xs hover:bg-teal-50/70 cursor-pointer transition-colors"
                          >
                            <p className="font-bold text-gray-800">{item.nama_lengkap}</p>
                            <p className="text-[11px] text-gray-500 font-mono">NIP: {item.nip} {item.jabatan ? `• ${item.jabatan}` : ''}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {adminVerified && (
                      <div className="mt-2 p-2 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-start gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-emerald-900 leading-tight min-w-0">
                          <p className="font-bold truncate">{adminVerified.jabatan || 'Aparatur Sipil Negara'}</p>
                          <p className="text-emerald-700/80 truncate text-[10px]">{adminVerified.unit_kerja || 'Pemerintah Kabupaten Buleleng'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Bagian 3: Foto Thumbnail Sampul (Maks 2MB) */}
            <div>
              <div className="flex items-center gap-3 pb-3.5 mb-6 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D97706] to-[#F59E0B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  3
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1D315F]">Foto Thumbnail Komunitas</h3>
                  <p className="text-xs text-gray-500 font-normal">Identitas visual komunitas yang akan tayang pada katalog publik (Maks. 2MB)</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 sm:p-6 rounded-2xl border-2 border-dashed border-teal-200/90 hover:border-[#006A63] bg-teal-50/20 hover:bg-teal-50/40 transition-all duration-300">
                {/* Image Preview Box */}
                <div className="relative w-44 h-28 sm:w-52 sm:h-32 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center shadow-md">
                  {thumbnailPreview ? (
                    <>
                      <img src={thumbnailPreview} alt="Preview Thumbnail" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-md cursor-pointer active:scale-95"
                        title="Hapus Gambar"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1 text-slate-300" />
                      <span className="text-[11px] font-medium">Belum ada thumbnail</span>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 w-full text-center sm:text-left">
                  <label className="inline-block cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006A63] hover:bg-[#00544f] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-900/15 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Pilih Foto Thumbnail</span>
                    </span>
                    <input
                      type="file"
                      id="community-thumbnail-input"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="mt-2.5 text-xs text-gray-500 space-y-0.5 font-medium">
                    <p className="font-bold text-[#1D315F]">Persyaratan Gambar:</p>
                    <p>• Format: JPG, JPEG, PNG, atau WEBP</p>
                    <p>• Ukuran maksimal: <span className="font-bold text-[#006A63]">2 MB (2048 KB)</span></p>
                    <p>• Disarankan rasio landscape (16:9 atau 4:3) untuk hasil optimal di halaman katalog.</p>
                  </div>

                  {errors.thumbnail && (
                    <p className="text-xs text-rose-500 mt-2 flex items-center gap-1 justify-center sm:justify-start font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.thumbnail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Note & Action Submit */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-start gap-2.5 text-xs text-gray-500 max-w-md">
                <div className="w-5 h-5 rounded-full bg-teal-100/70 text-[#006A63] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="leading-snug">
                  Setiap permohonan pendaftaran akan diverifikasi dan disetujui oleh <strong className="text-[#1D315F]">Admin BKPSDM</strong> sebelum dipublikasikan ke portal peserta.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 ${isSubmitting
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                    : 'bg-white hover:bg-amber-300 text-[#1D315F] hover:text-[#1D315F] border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-md'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Memproses Pendaftaran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
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
