import React from 'react';
import { sound } from '../utils/audio';

interface InteractiveMoonProps {
  slices: [number, number, number, number];
  onToggleSlice: (index: number) => void;
  onSetAll: (val: number) => void;
  disabled?: boolean;
}

export const InteractiveMoon: React.FC<InteractiveMoonProps> = ({
  slices,
  onToggleSlice,
  onSetAll,
  disabled = false
}) => {
  const handleSliceClick = (index: number) => {
    if (disabled) return;
    sound.playClick(500 + index * 60);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignored
      }
    }
    onToggleSlice(index);
  };

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Outer Radar Container */}
      <div className="relative w-full max-w-sm sm:max-w-md p-2 sm:p-2.5 rounded-xl border-2 border-emerald-500/80 bg-zinc-950 radar-grid shadow-[0_0_15px_rgba(16,185,129,0.2),inset_0_0_12px_rgba(16,185,129,0.15)] flex flex-col items-center">
        {/* Header HUD tag with enlarged legible text */}
        <div className="w-full flex items-center justify-between px-1.5 py-0.5 sm:py-1 mb-1 sm:mb-1.5 border-b border-emerald-500/30">
          <span className="flex items-center gap-1.5 text-xs sm:text-sm md:text-base text-emerald-400 font-black tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            달 위상 색칠 입력창
          </span>
          <span className="text-zinc-400 text-[10px] sm:text-xs font-bold">각 영역을 터치하세요</span>
        </div>

        {/* SVG Moon Interactive */}
        <div className="relative flex items-center justify-center p-0.5">
          <svg
            viewBox="0 0 100 100"
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 max-h-[21vh] sm:max-h-[25vh] touch-manipulation cursor-pointer"
          >
            <defs>
              {/* 
                ============================================================
                1. HIGH-PRECISION RETRO PIXEL ART BRIGHT MOON PATTERN
                - 각 픽셀 단위를 2x2 단위로 미세화하여 실제 달의 지형을 정밀하게 구현
                - 폭풍의 대양, 비의 바다, 맑음의 바다, 고요의 바다, 위기의 바다, 구름의 바다
                - 티코 크레이터와 사방으로 뻗어나가는 정교한 2x2 방사선 광조(Rays)
                - 코페르니쿠스, 케플러, 아리스타르코스 크레이터 디테일
                ============================================================
              */}
              <pattern
                id="retro-bright-moon"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                {/* [1] 기본 황금빛/호박색 레골리스 베이스 */}
                <rect width="100" height="100" fill="#fad76b" />

                {/* [2] 밝은 아이보리/크림색 고지대 픽셀 클러스터 (#fff5b8 / #fffadc) */}
                <g fill="#fff6bd">
                  {/* 북극 및 북부 고지대 */}
                  <rect x="42" y="4" width="16" height="4" />
                  <rect x="46" y="8" width="12" height="4" />
                  <rect x="36" y="8" width="6" height="4" />
                  <rect x="58" y="8" width="6" height="4" />
                  
                  {/* 북서쪽 고지대 */}
                  <rect x="20" y="12" width="12" height="4" />
                  <rect x="24" y="16" width="8" height="4" />
                  <rect x="16" y="16" width="6" height="4" />
                  
                  {/* 북동쪽 고지대 */}
                  <rect x="68" y="10" width="10" height="4" />
                  <rect x="72" y="14" width="8" height="4" />
                  <rect x="80" y="14" width="6" height="4" />

                  {/* 아펜니노 산맥 (비의 바다와 맑음의 바다 경계) */}
                  <rect x="46" y="26" width="4" height="4" />
                  <rect x="48" y="30" width="4" height="6" />
                  <rect x="50" y="36" width="4" height="4" />

                  {/* 동쪽 외곽 밝은 림 */}
                  <rect x="86" y="38" width="4" height="16" />
                  <rect x="84" y="42" width="4" height="12" />

                  {/* 서쪽 외곽 밝은 림 */}
                  <rect x="10" y="38" width="4" height="14" />
                  <rect x="12" y="42" width="4" height="10" />

                  {/* 남부 고밀도 크레이터 고지대 전체 */}
                  <rect x="34" y="66" width="32" height="6" />
                  <rect x="30" y="72" width="40" height="6" />
                  <rect x="28" y="78" width="44" height="6" />
                  <rect x="32" y="84" width="36" height="6" />
                  <rect x="38" y="90" width="24" height="6" />
                </g>

                {/* [3] 중간 탠/골드 도트 셰이딩 픽셀 (크레이터 외곽 및 경사면 음영 #d69b2d) */}
                <g fill="#d69b2d">
                  {/* 북쪽 및 외곽 테두리 셰이딩 */}
                  <rect x="32" y="12" width="4" height="4" />
                  <rect x="44" y="12" width="4" height="4" />
                  <rect x="64" y="12" width="4" height="4" />
                  <rect x="84" y="24" width="4" height="6" />
                  <rect x="86" y="30" width="4" height="6" />
                  <rect x="88" y="54" width="4" height="8" />
                  <rect x="8" y="34" width="4" height="8" />
                  <rect x="8" y="52" width="4" height="8" />

                  {/* 바다 주변 전이 구역 도트 */}
                  <rect x="14" y="26" width="4" height="4" />
                  <rect x="18" y="22" width="4" height="4" />
                  <rect x="44" y="18" width="6" height="4" />
                  <rect x="52" y="16" width="4" height="4" />
                  <rect x="64" y="18" width="4" height="4" />
                  <rect x="76" y="20" width="4" height="4" />
                  <rect x="86" y="20" width="4" height="4" />
                  <rect x="48" y="40" width="4" height="6" />
                  <rect x="52" y="44" width="4" height="6" />
                  <rect x="54" y="50" width="4" height="6" />
                  <rect x="46" y="58" width="6" height="4" />
                  <rect x="26" y="66" width="4" height="4" />
                  <rect x="44" y="66" width="4" height="4" />
                  <rect x="70" y="64" width="4" height="6" />
                  <rect x="76" y="64" width="4" height="6" />
                  <rect x="82" y="60" width="4" height="6" />
                  <rect x="26" y="86" width="4" height="4" />
                  <rect x="70" y="86" width="4" height="4" />
                </g>

                {/* [4] 갈색 전이 픽셀 (바다 경계부 침전암 #875712) */}
                <g fill="#875712">
                  {/* 폭풍의 대양 및 비의 바다 외곽 */}
                  <rect x="14" y="34" width="4" height="6" />
                  <rect x="16" y="30" width="4" height="4" />
                  <rect x="24" y="22" width="4" height="4" />
                  <rect x="34" y="18" width="6" height="4" />
                  <rect x="42" y="22" width="4" height="4" />
                  <rect x="14" y="54" width="4" height="6" />
                  <rect x="20" y="60" width="4" height="4" />
                  <rect x="26" y="58" width="4" height="4" />

                  {/* 맑음의 바다 및 고요의 바다 외곽 */}
                  <rect x="56" y="18" width="6" height="4" />
                  <rect x="66" y="22" width="4" height="4" />
                  <rect x="68" y="32" width="4" height="4" />
                  <rect x="76" y="36" width="4" height="4" />
                  <rect x="78" y="46" width="4" height="6" />
                  <rect x="66" y="50" width="4" height="4" />

                  {/* 위기의 바다 외곽 */}
                  <rect x="76" y="24" width="4" height="4" />
                  <rect x="86" y="26" width="4" height="4" />
                  <rect x="86" y="34" width="4" height="4" />

                  {/* 구름의 바다 & 습기의 바다 외곽 */}
                  <rect x="16" y="60" width="4" height="4" />
                  <rect x="26" y="64" width="4" height="4" />
                  <rect x="36" y="54" width="4" height="4" />
                  <rect x="44" y="62" width="4" height="4" />
                </g>

                {/* 
                  [5] 실제 달의 주요 바다(Maria) 본체 픽셀 - 2x2 단위 정밀 구현
                  색상: 짙은 현무암 브라운 (#382006)
                */}
                <g fill="#382006">
                  {/* --- 1. Mare Imbrium (비의 바다) --- */}
                  <rect x="28" y="22" width="12" height="4" />
                  <rect x="26" y="26" width="18" height="4" />
                  <rect x="28" y="30" width="16" height="4" />
                  <rect x="30" y="34" width="12" height="4" />
                  <rect x="32" y="38" width="8" height="4" />

                  {/* --- 2. Oceanus Procellarum (폭풍의 대양) --- */}
                  <rect x="16" y="36" width="10" height="4" />
                  <rect x="14" y="40" width="14" height="4" />
                  <rect x="14" y="44" width="16" height="4" />
                  <rect x="16" y="48" width="14" height="4" />
                  <rect x="18" y="52" width="12" height="4" />
                  <rect x="22" y="56" width="8" height="4" />

                  {/* --- 3. Mare Serenitatis (맑음의 바다) --- */}
                  <rect x="54" y="22" width="10" height="4" />
                  <rect x="52" y="26" width="14" height="4" />
                  <rect x="54" y="30" width="12" height="4" />
                  <rect x="56" y="34" width="8" height="2" />

                  {/* --- 4. Mare Tranquillitatis (고요의 바다 - 아폴로 11 착륙지) --- */}
                  <rect x="62" y="34" width="12" height="4" />
                  <rect x="60" y="38" width="16" height="4" />
                  <rect x="62" y="42" width="14" height="4" />
                  <rect x="64" y="46" width="10" height="4" />

                  {/* --- 5. Mare Crisium (위기의 바다 - 북동쪽 고립된 둥근 바다) --- */}
                  <rect x="78" y="26" width="8" height="2" />
                  <rect x="76" y="28" width="10" height="4" />
                  <rect x="78" y="32" width="8" height="2" />

                  {/* --- 6. Mare Fecunditatis & Nectaris (풍요의 바다 / 감로의 바다) --- */}
                  <rect x="70" y="50" width="8" height="4" />
                  <rect x="72" y="54" width="8" height="4" />
                  <rect x="70" y="58" width="6" height="4" />
                  <rect x="60" y="54" width="6" height="4" />

                  {/* --- 7. Mare Nubium (구름의 바다) --- */}
                  <rect x="30" y="58" width="10" height="4" />
                  <rect x="32" y="62" width="8" height="4" />

                  {/* --- 8. Mare Humorum (습기의 바다) --- */}
                  <rect x="18" y="58" width="6" height="4" />
                  <rect x="18" y="62" width="6" height="4" />
                </g>

                {/* 
                  [6] 바다 중심부 가장 깊고 어두운 코어 픽셀 (#1a0d02)
                */}
                <g fill="#1a0d02">
                  {/* 비의 바다 심부 */}
                  <rect x="30" y="28" width="10" height="4" />
                  <rect x="32" y="32" width="8" height="2" />

                  {/* 폭풍의 대양 심부 */}
                  <rect x="16" y="42" width="8" height="6" />
                  <rect x="20" y="48" width="6" height="4" />

                  {/* 맑음의 바다 심부 */}
                  <rect x="56" y="26" width="6" height="4" />

                  {/* 고요의 바다 심부 */}
                  <rect x="64" y="38" width="8" height="4" />

                  {/* 위기의 바다 심부 */}
                  <rect x="78" y="28" width="6" height="3" />

                  {/* 구름의 바다 심부 */}
                  <rect x="32" y="60" width="4" height="4" />
                </g>

                {/* 
                  [7] 티코(Tycho) 크레이터 중심과 사방 2x2 광조(Rays) 시스템
                  - 첨부된 실제 달 사진의 가장 두드러진 특징인 남부 방사선 줄기 정밀 픽셀 재현
                */}
                {/* 티코 크레이터 코어 (순백색 #ffffff & 하이라이트 2x2) */}
                <rect x="48" y="80" width="4" height="4" fill="#ffffff" />
                <rect x="46" y="78" width="8" height="2" fill="#fffde8" opacity="0.8" />
                <rect x="46" y="84" width="8" height="2" fill="#fffde8" opacity="0.8" />
                <rect x="46" y="80" width="2" height="4" fill="#fffde8" opacity="0.8" />
                <rect x="52" y="80" width="2" height="4" fill="#fffde8" opacity="0.8" />

                {/* 2x2 정밀 티코 방사선 광조 줄기들 (Rays) */}
                <g fill="#ffffff">
                  {/* 북서쪽 광조 (Ray NW -> Mare Nubium -> Oceanus Procellarum) */}
                  <rect x="46" y="76" width="2" height="2" />
                  <rect x="44" y="74" width="2" height="2" />
                  <rect x="42" y="72" width="2" height="2" />
                  <rect x="40" y="70" width="2" height="2" />
                  <rect x="38" y="68" width="2" height="2" />
                  <rect x="36" y="64" width="2" height="2" />
                  <rect x="34" y="60" width="2" height="2" />
                  <rect x="30" y="56" width="2" height="2" />
                  <rect x="28" y="52" width="2" height="2" />
                  <rect x="24" y="48" width="2" height="2" />

                  {/* 북쪽 중앙 광조 (Ray North -> Copernicus 방향) */}
                  <rect x="49" y="76" width="2" height="2" />
                  <rect x="49" y="72" width="2" height="2" />
                  <rect x="48" y="68" width="2" height="2" />
                  <rect x="49" y="64" width="2" height="2" />
                  <rect x="47" y="60" width="2" height="2" />
                  <rect x="48" y="54" width="2" height="2" />
                  <rect x="46" y="48" width="2" height="2" />

                  {/* 북동쪽 광조 (Ray NE -> Mare Serenitatis / Tranquillitatis) */}
                  <rect x="52" y="76" width="2" height="2" />
                  <rect x="54" y="74" width="2" height="2" />
                  <rect x="56" y="70" width="2" height="2" />
                  <rect x="58" y="66" width="2" height="2" />
                  <rect x="62" y="62" width="2" height="2" />
                  <rect x="64" y="58" width="2" height="2" />
                  <rect x="68" y="52" width="2" height="2" />

                  {/* 동쪽 광조 (Ray East -> Mare Nectaris / Fecunditatis) */}
                  <rect x="54" y="78" width="2" height="2" />
                  <rect x="58" y="76" width="2" height="2" />
                  <rect x="62" y="76" width="2" height="2" />
                  <rect x="66" y="74" width="2" height="2" />
                  <rect x="70" y="72" width="2" height="2" />

                  {/* 남서쪽 및 서쪽 광조 */}
                  <rect x="44" y="80" width="2" height="2" />
                  <rect x="40" y="82" width="2" height="2" />
                  <rect x="36" y="82" width="2" height="2" />
                  <rect x="32" y="84" width="2" height="2" />
                  <rect x="28" y="84" width="2" height="2" />

                  {/* 남동쪽 광조 */}
                  <rect x="54" y="82" width="2" height="2" />
                  <rect x="58" y="84" width="2" height="2" />
                  <rect x="62" y="86" width="2" height="2" />
                  <rect x="66" y="86" width="2" height="2" />

                  {/* 남극 방향 광조 */}
                  <rect x="49" y="86" width="2" height="2" />
                  <rect x="50" y="90" width="2" height="2" />
                  <rect x="48" y="94" width="2" height="2" />
                </g>

                {/* 
                  [8] 코페르니쿠스(Copernicus) & 케플러(Kepler) & 아리스타르코스(Aristarchus)
                  - 바다 한가운데 빛나는 대표 크레이터와 미세 광조
                */}
                {/* 코페르니쿠스 (Copernicus, x: 36, y: 42) */}
                <rect x="36" y="42" width="4" height="4" fill="#ffffff" />
                <rect x="34" y="40" width="2" height="2" fill="#fff9cf" />
                <rect x="40" y="40" width="2" height="2" fill="#fff9cf" />
                <rect x="34" y="46" width="2" height="2" fill="#fff9cf" />
                <rect x="40" y="46" width="2" height="2" fill="#fff9cf" />
                {/* 코페르니쿠스 미세 광조 */}
                <rect x="32" y="38" width="2" height="2" fill="#ffffff" />
                <rect x="42" y="38" width="2" height="2" fill="#ffffff" />
                <rect x="38" y="36" width="2" height="2" fill="#ffffff" />
                <rect x="38" y="48" width="2" height="2" fill="#ffffff" />

                {/* 케플러 (Kepler, x: 24, y: 44) */}
                <rect x="24" y="44" width="2" height="2" fill="#ffffff" />
                <rect x="22" y="42" width="2" height="2" fill="#fff9cf" />
                <rect x="26" y="46" width="2" height="2" fill="#fff9cf" />

                {/* 아리스타르코스 (Aristarchus, x: 22, y: 30) - 달에서 가장 반사율 높은 고원 지대 */}
                <rect x="22" y="30" width="2" height="2" fill="#ffffff" />
                <rect x="20" y="30" width="2" height="2" fill="#fff9cf" />
              </pattern>

              {/* 
                ============================================================
                2. HIGH-PRECISION RETRO PIXEL ART DARK MOON PATTERN
                - 달의 밤/그림자 면에도 동일한 2x2 지형 구조를 깊은 우주 차콜/슬레이트 픽셀로 반영
                ============================================================
              */}
              <pattern
                id="retro-dark-moon"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                {/* 기본 어두운 달 밤하늘 바탕 */}
                <rect width="100" height="100" fill="#181512" />

                {/* 중간 그림자 픽셀 (고지대 약한 지구조 반사) */}
                <g fill="#24201b">
                  <rect x="42" y="4" width="16" height="4" />
                  <rect x="20" y="12" width="12" height="4" />
                  <rect x="68" y="10" width="10" height="4" />
                  <rect x="86" y="38" width="4" height="16" />
                  <rect x="10" y="38" width="4" height="14" />
                  <rect x="30" y="72" width="40" height="12" />
                  <rect x="38" y="90" width="24" height="6" />
                </g>

                {/* 짙은 바다 그림자 픽셀 (Mare Basalt Shadows) */}
                <g fill="#0e0c0a">
                  {/* 비의 바다 */}
                  <rect x="26" y="26" width="18" height="12" />
                  {/* 폭풍의 대양 */}
                  <rect x="14" y="40" width="16" height="14" />
                  {/* 맑음의 바다 & 고요의 바다 */}
                  <rect x="52" y="26" width="14" height="8" />
                  <rect x="60" y="36" width="16" height="12" />
                  {/* 위기의 바다 */}
                  <rect x="76" y="28" width="10" height="6" />
                  {/* 구름의 바다 & 습기의 바다 */}
                  <rect x="30" y="58" width="10" height="8" />
                  <rect x="18" y="58" width="6" height="8" />
                </g>

                {/* 가장 짙은 심연 픽셀 */}
                <g fill="#060504">
                  <rect x="30" y="28" width="10" height="6" />
                  <rect x="16" y="42" width="8" height="6" />
                  <rect x="64" y="38" width="8" height="6" />
                  <rect x="78" y="28" width="6" height="4" />
                </g>

                {/* 티코 및 코페르니쿠스 위치의 은은한 지구조(Earthshine) 반사 도트 */}
                <rect x="48" y="80" width="4" height="4" fill="#363028" />
                <rect x="44" y="74" width="2" height="2" fill="#2c2720" />
                <rect x="54" y="74" width="2" height="2" fill="#2c2720" />
                <rect x="36" y="42" width="4" height="4" fill="#363028" />
              </pattern>
            </defs>

            {/* 
              4개의 달 위상 분할 슬라이스:
              - 선택된 슬라이스(1): 밝은 황금빛 픽셀 아트 달 (url(#retro-bright-moon))
              - 선택되지 않은 슬라이스(0): 어두운 그림자 픽셀 아트 달 (url(#retro-dark-moon))
              - 분할 경계선: 중립 점선(#454550)으로 영역 안내
            */}

            {/* Slice 0: Far Left Crescent (왼쪽 외곽 눈썹달 영역) */}
            <path
              id="slice-0"
              role="button"
              tabIndex={0}
              aria-label="왼쪽 바깥 눈썹달 영역"
              d="M 50 0 A 50 50 0 0 0 50 100 A 25 50 0 0 1 50 0 Z"
              fill={slices[0] ? 'url(#retro-bright-moon)' : 'url(#retro-dark-moon)'}
              stroke="#404048"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              onClick={() => handleSliceClick(0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSliceClick(0);
                }
              }}
              className="transition-all duration-100 hover:brightness-110 active:opacity-90 cursor-pointer touch-manipulation focus:outline-none"
            />

            {/* Slice 1: Mid Left Gibbous (왼쪽 안쪽 반달/볼록 영역) */}
            <path
              id="slice-1"
              role="button"
              tabIndex={0}
              aria-label="왼쪽 안쪽 반달 영역"
              d="M 50 0 A 25 50 0 0 0 50 100 L 50 0 Z"
              fill={slices[1] ? 'url(#retro-bright-moon)' : 'url(#retro-dark-moon)'}
              stroke="#404048"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              onClick={() => handleSliceClick(1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSliceClick(1);
                }
              }}
              className="transition-all duration-100 hover:brightness-110 active:opacity-90 cursor-pointer touch-manipulation focus:outline-none"
            />

            {/* Slice 2: Mid Right Gibbous (오른쪽 안쪽 반달/볼록 영역) */}
            <path
              id="slice-2"
              role="button"
              tabIndex={0}
              aria-label="오른쪽 안쪽 반달 영역"
              d="M 50 0 L 50 100 A 25 50 0 0 0 50 0 Z"
              fill={slices[2] ? 'url(#retro-bright-moon)' : 'url(#retro-dark-moon)'}
              stroke="#404048"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              onClick={() => handleSliceClick(2)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSliceClick(2);
                }
              }}
              className="transition-all duration-100 hover:brightness-110 active:opacity-90 cursor-pointer touch-manipulation focus:outline-none"
            />

            {/* Slice 3: Far Right Crescent (오른쪽 외곽 눈썹달 영역) */}
            <path
              id="slice-3"
              role="button"
              tabIndex={0}
              aria-label="오른쪽 바깥 눈썹달 영역"
              d="M 50 0 A 25 50 0 0 1 50 100 A 50 50 0 0 0 50 0 Z"
              fill={slices[3] ? 'url(#retro-bright-moon)' : 'url(#retro-dark-moon)'}
              stroke="#404048"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              onClick={() => handleSliceClick(3)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSliceClick(3);
                }
              }}
              className="transition-all duration-100 hover:brightness-110 active:opacity-90 cursor-pointer touch-manipulation focus:outline-none"
            />

            {/* 
              가장 바깥쪽 원형 테두리 (Outer Boundary):
              - 고정된 중립 점선으로만 유지되며 절대 노란색으로 변하지 않음.
            */}
            <circle
              cx="50"
              cy="50"
              r="49.5"
              fill="none"
              stroke="#404048"
              strokeWidth="0.75"
              strokeDasharray="2 2"
              className="pointer-events-none"
            />
          </svg>
        </div>

        {/* 
          Quick-Preset Shortcuts: 
          [ 전체 비움 ] & [ 전체 채움 ]
        */}
        <div className="w-full flex items-center justify-between gap-2 mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => {
              sound.playClick(380);
              onSetAll(0);
            }}
            disabled={disabled}
            className="flex-1 py-1.5 sm:py-2 px-2 text-xs sm:text-sm font-black bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-zinc-300 rounded-lg border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 arcade-btn"
          >
            <span>🌑</span>
            <span>전체 비움</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick(500);
              onSetAll(1);
            }}
            disabled={disabled}
            className="flex-1 py-1.5 sm:py-2 px-2 text-xs sm:text-sm font-black bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-yellow-300 rounded-lg border border-yellow-500/30 transition-colors flex items-center justify-center gap-1.5 arcade-btn"
          >
            <span>🌕</span>
            <span>전체 채움</span>
          </button>
        </div>
      </div>
    </div>
  );
};
