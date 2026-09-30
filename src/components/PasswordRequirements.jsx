import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * Validasi ketat kata sandi:
 * 1. Minimal 8 karakter
 * 2. Kombinasi huruf besar (A-Z) dan huruf kecil (a-z)
 * 3. Mengandung minimal 1 angka (0-9)
 * 4. Mengandung minimal 1 simbol / karakter khusus (!@#$%^&* dll)
 * 5. Tidak mengandung NIP Anda (atau 8 digit terakhir NIP)
 * 6. Tidak sama dengan kata sandi lama (jika diberikan)
 */
export const validatePasswordStrict = (pwd = '', nip = '', oldPassword = '') => {
  const minLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const mixedCase = hasUpper && hasLower;
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

  const cleanNip = (nip || '').trim();
  const noNip = !cleanNip || (
    !pwd.includes(cleanNip) &&
    !(cleanNip.length >= 8 && pwd.includes(cleanNip.slice(-8)))
  );

  const notSameAsOld = !oldPassword || pwd !== oldPassword;

  const isValid = minLength && mixedCase && hasNumber && hasSymbol && noNip && notSameAsOld;

  const getFirstError = () => {
    if (!minLength) return 'Kata sandi minimal 8 karakter.';
    if (!mixedCase) return 'Kata sandi wajib memadukan huruf besar (A-Z) dan huruf kecil (a-z).';
    if (!hasNumber) return 'Kata sandi wajib mengandung minimal 1 angka (0-9).';
    if (!hasSymbol) return 'Kata sandi wajib mengandung minimal 1 simbol / karakter khusus (!@#$% dll).';
    if (!noNip) return 'Kata sandi tidak boleh memuat NIP Anda.';
    if (!notSameAsOld) return 'Kata sandi baru tidak boleh sama dengan kata sandi lama.';
    return '';
  };

  return {
    minLength,
    hasUpper,
    hasLower,
    mixedCase,
    hasNumber,
    hasSymbol,
    noNip,
    notSameAsOld,
    isValid,
    getFirstError,
  };
};

export const PasswordRequirementsList = ({ password = '', nip = '', oldPassword = '', className = '' }) => {
  const status = validatePasswordStrict(password, nip, oldPassword);

  const items = [
    { label: 'Minimal 8 karakter', valid: status.minLength },
    { label: 'Huruf besar & huruf kecil (A-Z, a-z)', valid: status.mixedCase },
    { label: 'Angka (0-9)', valid: status.hasNumber },
    { label: 'Simbol / Karakter khusus (!@#$%^&*)', valid: status.hasSymbol },
    ...(nip ? [{ label: 'Tidak memuat nomor NIP', valid: status.noNip }] : []),
    ...(oldPassword ? [{ label: 'Berbeda dari kata sandi lama', valid: status.notSameAsOld }] : []),
  ];

  return (
    <div className={`bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs ${className}`}>
      <p className="font-semibold text-slate-700 mb-2 flex items-center justify-between">
        <span>Ketentuan Kombinasi Kata Sandi:</span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
          status.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {status.isValid ? 'Kombinasi Kuat' : 'Belum Memenuhi'}
        </span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 transition-colors duration-200 ${
              item.valid ? 'text-emerald-700 font-medium' : 'text-slate-500'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                item.valid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {item.valid ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              )}
            </div>
            <span className="text-[11px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordRequirementsList;
