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
              badge === 'Pre-Test Selesai'
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

export default function CourseOutlineSidebar({ courseData, activeMateri, onSelectMateri, onNavigate }) {
  return (
    <aside className="bg-white border border-[#BBC9C7] rounded-lg p-4 md:p-6 overflow-y-auto max-h-[600px] custom-scrollbar">
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
              if (hasPreTest) {
                badge = isPreTestDone ? 'Pre-Test Selesai' : 'Wajib Pre-Test';
              }

              return (
                <SyllabusItem
                  key={mat.materi_id}
                  index={i + 1}
                  title={mat.judul}
                  subtitle={`Tipe: ${mat.tipe === 'h5p' ? 'H5P Interaktif' : mat.tipe === 'scorm' ? 'SCORM Interaktif' : isMateriVideo(mat) ? 'Video' : 'Materi Bacaan'}`}
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
                        text: 'Selesaikan materi sebelumnya sesuai urutan silabus terlebih dahulu.',
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
                subtitle="Kuis Evaluasi Modul"
                duration={modul.kuis.durasi}
                status={modul.kuis.is_completed ? 'completed' : (modul.kuis.is_locked ? 'locked' : 'pending')}
                isActive={false}
                typeBadges={getQuizBadges(modul.kuis.tipe_soal_list)}
                onClick={() => {
                  if (modul.kuis.is_locked) {
                    Swal.fire({
                      icon: 'info',
                      title: 'Kuis Masih Terkunci',
                      text: 'Selesaikan seluruh materi pada modul ini terlebih dahulu sebelum mengerjakan kuis.',
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
                subtitle="Kuis Nilai Berbobot"
                duration={modul.kuis_berbobot.durasi}
                status={modul.kuis_berbobot.is_completed ? 'completed' : (modul.kuis_berbobot.is_locked ? 'locked' : 'pending')}
                isActive={false}
                typeBadges={getQuizBadges(modul.kuis_berbobot.tipe_soal_list || ['pilihan_berbobot'])}
                onClick={() => {
                  if (modul.kuis_berbobot.is_locked) {
                    Swal.fire({
                      icon: 'info',
                      title: 'Kuis Masih Terkunci',
                      text: 'Selesaikan seluruh materi pada modul ini terlebih dahulu sebelum mengerjakan asesmen.',
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
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs md:text-sm text-[#006A63] font-bold mb-2">Evaluasi Akhir Pelatihan</p>
          <SyllabusItem
            index="Final"
            title={courseData.post_test.judul || 'Post Test Akhir'}
            subtitle="Tes Evaluasi Akhir Kelulusan"
            duration={courseData.post_test.durasi}
            status={courseData.post_test.is_completed ? 'completed' : (courseData.post_test.is_locked ? 'locked' : 'pending')}
            isActive={false}
            typeBadges={getQuizBadges(courseData.post_test.tipe_soal_list)}
            onClick={() => {
              if (courseData.post_test.is_locked) {
                Swal.fire({
                  icon: 'info',
                  title: 'Post Test Masih Terkunci',
                  text: 'Selesaikan seluruh modul dan kuis evaluasi terlebih dahulu sebelum membuka Post Test.',
                  confirmButtonColor: '#006A63'
                });
                return;
              }
              onNavigate('post-test');
            }}
          />
        </div>
      )}
    </aside>
  );
}
