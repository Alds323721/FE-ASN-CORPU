import React from 'react';
import Swal from 'sweetalert2';
import {
  CheckCircle2,
  Circle,
  Lock,
  HelpCircle
} from 'lucide-react';
import { isMateriVideo, getQuizBadges } from './courseHelpers';

const SyllabusItem = ({ index, title, subtitle, duration, status, onClick, isActive, badge, typeBadges = [] }) => {
  const getStatusIcon = () => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#10B981]" />;
    if (status === 'locked') return <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />;
    if (status === 'pre_test_ready') return <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />;
    return <Circle className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />;
  };

  return (
    <div
      className={`flex items-start gap-2 md:gap-3 py-2 md:py-3 cursor-pointer hover:bg-gray-50 transition-colors px-2 rounded ${
        isActive ? 'bg-[#F4F8FB] border-l-4 border-[#3FCDC1]' : 'border-l-4 border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h4 className="font-semibold text-[#1D315F] text-xs md:text-sm mb-0.5">{index}. {title}</h4>
          {badge && (
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
              badge === 'Selesai' || badge === 'Pre-Test Selesai' || badge === 'Selesai • Pre-Test Selesai' || badge === 'Selesai / Lulus' || badge === 'Feedback Selesai' || badge === 'Terbuka'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {badge}
            </span>
          )}
          {typeBadges && typeBadges.map((tb, idx) => (
            <span key={idx} className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${tb.color}`}>
              {tb.label}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-1 font-semibold line-clamp-1">{subtitle}</p>
        {duration && <p className="text-xs text-gray-400 font-semibold">{duration} Menit</p>}
      </div>
    </div>
  );
};

export default function CourseOutlineSidebar({
  courseData,
  activeMateri,
  onSelectMateri,
  onNavigate,
  onSelectFeedbackSection,
  onOpenGraduationPage
}) {
  return (
    <aside className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6 overflow-y-auto max-h-[650px] custom-scrollbar">
      <h2 className="font-semibold text-[#1D315F] text-base md:text-lg mb-4">Silabus Pelatihan</h2>

      {courseData?.modul?.map((modul) => (
        <div key={modul.modul_id} className="mb-6">
          <p className="text-xs md:text-sm text-[#006A63] font-bold mb-2">Modul {modul.urutan}: {modul.judul}</p>
          <div className="space-y-1 divide-y divide-gray-100 pl-2">
            {modul.materi?.map((mat, i) => {
              const hasPreTest = Boolean(mat.pre_test);
              const isPreTestDone = Boolean(mat.pre_test?.is_completed);
              const isPreTestReady = hasPreTest && !isPreTestDone && !mat.pre_test?.is_locked;

              let status = 'pending';
              if (mat.is_read) {
                status = 'completed';
              } else if (isPreTestReady) {
                status = 'pre_test_ready';
              } else if (mat.is_locked) {
                status = 'locked';
              }

              let badge = null;
              if (mat.is_read) {
                badge = hasPreTest ? 'Selesai • Pre-Test Selesai' : 'Selesai';
              } else if (hasPreTest) {
                badge = isPreTestDone ? 'Pre-Test Selesai' : 'Wajib Pre-Test';
              }

              return (
                <SyllabusItem
                  key={mat.materi_id}
                  index={i + 1}
                  title={mat.judul}
                  subtitle={`Tipe: ${mat.tipe === 'h5p' ? 'H5P Interaktif' : mat.tipe === 'scorm' ? 'SCORM Interaktif' : mat.tipe === 'tautan_web' ? 'Materi Web (Webview)' : isMateriVideo(mat) ? 'Video' : 'Materi Bacaan'}`}
                  duration={mat.durasi}
                  status={status}
                  badge={badge}
                  isActive={activeMateri?.materi_id === mat.materi_id}
                  onClick={() => {
                    if (mat.is_locked) {
                      if (isPreTestReady) {
                        onSelectMateri({ ...mat, currentModulId: modul.modul_id });
                        return;
                      }
                      Swal.fire({
                        icon: 'info',
                        title: 'Materi Masih Terkunci',
                        text: courseData?.lock_reason || 'Selesaikan materi sebelumnya sesuai urutan silabus terlebih dahulu.',
                        confirmButtonColor: '#006A63'
                      });
                      return;
                    }
                    onSelectMateri({ ...mat, currentModulId: modul.modul_id });
                  }}
                />
              );
            })}

            {modul.kuis && (
              <SyllabusItem
                key={`kuis-${modul.kuis.kuis_id}`}
                index="Kuis"
                title={modul.kuis.judul}
                subtitle={modul.kuis.is_completed ? 'Kuis Evaluasi Modul (Telah Selesai)' : 'Kuis Evaluasi Modul'}
                duration={modul.kuis.durasi}
                status={modul.kuis.is_completed ? 'completed' : (modul.kuis.is_locked ? 'locked' : 'pending')}
                badge={modul.kuis.is_completed ? 'Selesai / Lulus' : null}
                isActive={false}
                typeBadges={getQuizBadges(modul.kuis.tipe_soal_list)}
                onClick={() => {
                  const isCourseDone =
                    courseData?.post_test?.is_completed ||
                    courseData?.status_pendaftaran === 'lulus' ||
                    courseData?.status_pendaftaran === 'selesai';

                  if (modul.kuis.is_completed || isCourseDone) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Kuis Sudah Diselesaikan',
                      text: 'Anda telah menyelesaikan dan lulus Kuis Evaluasi Modul ini. Kuis yang telah selesai tidak dapat dijawab kembali.',
                      confirmButtonColor: '#006A63'
                    });
                    return;
                  }
                  if (modul.kuis.is_locked) {
                    Swal.fire({
                      icon: 'info',
                      title: 'Kuis Masih Terkunci',
                      text: courseData?.lock_reason || 'Selesaikan seluruh materi pada modul ini terlebih dahulu sebelum mengerjakan kuis.',
                      confirmButtonColor: '#006A63'
                    });
                    return;
                  }
                  localStorage.setItem('userModulId', modul.modul_id);
                  localStorage.setItem('userKuisId', modul.kuis.kuis_id);
                  onNavigate('kuis');
                }}
              />
            )}

            {modul.kuis_berbobot && (
              <SyllabusItem
                key={`kuis-berbobot-${modul.kuis_berbobot.kuis_id}`}
                index="Asesmen"
                title={modul.kuis_berbobot.judul}
                subtitle={modul.kuis_berbobot.is_completed ? 'Kuis Nilai Berbobot (Telah Selesai)' : 'Kuis Nilai Berbobot'}
                duration={modul.kuis_berbobot.durasi}
                status={modul.kuis_berbobot.is_completed ? 'completed' : (modul.kuis_berbobot.is_locked ? 'locked' : 'pending')}
                badge={modul.kuis_berbobot.is_completed ? 'Selesai' : null}
                isActive={false}
                typeBadges={getQuizBadges(modul.kuis_berbobot.tipe_soal_list || ['pilihan_berbobot'])}
                onClick={() => {
                  const isCourseDone =
                    courseData?.post_test?.is_completed ||
                    courseData?.status_pendaftaran === 'lulus' ||
                    courseData?.status_pendaftaran === 'selesai';

                  if (modul.kuis_berbobot.is_completed || isCourseDone) {
                    Swal.fire({
                      icon: 'success',
                      title: 'Asesmen Sudah Diselesaikan',
                      text: 'Anda telah menyelesaikan Kuis Nilai Berbobot ini. Asesmen yang telah selesai tidak dapat dijawab kembali.',
                      confirmButtonColor: '#006A63'
                    });
                    return;
                  }
                  if (modul.kuis_berbobot.is_locked) {
                    Swal.fire({
                      icon: 'info',
                      title: 'Kuis Masih Terkunci',
                      text: courseData?.lock_reason || 'Selesaikan seluruh materi pada modul ini terlebih dahulu sebelum mengerjakan asesmen.',
                      confirmButtonColor: '#006A63'
                    });
                    return;
                  }
                  localStorage.setItem('userModulId', modul.modul_id);
                  localStorage.setItem('userKuisId', modul.kuis_berbobot.kuis_id);
                  onNavigate('kuis');
                }}
              />
            )}
          </div>
        </div>
      ))}

      {courseData?.post_test && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs md:text-sm text-[#006A63] font-bold mb-2">Evaluasi Akhir Pelatihan</p>
          <SyllabusItem
            index="Final"
            title={courseData.post_test.judul || 'Post Test Akhir'}
            subtitle={courseData.post_test.is_completed ? 'Post Test Telah Diselesaikan (Lulus)' : 'Tes Evaluasi Akhir Kelulusan'}
            duration={courseData.post_test.durasi}
            status={courseData.post_test.is_completed ? 'completed' : (courseData.post_test.is_locked ? 'locked' : 'pending')}
            badge={courseData.post_test.is_completed ? 'Selesai / Lulus' : null}
            isActive={false}
            typeBadges={getQuizBadges(courseData.post_test.tipe_soal_list)}
            onClick={() => {
              const isPostTestDone =
                courseData.post_test.is_completed ||
                courseData?.status_pendaftaran === 'lulus' ||
                courseData?.status_pendaftaran === 'selesai';

              if (isPostTestDone) {
                if (!courseData.kuesioner_selesai) {
                  if (onSelectFeedbackSection) onSelectFeedbackSection();
                  Swal.fire({
                    icon: 'info',
                    title: 'Post Test Sudah Selesai (Lulus)',
                    text: 'Anda telah menyelesaikan dan lulus Post Test! Silakan lengkapi Feedback Kursus pada bagian di bawah terlebih dahulu untuk membuka Halaman Kelulusan & Sertifikat.',
                    confirmButtonColor: '#006A63'
                  });
                  return;
                }
                Swal.fire({
                  icon: 'success',
                  title: 'Post Test Sudah Selesai (Lulus)',
                  text: 'Post Test pada pelatihan ini telah selesai dikerjakan dan tidak dapat dijawab kembali. Anda dapat langsung melihat nilai akhir dan sertifikat di Halaman Kelulusan.',
                  showCancelButton: true,
                  confirmButtonColor: '#006A63',
                  cancelButtonColor: '#6B7280',
                  confirmButtonText: 'Buka Halaman Kelulusan',
                  cancelButtonText: 'Tutup'
                }).then((res) => {
                  if (res.isConfirmed) {
                    if (onOpenGraduationPage) {
                      onOpenGraduationPage();
                    } else {
                      onNavigate('test-result');
                    }
                  }
                });
                return;
              }
              if (courseData.post_test.is_locked) {
                Swal.fire({
                  icon: 'info',
                  title: 'Post Test Masih Terkunci',
                  text: courseData?.lock_reason || 'Selesaikan seluruh modul dan kuis evaluasi terlebih dahulu sebelum membuka Post Test.',
                  confirmButtonColor: '#006A63'
                });
                return;
              }
              onNavigate('post-test');
            }}
          />
        </div>
      )}

      {/* Section Baru di Bawah Post Test: Feedback Kursus & Halaman Kelulusan */}
      {courseData?.is_enrolled && (
        <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-[#006A63] font-bold">Feedback & Kelulusan Kursus</p>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 text-[#006A63] border border-teal-200">
              Kategori: Kursus
            </span>
          </div>

          <SyllabusItem
            index="Feedback"
            title="Kuesioner Feedback Kursus"
            subtitle={
              courseData?.kuesioner_selesai
                ? 'Evaluasi kursus telah selesai diisi'
                : 'Wajib diisi sebelum ke Halaman Kelulusan'
            }
            status={
              courseData?.kuesioner_selesai
                ? 'completed'
                : courseData?.post_test?.is_completed
                  ? 'pre_test_ready'
                  : 'locked'
            }
            badge={courseData?.kuesioner_selesai ? 'Feedback Selesai' : 'Wajib Feedback'}
            isActive={false}
            onClick={() => {
              if (!courseData?.post_test?.is_completed && !courseData?.kuesioner_selesai) {
                if (onSelectFeedbackSection) onSelectFeedbackSection();
                Swal.fire({
                  icon: 'info',
                  title: 'Feedback Kursus Belum Terbuka',
                  text: 'Selesaikan seluruh modul dan lulus Post Test Akhir terlebih dahulu untuk mengisi Kuesioner Feedback Kursus.',
                  confirmButtonColor: '#006A63'
                });
                return;
              }
              if (onSelectFeedbackSection) onSelectFeedbackSection();
            }}
          />

          {courseData?.post_test?.is_completed && (
            <SyllabusItem
              index="Lulus"
              title="Halaman Kelulusan & Sertifikat"
              subtitle={
                courseData?.kuesioner_selesai
                  ? 'Klik untuk melihat nilai akhir & unduh sertifikat'
                  : 'Terkunci — Isi Feedback Kursus terlebih dahulu'
              }
              status={courseData?.kuesioner_selesai ? 'completed' : 'locked'}
              badge={courseData?.kuesioner_selesai ? 'Terbuka' : null}
              isActive={false}
              onClick={() => {
                if (!courseData?.kuesioner_selesai) {
                  if (onSelectFeedbackSection) onSelectFeedbackSection();
                  Swal.fire({
                    icon: 'warning',
                    title: 'Wajib Mengisi Feedback Kursus',
                    text: 'Silakan isi dan kirim Kuesioner Feedback Kursus pada bagian di bawah terlebih dahulu sebelum menuju ke Halaman Kelulusan.',
                    confirmButtonColor: '#006A63'
                  });
                  return;
                }
                if (onOpenGraduationPage) {
                  onOpenGraduationPage();
                } else {
                  onNavigate('test-result');
                }
              }}
            />
          )}
        </div>
      )}
    </aside>
  );
}
