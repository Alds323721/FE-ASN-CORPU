import { useState, useEffect } from 'react';
import api from '../api/axios';
import { setAuth } from '../utils/auth';
import logoImg from '../assets/logo-removebg-preview 1.png';
import heroImg from '../assets/BG_BKPSDM.jpg';
import {
  Search,
  Users,
  HandHeart,
  Monitor,
  Landmark,
  Scale,
  Banknote,
  UserPlus,
  ShieldCheck,
  Clock,
  BookOpen,
  Star,
  TrendingUp,
  Award,
  CalendarCheck,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Eye,
  EyeOff,
  User,
  Lock,
  Check,
  Loader2,
} from 'lucide-react';

const Navbar = ({ onLoginClick }) => (
  <nav className="fixed top-0 left-0 w-full z-50 bg-white border-t-[5px] border-[#0099FF] shadow-sm flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
    <div className="flex items-center gap-2 sm:gap-3">
      <img src={logoImg} alt="Logo BKPSDM" className="w-8 sm:w-10 object-contain" />
      <span className="font-bold text-lg sm:text-xl text-[#1D315F] tracking-wide">Buleleng ASN Corpu</span>
    </div>
    <button
      onClick={onLoginClick}
      className="border border-gray-400 text-[#4B5563] font-semibold py-1.5 sm:py-2 px-3 sm:px-5 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer text-xs sm:text-sm shadow-sm"
    >
      Daftar / Login
    </button>
  </nav>
);

const Hero = ({ showAuth, setShowAuth, authMode, setAuthMode, onLogin, onAuthClick }) => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [resetNip, setResetNip] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Register Form States
  const [regNip, setRegNip] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [pegawaiData, setPegawaiData] = useState(null);

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    setRegError('');
    setRegSuccess('');

    if (!regNip.trim()) {
      setRegError('Silakan masukkan NIP Anda terlebih dahulu.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Silakan masukkan alamat email Gmail Anda.');
      return;
    }
    if (!regEmail.toLowerCase().endsWith('@gmail.com')) {
      setRegError('Alamat email wajib menggunakan domain @gmail.com.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.post('/register/request-otp', {
        nip: regNip.trim(),
        email: regEmail.trim(),
      });
      setOtpSent(true);
      setOtpCountdown(60);
      setRegSuccess(res.data.message || 'Kode OTP telah dikirim ke kotak masuk Gmail Anda.');
      if (res.data.pegawai) {
        setPegawaiData(res.data.pegawai);
      }
    } catch (err) {
      setRegError(err.response?.data?.message || 'Gagal mengirim kode OTP. Periksa kembali NIP dan Email Anda.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regNip.trim() || !regEmail.trim()) {
      setRegError('NIP dan Email wajib diisi.');
      return;
    }
    if (!regOtp.trim()) {
      setRegError('Silakan masukkan 6 digit kode OTP verifikasi.');
      return;
    }
    if (!regPassword) {
      setRegError('Silakan buat kata sandi baru Anda.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('Kata sandi minimal 8 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!agreeTerms) {
      setRegError('Anda harus menyetujui Ketentuan Layanan BKPSDM.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await api.post('/register', {
        nip: regNip.trim(),
        email: regEmail.trim(),
        otp: regOtp.trim(),
        password: regPassword,
        password_confirmation: regConfirmPassword,
      });

      if (res.data.access_token) {
        setAuth(res.data.access_token, res.data.user);
        onLogin();
      } else {
        setNip(regNip.trim());
        setAuthMode('login');
      }
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registrasi gagal. Periksa kembali data yang Anda masukkan.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/login', { nip, password });
      setAuth(response.data.access_token, response.data.user);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, periksa kredensial Anda');
    } finally {
      setLoading(false);
    }
  };

  if (!showAuth) {
    return (
      <div className="relative h-[650px] sm:h-[700px] flex flex-col justify-center text-left">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1D315F]/50 z-10"></div>
          <img
            src={heroImg}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col md:flex-row justify-between items-center mt-10">

          {/* Left Content */}
          <div className="w-full md:w-1/2 text-white mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Inter'] font-semibold text-white mb-4 md:mb-6 tracking-tight">BKPSDM</h1>
            <p className="text-sm md:text-base lg:text-lg text-white/90 leading-relaxed max-w-xl mb-6">
              Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Kabupaten Buleleng bertugas membantu Bupati melaksanakan fungsi penunjang urusan pemerintahan di bidang kepegawaian serta pendidikan dan pelatihan.
            </p>
            <div className="inline-block mt-4">
              <button onClick={onAuthClick || (() => setShowAuth(true))} className="bg-[#10B981] text-white font-bold py-3 px-10 text-sm sm:text-base rounded-full hover:bg-[#0d9668] transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-1">
                Daftar / Login
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="w-full md:w-5/12 bg-white/10 backdrop-blur-sm border border-white/20 p-6 md:p-8 rounded-2xl shadow-xl">
            <h3 className="text-white font-bold text-lg md:text-xl mb-5 border-b border-white/20 pb-3">Bidang Layanan</h3>
            <ul className="space-y-4">
              {[
                'Bidang Penilaian Kinerja Aparatur dan Promosi (PKAP)',
                'Bidang Pengadaan, Pemberhentian dan Informasi (PPI)',
                'Bidang Mutasi',
                'Bidang Pengembangan Kompetensi Aparatur (PKA)'
              ].map((bidang, idx) => (
                <li key={idx} className="flex items-start gap-3 text-white/90 text-sm md:text-base">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3FCDC1]/20 border border-[#3FCDC1]/50 text-[#3FCDC1] flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{bidang}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Jam Pelayanan (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-20 hidden md:block text-right text-white/80 text-xs bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-white/10">
          <p className="font-semibold text-[#3FCDC1] mb-1"><Clock className="inline w-3.5 h-3.5 mr-1" /> Jam Pelayanan</p>
          <p>Senin - Kamis: 07.30 - 16.00</p>
          <p>Jumat: 07.00 - 13.00</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E8EDF4]/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row w-full max-w-[950px] bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[auto] md:min-h-[520px] lg:min-h-[550px] m-auto">

        {/* Left Panel */}
        <div className="w-full md:w-[42%] bg-[#1D315F] p-6 sm:p-8 md:p-8 lg:p-10 flex flex-col justify-between text-white order-2 md:order-1">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img src={logoImg} alt="Logo BKPSDM" className="w-7 sm:w-8 object-contain" />
              <span className="font-semibold text-sm sm:text-base">Buleleng ASN Corpu</span>
            </div>

            <div className="mb-6">
              <h3 className="text-[10px] sm:text-xs font-semibold tracking-widest text-white/60 uppercase mb-2">Visi Platform</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-white/90 font-semibold">
                "Mewujudkan ASN Buleleng yang kompetitif, inovatif, dan berdaya saing tinggi melalui pendidikan digital yang terintegrasi dengan sistem kepegawaian."
              </p>
            </div>

            <hr className="border-white/10 my-4" />

            <div>
              <h3 className="text-[10px] sm:text-xs font-semibold tracking-widest text-white/60 uppercase mb-3">Misi Utama</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-white/90">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#3FCDC1] text-[#1D315F] flex items-center justify-center text-[9px] sm:text-[10px] font-semibold mt-0.5">1</span>
                  <span className="text-xs sm:text-sm">Menyediakan akses belajar fleksibel untuk seluruh ASN</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#3FCDC1] text-[#1D315F] flex items-center justify-center text-[9px] sm:text-[10px] font-semibold mt-0.5">2</span>
                  <span className="text-xs sm:text-sm">Integrasi data kompetensi dengan sistem kepegawaian</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#3FCDC1] text-[#1D315F] flex items-center justify-center text-[9px] sm:text-[10px] font-semibold mt-0.5">3</span>
                  <span className="text-xs sm:text-sm">Sertifikasi otomatis dan terverifikasi instansi</span>
                </li>
              </ul>
            </div>
          </div>

          <hr className="border-white/10 mt-6 mb-3" />
          <p className="text-[10px] text-white/40">© 2026 BKPSDM. Hak Cipta Dilindungi.</p>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[58%] p-6 sm:p-8 md:p-8 lg:p-12 flex flex-col justify-center order-1 md:order-2">
          {authMode === 'register' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5 text-[#1D315F]">Aktivasi & Registrasi Akun</h2>
                <p className="text-xs sm:text-sm leading-relaxed font-medium text-gray-500">
                  Lengkapi data NIP, Email Gmail, dan buat kata sandi untuk mendaftar akun e-learning ASN.
                </p>
              </div>

              {regError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm mb-4">
                  {regError}
                </div>
              )}

              {regSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm mb-4">
                  {regSuccess}
                </div>
              )}

              {pegawaiData && (
                <div className="bg-teal-50/70 border border-teal-200 p-2.5 rounded-lg mb-4 text-xs text-teal-800">
                  <span className="font-bold">ASN Terverifikasi:</span> {pegawaiData.nama_lengkap} ({pegawaiData.unit_kerja})
                </div>
              )}

              <form onSubmit={handleRegisterSubmit}>
                {/* NIP */}
                <div className="mb-3.5 sm:mb-4">
                  <label className="block text-[#1D315F] text-[10px] sm:text-xs font-bold mb-1.5 uppercase tracking-wide">NIP (Nomor Induk Pegawai)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <input
                      type="text"
                      value={regNip}
                      onChange={(e) => setRegNip(e.target.value)}
                      autoComplete="username"
                      required
                      className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-xs sm:text-sm text-gray-700 placeholder-gray-400 font-medium bg-gray-50/50"
                      placeholder="Masukkan 18 digit NIP Anda"
                    />
                  </div>
                </div>

                {/* Email Gmail */}
                <div className="mb-3.5 sm:mb-4">
                  <label className="block text-[#1D315F] text-[10px] sm:text-xs font-bold mb-1.5 uppercase tracking-wide">Email (Gmail)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-xs sm:text-sm text-gray-700 placeholder-gray-400 font-medium bg-gray-50/50"
                      placeholder="contoh: nama@gmail.com"
                    />
                  </div>
                </div>

                {/* Kode OTP */}
                <div className="mb-3.5 sm:mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[#1D315F] text-[10px] sm:text-xs font-bold uppercase tracking-wide">Kode OTP Verifikasi</label>
                    <span className="text-[10px] text-gray-400 font-medium">Berlaku 10 menit</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <input
                        type="text"
                        value={regOtp}
                        onChange={(e) => setRegOtp(e.target.value)}
                        autoComplete="one-time-code"
                        required
                        maxLength={6}
                        className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-xs sm:text-sm text-gray-700 placeholder-gray-400 font-medium tracking-widest bg-gray-50/50"
                        placeholder="6 digit OTP"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading || otpCountdown > 0}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 border border-[#3FCDC1] text-[#006A63] bg-[#E8F8F5] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#3FCDC1] hover:text-white transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengirim...</span>
                        </>
                      ) : otpCountdown > 0 ? (
                        <span>Kirim Ulang ({otpCountdown}s)</span>
                      ) : (
                        <span>{otpSent ? 'Kirim Ulang OTP' : 'Kirim OTP'}</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[#1D315F] text-[10px] sm:text-xs font-bold mb-1.5 uppercase tracking-wide">Kata Sandi Baru</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword || ''}
                        onChange={(e) => setRegPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="w-full pl-3 pr-9 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-xs sm:text-sm text-gray-700 placeholder-gray-400 font-medium bg-gray-50/50"
                        placeholder="Min. 8 karakter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#1D315F] text-[10px] sm:text-xs font-bold mb-1.5 uppercase tracking-wide">Ulangi Kata Sandi</label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword || ''}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="w-full pl-3 pr-9 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-xs sm:text-sm text-gray-700 placeholder-gray-400 font-medium bg-gray-50/50"
                        placeholder="Konfirmasi sandi"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="mb-4 sm:mb-5 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#3FCDC1] focus:ring-[#3FCDC1]"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-500 font-medium cursor-pointer">
                    Saya menyetujui Ketentuan Layanan & Kebijakan E-Learning BKPSDM
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-[#36B1A0] text-white font-bold py-2.5 sm:py-3 rounded-lg hover:bg-[#2A8F81] transition-colors text-sm flex items-center justify-center gap-2 shadow-md mb-4 disabled:opacity-60 cursor-pointer"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs sm:text-sm font-medium text-gray-500 text-center">
                  Sudah memiliki akun aktif?{' '}
                  <button type="button" onClick={() => setAuthMode('login')} className="text-[#3FCDC1] font-bold hover:underline cursor-pointer">
                    Masuk di sini
                  </button>
                </p>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300 w-full">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-[#1D315F]">Masuk ke Akun Anda</h2>
              <p className="text-xs sm:text-sm mb-6 leading-relaxed font-semibold text-gray-500">
                Gunakan Nomor Induk Pegawai (NIP) dan kata sandi yang telah terdaftar di sistem.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm mb-5">
                  <p>{error}</p>
                  {error.toLowerCase().includes('registrasi') && (
                    <button
                      type="button"
                      onClick={() => {
                        setRegNip(nip);
                        setAuthMode('register');
                      }}
                      className="mt-2 text-xs font-bold text-[#006A63] bg-teal-100 hover:bg-teal-200 px-3 py-1 rounded transition-colors inline-block cursor-pointer"
                    >
                      Daftar Akun Baru Sekarang &rarr;
                    </button>
                  )}
                </div>
              )}

          {loading ? (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 sm:h-11 w-full bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
              <div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 sm:h-11 w-full bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-11 sm:h-12 w-full bg-[#3FCDC1]/30 rounded-lg animate-pulse flex items-center justify-center gap-2 mt-2">
                <Loader2 className="w-4 h-4 text-[#006A63] animate-spin" />
                <span className="text-sm font-semibold text-[#006A63]">Memproses...</span>
              </div>
              <div className="h-3 w-44 sm:w-56 bg-gray-100 rounded animate-pulse mt-2"></div>
            </div>
          ) : showForgotPassword ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6">
                <h3 className="text-[#1D315F] font-bold text-lg mb-1">Lupa Kata Sandi?</h3>
                <p className="text-gray-500 text-xs font-semibold">
                  {resetStep === 'email'
                    ? 'Masukkan email yang terdaftar untuk menerima kode OTP.'
                    : 'Masukkan kode OTP yang dikirimkan ke email Anda dan kata sandi baru.'}
                </p>
              </div>

              {resetError && (
                <div className="bg-red-100 text-red-600 p-2 rounded text-sm mb-4 text-center">
                  {resetError}
                </div>
              )}

              {resetStep === 'email' ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setResetError('');
                  setResetLoading(true);
                  try {
                    await api.post('/forgot-password', { nip: resetNip, email: resetEmail });
                    setResetStep('otp');
                  } catch (err) {
                    setResetError(err.response?.data?.message || 'Terjadi kesalahan saat meminta OTP');
                  } finally {
                    setResetLoading(false);
                  }
                }}>
                  <div className="mb-4">
                    <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">NIP</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <input
                        type="text"
                        value={resetNip}
                        onChange={(e) => setResetNip(e.target.value)}
                        autoComplete="username"
                        required
                        className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400"
                        placeholder="Masukkan 18 digit NIP Anda"
                      />
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">ALAMAT EMAIL</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        autoComplete="email"
                        required
                        className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400"
                        placeholder="contoh: user@bkpsdm.go.id"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-[#1D315F] text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-[#152747] transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md mb-3 disabled:opacity-50"
                  >
                    {resetLoading ? 'Mengirim...' : 'Kirim Kode OTP'} <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetError('');
                      setResetNip('');
                      setResetEmail('');
                    }}
                    className="w-full bg-white text-gray-600 border border-gray-300 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    Kembali ke Login
                  </button>
                </form>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setResetError('');

                  if (newPassword !== resetConfirmPassword) {
                    setResetError('Konfirmasi password tidak cocok');
                    return;
                  }

                  setResetLoading(true);
                  try {
                    await api.post('/reset-password', {
                      nip: resetNip,
                      otp: resetOtp,
                      password_baru: newPassword,
                      password_baru_confirmation: resetConfirmPassword
                    });

                    alert('Password berhasil direset! Silakan login dengan password baru Anda.');
                    setShowForgotPassword(false);
                    setResetStep('email');
                    setResetEmail('');
                    setResetNip('');
                    setResetOtp('');
                    setNewPassword('');
                    setResetConfirmPassword('');
                  } catch (err) {
                    setResetError(err.response?.data?.message || 'Terjadi kesalahan saat mereset password');
                  } finally {
                    setResetLoading(false);
                  }
                }}>
                  <div className="mb-4">
                    <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">KODE OTP</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <input
                        type="text"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        autoComplete="one-time-code"
                        required
                        maxLength={6}
                        className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400 text-center tracking-widest font-bold"
                        placeholder="123456"
                      />
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">KATA SANDI BARU</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword || ''}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400"
                        placeholder="Masukkan kata sandi baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">KONFIRMASI KATA SANDI</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={resetConfirmPassword || ''}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400"
                        placeholder="Konfirmasi kata sandi baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-[#36B1A0] text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-[#2A8F81] transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md mb-3 disabled:opacity-50"
                  >
                    {resetLoading ? 'Menyimpan...' : 'Reset Kata Sandi'} <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetStep('email')}
                    className="w-full bg-white text-gray-600 border border-gray-300 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    Kembali
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4 sm:mb-5">
                <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">NIP / USERNAME</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    autoComplete="username"
                    required
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400"
                    placeholder="Masukkan 18 digit NIP Anda"
                  />
                </div>
              </div>

              <div className="mb-4 sm:mb-5">
                <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">KATA SANDI</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password || ''}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400"
                    placeholder="Masukkan kata sandi akun"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setRemember(!remember)}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${remember ? 'bg-[#1D315F] border-[#1D315F]' : 'border-gray-300 bg-white'}`}
                  >
                    {remember && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-600">Ingat sesi saya</span>
                </label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs sm:text-sm text-[#1D315F] font-semibold hover:underline">
                  Lupa Kata Sandi?
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-2 rounded text-xs mb-4 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#36B1A0] text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-[#2A8F81] transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                Masuk ke Platform <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-4 sm:mt-5 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Khusus Pegawai ASN & Tim Pembelajaran Terdaftar
              </p>
            </form>
          )}
            </div>
          )}

          {authMode === 'login' && (
            <button
              onClick={() => {
                setShowAuth(false);
                setError('');
                setNip('');
                setPassword('');
                setShowForgotPassword(false);
                setResetStep('email');
                setResetError('');
                setResetNip('');
                setResetEmail('');
                setResetOtp('');
                setNewPassword('');
                setResetConfirmPassword('');
              }}
              className="mt-3 sm:mt-4 text-xs font-semibold text-gray-400 hover:text-gray-600 text-center transition-colors"
            >
              ← Kembali ke beranda
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const FeaturesBanner = () => (
  <div className="bg-[#1D315F] text-white py-6 relative z-20 shadow-xl">
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 px-6 divide-y divide-white/10 md:divide-y-0 md:divide-x">

      <div className="flex items-center gap-5 justify-start md:justify-center py-5 md:py-2 px-4">
        <div className="bg-white/10 p-3.5 rounded-full flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-[#3FCDC1]" />
        </div>
        <p className="text-[14px] text-gray-200 font-medium">Pembelajaran Berbasis Progres</p>
      </div>

      <div className="flex items-center gap-5 justify-start md:justify-center py-5 md:py-2 px-4">
        <div className="bg-white/10 p-3.5 rounded-full flex-shrink-0">
          <Award className="w-5 h-5 text-[#3FCDC1]" />
        </div>
        <p className="text-[14px] text-gray-200 font-medium">Tercatat di sistem kepegawaian</p>
      </div>

      <div className="flex items-center gap-5 justify-start md:justify-center py-5 md:py-2 px-4">
        <div className="bg-white/10 p-3.5 rounded-full flex-shrink-0">
          <CalendarCheck className="w-5 h-5 text-[#3FCDC1]" />
        </div>
        <p className="text-[14px] text-gray-200 font-medium">Akses tak terbatas untuk ASN</p>
      </div>

    </div>
  </div>
);

const CategoryCard = ({ icon: Icon, title, count }) => (
  <div className="bg-white border border-[#BBC9C7] rounded-md p-6 md:p-8 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-[#3FCDC1] transition-all cursor-pointer group">
    <div className="bg-[#3FCDC1] text-[#00534D] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 md:mb-5 shadow-sm group-hover:scale-110 group-hover:bg-[#00534D] group-hover:text-[#3FCDC1] transition-all duration-300">
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
    </div>
    <h3 className="font-bold text-[#1D315F] text-xs md:text-[13px] mb-2">{title}</h3>
    <p className="text-[10px] md:text-[11px] text-gray-500 font-medium">{count} Pelatihan</p>
  </div>
);

const Categories = () => {
  const categories = [
    { icon: Users, title: 'Manajemen Kepemimpinan', count: 42 },
    { icon: HandHeart, title: 'Pelayanan Publik', count: 38 },
    { icon: Monitor, title: 'Teknologi & Informasi', count: 56 },
    { icon: Landmark, title: 'Tata Kelola Pemerintahan', count: 29 },
    { icon: Scale, title: 'Hukum & Kebijakan', count: 21 },
    { icon: Banknote, title: 'Keuangan Negara', count: 45 },
    { icon: UserPlus, title: 'Pengembangan Diri', count: 62 },
    { icon: ShieldCheck, title: 'Kesehatan & Keselamatan', count: 24 },
  ];

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto bg-white">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] mb-2 md:mb-3">Komunitas & Kategori Pelatihan</h2>
        <p className="text-gray-500 text-xs sm:text-sm px-4">Temukan berbagai topik pelatihan yang relevan dengan bidang<br className="hidden sm:block" />tugas dan fungsi Anda di pemerintahan.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {categories.map((cat, idx) => (
          <CategoryCard key={idx} {...cat} />
        ))}
      </div>
    </section>
  );
};

const CourseCard = ({ image, category, title, instructor, jpl, modules, rating }) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="relative h-44">
      <img src={image} alt={title} className="w-full h-full object-cover" />
      <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded text-[11px] font-bold text-[#1D315F] shadow-sm">
        {category}
      </div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <h3 className="font-bold text-[#1D315F] text-[15px] leading-snug line-clamp-2 mb-4 flex-1">{title}</h3>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex-shrink-0">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor}`} alt={instructor} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#1D315F]">{instructor}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-5 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-gray-400" /> {jpl} JPL
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <BookOpen className="w-3.5 h-3.5 text-gray-400" /> {modules} Modul
        </div>
        <div className="flex items-center gap-1 text-[#F59E0B] font-bold">
          <Star className="w-3.5 h-3.5 fill-current" /> {rating}
        </div>
      </div>

      <button className="w-full py-2.5 border border-[#006A63] text-[#006A63] bg-[#FFFFFF] rounded-md text-[13px] font-bold hover:bg-[#006A63] hover:text-white transition-colors">
        Mulai Belajar
      </button>
    </div>
  </div>
);

const PopularCourses = () => {
  const courses = [
    {
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      category: "Tata Kelola",
      title: "Manajemen Digitalisasi Pelayanan Publik Aparatur",
      instructor: "Dr. Budi Santoso, M.Si",
      jpl: 24,
      modules: 6,
      rating: 4.8
    },
    {
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
      category: "Kepemimpinan",
      title: "Kepemimpinan Transformasional di Era Digital",
      instructor: "Dra. Siti Aminah, MPA",
      jpl: 32,
      modules: 8,
      rating: 4.9
    },
    {
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop",
      category: "Keuangan",
      title: "Teknis Penyusunan Anggaran Kinerja Berbasis Hasil",
      instructor: "Ir. Ahmad Wahyudi, MM",
      jpl: 18,
      modules: 5,
      rating: 4.7
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-[#EFF5F3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] mb-2">Pelatihan Terpopuler</h2>
            <p className="text-gray-500 text-xs sm:text-sm">Ikuti pelatihan yang paling banyak diminati oleh rekan-rekan ASN lainnya.</p>
          </div>
          <a href="#" className="text-[#3FCDC1] text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline">
            Lihat Semua Pelatihan <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {courses.map((course, idx) => (
            <CourseCard key={idx} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsSection = () => {
  const news = [
    {
      title: "APEL PAGI, SATUKAN LANGKAH",
      date: "07 September 2026",
      image: "https://bkpsdm.bulelengkab.go.id/uploads/konten/thumbnail/28_apel-pagi-satukan-langkah_2026-09-07-08-35-21.jpeg",
      url: "https://bkpsdm.bulelengkab.go.id/informasi/detail/berita/28_apel-pagi-satukan-langkah"
    },
    {
      title: "BKPSDM Buleleng Ikut Aksi Bersih Lingkungan",
      date: "04 September 2026",
      image: "https://bkpsdm.bulelengkab.go.id/uploads/konten/thumbnail/76_bkpsdm-buleleng-ikut-aksi-bersih-lingkungan_2026-09-04-08-31-45.jpeg",
      url: "https://bkpsdm.bulelengkab.go.id/informasi/detail/berita/76_bkpsdm-buleleng-ikut-aksi-bersih-lingkungan"
    },
    {
      title: "Rekonsiliasi Data Peserta Tapera 2026",
      date: "03 September 2026",
      image: "https://bkpsdm.bulelengkab.go.id/uploads/konten/thumbnail/82_rekonsiliasi-data-peserta-tapera-2026_08-44-08.jpeg",
      url: "https://bkpsdm.bulelengkab.go.id/informasi/detail/berita/82_rekonsiliasi-data-peserta-tapera-2026"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-[#E8EDF4] px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] mb-2 md:mb-3">Berita Terbaru</h2>
          <p className="text-gray-500 text-xs sm:text-sm px-4">Ikuti informasi dan kegiatan terbaru dari BKPSDM Kabupaten Buleleng.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs text-gray-500 font-semibold mb-2">{item.date}</p>
                <h3 className="text-sm md:text-base font-bold text-[#1D315F] leading-snug mb-4 line-clamp-2">{item.title}</h3>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2.5 border border-[#006A63] text-[#006A63] rounded-md font-bold text-[13px] hover:bg-[#006A63] hover:text-white transition-colors">
                    Baca Berita
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { num: 1, title: 'Login dengan NIP', desc: 'Gunakan NIP dan kata sandi sistem kepegawaian Anda untuk masuk secara aman.' },
    { num: 2, title: 'Pilih Pelatihan', desc: 'Eksplorasi katalog dan pilih kursus yang sesuai dengan kebutuhan pengembangan Anda.' },
    { num: 3, title: 'Belajar Mandiri', desc: 'Ikuti materi, kerjakan kuis, dan selesaikan modul sesuai dengan waktu yang Anda miliki.' },
    { num: 4, title: 'Dapatkan Sertifikat', desc: 'Unduh sertifikat digital yang otomatis terintegrasi dengan riwayat kompetensi kepegawaian.' },
  ];

  return (
    <section className="py-12 md:py-24 px-4 sm:px-6 max-w-6xl mx-auto bg-white">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-xl md:text-2xl font-bold text-[#1D315F] mb-2 md:mb-3">Cara Kerja Platform</h2>
        <p className="text-gray-500 text-xs sm:text-sm px-4">Langkah mudah untuk mulai meningkatkan kompetensi Anda melalui platform BKPSDM Pintar.</p>
      </div>
      <div className="relative">
        {/* Connecting Line */}
        <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-[1px] bg-gray-200 z-0"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1D315F] text-white flex items-center justify-center font-bold text-base md:text-lg mb-4 md:mb-6 shadow-lg ring-4 md:ring-8 ring-white">
                {step.num}
              </div>
              <h3 className="font-bold text-[#1D315F] text-sm md:text-[14px] mb-2 md:mb-3">{step.title}</h3>
              <p className="text-xs md:text-[12px] text-gray-500 leading-relaxed max-w-[220px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onFooterLinkClick }) => (
  <footer className="bg-[#EAEFF4] pt-16 pb-8 border-t border-gray-200">
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
      <div className="md:col-span-5 pr-8">
        <div className="flex items-center gap-3 mb-6">
          <img src={logoImg} alt="Logo BKPSDM" className="w-8 object-contain" />
          <span className="font-semibold text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
        </div>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
          Platform Digital ASN untuk pengembangan kompetensi<br />dan peningkatan kapasitas secara berkelanjutan.
        </p>
        <p className="text-[11px] text-gray-500">
          © 2026 BKPSDM. Hak Cipta Dilindungi Undang-Undang. Platform Digital ASN.
        </p>
      </div>

      <div className="md:col-span-3">
        <h4 className="font-bold text-[#1D315F] text-[14px] mb-6">Tautan Cepat</h4>
        <ul className="text-[13px] text-gray-600 space-y-3 font-medium">
          <li><a href="#" onClick={(e) => { e.preventDefault(); onFooterLinkClick('courses'); }} className="hover:text-[#006A63] transition-colors">Pelatihan</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onFooterLinkClick('community'); }} className="hover:text-[#006A63] transition-colors">Komunitas</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onFooterLinkClick('help-center'); }} className="hover:text-[#006A63] transition-colors">Bantuan</a></li>
        </ul>
      </div>

      <div className="md:col-span-4">
        <h4 className="font-bold text-[#1D315F] text-[14px] mb-6">Kontak Kami</h4>
        <ul className="text-[13px] text-gray-600 space-y-4">
          <li className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-[#3FCDC1] mt-0.5 flex-shrink-0" />
            <span className="font-medium">support@bkpsdm-pintar.go.id</span>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-[#3FCDC1] mt-0.5 flex-shrink-0" />
            <span className="font-medium">(021) 123-4567 (Jam Kerja)</span>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#3FCDC1] mt-0.5 flex-shrink-0" />
            <span className="font-medium leading-relaxed">Gedung Kepegawaian Lt. 3, Jl. Protokol<br />No. 1, Jakarta</span>
          </li>
        </ul>
      </div>
    </div>
  </footer>
);

export default function LandingPage({ onLogin, onNavigate }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [intendedRoute, setIntendedRoute] = useState('dashboard');

  const handleAuthClick = (route = 'dashboard') => {
    setIntendedRoute(route);
    setAuthMode('register');
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] bg-white">
      <Navbar onLoginClick={() => handleAuthClick('dashboard')} />
      <main className="flex-grow pt-12 sm:pt-14">
        <Hero showAuth={showAuth} setShowAuth={setShowAuth} authMode={authMode} setAuthMode={setAuthMode} onLogin={() => onLogin(intendedRoute)} onAuthClick={() => handleAuthClick('dashboard')} />
        <FeaturesBanner />
        <Categories />
        <PopularCourses />
        <NewsSection />
        <HowItWorks />
      </main>
      <Footer onFooterLinkClick={handleAuthClick} />
    </div>
  );
}
