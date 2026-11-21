import React, { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up', // 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in'
  delay = 0,
  duration = 650,
  threshold = 0.1,
  repeat = true, // Re-trigger animasi secara dua arah saat scroll down & scroll up
  tag: Tag = 'div',
  ...rest
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('down'); // 'down' | 'up'
  const domRef = useRef(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    lastScrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const currentY = typeof window !== 'undefined' ? window.scrollY : 0;
          const direction = currentY < lastScrollYRef.current ? 'up' : 'down';
          lastScrollYRef.current = currentY;

          if (entry.isIntersecting) {
            setScrollDirection(direction);
            setIsVisible(true);
            if (!repeat && domRef.current) {
              observer.unobserve(domRef.current);
            }
          } else if (repeat) {
            // Ketika elemen keluar dari viewport, reset state agar bisa menganimasikan kembali saat scroll balik
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        // Margin toleransi agar perpindahan halus tanpa berkedip di tepi layar
        rootMargin: '20px 0px 20px 0px'
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, repeat]);

  const getAnimationStyles = () => {
    if (isVisible) {
      return 'opacity-100 translate-y-0 translate-x-0 scale-100';
    }

    // Jika sedang scroll UP (kembali ke atas / hero section),
    // elemen bergerak mengikuti alur scrolling ke atas secara natural
    if (scrollDirection === 'up') {
      switch (animation) {
        case 'fade-up':
        case 'fade-down':
          return 'opacity-0 -translate-y-8';
        case 'fade-left':
          return 'opacity-0 translate-x-8';
        case 'fade-right':
          return 'opacity-0 -translate-x-8';
        case 'zoom-in':
          return 'opacity-0 scale-95 -translate-y-4';
        default:
          return 'opacity-0 -translate-y-8';
      }
    }

    // Default saat scroll DOWN
    switch (animation) {
      case 'fade-up':
        return 'opacity-0 translate-y-8';
      case 'fade-down':
        return 'opacity-0 -translate-y-8';
      case 'fade-left':
        return 'opacity-0 translate-x-8';
      case 'fade-right':
        return 'opacity-0 -translate-x-8';
      case 'zoom-in':
        return 'opacity-0 scale-95 translate-y-4';
      default:
        return 'opacity-0 translate-y-8';
    }
  };

  return (
    <Tag
      ref={domRef}
      className={`transform transition-all will-change-[transform,opacity] ${getAnimationStyles()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
