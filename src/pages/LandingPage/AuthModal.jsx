import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { setAuth } from '../../utils/auth';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../../assets/ASN-CORPU.png';
import { PasswordRequirementsList, validatePasswordStrict } from '../../components/PasswordRequirements';
import ReCaptcha from '../../components/ReCaptcha';
import {
  Clock,
  ChevronRight,
  Eye,
  EyeOff,
  User,
  Lock,
  Check,
  Mail,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export default function AuthModal({
  showAuth,
  setShowAuth,
  onLogin
}) {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [resetUniqueId, setResetUniqueId] = useState('');
  const [resetNip, setResetNip] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [otpLockoutCountdown, setOtpLockoutCountdown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [loginCaptchaToken, setLoginCaptchaToken] = useState('');
  const loginRecaptchaRef = useRef(null);
  const [resetCaptchaToken, setResetCaptchaToken] = useState('');
  const resetRecaptchaRef = useRef(null);

  useEffect(() => {
    const savedLockoutUntil = sessionStorage.getItem('bkpsdm_login_lockout_until');
    if (savedLockoutUntil) {
      const remaining = Math.ceil((parseInt(savedLockoutUntil, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setLockoutCountdown(remaining);
      } else {
        sessionStorage.removeItem('bkpsdm_login_lockout_until');
      }
    }

    const savedOtpLockoutUntil = sessionStorage.getItem('bkpsdm_otp_lockout_until');
    if (savedOtpLockoutUntil) {
      const remaining = Math.ceil((parseInt(savedOtpLockoutUntil, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setOtpLockoutCountdown(remaining);
      } else {
        sessionStorage.removeItem('bkpsdm_otp_lockout_until');
      }
    }
  }, []);

  useEffect(() => {
    let timer;
    if (lockoutCountdown > 0) {
      timer = setTimeout(() => {
        setLockoutCountdown((prev) => {
          if (prev <= 1) {
            sessionStorage.removeItem('bkpsdm_login_lockout_until');
            setRemainingAttempts(null);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [lockoutCountdown]);

  useEffect(() => {
    let timer;
    if (otpLockoutCountdown > 0) {
      timer = setTimeout(() => {
        setOtpLockoutCountdown((prev) => {
          if (prev <= 1) {
            sessionStorage.removeItem('bkpsdm_otp_lockout_until');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpLockoutCountdown]);

  const formatCountdown = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (lockoutCountdown > 0) return;
    if (!nip.trim()) {
      setError('Silakan isi NIP Anda terlebih dahulu.');
      loginRecaptchaRef.current?.reset();
      setLoginCaptchaToken('');
      return;
    }
    if (!password) {
      setError('Silakan isi kata sandi Anda terlebih dahulu.');
      loginRecaptchaRef.current?.reset();
      setLoginCaptchaToken('');
      return;
    }
    if (!loginCaptchaToken) {
      setError('Silakan centang verifikasi "Saya bukan robot" terlebih dahulu.');
      loginRecaptchaRef.current?.reset();
      return;
    }
    setError('');
    setResetSuccess('');
    setLoading(true);
    try {
      const response = await api.post('/login', {
        nip,
        password,
        recaptcha_token: loginCaptchaToken,
      });
      sessionStorage.removeItem('bkpsdm_login_lockout_until');
      setRemainingAttempts(null);
      setAuth(response.data.access_token, response.data.user);
      onLogin();
    } catch (err) {
      loginRecaptchaRef.current?.reset();
      setLoginCaptchaToken('');
      const resData = err.response?.data;
      const status = err.response?.status;

      if (status === 429) {
        const retryAfter = Number(resData?.retry_after) || 180;
        setLockoutCountdown(retryAfter);
        sessionStorage.setItem('bkpsdm_login_lockout_until', String(Date.now() + retryAfter * 1000));
        setRemainingAttempts(0);
        setError(resData?.message || 'Terlalu banyak percobaan gagal (3 kali). Silakan tunggu sebelum mencoba kembali.');
      } else {
        if (typeof resData?.remaining_attempts === 'number') {
          setRemainingAttempts(resData.remaining_attempts);
        }
        setError(resData?.message || 'Login gagal, periksa kredensial Anda');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resetLoading || resendCount >= 3 || otpLockoutCountdown > 0) return;
    setResetError('');
    setResetLoading(true);
    try {
      const response = await api.post('/forgot-password/resend', {
        unique_id: resetUniqueId,
        nip: resetNip,
      });
      if (response.data?.unique_id) {
        setResetUniqueId(response.data.unique_id);
      }
      if (typeof response.data?.resent === 'number') {
        setResendCount(response.data.resent);
      } else {
        setResendCount((prev) => prev + 1);
      }
      setServerMessage(response.data?.message || 'Kode OTP baru telah dikirim ke email Anda.');
      setResendCountdown(60);
    } catch (err) {
      const resData = err.response?.data;
      if (typeof resData?.resent === 'number') {
        setResendCount(resData.resent);
      }
      if (err.response?.status === 429) {
        const retryAfter = Number(resData?.retry_after) || 1800;
        setOtpLockoutCountdown(retryAfter);
        sessionStorage.setItem('bkpsdm_otp_lockout_until', String(Date.now() + retryAfter * 1000));
        setResetError(resData?.message || 'Batas pengiriman ulang OTP telah tercapai (3 kali). Akses dibatasi selama 30 menit.');
      } else {
        setResetError(resData?.message || 'Gagal mengirim ulang kode OTP.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  if (!showAuth) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E8EDF4]/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row w-full max-w-[950px] bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[auto] md:min-h-[520px] lg:min-h-[550px] m-auto">

        {/* Left Panel */}
        <div className="w-full md:w-[42%] bg-[#1D315F] p-6 sm:p-8 md:p-8 lg:p-10 flex flex-col justify-between text-white order-2 md:order-1">
          <div>
            <div className="flex items-center gap-2.5 mb-8">
              <img src={logoImg} alt="Logo BKPSDM" className="w-7 sm:w-8 h-7 sm:h-8 object-contain" />
              <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-7 sm:w-8 h-7 sm:h-8 object-contain" />
              <span className="font-semibold text-sm sm:text-base">Buleleng ASN Corpu</span>
            </div>

            <div className="mb-6">
              <h3 className="text-[10px] sm:text-xs font-semibold tracking-widest text-white/60 uppercase mb-2">Visi Platform</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-white/90 font-semibold">
                Mewujudkan ASN Buleleng yang kompetitif, inovatif, dan berdaya saing tinggi melalui pendidikan digital yang terintegrasi dengan sistem kepegawaian.
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
          <div className="animate-in fade-in duration-300 w-full">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-[#1D315F]">Masuk ke Akun Anda</h2>
            <p className="text-xs sm:text-sm mb-6 leading-relaxed font-semibold text-gray-500">
              Gunakan NIP dan kata sandi akun LMS Anda.
            </p>

            {resetSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm mb-5 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {lockoutCountdown > 0 && (
              <div className="bg-red-50 border border-red-300 text-red-700 p-3 sm:p-4 rounded-lg text-xs sm:text-sm mb-5 flex items-start gap-3 shadow-sm">
                <Clock className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-bold text-red-800">Akun Dikunci Sementara</p>
                  <p className="mt-1 text-xs text-red-600 leading-relaxed">
                    Terlalu banyak percobaan login yang gagal. Silakan tunggu{' '}
                    <span className="font-mono font-bold text-red-800 text-sm">{formatCountdown(lockoutCountdown)}</span>{' '}
                    sebelum dapat mencoba kembali.
                  </p>
                </div>
              </div>
            )}

            {remainingAttempts !== null && remainingAttempts > 0 && !lockoutCountdown && (
              <div className="bg-amber-50 border border-amber-300 text-amber-800 p-2.5 sm:p-3 rounded-lg text-xs mb-5 flex items-start gap-2">
                <span className="font-bold text-amber-900">Perhatian:</span>
                <span>NIP atau kata sandi tidak cocok. Sisa kesempatan: <b className="text-amber-900">{remainingAttempts} kali</b> sebelum akun terkunci.</span>
              </div>
            )}

            {error && !lockoutCountdown && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm mb-5">
                <p className="font-medium">{error}</p>
                {remainingAttempts === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (nip) setResetNip(nip);
                      setShowForgotPassword(true);
                      setResetStep('email');
                      setError('');
                      setResetSuccess('');
                      setLoginCaptchaToken('');
                      setResetCaptchaToken('');
                      loginRecaptchaRef.current?.reset();
                      resetRecaptchaRef.current?.reset();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#1D315F] hover:underline bg-white px-2.5 py-1.5 rounded border border-red-200 shadow-sm cursor-pointer"
                  >
                    Buka Menu Lupa Kata Sandi &rarr;
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
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${resetStep === 'email' ? 'bg-[#1D315F] text-white' : 'bg-gray-100 text-gray-500'}`}>1. Data Akun</span>
                    <span className="text-gray-300 text-xs">&rarr;</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${resetStep === 'otp' ? 'bg-[#1D315F] text-white' : 'bg-gray-100 text-gray-500'}`}>2. Verifikasi OTP</span>
                    <span className="text-gray-300 text-xs">&rarr;</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${resetStep === 'password' ? 'bg-[#1D315F] text-white' : 'bg-gray-100 text-gray-500'}`}>3. Sandi Baru</span>
                  </div>
                  <h3 className="text-[#1D315F] font-bold text-lg mb-1">
                    {resetStep === 'email' && 'Buat / Atur Ulang Kata Sandi'}
                    {resetStep === 'otp' && 'Verifikasi Kode OTP'}
                    {resetStep === 'password' && 'Buat Kata Sandi Baru'}
                  </h3>
                  <p className="text-gray-500 text-xs font-semibold">
                    {resetStep === 'email' && 'Masukkan NIP dan email yang terdaftar di data kepegawaian untuk menerima kode OTP verifikasi.'}
                    {resetStep === 'otp' && 'Masukkan 6 digit kode OTP yang telah dikirimkan ke email Anda. Kode berlaku 5 menit.'}
                    {resetStep === 'password' && 'Buat kata sandi baru yang kuat untuk akun LMS Anda.'}
                  </p>
                </div>

                {resetError && (
                  <div className="bg-red-100 text-red-600 p-2.5 rounded text-xs sm:text-sm mb-4 text-center font-medium">
                    {resetError}
                  </div>
                )}

                {/* STEP 1: Input NIP & Email */}
                {resetStep === 'email' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (otpLockoutCountdown > 0) {
                      setResetError(`Akses OTP sedang dibatasi selama 30 menit. Silakan tunggu ${formatCountdown(otpLockoutCountdown)}.`);
                      resetRecaptchaRef.current?.reset();
                      setResetCaptchaToken('');
                      return;
                    }
                    if (!resetNip.trim() || !resetEmail.trim()) {
                      setResetError('Silakan isi NIP dan email Anda terlebih dahulu.');
                      resetRecaptchaRef.current?.reset();
                      setResetCaptchaToken('');
                      return;
                    }
                    if (!resetCaptchaToken) {
                      setResetError('Silakan centang verifikasi "Saya bukan robot" terlebih dahulu.');
                      resetRecaptchaRef.current?.reset();
                      return;
                    }
                    setResetError('');
                    setResetLoading(true);
                    try {
                      const response = await api.post('/forgot-password', {
                        nip: resetNip,
                        email: resetEmail,
                        recaptcha_token: resetCaptchaToken,
                      });
                      if (response.data?.unique_id) {
                        setResetUniqueId(response.data.unique_id);
                      }
                      setServerMessage(response.data?.message || 'Kode OTP telah dikirimkan ke email Anda.');
                      setResetStep('otp');
                      setResendCount(0);
                      setResendCountdown(60);
                    } catch (err) {
                      resetRecaptchaRef.current?.reset();
                      setResetCaptchaToken('');
                      const resData = err.response?.data;
                      if (err.response?.status === 429) {
                        const retryAfter = Number(resData?.retry_after) || 1800;
                        setOtpLockoutCountdown(retryAfter);
                        sessionStorage.setItem('bkpsdm_otp_lockout_until', String(Date.now() + retryAfter * 1000));
                        setResetError(resData?.message || 'Batas pengiriman OTP telah tercapai. Akses dibatasi selama 30 menit.');
                      } else {
                        setResetError(resData?.message || 'NIP atau email tidak ditemukan di pangkalan data kami.');
                      }
                    } finally {
                      setResetLoading(false);
                    }
                  }}>
                    {otpLockoutCountdown > 0 && (
                      <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg text-xs mb-4 text-center font-medium flex flex-col items-center gap-1 shadow-sm">
                        <div className="flex items-center gap-1.5 font-bold text-red-800 text-xs sm:text-sm">
                          <Clock className="w-4 h-4 text-red-600 animate-pulse" />
                          <span>Akses OTP Dibatasi (30 Menit)</span>
                        </div>
                        <p className="text-[11px] text-red-600">
                          Telah mencapai batas 3 kali percobaan salah atau pengiriman OTP. Silakan tunggu:
                        </p>
                        <span className="font-mono text-base font-extrabold text-red-800 tracking-wider bg-red-100 px-3 py-0.5 rounded border border-red-300 mt-1">
                          {formatCountdown(otpLockoutCountdown)}
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">NIP</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <input
                          type="text"
                          name="reset-nip"
                          autoComplete="username"
                          value={resetNip}
                          onChange={(e) => setResetNip(e.target.value)}
                          required
                          disabled={resetLoading || otpLockoutCountdown > 0}
                          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
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
                          name="reset-email"
                          autoComplete="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          disabled={resetLoading || otpLockoutCountdown > 0}
                          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
                          placeholder="contoh: user@bkpsdm.go.id"
                        />
                      </div>
                    </div>
                    {/* reCAPTCHA v2 Checkbox */}
                    <div className="mb-4 flex flex-col items-center justify-center">
                      <ReCaptcha
                        ref={resetRecaptchaRef}
                        onChange={setResetCaptchaToken}
                        onExpired={() => setResetCaptchaToken('')}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading || otpLockoutCountdown > 0}
                      className="w-full bg-[#1D315F] text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-[#152747] transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md mb-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
                        setResetCaptchaToken('');
                        setLoginCaptchaToken('');
                        resetRecaptchaRef.current?.reset();
                        loginRecaptchaRef.current?.reset();
                      }}
                      className="w-full bg-white text-gray-600 border border-gray-300 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm cursor-pointer"
                    >
                      Kembali ke Login
                    </button>
                  </form>
                )}

                {/* STEP 2: Input & Verify OTP */}
                {resetStep === 'otp' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (otpLockoutCountdown > 0) {
                      setResetError(`Akses OTP sedang dibatasi selama 30 menit. Silakan tunggu ${formatCountdown(otpLockoutCountdown)}.`);
                      return;
                    }
                    setResetError('');
                    setResetLoading(true);
                    try {
                      const response = await api.post('/forgot-password/verify', {
                        unique_id: resetUniqueId,
                        nip: resetNip,
                        otp: resetOtp,
                      });
                      if (response.data?.unique_id) {
                        setResetUniqueId(response.data.unique_id);
                      }
                      setResetStep('password');
                    } catch (err) {
                      if (err.response?.status === 429) {
                        const retryAfter = Number(err.response?.data?.retry_after) || 1800;
                        setOtpLockoutCountdown(retryAfter);
                        sessionStorage.setItem('bkpsdm_otp_lockout_until', String(Date.now() + retryAfter * 1000));
                        setResetError(err.response?.data?.message || 'Anda telah 3 kali salah memasukkan kode OTP. Akses dibatasi selama 30 menit.');
                      } else {
                        setResetError(err.response?.data?.message || 'Kode OTP tidak valid atau kedaluwarsa.');
                      }
                    } finally {
                      setResetLoading(false);
                    }
                  }}>
                    {otpLockoutCountdown > 0 && (
                      <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg text-xs mb-4 text-center font-medium flex flex-col items-center gap-1 shadow-sm">
                        <div className="flex items-center gap-1.5 font-bold text-red-800 text-xs sm:text-sm">
                          <Clock className="w-4 h-4 text-red-600 animate-pulse" />
                          <span>Akses OTP Dibatasi (30 Menit)</span>
                        </div>
                        <p className="text-[11px] text-red-600">
                          Telah mencapai batas 3 kali percobaan salah atau pengiriman OTP. Silakan tunggu:
                        </p>
                        <span className="font-mono text-base font-extrabold text-red-800 tracking-wider bg-red-100 px-3 py-0.5 rounded border border-red-300 mt-1">
                          {formatCountdown(otpLockoutCountdown)}
                        </span>
                      </div>
                    )}

                    {serverMessage && !otpLockoutCountdown && (
                      <div className="bg-teal-50 border border-teal-200 text-teal-800 p-2.5 rounded-lg text-xs mb-4">
                        <p className="font-semibold">{serverMessage}</p>
                        <p className="mt-1 text-[11px] text-teal-700">
                          Periksa kotak masuk (inbox) atau folder spam email Anda.
                        </p>
                      </div>
                    )}

                    <div className="mb-5">
                      <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 text-center">MASUKKAN KODE OTP (6 DIGIT)</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <input
                          type="text"
                          name="reset-otp"
                          autoComplete="one-time-code"
                          value={resetOtp}
                          onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          maxLength={6}
                          autoFocus
                          disabled={resetLoading || otpLockoutCountdown > 0}
                          className="w-full pl-10 sm:pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-lg text-gray-800 placeholder-gray-400 text-center tracking-[8px] font-mono font-bold disabled:bg-gray-100 disabled:text-gray-400"
                          placeholder="------"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className="text-gray-500">Tidak menerima kode?</span>
                        {otpLockoutCountdown > 0 ? (
                          <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-semibold text-[11px]">
                            Dibatasi ({formatCountdown(otpLockoutCountdown)})
                          </span>
                        ) : resendCount >= 3 ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                            Batas kirim ulang habis (3x)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={resendCountdown > 0 || resetLoading || resendCount >= 3 || otpLockoutCountdown > 0}
                            className="text-teal-700 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                          >
                            {resendCountdown > 0 ? `Kirim ulang (${resendCountdown}s)` : `Kirim ulang kode (${resendCount}/3)`}
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading || resetOtp.length !== 6 || otpLockoutCountdown > 0}
                      className="w-full bg-[#1D315F] text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-[#152747] transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md mb-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {resetLoading ? 'Memverifikasi...' : 'Verifikasi OTP'} <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep('email');
                        setResendCount(0);
                        setResetError('');
                      }}
                      className="w-full bg-white text-gray-600 border border-gray-300 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm cursor-pointer"
                    >
                      Kembali ke Input Email/NIP
                    </button>
                  </form>
                )}

                {/* STEP 3: Input Password Baru */}
                {resetStep === 'password' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setResetError('');

                    const check = validatePasswordStrict(newPassword, resetNip);
                    if (!check.isValid) {
                      setResetError(check.getFirstError() || 'Kata sandi belum memenuhi kombinasi ketat.');
                      return;
                    }

                    if (newPassword !== resetConfirmPassword) {
                      setResetError('Konfirmasi kata sandi tidak cocok.');
                      return;
                    }

                    setResetLoading(true);
                    try {
                      const response = await api.post('/reset-password', {
                        unique_id: resetUniqueId,
                        nip: resetNip,
                        otp: resetOtp,
                        password_baru: newPassword,
                        password_baru_confirmation: resetConfirmPassword
                      });

                      const savedNip = resetNip;
                      sessionStorage.removeItem('bkpsdm_otp_lockout_until');
                      setOtpLockoutCountdown(0);
                      setResetSuccess(response.data?.message || 'Kata sandi berhasil dibuat. Silakan masuk dengan kata sandi baru Anda.');
                      setShowForgotPassword(false);
                      setResetStep('email');
                      setResetUniqueId('');
                      setResetEmail('');
                      setResetOtp('');
                      setNewPassword('');
                      setResetConfirmPassword('');
                      setNip(savedNip);
                      setPassword('');
                    } catch (err) {
                      if (err.response?.status === 429) {
                        setResetError('Terlalu banyak percobaan. Coba lagi beberapa saat.');
                      } else if (err.response?.data?.errors) {
                        const firstErr = Object.values(err.response.data.errors).flat()[0];
                        setResetError(firstErr || 'Validasi kata sandi gagal.');
                      } else {
                        setResetError(err.response?.data?.message || 'Terjadi kesalahan saat mereset kata sandi.');
                      }
                    } finally {
                      setResetLoading(false);
                    }
                  }}>
                    <div className="mb-4">
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                      <PasswordRequirementsList
                        password={newPassword}
                        nip={resetNip}
                        className="mt-2"
                      />
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full bg-[#36B1A0] text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-[#2A8F81] transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md mb-3 disabled:opacity-50 cursor-pointer"
                    >
                      {resetLoading ? 'Menyimpan...' : 'Simpan Kata Sandi'} <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetStep('otp')}
                      className="w-full bg-white text-gray-600 border border-gray-300 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm cursor-pointer"
                    >
                      Kembali ke Input OTP
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4 sm:mb-5">
                  <label className="block text-[#1D315F] text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">NIP</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <input
                      type="text"
                      name="nip"
                      autoComplete="username"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      required
                      disabled={lockoutCountdown > 0}
                      className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      name="password"
                      value={password || ''}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={lockoutCountdown > 0}
                      className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FCDC1] focus:border-[#3FCDC1] text-sm text-gray-700 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Masukkan kata sandi akun"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
                  <button
                    type="button"
                    onClick={() => {
                      if (nip) setResetNip(nip);
                      setShowForgotPassword(true);
                      setResetStep('email');
                      setError('');
                      setResetSuccess('');
                      setLoginCaptchaToken('');
                      setResetCaptchaToken('');
                      loginRecaptchaRef.current?.reset();
                      resetRecaptchaRef.current?.reset();
                    }}
                    className="text-xs sm:text-sm text-[#1D315F] font-semibold hover:underline cursor-pointer"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>

                {lockoutCountdown > 0 ? (
                  <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg text-xs mb-4 text-left shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold text-red-700 mb-1">
                      <Clock className="w-4 h-4 text-red-600 animate-pulse" />
                      <span>Akun Dikunci Sementara (3x Gagal)</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Kesempatan 3 kali memasukkan kata sandi telah habis. Silakan tunggu{' '}
                      <span className="font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                        {formatCountdown(lockoutCountdown)}
                      </span>{' '}
                      sebelum dapat mencoba memasukkan kata sandi kembali.
                    </p>
                  </div>
                ) : remainingAttempts !== null && remainingAttempts > 0 ? (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded-lg text-xs mb-4 flex items-center justify-between text-left">
                    <span className="font-medium">NIP atau kata sandi salah.</span>
                    <span className="font-bold bg-amber-200/80 px-2 py-0.5 rounded text-amber-950 shrink-0">
                      Sisa: {remainingAttempts}x kesempatan
                    </span>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-600 p-2 rounded text-xs mb-4 text-center">
                    {error}
                  </div>
                ) : null}

                {/* Google reCAPTCHA v2 Checkbox */}
                <div className="mb-4 flex flex-col items-center justify-center">
                  <ReCaptcha
                    ref={loginRecaptchaRef}
                    onChange={setLoginCaptchaToken}
                    onExpired={() => setLoginCaptchaToken('')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || lockoutCountdown > 0}
                  className="w-full bg-[#36B1A0] text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-[#2A8F81] transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {lockoutCountdown > 0 ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Tunggu ({formatCountdown(lockoutCountdown)})
                    </>
                  ) : loading ? (
                    'Memproses...'
                  ) : (
                    <>Masuk ke Platform<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></>
                  )}
                </button>

                {/* Info Box untuk Pengguna Baru */}
                <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800 leading-relaxed text-left">
                  Pertama kali masuk? Klik <button type="button" onClick={() => { setShowForgotPassword(true); setError(''); setResetSuccess(''); setLoginCaptchaToken(''); setResetCaptchaToken(''); loginRecaptchaRef.current?.reset(); resetRecaptchaRef.current?.reset(); }} className="font-bold underline text-teal-900 hover:text-teal-700 cursor-pointer">Lupa Kata Sandi</button> untuk membuat kata sandi Anda dengan kode OTP yang dikirim ke email terdaftar.
                </div>

                <p className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-4 sm:mt-5 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Khusus Pegawai ASN & Tim Pembelajaran Terdaftar
                </p>
              </form>
            )}
          </div>

          <button
            onClick={() => {
              setShowAuth(false);
              setError('');
              setResetSuccess('');
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
            className="mt-3 sm:mt-4 text-xs font-semibold text-gray-400 hover:text-gray-600 text-center transition-colors cursor-pointer"
          >
            ← Kembali ke beranda
          </button>
        </div>
      </div>
    </div>
  );
}
