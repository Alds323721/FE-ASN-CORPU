import { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { Lock } from 'lucide-react';
import CourseDetailNavbar from './CourseDetail/CourseDetailNavbar';
import CourseHeader from './CourseDetail/CourseHeader';
import CourseOutlineSidebar from './CourseDetail/CourseOutlineSidebar';
import CoursePlayer from './CourseDetail/CoursePlayer';
import CourseFooter from './CourseDetail/CourseFooter';
import { isMateriVideo, findNextMateriInfo } from './CourseDetail/courseHelpers';

export default function CourseDetail({ onNavigate, onBack }) {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMateri, setActiveMateri] = useState(null);

  const courseId = localStorage.getItem('userCourseId');

  const resolveActiveMateri = (data, currentActive) => {
    if (!data?.modul || data.modul.length === 0) return null;

    // A. Cek apakah user baru saja menyelesaikan Pre-Test
    const justCompletedPreTest = localStorage.getItem('userJustCompletedPreTest');
    if (justCompletedPreTest) {
      localStorage.removeItem('userJustCompletedPreTest');
      const savedMateriId = localStorage.getItem('userActiveMateriId');
      if (savedMateriId) {
        for (const m of data.modul) {
          const found = m.materi?.find(mat => String(mat.materi_id) === String(savedMateriId));
          if (found) {
            Swal.fire({
              icon: 'success',
              title: 'Pre-Test Selesai!',
              text: `Materi "${found.judul}" sekarang terbuka dan siap dipelajari.`,
              timer: 2000,
              showConfirmButton: false
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return { ...found, currentModulId: m.modul_id };
          }
        }
      }
    }

    // B. Cek apakah user baru saja lulus kuis modul / menyelesaikan kuis berbobot
    const passedKuisModulId = localStorage.getItem('userCompletedKuisModulId');
    const justPassedKuisStr = localStorage.getItem('userJustPassedKuis');
    if (passedKuisModulId || justPassedKuisStr) {
      localStorage.removeItem('userCompletedKuisModulId');
      localStorage.removeItem('userJustPassedKuis');
      let targetModulId = passedKuisModulId;
      let targetKuisId = localStorage.getItem('userCompletedKuisId');
      localStorage.removeItem('userCompletedKuisId');

      try {
        if (justPassedKuisStr) {
          const parsed = JSON.parse(justPassedKuisStr);
          if (parsed?.modulId) targetModulId = parsed.modulId;
          if (parsed?.kuisId) targetKuisId = parsed.kuisId;
        }
      } catch (e) {}

      const passedIdx = data.modul.findIndex(m => String(m.modul_id) === String(targetModulId));
      if (passedIdx !== -1) {
        const curMod = data.modul[passedIdx];
        
        // 1. Cek jika masih ada materi yang belum selesai di modul yang sama
        const unreadInSameMod = curMod.materi?.find(mat => !mat.is_read && !mat.is_locked);
        if (unreadInSameMod) {
          localStorage.setItem('userActiveMateriId', unreadInSameMod.materi_id);
          localStorage.setItem('userModulId', curMod.modul_id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return { ...unreadInSameMod, currentModulId: curMod.modul_id };
        }

        // 2. Cek jika modul ini memiliki kuis nilai berbobot yang belum selesai
        if (curMod.kuis_berbobot && !curMod.kuis_berbobot.is_completed && targetKuisId !== String(curMod.kuis_berbobot.kuis_id)) {
          localStorage.setItem('userModulId', curMod.modul_id);
          localStorage.setItem('userKuisId', curMod.kuis_berbobot.kuis_id);
          Swal.fire({
            icon: 'info',
            title: 'Lanjut ke Kuis Berbobot',
            text: `Modul ini memiliki kuis nilai berbobot: "${curMod.kuis_berbobot.judul}". Membuka kuis...`,
            timer: 2000,
            showConfirmButton: false
          });
          onNavigate('kuis');
          return null;
        }

        // 3. Lanjut ke materi pertama di modul berikutnya
        if (passedIdx + 1 < data.modul.length) {
          const nextMod = data.modul[passedIdx + 1];
          if (nextMod.materi && nextMod.materi.length > 0) {
            const sortedMateri = [...nextMod.materi].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
            const nextMat = sortedMateri[0];
            localStorage.setItem('userActiveMateriId', nextMat.materi_id);
            localStorage.setItem('userModulId', nextMod.modul_id);
            Swal.fire({
              icon: 'success',
              title: 'Lanjut ke Modul Berikutnya!',
              text: `Melanjutkan ke ${nextMod.judul}: "${nextMat.judul}"`,
              timer: 2200,
              showConfirmButton: false
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return { ...nextMat, currentModulId: nextMod.modul_id };
          }
        } else {
          // Modul terakhir telah selesai, cek Post Test
          if (data.post_test && data.status_pendaftaran !== 'lulus') {
            setTimeout(() => {
              Swal.fire({
                icon: 'success',
                title: '🎉 Selamat! Seluruh Modul Selesai',
                text: 'Anda telah menyelesaikan seluruh materi dan kuis modul pelatihan. Lanjutkan ke Post Test Akhir Pelatihan?',
                showCancelButton: true,
                confirmButtonColor: '#006A63',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Mulai Post Test Sekarang',
                cancelButtonText: 'Nanti'
              }).then((res) => {
                if (res.isConfirmed) {
                  onNavigate('post-test');
                }
              });
            }, 600);
          }
        }
      }
    }

    // C. Cek materi yang tersimpan di localStorage
    const savedMateriId = localStorage.getItem('userActiveMateriId');
    if (savedMateriId) {
      for (const m of data.modul) {
        const found = m.materi?.find(mat => String(mat.materi_id) === String(savedMateriId));
        if (found) {
          return { ...found, currentModulId: m.modul_id };
        }
      }
    }

    // D. Jika currentActive sudah ada di state, refresh status terbarunya dari data API
    if (currentActive) {
      for (const m of data.modul) {
        const found = m.materi?.find(mat => String(mat.materi_id) === String(currentActive.materi_id));
        if (found) {
          return { ...found, currentModulId: m.modul_id };
        }
      }
    }

    // E. Cari materi pertama yang belum dibaca dan tidak terkunci
    for (const m of data.modul) {
      const sortedM = [...(m.materi || [])].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
      const firstUnread = sortedM.find(mat => !mat.is_read && !mat.is_locked);
      if (firstUnread) {
        return { ...firstUnread, currentModulId: m.modul_id };
      }
    }

    // F. Default: materi pertama di modul pertama
    if (data.modul[0]?.materi?.[0]) {
      const sortedFirst = [...data.modul[0].materi].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
      return { ...sortedFirst[0], currentModulId: data.modul[0].modul_id };
    }

    return null;
  };

  const fetchCourse = async () => {
    if (!courseId) {
      Swal.fire({
        icon: 'warning',
        title: 'ID Pelatihan Tidak Ditemukan',
        text: 'Data sesi pelatihan tidak ditemukan. Silakan kembali ke katalog pelatihan.',
        confirmButtonColor: '#006A63'
      });
      onBack();
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/user/courses/${courseId}`);
      if (res.data?.data) {
        const fetchedData = res.data.data;
        setCourseData(fetchedData);
        const resolved = resolveActiveMateri(fetchedData, activeMateri);
        if (resolved) {
          setActiveMateri(resolved);
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Pelatihan',
        text: error.response?.data?.message || 'Terjadi gangguan saat mengambil data pelatihan.',
        confirmButtonColor: '#006A63'
      });
      onBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const handleSelectMateri = (materiWithModul) => {
    setActiveMateri(materiWithModul);
    if (materiWithModul?.materi_id) {
      localStorage.setItem('userActiveMateriId', materiWithModul.materi_id);
    }
    if (materiWithModul?.currentModulId) {
      localStorage.setItem('userModulId', materiWithModul.currentModulId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoNext = (nextMateri, nextModulId) => {
    if (!nextMateri) return;
    if (nextMateri.is_locked) {
      Swal.fire({
        icon: 'info',
        title: 'Materi Masih Terkunci',
        text: 'Materi selanjutnya belum dapat diakses. Selesaikan syarat materi/kuis terlebih dahulu.',
        confirmButtonColor: '#006A63'
      });
      return;
    }
    const newActive = { ...nextMateri, currentModulId: nextModulId };
    setActiveMateri(newActive);
    localStorage.setItem('userActiveMateriId', nextMateri.materi_id);
    localStorage.setItem('userModulId', nextModulId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkAsRead = async () => {
    if (!activeMateri) return;
    try {
      await api.post(`/user/courses/${courseId}/materi/${activeMateri.materi_id}/read`);
      
      // Ambil data kursus terbaru untuk sinkronisasi locking & progress
      const res = await api.get(`/user/courses/${courseId}`);
      const updatedCourse = res.data?.data;
      if (updatedCourse) {
        setCourseData(updatedCourse);
      }

      const allModuls = updatedCourse?.modul || courseData?.modul || [];
      const currentModulId = activeMateri.currentModulId;

      // Cari materi atau langkah selanjutnya
      const nextStep = findNextMateriInfo(allModuls, currentModulId, activeMateri.materi_id);

      if (nextStep?.type === 'same_modul_materi') {
        // Lanjut ke materi berikutnya yang ada di modul yang sama!
        const nextMat = nextStep.materi;
        const newActive = { ...nextMat, currentModulId: nextStep.modulId };
        setActiveMateri(newActive);
        localStorage.setItem('userActiveMateriId', nextMat.materi_id);
        localStorage.setItem('userModulId', nextStep.modulId);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        Swal.fire({
          icon: 'success',
          title: isMateriVideo(activeMateri) ? 'Video Selesai Ditonton!' : 'Materi Selesai Dibaca!',
          text: `Melanjutkan ke materi berikutnya: "${nextMat.judul}"`,
          timer: 1800,
          showConfirmButton: false
        });
      } else if (nextStep?.type === 'modul_kuis') {
        // Materi terakhir di modul ini, arahkan otomatis ke kuis evaluasi modul
        const result = await Swal.fire({
          icon: 'success',
          title: 'Materi Modul Selesai!',
          html: `
            <div class="text-left text-sm text-gray-600 space-y-2 pt-1">
              <p>Selamat! Anda telah menyelesaikan seluruh materi pada <b>${nextStep.modul.judul}</b>.</p>
              <p class="text-xs text-teal-800 bg-teal-50 p-2.5 rounded border border-teal-200">
                Langkah berikutnya: Selesaikan <b>${nextStep.kuis.judul || 'Kuis Evaluasi Modul'}</b> untuk mengukur pemahaman Anda dan membuka modul berikutnya.
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: '#006A63',
          cancelButtonColor: '#6B7280',
          confirmButtonText: 'Mulai Kerjakan Kuis Sekarang',
          cancelButtonText: 'Tetap di Halaman Ini',
          timer: 3000,
          timerProgressBar: true
        });

        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          localStorage.setItem('userModulId', nextStep.modulId);
          localStorage.setItem('userKuisId', nextStep.kuis.kuis_id);
          onNavigate('kuis');
        } else {
          setActiveMateri(prev => ({ ...prev, is_read: true }));
        }
      } else if (nextStep?.type === 'next_modul_materi') {
        // Kuis modul sudah selesai atau tidak ada kuis, lanjut ke modul berikutnya
        const nextMat = nextStep.materi;
        const newActive = { ...nextMat, currentModulId: nextStep.modulId };
        setActiveMateri(newActive);
        localStorage.setItem('userActiveMateriId', nextMat.materi_id);
        localStorage.setItem('userModulId', nextStep.modulId);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        Swal.fire({
          icon: 'success',
          title: 'Modul Selesai!',
          text: `Melanjutkan ke ${nextStep.modul.judul}: "${nextMat.judul}"`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Seluruh materi & modul selesai
        setActiveMateri(prev => ({ ...prev, is_read: true }));
        if (updatedCourse?.post_test && updatedCourse?.status_pendaftaran !== 'lulus') {
          const result = await Swal.fire({
            icon: 'success',
            title: '🎉 Selamat! Seluruh Silabus Selesai',
            text: 'Anda telah menyelesaikan seluruh materi dan evaluasi modul. Lanjutkan ke Post Test Akhir Pelatihan?',
            showCancelButton: true,
            confirmButtonColor: '#006A63',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Mulai Post Test Sekarang',
            cancelButtonText: 'Nanti'
          });
          if (result.isConfirmed) {
            onNavigate('post-test');
          }
        } else {
          Swal.fire({
            icon: 'success',
            title: isMateriVideo(activeMateri) ? 'Video Selesai Ditonton!' : 'Materi Selesai!',
            text: 'Progres belajar Anda telah tersimpan.',
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Progres',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan progres.',
        confirmButtonColor: '#006A63'
      });
    }
  };

  // Listener event postMessage / xAPI dari player H5P dan YouTube Player
  useEffect(() => {
    const handleWindowMessage = (event) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }
        if (!data) return;

        // 1. Deteksi H5P selesai
        const verb = data?.statement?.verb?.id || data?.verb || data?.context?.verb;
        const isH5PCompleted =
          (typeof verb === 'string' && (verb.includes('completed') || verb.includes('passed') || verb.includes('answered'))) ||
          data?.event === 'h5p-completed' ||
          data?.action === 'completed';

        if (isH5PCompleted && activeMateri?.materi_id && !activeMateri.is_read && activeMateri.tipe === 'h5p') {
          handleMarkAsRead();
          return;
        }

        // 2. Deteksi YouTube player selesai (state 0 = ENDED)
        if (data?.event === 'onStateChange' && Number(data?.info) === 0) {
          if (activeMateri?.materi_id && !activeMateri.is_read && isMateriVideo(activeMateri)) {
            handleMarkAsRead();
            return;
          }
        }
      } catch (e) {
        // Data non-JSON diabaikan
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [activeMateri]);

  // Listener & Runtime Bridge untuk Materi SCORM (SCORM 1.2 & SCORM 2004)
  useEffect(() => {
    if (activeMateri?.tipe !== 'scorm') return;

    const cmiData = {
      'cmi.core.lesson_status': 'incomplete',
      'cmi.core.lesson_location': '',
      'cmi.core.score.raw': '0',
      'cmi.core.session_time': '00:00:00',
      'cmi.suspend_data': '',
      'cmi.completion_status': 'incomplete',
      'cmi.success_status': 'unknown',
      'cmi.score.raw': '0',
    };

    const triggerScormCompletion = (status) => {
      const s = String(status || '').toLowerCase();
      if ((s === 'completed' || s === 'passed') && activeMateri?.materi_id && !activeMateri.is_read) {
        handleMarkAsRead();
      }
    };

    // SCORM 1.2 Runtime API Bridge
    window.API = {
      LMSInitialize: () => "true",
      LMSFinish: () => {
        const status = cmiData['cmi.core.lesson_status'];
        triggerScormCompletion(status);
        return "true";
      },
      LMSGetValue: (element) => cmiData[element] || "",
      LMSSetValue: (element, value) => {
        cmiData[element] = String(value);
        if (element === 'cmi.core.lesson_status') {
          triggerScormCompletion(value);
        }
        return "true";
      },
      LMSCommit: () => {
        const status = cmiData['cmi.core.lesson_status'];
        triggerScormCompletion(status);
        return "true";
      },
      LMSGetLastError: () => "0",
      LMSGetErrorString: () => "No error",
      LMSGetDiagnostic: () => ""
    };

    // SCORM 2004 Runtime API Bridge
    window.API_1484_11 = {
      Initialize: () => "true",
      Terminate: () => {
        const status = cmiData['cmi.completion_status'] || cmiData['cmi.success_status'];
        triggerScormCompletion(status);
        return "true";
      },
      GetValue: (element) => cmiData[element] || "",
      SetValue: (element, value) => {
        cmiData[element] = String(value);
        if (element === 'cmi.completion_status' || element === 'cmi.success_status') {
          triggerScormCompletion(value);
        }
        return "true";
      },
      Commit: () => {
        const status = cmiData['cmi.completion_status'] || cmiData['cmi.success_status'];
        triggerScormCompletion(status);
        return "true";
      },
      GetLastError: () => "0",
      GetErrorString: () => "No error",
      GetDiagnostic: () => ""
    };

    return () => {
      try {
        delete window.API;
        delete window.API_1484_11;
      } catch (e) {
        window.API = undefined;
        window.API_1484_11 = undefined;
      }
    };
  }, [activeMateri]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FBFC]">
        <div className="text-[#1D315F] font-bold">Memuat Detail Pelatihan...</div>
      </div>
    );
  }

  const nextStepInfo = activeMateri ? findNextMateriInfo(courseData?.modul, activeMateri.currentModulId, activeMateri.materi_id) : null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9FBFC]">
      <CourseDetailNavbar onNavigate={onNavigate} />
      <CourseHeader onBack={onBack} courseData={courseData} />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
          {courseData?.is_locked_review && (
            <div className="mb-6 p-4.5 bg-amber-50/90 border border-amber-300 rounded-xl flex items-start gap-3.5 shadow-xs">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-2">
                  <span>Materi Pembelajaran Sedang Ditinjau Admin BKPSDM</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Terkunci Sementara</span>
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Admin Komunitas baru saja memperbarui materi pembelajaran pada pelatihan ini. Seluruh materi dan kuis sementara terkunci dan akan dibuka kembali secara otomatis setelah mendapatkan persetujuan (approval) resmi dari Admin BKPSDM.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            <div className="lg:col-span-8 order-2 lg:order-1">
              <CoursePlayer
                activeMateri={activeMateri}
                onMarkAsRead={handleMarkAsRead}
                onNavigate={onNavigate}
                onNextMateri={handleGoNext}
                nextStepInfo={nextStepInfo}
              />
            </div>

            <div className="lg:col-span-4 order-1 lg:order-2">
              <CourseOutlineSidebar
                courseData={courseData}
                activeMateri={activeMateri}
                onSelectMateri={handleSelectMateri}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>
      </main>

      <CourseFooter onNavigate={onNavigate} />
    </div>
  );
}
