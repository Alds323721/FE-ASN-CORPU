import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Users,
  UserCheck,
  Award,
  Briefcase,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import api from '../../api/axios';
import Swal from 'sweetalert2';

export default function CommunityRegistrationModal({ isOpen, onClose, onSuccess }) {
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

  // Auto-fill state Ketua
  const [isLookingUpKetua, setIsLookingUpKetua] = useState(false);
  const [ketuaVerified, setKetuaVerified] = useState(null);
  const [ketuaSuggestions, setKetuaSuggestions] = useState([]);
  const [showKetuaSuggestions, setShowKetuaSuggestions] = useState(false);

  // Auto-fill state Admin
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

  // Fetch Daftar Nama Komunitas Master
  const fetchAvailableNames = async () => {
    try {
      setIsLoadingNames(true);
      const res = await api.get('/komunitas/available-names');
      if (res.data?.data) {
        setAvailableNames(res.data.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingNames(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAvailableNames();
    }
  }, [isOpen]);

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

  const isNameMatching = (inputName, dbName) => {
    if (!inputName || !dbName) return false;
    const cleanInput = inputName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanDb = dbName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      cleanInput === cleanDb ||
      (cleanInput.length >= 4 && cleanDb.includes(cleanInput)) ||
      (cleanDb.length >= 4 && cleanInput.includes(cleanDb))
    );
  };

  const handleNipKetuaChange = async (val) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 18);
    setFormData((prev) => ({ ...prev, nip_ketua: numericVal }));

    if (numericVal.length === 18) {
      setIsLookingUpKetua(true);
      try {
        const res = await api.get('/pegawai/lookup', { params: { nip: numericVal } });
        if (res.data?.found && res.data?.data) {
          const p = res.data.data;
          setFormData((prev) => ({ ...prev, nama_ketua: p.nama_lengkap }));
          setKetuaVerified(p);
          setErrors((prev) => ({ ...prev, nip_ketua: null, nama_ketua: null }));
        } else {
          setKetuaVerified(null);
          setErrors((prev) => ({ ...prev, nip_ketua: 'NIP ketua tidak ditemukan di database pegawai.' }));
        }
      } catch {
        setKetuaVerified(null);
        setErrors((prev) => ({ ...prev, nip_ketua: 'Gagal memverifikasi NIP pegawai.' }));
      } finally {
        setIsLookingUpKetua(false);
      }
    } else {
      setKetuaVerified(null);
      if (errors.nip_ketua) setErrors((prev) => ({ ...prev, nip_ketua: null }));
    }
  };

  const handleNipAdminChange = async (val) => {
    const numericVal = val.replace(/\D/g, '').slice(0, 18);
    setFormData((prev) => ({ ...prev, nip_admin: numericVal }));

    if (numericVal.length === 18) {
      setIsLookingUpAdmin(true);
      try {
        const res = await api.get('/pegawai/lookup', { params: { nip: numericVal } });
        if (res.data?.found && res.data?.data) {
          const p = res.data.data;
          setFormData((prev) => ({ ...prev, nama_admin: p.nama_lengkap }));
          setAdminVerified(p);
          setErrors((prev) => ({ ...prev, nip_admin: null, nama_admin: null }));
        } else {
          setAdminVerified(null);
          setErrors((prev) => ({ ...prev, nip_admin: 'NIP admin tidak ditemukan di database pegawai.' }));
        }
      } catch {
        setAdminVerified(null);
        setErrors((prev) => ({ ...prev, nip_admin: 'Gagal memverifikasi NIP pegawai.' }));
      } finally {
        setIsLookingUpAdmin(false);
      }
    } else {
      setAdminVerified(null);
      if (errors.nip_admin) setErrors((prev) => ({ ...prev, nip_admin: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|png|jpg|webp)/)) {
      setErrors((prev) => ({ ...prev, thumbnail: 'Format file harus berupa JPG, PNG, atau WEBP.' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, thumbnail: 'Ukuran file thumbnail maksimal 2MB.' }));
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, thumbnail: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.nama_komunitas.trim()) newErrors.nama_komunitas = 'Nama komunitas wajib dipilih.';
    if (!formData.nama_ketua.trim()) newErrors.nama_ketua = 'Nama ketua komunitas wajib diisi.';
    if (!formData.nip_ketua || formData.nip_ketua.length !== 18) newErrors.nip_ketua = 'NIP ketua harus 18 digit.';
    if (!formData.nama_admin.trim()) newErrors.nama_admin = 'Nama admin komunitas wajib diisi.';
    if (!formData.nip_admin || formData.nip_admin.length !== 18) newErrors.nip_admin = 'NIP admin harus 18 digit.';
    if (!thumbnailFile) newErrors.thumbnail = 'Thumbnail komunitas wajib diunggah.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        icon: 'warning',
        title: 'Formulir Belum Lengkap',
        text: 'Mohon periksa kembali kolom yang bertanda bintang merah (*).',
        confirmButtonColor: '#006A63'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const postData = new FormData();
      postData.append('nama_komunitas', formData.nama_komunitas);
      postData.append('nama_ketua', formData.nama_ketua);
      postData.append('nip_ketua', formData.nip_ketua);
      postData.append('nama_admin', formData.nama_admin);
      postData.append('nip_admin', formData.nip_admin);
      postData.append('rumpun_jabatan', formData.rumpun_jabatan);
      postData.append('jumlah_anggota', formData.jumlah_anggota);
      postData.append('deskripsi', formData.deskripsi || '');
      if (thumbnailFile) {
        postData.append('thumbnail', thumbnailFile);
      }

      const res = await api.post('/komunitas/register', postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire({
        icon: 'success',
        title: 'Pengajuan Berhasil!',
        text: res.data?.message || 'Komunitas Anda telah diajukan dan sedang menunggu verifikasi Admin BKPSDM.',
        confirmButtonColor: '#006A63'
      });

      // Reset form
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
      setThumbnailFile(null);
      setThumbnailPreview('');
      setErrors({});

      if (onSuccess) onSuccess();
    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Terjadi kesalahan saat mengajukan komunitas.';
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengajukan',
        text: serverMsg,
        confirmButtonColor: '#006A63'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredNames = availableNames.filter((item) =>
    item.nama_komunitas.toLowerCase().includes(nameFilterSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#006A63] to-[#1D315F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Ajukan Komunitas Baru</h3>
              <p className="text-xs text-teal-100/80">Daftarkan komunitas belajar untuk diverifikasi oleh BKPSDM</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Formulir */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-left">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nama Komunitas Master */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-[#1D315F] mb-1">
                Nama Komunitas (Master Jabatan Fungsional) <span className="text-red-500">*</span>
              </label>
              
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between cursor-pointer bg-gray-50/70 hover:bg-white transition-colors ${
                  errors.nama_komunitas ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                }`}
              >
                <span className={formData.nama_komunitas ? 'text-gray-900 font-semibold' : 'text-gray-400'}>
                  {formData.nama_komunitas || 'Pilih Nama Komunitas Tersedia...'}
                </span>
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
              </div>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto p-2">
                  <input
                    type="text"
                    value={nameFilterSearch}
                    onChange={(e) => setNameFilterSearch(e.target.value)}
                    placeholder="Ketik untuk mencari nama komunitas..."
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-1 focus:ring-[#006A63]"
                    autoFocus
                  />
                  <div className="divide-y divide-gray-100">
                    {filteredNames.length === 0 ? (
                      <div className="p-3 text-xs text-gray-400 text-center">Nama tidak ditemukan</div>
                    ) : (
                      filteredNames.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              nama_komunitas: item.nama_komunitas,
                              rumpun_jabatan: item.rumpun_jabatan || prev.rumpun_jabatan
                            }));
                            setIsDropdownOpen(false);
                            if (errors.nama_komunitas) setErrors((prev) => ({ ...prev, nama_komunitas: null }));
                          }}
                          className="p-2 hover:bg-teal-50/60 rounded-lg cursor-pointer text-xs flex items-center justify-between"
                        >
                          <span className="font-medium text-[#1D315F]">{item.nama_komunitas}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                            {item.rumpun_jabatan || 'JF'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              {errors.nama_komunitas && (
                <p className="text-[11px] text-red-500 mt-1">{errors.nama_komunitas}</p>
              )}
            </div>

            {/* Rumpun Jabatan & Jumlah Anggota */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1D315F] mb-1">
                  Rumpun Jabatan <span className="text-red-500">*</span>
                </label>
                <select
                  name="rumpun_jabatan"
                  value={formData.rumpun_jabatan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A63]"
                >
                  <option value="JF">Jabatan Fungsional (JF)</option>
                  <option value="JA">Jabatan Administrasi (JA)</option>
                  <option value="JPT">Jabatan Pimpinan Tinggi (JPT)</option>
                  <option value="JP">Jabatan Pelaksana (JP)</option>
                  <option value="UMUM">Umum Seluruh ASN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1D315F] mb-1">
                  Perkiraan Jumlah Anggota <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="jumlah_anggota"
                  min="1"
                  value={formData.jumlah_anggota}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A63]"
                />
              </div>
            </div>

            {/* Ketua Komunitas (NIP & Nama Auto-Fill) */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
              <span className="text-xs font-bold text-[#1D315F] block">Informasi Ketua Komunitas</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    NIP Ketua (18 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    value={formData.nip_ketua}
                    onChange={(e) => handleNipKetuaChange(e.target.value)}
                    placeholder="1985..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A63]"
                  />
                  {errors.nip_ketua && <p className="text-[10px] text-red-500 mt-1">{errors.nip_ketua}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Nama Lengkap Ketua <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_ketua"
                    value={formData.nama_ketua}
                    onChange={handleInputChange}
                    placeholder="Nama lengkap & gelar..."
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A63]"
                  />
                  {errors.nama_ketua && <p className="text-[10px] text-red-500 mt-1">{errors.nama_ketua}</p>}
                </div>
              </div>
            </div>

            {/* Admin Komunitas (NIP & Nama Auto-Fill) */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
              <span className="text-xs font-bold text-[#1D315F] block">Informasi Admin Komunitas</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    NIP Admin (18 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    value={formData.nip_admin}
                    onChange={(e) => handleNipAdminChange(e.target.value)}
                    placeholder="1992..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A63]"
                  />
                  {errors.nip_admin && <p className="text-[10px] text-red-500 mt-1">{errors.nip_admin}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Nama Lengkap Admin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_admin"
                    value={formData.nama_admin}
                    onChange={handleInputChange}
                    placeholder="Nama lengkap & gelar..."
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006A63]"
                  />
                  {errors.nama_admin && <p className="text-[10px] text-red-500 mt-1">{errors.nama_admin}</p>}
                </div>
              </div>
            </div>

            {/* Upload Thumbnail & Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-[#1D315F] mb-1">
                Foto Thumbnail Komunitas <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 text-gray-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{thumbnailFile ? 'Ganti Foto' : 'Pilih Foto (Max 2MB)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.thumbnail && <p className="text-[11px] text-red-500 mt-1">{errors.thumbnail}</p>}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-[#1D315F] mb-1">Deskripsi Singkat</label>
              <textarea
                name="deskripsi"
                rows={2}
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Jelaskan fokus pembelajaran atau ruang lingkup komunitas..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006A63]"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-[#006A63] hover:bg-[#00554E] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Kirim Usulan Komunitas</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
