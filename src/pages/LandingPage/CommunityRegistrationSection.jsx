import React, { useState } from 'react';
import { 
  Users, UserCheck, Award, Briefcase, Upload, Image as ImageIcon, 
  CheckCircle2, AlertCircle, X, Loader2, HelpCircle 
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
    jumlah_anggota: '',
    deskripsi: ''
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Filter angka saja untuk NIP
    if (name === 'nip_ketua' || name === 'nip_admin') {
      const numericVal = value.replace(/\D/g, '').slice(0, 18);
      setFormData(prev => ({ ...prev, [name]: numericVal }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
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

    // Validasi ukuran maks 2MB (2048 KB)
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
      newErrors.nama_komunitas = 'Nama komunitas wajib diisi.';
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

      const response = await api.post('/komunitas/register', payload, {
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
              Setelah disetujui (ACC) oleh Admin BKPSDM, komunitas ini akan otomatis tayang di Halaman Komunitas User.
            </p>
          </div>
        `,
        confirmButtonColor: '#006A63',
        confirmButtonText: 'Selesai'
      });

      // Reset form
      setFormData({
        nama_komunitas: '',
        nama_ketua: '',
        nip_ketua: '',
        nama_admin: '',
        nip_admin: '',
        rumpun_jabatan: 'JF',
        jumlah_anggota: '',
        deskripsi: ''
      });
      handleRemoveThumbnail();
      setErrors({});

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
              <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-100">
                <Users className="w-5 h-5 text-[#006A63]" />
                <h3 className="text-base sm:text-lg font-bold text-[#1D315F]">1. Informasi Dasar Komunitas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nama Komunitas */}
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-[#1D315F] mb-1.5">
                    Nama Komunitas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_komunitas"
                    value={formData.nama_komunitas}
                    onChange={handleInputChange}
                    placeholder="Contoh: Komunitas Inovasi Tata Kelola Digital Buleleng"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 focus:outline-none transition-colors ${
                      errors.nama_komunitas 
                        ? 'border-red-400 bg-red-50/40 focus:ring-1 focus:ring-red-400' 
                        : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#006A63] focus:ring-1 focus:ring-[#006A63]'
                    }`}
                  />
                  {errors.nama_komunitas && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.nama_komunitas}
                    </p>
                  )}
                </div>

                {/* Rumpun Jabatan */}
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
                  <p className="text-[11px] text-gray-400 mt-1">Pilih batasan keanggotaan berdasarkan rumpun jabatan.</p>
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
                    rows="3"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    placeholder="Jelaskan fokus pembelajaran, tujuan, dan ruang lingkup kegiatan komunitas ini..."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#006A63] focus:ring-1 focus:ring-[#006A63] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Pengurus (Ketua & Admin Komunitas) */}
            <div>
              <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-100">
                <Award className="w-5 h-5 text-[#006A63]" />
                <h3 className="text-base sm:text-lg font-bold text-[#1D315F]">2. Pengurus Komunitas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Ketua Komunitas Box */}
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/80 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#006A63]">
                    <Award className="w-4 h-4" />
                    <span>Ketua Komunitas</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Lengkap & Gelar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_ketua"
                      value={formData.nama_ketua}
                      onChange={handleInputChange}
                      placeholder="Contoh: Drs. Ketut Suparta, M.Si"
                      className={`w-full px-3.5 py-2 rounded-lg border text-sm text-gray-800 bg-white focus:outline-none transition-colors ${
                        errors.nama_ketua ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-200 focus:border-[#006A63]'
                      }`}
                    />
                    {errors.nama_ketua && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.nama_ketua}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      NIP Ketua (18 Digit) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nip_ketua"
                      maxLength="18"
                      value={formData.nip_ketua}
                      onChange={handleInputChange}
                      placeholder="198501012010011001"
                      className={`w-full px-3.5 py-2 rounded-lg border text-sm text-gray-800 bg-white focus:outline-none transition-colors font-mono ${
                        errors.nip_ketua ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-200 focus:border-[#006A63]'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      {errors.nip_ketua ? (
                        <span className="text-red-500">{errors.nip_ketua}</span>
                      ) : (
                        <span className="text-gray-400">Pastikan 18 digit angka NIP valid</span>
                      )}
                      <span className="text-gray-400">{formData.nip_ketua.length}/18</span>
                    </div>
                  </div>
                </div>

                {/* Admin Komunitas Box */}
                <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#006A63]">
                    <UserCheck className="w-4 h-4" />
                    <span>Admin Komunitas</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nama Lengkap Admin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_admin"
                      value={formData.nama_admin}
                      onChange={handleInputChange}
                      placeholder="Contoh: Putu Arya Pratama, S.Kom"
                      className={`w-full px-3.5 py-2 rounded-lg border text-sm text-gray-800 bg-white focus:outline-none transition-colors ${
                        errors.nama_admin ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-200 focus:border-[#006A63]'
                      }`}
                    />
                    {errors.nama_admin && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.nama_admin}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      NIP Admin (18 Digit) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nip_admin"
                      maxLength="18"
                      value={formData.nip_admin}
                      onChange={handleInputChange}
                      placeholder="199205152015021002"
                      className={`w-full px-3.5 py-2 rounded-lg border text-sm text-gray-800 bg-white focus:outline-none transition-colors font-mono ${
                        errors.nip_admin ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-gray-200 focus:border-[#006A63]'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      {errors.nip_admin ? (
                        <span className="text-red-500">{errors.nip_admin}</span>
                      ) : (
                        <span className="text-gray-400">Admin akan diberi hak kelola modul</span>
                      )}
                      <span className="text-gray-400">{formData.nip_admin.length}/18</span>
                    </div>
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
