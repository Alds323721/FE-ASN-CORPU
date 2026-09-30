import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

/**
 * Komponen Google reCAPTCHA v2 (Checkbox "Saya bukan robot")
 * Dirancang khusus dan kompatibel penuh dengan React 19 & Vite tanpa dependensi eksternal usang.
 */
const ReCaptcha = forwardRef(({ onChange, onExpired, onError, className = '' }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
          if (onChange) onChange('');
        } catch (e) {
          // ignore
        }
      }
    },
    getResponse: () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          return window.grecaptcha.getResponse(widgetIdRef.current);
        } catch (e) {
          return '';
        }
      }
      return '';
    }
  }));

  useEffect(() => {
    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.grecaptcha || !window.grecaptcha.render) {
        return;
      }

      if (widgetIdRef.current !== null) {
        return;
      }

      try {
        containerRef.current.innerHTML = '';
        const id = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            if (isMounted && onChange) onChange(token);
          },
          'expired-callback': () => {
            if (isMounted) {
              if (onExpired) onExpired();
              if (onChange) onChange('');
            }
          },
          'error-callback': () => {
            if (isMounted) {
              if (onError) onError();
              if (onChange) onChange('');
            }
          }
        });
        widgetIdRef.current = id;
        setIsReady(true);
      } catch (err) {
        // Silently catch or handle
      }
    };

    if (!window.__recaptcha_callbacks) {
      window.__recaptcha_callbacks = [];
      window.onGoogleReCaptchaLoad = () => {
        if (Array.isArray(window.__recaptcha_callbacks)) {
          window.__recaptcha_callbacks.forEach((cb) => {
            try { cb(); } catch (e) {}
          });
          window.__recaptcha_callbacks = [];
        }
      };
    }

    if (window.grecaptcha && window.grecaptcha.render) {
      renderWidget();
    } else {
      window.__recaptcha_callbacks.push(renderWidget);

      const scriptId = 'google-recaptcha-script';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onGoogleReCaptchaLoad&render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  return (
    <div className={`recaptcha-wrapper flex flex-col items-center justify-center my-3 ${className}`}>
      <div ref={containerRef} className="min-h-[78px] flex items-center justify-center" />
      {!isReady && (
        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
          <span>Memuat verifikasi keamanan...</span>
        </div>
      )}
    </div>
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;
