import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Search,
  Calendar,
  Building2,
  UserCheck,
  Clock,
  ArrowRight,
  QrCode,
  FileCheck
} from 'lucide-react';
import logoImg from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';
import hiasanImg from '../assets/Hiasan.png';

export default function PublicCertificateVerification({ initialCode, onNavigate }) {
  const [code, setCode] = useState(initialCode || '');
  const [inputCode, setInputCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchVerification = async (targetCode) => {
    if (!targetCode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const cleanTarget = targetCode.trim();
      const res = await axios.get(`${apiUrl}/sertifikat/validasi/${encodeURIComponent(cleanTarget)}`);
      if (res.data?.is_valid && res.data?.data) {
        setCertData(res.data.data);
      } else {
        setErrorMsg('Data sertifikat tidak valid atau tidak ditemukan.');
        setCertData(null);
      }
    } catch (err) {
      console.error('Verification error:', err);
      const msg = err.response?.data?.message || 'Sertifikat tidak terdaftar atau tidak sah dalam pangkalan data BKPSDM Kabupaten Buleleng.';
      setErrorMsg(msg);
      setCertData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setInputCode(initialCode);
      fetchVerification(initialCode);
    } else {
      setLoading(false);
    }
  }, [initialCode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setCode(inputCode.trim());
    window.history.pushState({}, '', `/validasi-sertifikat/${encodeURIComponent(inputCode.trim())}`);
    fetchVerification(inputCode.trim());
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Navbar Resmi */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo Pemkab Buleleng" className="w-9 h-9 object-contain" />
            <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-9 h-9 object-contain" />
            <div>
              <div className="font-bold text-base sm:text-lg text-[#1D315F] leading-tight">
                Pemerintah Kabupaten Buleleng
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Badan Kepegawaian dan Pengembangan SDM (BKPSDM)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('landing');
                else window.location.href = '/';
              }}
              className="text-xs sm:text-sm font-semibold text-[#006A63] hover:text-[#00524C] hover:underline flex items-center gap-1"
            >
              Masuk Portal LMS <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div
        className="relative bg-[#1D315F] py-12 px-4 sm:px-6 lg:px-8 text-center text-white overflow-hidden"
        style={{ backgroundImage: `url(${hiasanImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#1D315F]/80 backdrop-blur-[2px]"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-4 border border-white/15">
            <ShieldCheck className="w-4 h-4" />
            Pangkalan Data Verifikasi Sertifikat Resmi
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Verifikasi Keaslian Sertifikat Digital
          </h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-xl mx-auto">
            Layanan validasi elektronik untuk memastikan sertifikat pelatihan dan kompetensi ASN diterbitkan secara sah oleh BKPSDM Kabupaten Buleleng.
          </p>

          {/* Form Pencarian Cepat */}
          <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Masukkan Nomor Sertifikat atau Kode Verifikasi..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white text-gray-800 rounded-lg text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#006A63]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#006A63] hover:bg-[#00534D] text-white font-semibold text-sm rounded-lg shadow-md transition-colors flex items-center gap-1.5"
            >
              Cek Keaslian
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="animate-spin w-12 h-12 border-4 border-[#006A63] border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-800">Memeriksa Keabsahan Dokumen...</h3>
            <p className="text-sm text-gray-500 mt-1">Menghubungkan ke Pangkalan Data Sertifikasi BKPSDM Buleleng</p>
          </div>
        ) : errorMsg ? (
          /* Tampilan Sertifikat Tidak Sah / Gagal */
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-red-200">
            <div className="bg-red-50 p-6 sm:p-8 border-b border-red-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-200 text-red-800 mb-1">
                  Sertifikat Tidak Sah
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-red-950">
                  Data Sertifikat Tidak Terdaftar
                </h2>
                <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                  <strong>Peringatan Keamanan:</strong> QR Code atau Nomor Sertifikat yang dipindai tidak cocok dengan arsip resmi. Pastikan Anda memindai kode QR dari berkas asli yang diunduh langsung dari sistem e-Learning BKPSDM Kabupaten Buleleng.
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center pt-4">
                Kode yang dipindai: <span className="font-mono font-semibold text-gray-700">{code || '-'}</span>
              </div>
            </div>
          </div>
        ) : certData ? (
          /* POP-UP / KARTU RESMI VALIDASI BERHASIL */
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-emerald-100 transition-all">
            {/* Header Pop-up Validasi Sukses */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-[#006A63] text-white p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                    <ShieldCheck className="w-10 h-10 text-emerald-200" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1.5 border border-emerald-300/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Dokumen Terverifikasi Asli
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      Sertifikat Sah & Terdaftar Resmi
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                      BKPSDM Pemerintah Kabupaten Buleleng
                    </p>
                  </div>
                </div>

                <div className="sm:text-right bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15">
                  <div className="text-[11px] text-emerald-200 uppercase font-semibold">Total Pemindaian</div>
                  <div className="text-lg font-extrabold text-white flex items-center sm:justify-end gap-1">
                    <FileCheck className="w-4 h-4 text-emerald-300" /> {certData.total_verifikasi} Kali
                  </div>
                </div>
              </div>
            </div>

            {/* Badan Data Sertifikat */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Nomor Surat Resmi */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nomor Sertifikat Resmi
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#1D315F] font-mono mt-0.5">
                    {certData.nomor_sertifikat}
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Diverifikasi pada: <strong>{certData.waktu_verifikasi_ini}</strong></span>
                </div>
              </div>

              {/* Rincian Peserta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-[#006A63]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <UserCheck className="w-4 h-4 text-[#006A63]" />
                    Penerima Sertifikat
                  </div>
                  <div className="text-base font-bold text-gray-900 leading-snug">
                    {certData.nama_lengkap}
                  </div>
                  <div className="text-xs text-gray-600 font-mono mt-1">
                    NIP: {certData.nip}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-[#006A63]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <Building2 className="w-4 h-4 text-[#006A63]" />
                    Unit Kerja / Instansi
                  </div>
                  <div className="text-sm font-semibold text-gray-900 leading-snug">
                    {certData.unit_kerja}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Pemerintah Kabupaten Buleleng
                  </div>
                </div>
              </div>

              {/* Rincian Pelatihan */}
              <div className="p-5 rounded-xl border border-teal-100 bg-teal-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">
                  <Award className="w-4 h-4 text-[#006A63]" />
                  Pelatihan Yang Diselesaikan
                </div>
                <div className="text-lg font-bold text-[#1D315F]">
                  "{certData.judul_pelatihan}"
                </div>

                <div className="mt-4 pt-4 border-t border-teal-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-700">
                  <div>
                    <span className="text-gray-500">Durasi Pelatihan:</span>{' '}
                    <strong className="text-[#006A63] font-bold">{certData.durasi_jp} Jam Pelajaran (JP)</strong>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-gray-500">Tanggal Terbit:</span>{' '}
                    <strong className="text-gray-900">{certData.tanggal_terbit}</strong>
                  </div>
                </div>
              </div>

              {/* Pejabat Penandatangan */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Disahkan Secara Elektronik Oleh
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-1">
                    {certData.pejabat_nama}
                  </div>
                  <div className="text-xs text-gray-600">
                    {certData.pejabat_jabatan} • NIP {certData.pejabat_nip}
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Status: Tervalidasi Resmi di Database
                </div>
              </div>

              {/* Info Keabsahan */}
              <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
                Pencatatan scan sertifikat ini telah otomatis disimpan ke tabel audit data kepegawaian BKPSDM Kabupaten Buleleng.
              </div>
            </div>
          </div>
        ) : (
          /* State Kosong */
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#006A63] flex items-center justify-center mx-auto mb-4 border border-teal-100">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Pindai QR Code Sertifikat Anda</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
              Arahkan kamera smartphone Anda ke QR Code pada sertifikat fisik atau PDF, atau ketikkan nomor sertifikat di kolom pencarian di atas untuk memeriksa keabsahan dokumen.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} BKPSDM Kabupaten Buleleng. Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
    </div>
  );
}
