import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { RotateCw } from 'lucide-react';

/**
 * Komponen Google reCAPTCHA v2 (Checkbox "Saya bukan robot")
 * Dirancang khusus dan kompatibel penuh dengan React 18/19 & Vite.
 * Kebal terhadap re-render parent: mengetik di form tidak akan menghilangkan atau me-reset captcha.
 */
const ReCaptcha = forwardRef(({ onChange, onExpired, onError, className = '' }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Simpan callbacks di ref agar stabil dan tidak memicu useEffect re-run saat parent re-render (misal saat mengetik input)
  const callbacksRef = useRef({ onChange, onExpired, onError });
  useEffect(() => {
    callbacksRef.current = { onChange, onExpired, onError };
  });

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  // Fungsi internal untuk render widget
  const executeRender = () => {
    if (!containerRef.current || !window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
      return false;
    }

    // Jika widget sudah terpasang, jangan render ulang
    if (widgetIdRef.current !== null) {
      setIsReady(true);
      setIsRendered(true);
      return true;
    }

    try {
      containerRef.current.innerHTML = '';
      const id = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => {
          callbacksRef.current.onChange?.(token);
        },
        'expired-callback': () => {
          callbacksRef.current.onExpired?.();
          callbacksRef.current.onChange?.('');
        },
        'error-callback': () => {
          callbacksRef.current.onError?.();
          callbacksRef.current.onChange?.('');
        }
      });

      widgetIdRef.current = id;
      setIsReady(true);
      setIsRendered(true);
      return true;
    } catch (err) {
      if (String(err?.message || '').includes('already been rendered')) {
        setIsReady(true);
        setIsRendered(true);
        return true;
      }
      return false;
    }
  };

  const handleReset = () => {
    callbacksRef.current.onChange?.('');

    if (widgetIdRef.current !== null && window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
        return;
      } catch (e) {
        widgetIdRef.current = null;
      }
    }

    // Fallback jika reset gagal
    if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
      window.grecaptcha.ready(() => {
        executeRender();
      });
    }
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      handleReset();
    },
    getResponse: () => {
      if (widgetIdRef.current !== null && window.grecaptcha && typeof window.grecaptcha.getResponse === 'function') {
        try {
          return window.grecaptcha.getResponse(widgetIdRef.current);
        } catch (e) {
          return '';
        }
      }
      return '';
    },
    reload: () => {
      widgetIdRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
      setIsReady(false);
      setIsRendered(false);
      if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
        window.grecaptcha.ready(executeRender);
      }
    }
  }));

  // Effect ini HANYA berjalan saat komponen pertama kali mount / unmount atau jika siteKey berubah
  // SANGAT PENTING: Jangan masukkan callback props agar pengetikan user di form tidak memicu re-mount!
  useEffect(() => {
    let isMounted = true;
    let poller = null;

    const tryInit = () => {
      if (!isMounted) return;

      if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
        window.grecaptcha.ready(() => {
          if (!isMounted) return;
          const ok = executeRender();
          if (ok && poller) {
            clearInterval(poller);
            poller = null;
          }
        });
      }
    };

    // Script injection
    const SCRIPT_ID = 'google-recaptcha-v2-script';
    let script = document.getElementById(SCRIPT_ID);

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        tryInit();
      };
      document.head.appendChild(script);
    } else {
      tryInit();
    }

    let attempts = 0;
    poller = setInterval(() => {
      attempts++;
      if (widgetIdRef.current !== null || attempts > 30) {
        clearInterval(poller);
        poller = null;
      } else {
        tryInit();
      }
    }, 250);

    return () => {
      isMounted = false;
      if (poller) clearInterval(poller);
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  return (
    <div className={`recaptcha-wrapper flex flex-col items-center justify-center my-2 ${className}`}>
      <div className="relative min-h-[78px] flex items-center justify-center">
        <div ref={containerRef} className="flex items-center justify-center" />
        {!isReady && (
          <div className="flex items-center justify-center bg-gray-50/90 rounded border border-gray-200 px-6 py-4 text-[11px] text-gray-500 gap-2 animate-pulse min-w-[300px]">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>Memuat verifikasi CAPTCHA...</span>
          </div>
        )}
      </div>
      {isRendered && (
        <div className="flex items-center justify-end w-full max-w-[304px] mt-1">
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-gray-400 hover:text-teal-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Klik untuk menyegarkan verifikasi CAPTCHA"
          >
            <RotateCw className="w-2.5 h-2.5" />
            <span>Segarkan CAPTCHA</span>
          </button>
        </div>
      )}
    </div>
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;
