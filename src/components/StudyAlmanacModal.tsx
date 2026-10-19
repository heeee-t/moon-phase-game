import React from 'react';
import { MOON_PHASES } from '../types/game';
import { X, BookOpen, Calendar, Lightbulb } from 'lucide-react';
import { sound } from '../utils/audio';

interface StudyAlmanacModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyAlmanacModal: React.FC<StudyAlmanacModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[88vh] flex flex-col bg-zinc-950 border-4 border-yellow-400 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.3)] text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-500/20 via-zinc-900 to-yellow-500/10 border-b-2 border-yellow-400/40 select-none">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base sm:text-lg font-black text-yellow-300">
              달의 위상 학습 도감 (8대 위상)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick(300);
              onClose();
            }}
            aria-label="도감 닫기"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content list (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-zinc-800">
          {/* Key Summary */}
          <div className="text-xs sm:text-sm text-zinc-200 bg-zinc-900/95 p-3 rounded-xl border border-zinc-700 leading-relaxed text-left">
            <div className="font-bold text-yellow-300 flex items-center gap-1.5 mb-1 text-sm">
              <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>달의 공전과 위상 변화 핵심 정리</span>
            </div>
            달은 지구 주위를 서에서 동(반시계 방향)으로 약 29.5일 주기로 공전합니다.
            지구에서 볼 때 햇빛을 받아 반사하는 면의 각도에 따라 달의 밝게 보이는 영역(위상)이 주기적으로 달라집니다.
          </div>

          {/* 8 Moon Phases Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5">
            {MOON_PHASES.map((phase, idx) => (
              <div
                key={phase.id}
                className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-start gap-3 hover:border-yellow-400/50 transition-colors"
              >
                {/* Visual Preview */}
                <div className="shrink-0 w-12 h-12 rounded-full border-2 border-zinc-700 bg-zinc-950 flex items-center justify-center relative overflow-hidden shadow-sm">
                  <svg viewBox="0 0 100 100" className="w-10 h-10">
                    <rect width="100" height="100" fill="#24272c" />
                    {phase.target[0] === 1 && (
                      <path d="M 50 0 A 50 50 0 0 0 50 100 A 25 50 0 0 1 50 0 Z" fill="#fde047" />
                    )}
                    {phase.target[1] === 1 && (
                      <path d="M 50 0 A 25 50 0 0 0 50 100 L 50 0 Z" fill="#fde047" />
                    )}
                    {phase.target[2] === 1 && (
                      <path d="M 50 0 L 50 100 A 25 50 0 0 0 50 0 Z" fill="#fde047" />
                    )}
                    {phase.target[3] === 1 && (
                      <path d="M 50 0 A 25 50 0 0 1 50 100 A 50 50 0 0 0 50 0 Z" fill="#fde047" />
                    )}
                    <circle cx="50" cy="50" r="49" fill="none" stroke="#666" strokeWidth="1" />
                  </svg>
                </div>

                {/* Text Details (왼쪽 정렬 및 초록색 정보 제거) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-black text-sm text-yellow-300 truncate">
                      {idx + 1}. {phase.name}
                    </span>
                  </div>

                  {/* 음력 날짜만 표시 (초록색 정보 삭제) */}
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 my-1">
                    <span className="flex items-center gap-1 text-sky-400 font-bold shrink-0">
                      <Calendar className="w-3 h-3" />
                      {phase.date}
                    </span>
                  </div>

                  {/* 설명 (왼쪽 정렬 text-left 적용) */}
                  <p className="text-[11px] sm:text-xs text-zinc-300 leading-snug text-left">
                    {phase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
