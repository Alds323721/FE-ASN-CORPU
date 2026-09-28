import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Camera, X, Lock, Eye, EyeOff, ArrowLeftRight, Check, Shield } from 'lucide-react';
import api from '../api/axios';
import userImg from '../assets/user.png';
import { logout, getUser, getUserRoles, getActiveRole, setActiveRole, canSwitchRole } from '../utils/auth';
import { useLanguage } from '../context/LanguageContext';

const ProfileDropdown = ({ onLogout }) => {
   const { t } = useLanguage();
   const [isOpen, setIsOpen] = useState(false);
   const [profileImage, setProfileImage] = useState(userImg);
   const [showImageModal, setShowImageModal] = useState(false);
   const [showPasswordModal, setShowPasswordModal] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   
   const user = getUser() || {};
   const userRoles = getUserRoles();
   const hasMultipleRoles = canSwitchRole();
   const currentActiveRole = getActiveRole();

   const roleLabels = {
     admin_bkpsdm: { label: 'Admin BKPSDM', badge: 'bg-red-50 text-red-700 border-red-200' },
     admin_komunitas: { label: 'Admin Komunitas', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
     peserta: { label: 'Peserta Pembelajaran', badge: 'bg-blue-50 text-blue-700 border-blue-200' }
   };

   const handleRoleSwitch = async (targetRole) => {
     if (targetRole === currentActiveRole) {
       setIsOpen(false);
       return;
     }

     if (!userRoles.includes(targetRole)) {
       alert('Akses Ditolak: Anda tidak diizinkan masuk ke peran ini.');
       return;
     }

     try {
       await api.post('/switch-role', { target_role: targetRole }).catch(() => {});
       setActiveRole(targetRole);
       setIsOpen(false);

       if (targetRole === 'admin_bkpsdm') {
         window.location.href = '/admin';
       } else if (targetRole === 'admin_komunitas') {
         window.location.href = '/admin-komunitas';
       } else {
         window.location.href = '/';
       }
     } catch (err) {
       console.error('Gagal beralih peran:', err);
     }
   };
   
   // Form state for passwords
   const [passwordStep, setPasswordStep] = useState(1);
   const [email, setEmail] = useState('');
   const [otp, setOtp] = useState('');
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [passwordError, setPasswordError] = useState('');
   const [passwordSuccess, setPasswordSuccess] = useState('');

   const dropdownRef = useRef(null);
   const fileInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

   const handleImageChange = (e) => {
     const file = e.target.files[0];
     if (file) {
       setIsLoading(true);
       const reader = new FileReader();
       reader.onloadend = () => {
         setProfileImage(reader.result);
         setIsLoading(false);
         setShowImageModal(false);
       };
       reader.readAsDataURL(file);
     }
   };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 overflow-hidden flex-shrink-0 hover:border-[#006A63] transition-colors focus:outline-none focus:ring-2 focus:ring-[#006A63] focus:ring-offset-2"
        >
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-[#1D315F] truncate">
                {user.nama_lengkap || JSON.parse(localStorage.getItem('user') || '{}').nama_lengkap || 'Budi Santoso'}
              </p>
              <p className="text-xs text-gray-500">
                NIP: {user.nip || JSON.parse(localStorage.getItem('user') || '{}').nip || '-'}
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleLabels[currentActiveRole]?.badge || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  <Shield className="w-3 h-3" />
                  Peran: {roleLabels[currentActiveRole]?.label || currentActiveRole}
                </span>
              </div>
            </div>

            {/* OPSI BERALIH PERAN: HANYA TAMPIL JIKA USER DISET LEBIH DARI 1 PERAN OLEH ADMIN-BKPSDM */}
            {hasMultipleRoles && (
              <div className="px-3 py-2 border-b border-gray-100 bg-teal-50/50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-1.5 px-1">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-teal-700" />
                  <span>Beralih Peran:</span>
                </div>
                <div className="space-y-1">
                  {userRoles.map((role) => {
                    const isActive = role === currentActiveRole;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleSwitch(role)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'text-gray-700 hover:bg-white hover:text-teal-800'
                        }`}
                      >
                        <span>{roleLabels[role]?.label || role}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setShowImageModal(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm font-semibold text-[#1D315F] hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#006A63]" />
              {t('profile.changePhoto')}
            </button>
            
            <button
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordStep(1);
                setEmail(JSON.parse(localStorage.getItem('user') || '{}').email || '');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm font-semibold text-[#1D315F] hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#006A63]" />
              {t('profile.changePassword')}
            </button>
            
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout(onLogout);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {t('profile.logout')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for changing profile image */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1D315F]">Ganti Foto Profil</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 overflow-hidden relative">
                {profileImage ? (
                  <img src={profileImage} alt="Current profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#006A63] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-6 py-2.5 bg-[#006A63] text-white rounded-md text-sm font-bold hover:bg-[#00534D] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Pilih Foto Baru
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Format: JPG, PNG, atau GIF. Maksimal 5MB
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowImageModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-[#1D315F] rounded-md text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1D315F]">Ubah Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

             <form onSubmit={async (e) => {
                 e.preventDefault();
                 setPasswordError('');
                 setPasswordSuccess('');
                 
                 if (passwordStep === 1) {
                   setIsPasswordSubmitting(true);
                   try {
                     await api.post('/change-password/request-otp', { email });
                     setPasswordSuccess('OTP telah dikirim ke email Anda!');
                     setTimeout(() => {
                       setPasswordSuccess('');
                       setPasswordStep(2);
                       setIsPasswordSubmitting(false);
                     }, 1500);
                   } catch (err) {
                     setIsPasswordSubmitting(false);
                     setPasswordError(err.response?.data?.message || 'Terjadi kesalahan saat meminta OTP');
                   }
                   return;
                 }
                 
                 if (newPassword !== confirmPassword) {
                   setPasswordError('Konfirmasi password tidak cocok');
                   return;
                 }
                 
                 setIsPasswordSubmitting(true);
                 try {
                   await api.post('/change-password/verify', {
                     otp,
                     password_sebelumnya: currentPassword,
                     password_baru: newPassword,
                     password_baru_confirmation: confirmPassword
                   });
                   setPasswordSuccess('Password berhasil diubah!');
                   setTimeout(() => {
                     setIsPasswordSubmitting(false);
                     setShowPasswordModal(false);
                     setPasswordStep(1);
                     setShowCurrentPassword(false);
                     setShowNewPassword(false);
                     setShowConfirmPassword(false);
                     setCurrentPassword('');
                     setNewPassword('');
                     setConfirmPassword('');
                     setOtp('');
                     setPasswordSuccess('');
                   }, 1500);
                 } catch (err) {
                   setIsPasswordSubmitting(false);
                   setPasswordError(err.response?.data?.message || 'Terjadi kesalahan saat memverifikasi');
                 }
               }} className="space-y-4">
               
               {passwordError && (
                 <div className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">
                   {passwordError}
                 </div>
               )}
               {passwordSuccess && (
                 <div className="bg-green-100 text-green-600 p-2 rounded text-sm text-center">
                   {passwordSuccess}
                 </div>
               )}

               {passwordStep === 1 ? (
                 <>
                   <div>
                     <label className="block text-sm font-semibold text-[#1D315F] mb-2">
                       Email Akun
                     </label>
                     <input
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       placeholder="Masukkan email Anda"
                       className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#006A63] outline-none text-sm font-semibold"
                     />
                     <p className="text-xs text-gray-500 mt-2">
                       Kode OTP akan dikirimkan ke email ini untuk keperluan verifikasi keamanan.
                     </p>
                   </div>
                 </>
               ) : (
                 <>
                   <div>
                     <label className="block text-sm font-semibold text-[#1D315F] mb-2">
                       Kode OTP (6 digit)
                     </label>
                     <input
                       type="text"
                       value={otp}
                       onChange={(e) => setOtp(e.target.value)}
                       required
                       placeholder="Masukkan kode OTP dari email"
                       className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#006A63] outline-none text-sm font-semibold tracking-widest"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-[#1D315F] mb-2">
                       Password Saat Ini
                     </label>
                     <div className="relative">
                       <input
                         type={showCurrentPassword ? "text" : "password"}
                         value={currentPassword || ''}
                         onChange={(e) => setCurrentPassword(e.target.value)}
                         autoComplete="current-password"
                         required
                         placeholder="Masukkan password saat ini"
                         className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#006A63] outline-none text-sm font-semibold"
                       />
                       <button
                         type="button"
                         onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1D315F] transition-colors"
                       >
                         {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-[#1D315F] mb-2">
                       Password Baru
                     </label>
                     <div className="relative">
                       <input
                         type={showNewPassword ? "text" : "password"}
                         value={newPassword || ''}
                         onChange={(e) => setNewPassword(e.target.value)}
                         autoComplete="new-password"
                         required
                         placeholder="Masukkan password baru"
                         className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#006A63] outline-none text-sm font-semibold"
                       />
                       <button
                         type="button"
                         onClick={() => setShowNewPassword(!showNewPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1D315F] transition-colors"
                       >
                         {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-[#1D315F] mb-2">
                       Konfirmasi Password Baru
                     </label>
                     <div className="relative">
                       <input
                         type={showConfirmPassword ? "text" : "password"}
                         value={confirmPassword || ''}
                         onChange={(e) => setConfirmPassword(e.target.value)}
                         autoComplete="new-password"
                         required
                         placeholder="Konfirmasi password baru"
                         className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#006A63] outline-none text-sm font-semibold"
                       />
                       <button
                         type="button"
                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1D315F] transition-colors"
                       >
                         {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                     </div>
                   </div>
                 </>
               )}

               <div className="flex gap-3 pt-2">
                 <button
                   type="button"
                   onClick={() => setShowPasswordModal(false)}
                   className="flex-1 px-4 py-2.5 border border-gray-300 text-[#1D315F] rounded-md text-sm font-bold hover:bg-gray-50 transition-colors"
                 >
                   Batal
                 </button>
                 <button
                   type="submit"
                   disabled={isPasswordSubmitting}
                   className="flex-1 px-4 py-2.5 bg-[#006A63] text-white rounded-md text-sm font-bold hover:bg-[#00534D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {isPasswordSubmitting ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       {passwordStep === 1 ? 'Mengirim...' : 'Menyimpan...'}
                     </>
                   ) : (
                     passwordStep === 1 ? 'Kirim OTP' : 'Simpan'
                   )}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileDropdown;
