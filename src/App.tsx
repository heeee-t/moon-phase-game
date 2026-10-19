import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MOON_PHASES, MoonPhase, QuestionType, GameState, ScoreRecord } from './types/game';
import { sound } from './utils/audio';
import { MoonOrbitDiagram } from './components/MoonOrbitDiagram';
import { InteractiveMoon } from './components/InteractiveMoon';
import { StudyAlmanacModal } from './components/StudyAlmanacModal';
import {
  fetchTopScores,
  recordNewScore,
  isFirebaseConfigured
} from './services/firebase';
import {
  Volume2,
  VolumeX,
  BookOpen,
  Trophy,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Flame,
  Pause,
  Smartphone,
  RefreshCw,
  Globe
} from 'lucide-react';

export default function App() {
  // Game states
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentPhase, setCurrentPhase] = useState<MoonPhase>(MOON_PHASES[0]);
  const [questionType, setQuestionType] = useState<QuestionType>('name');
  const [userSlices, setUserSlices] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [comboCount, setComboCount] = useState<number>(0);
  const [isHintUsed, setIsHintUsed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Statistics
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);

  // UI Modals, Popups & Orientation State
  const [isAlmanacOpen, setIsAlmanacOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [comboMessage, setComboMessage] = useState<string | null>(null);
  const [wrongMessage, setWrongMessage] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [hasSavedScore, setHasSavedScore] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<ScoreRecord[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState<boolean>(false);
  const [leaderboardSource, setLeaderboardSource] = useState<'firestore' | 'local'>('local');
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  // Refs
  const lastPhaseIndexRef = useRef<number>(-1);
  const lastCorrectTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // Fetch leaderboard asynchronously from Firestore or localStorage
  const loadScores = useCallback(async () => {
    setIsLoadingScores(true);
    try {
      const res = await fetchTopScores();
      setLeaderboard(res.records);
      setLeaderboardSource(res.source);
    } catch (err) {
      console.warn('[Leaderboard] Load error:', err);
    } finally {
      setIsLoadingScores(false);
    }
  }, []);

  // Load Leaderboard on mount & Orientation Lock Handling
  useEffect(() => {
    loadScores();

    const tryLockPortrait = () => {
      try {
        if (typeof screen !== 'undefined' && screen.orientation && 'lock' in screen.orientation) {
          (screen.orientation as any).lock('portrait').catch(() => {});
        }
      } catch {
        // Silently ignored if unsupported or denied
      }
    };

    const checkOrientation = () => {
      tryLockPortrait();
      // Detect landscape when device width exceeds height on mobile/tablet viewports
      const isLand = window.innerWidth > window.innerHeight && (window.innerHeight < 680 || window.innerWidth < 1000);
      setIsLandscape(isLand);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Sync mute state
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.isMuted = next;
    if (!next) {
      sound.playClick(600);
    }
  };

  // Open Leaderboard & sync
  const openLeaderboard = () => {
    sound.playClick(440);
    setIsLeaderboardOpen(true);
    loadScores();
  };

  // Start Game
  const handleStartGame = () => {
    // Attempt orientation lock on user gesture
    try {
      if (typeof screen !== 'undefined' && screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('portrait').catch(() => {});
      }
    } catch {
      // Ignored
    }

    sound.playClick(520);
    setScore(0);
    setTimeLeft(90);
    setComboCount(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setTotalAttempts(0);
    setHasSavedScore(false);
    setPlayerName('');
    lastCorrectTimeRef.current = 0;
    setGameState('PLAYING');
    pickNextQuestion();
  };

  // Timer Tick (Automatically pauses when isAlmanacOpen or isLeaderboardOpen is true)
  useEffect(() => {
    if (gameState === 'PLAYING' && !isAlmanacOpen && !isLeaderboardOpen) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, isAlmanacOpen, isLeaderboardOpen]);

  // Game Over
  const handleGameOver = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sound.playGameOver();
    setGameState('GAMEOVER');
  };

  // Pick Next Random Question (avoiding consecutive same phases)
  const pickNextQuestion = () => {
    let nextIdx: number;
    do {
      nextIdx = Math.floor(Math.random() * MOON_PHASES.length);
    } while (nextIdx === lastPhaseIndexRef.current && MOON_PHASES.length > 1);

    lastPhaseIndexRef.current = nextIdx;
    const nextPhase = MOON_PHASES[nextIdx];
    setCurrentPhase(nextPhase);

    // Question types: name, orbit, or date
    const types: QuestionType[] = ['name', 'orbit', 'date'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    setQuestionType(selectedType);

    // Reset user slices and hint
    setUserSlices([0, 0, 0, 0]);
    setIsHintUsed(false);
  };

  // Toggle Moon Slice
  const handleToggleSlice = (index: number) => {
    setUserSlices((prev) => {
      const next: [number, number, number, number] = [...prev];
      next[index] = next[index] === 1 ? 0 : 1;
      return next;
    });
  };

  // Quick Preset Actions
  const handleSetAll = (val: number) => {
    setUserSlices([val, val, val, val]);
  };

  // Use Hint (Costs 5 points, activates remaining clues)
  const handleUseHint = () => {
    if (isHintUsed) return;
    sound.playHint();
    setIsHintUsed(true);
    setScore((prev) => Math.max(0, prev - 5));
    triggerComboMessage('힌트 활성화! (-5점)');
  };

  // Pass Question (Costs 5 points, resets combo)
  const handlePassQuestion = () => {
    sound.playClick(300);
    setScore((prev) => Math.max(0, prev - 5));
    setComboCount(0);
    setTotalAttempts((prev) => prev + 1);
    triggerComboMessage('패스! (-5점)');
    pickNextQuestion();
  };

  // Check Answer
  const handleCheckAnswer = () => {
    const isCorrect = userSlices.every((val, idx) => val === currentPhase.target[idx]);
    setTotalAttempts((prev) => prev + 1);

    if (isCorrect) {
      const now = Date.now();
      const isQuick = lastCorrectTimeRef.current > 0 && now - lastCorrectTimeRef.current <= 5000;
      const nextCombo = isQuick ? comboCount + 1 : 1;
      setComboCount(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setCorrectCount((prev) => prev + 1);

      // Points calculation
      let points = 20;
      if (nextCombo >= 2) {
        points += 15;
        sound.playCombo();
        triggerComboMessage(`COMBO x${nextCombo}! +${points}`);
        setScore((prev) => prev + points);
      } else {
        setScore((prev) => prev + points);
        sound.playCorrect();
        triggerComboMessage(`GREAT! +${points}`);
      }

      lastCorrectTimeRef.current = now;
      pickNextQuestion();
    } else {
      sound.playWrong();
      setComboCount(0);
      setWrongMessage(true);
      setTimeout(() => {
        setWrongMessage(false);
      }, 1200);
    }
  };

  const triggerComboMessage = (msg: string) => {
    setComboMessage(msg);
    setTimeout(() => {
      setComboMessage(null);
    }, 1100);
  };

  // Save Score to Leaderboard (Firestore + Local fallback)
  const handleSaveScore = async () => {
    const finalName = playerName.trim() || '달탐험가';
    sound.playClick(600);
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    const newRecord: ScoreRecord = {
      id: Date.now().toString(),
      name: finalName,
      score,
      date: new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
      accuracy
    };

    setHasSavedScore(true);
    await recordNewScore(newRecord);
    await loadScores();
  };

  return (
    <div className="h-dvh max-h-dvh w-screen overflow-hidden flex items-center justify-center bg-zinc-950 p-0 sm:p-2 md:p-3 text-zinc-100 select-none touch-manipulation">
      {/* 
        RESPONSIVE RETRO ARCADE CABINET CONTAINER
        Fills the available screen in tablet and mobile viewports with no excess dead borders and no bottom clipping!
      */}
      <div className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl h-full sm:h-[98dvh] sm:max-h-[1050px] bg-gradient-to-b from-red-600 via-rose-700 to-red-800 rounded-none sm:rounded-3xl p-1.5 sm:p-3.5 md:p-4 shadow-2xl border-0 sm:border-4 border-red-900/80 flex flex-col justify-between items-center shrink-0 overflow-hidden">
        
        {/* Screw rivets on 4 corners (hidden on mobile full-bleed for max area) */}
        <div className="hidden sm:flex absolute top-2 left-2.5 w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-600 shadow-inner items-center justify-center text-[8px] text-zinc-700 font-bold select-none">+</div>
        <div className="hidden sm:flex absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-600 shadow-inner items-center justify-center text-[8px] text-zinc-700 font-bold select-none">+</div>
        <div className="hidden sm:flex absolute bottom-2 left-2.5 w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-600 shadow-inner items-center justify-center text-[8px] text-zinc-700 font-bold select-none">+</div>
        <div className="hidden sm:flex absolute bottom-2 right-2.5 w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-600 shadow-inner items-center justify-center text-[8px] text-zinc-700 font-bold select-none">+</div>

        {/* 
          1. Console Top Bar
          (Power LED & Speaker Slits only, no marquee title)
        */}
        <div className="w-full flex items-center justify-between px-2 py-0.5 mb-0.5 sm:mb-1 select-none shrink-0">
          {/* Power LED */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span className="text-[9px] sm:text-xs tracking-wider text-rose-200 font-black">POWER ON</span>
          </div>

          {/* Speaker Slits */}
          <div className="flex gap-1.5">
            <div className="w-1.5 h-2 sm:h-3 bg-zinc-900/70 rounded-full" />
            <div className="w-1.5 h-2 sm:h-3 bg-zinc-900/70 rounded-full" />
            <div className="w-1.5 h-2 sm:h-3 bg-zinc-900/70 rounded-full" />
            <div className="w-1.5 h-2 sm:h-3 bg-zinc-900/70 rounded-full" />
            <div className="w-1.5 h-2 sm:h-3 bg-zinc-900/70 rounded-full" />
          </div>
        </div>

        {/* 
          2. INNER CRT ARCADE MONITOR SCREEN
          (All action buttons: SUBMIT, HINT, PASS are inside this screen, with zero clipping!)
        */}
        <div className="crt-screen relative w-full flex-1 min-h-0 bg-black rounded-xl sm:rounded-2xl border-2 sm:border-4 md:border-6 border-zinc-900 shadow-[inset_0_0_25px_rgba(0,0,0,0.95)] p-1.5 sm:p-3 flex flex-col justify-between overflow-y-auto">
          {/* CRT Glare Reflection */}
          <div className="crt-glare" />

          {/* Floating Combo Toast Notification */}
          {comboMessage && (
            <div className="absolute top-10 sm:top-11 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-lg bg-cyan-950/95 border-2 border-cyan-400 text-cyan-300 font-black text-xs sm:text-sm tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-bounce select-none whitespace-nowrap">
              🔥 {comboMessage}
            </div>
          )}

          {/* Floating Wrong Answer Alert */}
          {wrongMessage && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-red-950/95 border-2 border-red-500 text-red-200 font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(239,68,68,0.9)] flex items-center gap-1.5 animate-in zoom-in-95 duration-150 select-none whitespace-nowrap">
              <AlertCircle className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
              <span>다시 생각해보세요!</span>
            </div>
          )}

          {/* ==================== STATE 1: START SCREEN ==================== */}
          {gameState === 'START' && (
            <div className="h-full min-h-0 flex flex-col justify-between z-20">
              {/* Top utility row */}
              <div className="flex items-center justify-end gap-1 select-none shrink-0 pb-1 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick(440);
                    setIsAlmanacOpen(true);
                  }}
                  className="px-2 py-0.5 sm:py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border border-zinc-700 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold arcade-btn"
                >
                  <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
                  <span>도감</span>
                </button>
                <button
                  type="button"
                  onClick={openLeaderboard}
                  className="px-2 py-0.5 sm:py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold arcade-btn"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>랭킹</span>
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 arcade-btn"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>

              {/* Center Content Block (제목 + 설명 칸 + 시작 버튼이 하나의 유기적인 블록으로 배치) */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-1 my-auto w-full max-w-sm sm:max-w-md mx-auto">
                {/* 1. 제목 영역 */}
                <div className="mb-1.5 sm:mb-3">
                  <div className="text-base sm:text-2xl mb-1 tracking-widest text-amber-300 select-none">
                    🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘
                  </div>
                  <h1 className="text-xl sm:text-3xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)] mb-0.5 sm:mb-1">
                    달의 위상 마스터
                  </h1>
                  <p className="text-[11px] sm:text-sm text-zinc-400">
                    레트로 아케이드 에디션 · 과학 수업 탐구 게임
                  </p>
                </div>

                {/* 2. 게임 방법 설명 칸 (간격 확보, font-normal 적용, 큰 글씨 크기 통일) */}
                <div className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-left space-y-1.5 sm:space-y-2.5 shadow-inner mt-1 sm:mt-2 mb-2.5 sm:mb-4">
                  <div className="flex items-start gap-2 text-emerald-400 text-xs sm:text-base font-normal">
                    <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] sm:text-[10px] font-bold border border-emerald-500 shrink-0 mt-0.5">1</span>
                    <span>제한시간 90초 동안 도전합니다!</span>
                  </div>
                  <div className="flex items-start gap-2 text-yellow-300 text-xs sm:text-base font-normal">
                    <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-yellow-500/20 flex items-center justify-center text-[9px] sm:text-[10px] font-bold border border-yellow-500 shrink-0 mt-0.5">2</span>
                    <span>반짝이는 단서(명칭, 공전 위치, 음력 날짜)를 확인하세요.</span>
                  </div>
                  <div className="flex items-start gap-2 text-cyan-300 text-xs sm:text-base font-normal">
                    <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[9px] sm:text-[10px] font-bold border border-cyan-500 shrink-0 mt-0.5">3</span>
                    <span>달의 조각을 터치하여 알맞은 위상을 색칠하세요.</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 flex flex-col gap-1 sm:gap-1.5 text-xs sm:text-base font-normal">
                    <span className="text-amber-400">⚡ 5초 내 연속 정답 시 콤보 점수 (+15점)</span>
                    <span className="text-rose-400">⚠️ 힌트 또는 패스 사용 시 (-5점)</span>
                    <span className="text-sky-300">💡 학습 도감을 열면 시간이 자동으로 멈춥니다.</span>
                  </div>
                </div>

                {/* 3. 게임 시작 버튼 (설명 칸 바로 아래에 적절한 간격을 두고 긴밀하게 배치) */}
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="w-full py-2.5 sm:py-3.5 md:py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-black text-sm sm:text-lg rounded-xl sm:rounded-2xl arcade-btn shadow-[0_4px_0_#065f46] tracking-wider border-2 border-emerald-300 flex items-center justify-center gap-2"
                >
                  ▶ 게임 시작 (GAME START)
                </button>
              </div>
            </div>
          )}

          {/* ==================== STATE 2: GAME OVER SCREEN ==================== */}
          {gameState === 'GAMEOVER' && (
            <div className="h-full min-h-0 flex flex-col justify-between z-20">
              {/* Top utility row */}
              <div className="flex items-center justify-end gap-1 select-none shrink-0 pb-1 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick(440);
                    setIsAlmanacOpen(true);
                  }}
                  className="px-2 py-0.5 sm:py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border border-zinc-700 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold arcade-btn"
                >
                  <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
                  <span>도감</span>
                </button>
                <button
                  type="button"
                  onClick={openLeaderboard}
                  className="px-2 py-0.5 sm:py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold arcade-btn"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>랭킹</span>
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 arcade-btn"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>

              {/* Center Game Over Details */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-1 my-auto">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)] mb-0.5 tracking-wider">
                  GAME OVER
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mb-2">탐구 미션이 종료되었습니다</p>

                {/* Score Card */}
                <div className="w-full max-w-sm sm:max-w-md bg-zinc-900 border-2 border-zinc-700 rounded-xl p-2.5 sm:p-3 mb-2 sm:mb-2.5 shadow-inner">
                  <div className="text-[11px] sm:text-xs text-zinc-400">최종 획득 점수</div>
                  <div className="text-2xl sm:text-4xl md:text-5xl font-black text-yellow-400 tracking-wider my-0.5">
                    {score} <span className="text-xs text-yellow-200 font-normal">PTS</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-zinc-800 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[9px] sm:text-[10px]">정답 수</span>
                      <span className="font-bold text-emerald-400 text-xs sm:text-sm">{correctCount}회</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] sm:text-[10px]">정답률</span>
                      <span className="font-bold text-sky-400 text-xs sm:text-sm">
                        {totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0}%
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px] sm:text-[10px]">최고 콤보</span>
                      <span className="font-bold text-amber-400 text-xs sm:text-sm">{maxCombo}연속</span>
                    </div>
                  </div>
                </div>

                {/* Record Save Form */}
                {!hasSavedScore ? (
                  <div className="w-full max-w-sm sm:max-w-md flex items-center gap-1.5 mb-2">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="이름 (최대 6자)"
                      maxLength={6}
                      className="flex-1 bg-zinc-950 border-2 border-emerald-500 rounded-lg px-2.5 py-1.5 sm:py-2 text-center text-xs sm:text-sm font-bold text-emerald-400 placeholder:text-zinc-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveScore}
                      className="py-1.5 sm:py-2 px-3 sm:px-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-lg arcade-btn shadow-[0_3px_0_#065f46] whitespace-nowrap"
                    >
                      기록 저장
                    </button>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-emerald-400 font-bold mb-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> 명예의 전당에 등록되었습니다!
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2 w-full pt-1 shrink-0">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="flex-1 py-2.5 sm:py-3.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-black text-xs sm:text-sm rounded-xl arcade-btn shadow-[0_3px_0_#ca8a04] sm:shadow-[0_4px_0_#ca8a04] flex items-center justify-center gap-1.5 border border-yellow-200"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  다시 도전하기
                </button>
                <button
                  type="button"
                  onClick={openLeaderboard}
                  className="py-2.5 sm:py-3 px-3 sm:px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm rounded-xl border border-zinc-700 arcade-btn flex items-center justify-center gap-1"
                >
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  순위표
                </button>
              </div>
            </div>
          )}

          {/* ==================== STATE 3: PLAYING SCREEN ==================== */}
          {gameState === 'PLAYING' && (
            <div className="h-full min-h-0 flex flex-col justify-between z-20 gap-1 sm:gap-1.5">
              {/* TOP HUD BAR */}
              <div className="flex items-center justify-between pb-1.5 border-b border-dashed border-emerald-500/40 text-emerald-400 select-none shrink-0 text-xs sm:text-sm">
                {/* Timer & Pause indicator */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-zinc-400 text-[11px] sm:text-xs md:text-sm font-black">TIME:</span>
                  <span
                    className={`text-xs sm:text-base md:text-lg font-black px-2 py-0.5 rounded-lg border ${
                      timeLeft <= 15
                        ? 'bg-rose-950 text-rose-300 animate-pulse border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                        : 'bg-zinc-900 text-emerald-300 border-zinc-700'
                    }`}
                  >
                    {timeLeft}s
                  </span>
                  {(isAlmanacOpen || isLeaderboardOpen) && (
                    <span className="text-[10px] sm:text-xs text-yellow-400 bg-yellow-950/90 px-1.5 py-0.5 rounded border border-yellow-500/50 flex items-center gap-0.5 animate-pulse font-black">
                      <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      일시정지
                    </span>
                  )}
                </div>

                {/* Score & Combo */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-zinc-400 text-[11px] sm:text-xs md:text-sm font-black">SCORE:</span>
                  <span className="text-xs sm:text-base md:text-lg font-black text-yellow-300 px-2 py-0.5 bg-zinc-900 rounded-lg border border-zinc-700">
                    {score}
                  </span>
                  {comboCount >= 2 && (
                    <span className="text-[11px] sm:text-xs md:text-sm text-cyan-300 font-black flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 text-cyan-400 inline" />
                      x{comboCount}
                    </span>
                  )}
                </div>

                {/* Utility Buttons Trio (우측 상단) */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick(440);
                      setIsAlmanacOpen(true);
                    }}
                    title="학습 도감 보기 (시간 일시 정지)"
                    className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-yellow-300 border border-zinc-700 flex items-center gap-1 text-[11px] sm:text-xs font-bold arcade-btn"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
                    <span>도감</span>
                  </button>

                  <button
                    type="button"
                    onClick={openLeaderboard}
                    title="명예의 전당 랭킹 보기 (시간 일시 정지)"
                    className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 flex items-center gap-1 text-[11px] sm:text-xs font-bold arcade-btn"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>랭킹</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    title={isMuted ? '음소거 해제' : '음소거'}
                    className="p-1 sm:p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 arcade-btn"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {/* 
                MIDDLE DISPLAY: Clues & Orbit Diagram
              */}
              <div className="flex flex-col gap-1 sm:gap-1.5 my-auto shrink-0">
                {/* Clue 1: Moon Name */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="w-16 sm:w-18 md:w-20 shrink-0 text-xs sm:text-sm font-black text-emerald-400 tracking-wide">
                    명칭
                  </span>
                  <div
                    className={`flex-1 min-h-[32px] sm:min-h-[38px] md:min-h-[44px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl border-2 text-sm sm:text-base md:text-lg font-black flex items-center justify-center transition-all ${
                      questionType === 'name' || isHintUsed
                        ? 'border-yellow-400 bg-zinc-900 text-white neon-active shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-700'
                    }`}
                  >
                    {questionType === 'name' || isHintUsed ? currentPhase.name : '? ? ?'}
                  </div>
                </div>

                {/* Clue 2: Orbit Diagram */}
                <div className="py-1 w-full">
                  <MoonOrbitDiagram
                    angle={currentPhase.angle}
                    isVisible={questionType === 'orbit' || isHintUsed}
                    isHintActive={questionType === 'orbit' || isHintUsed}
                  />
                </div>

                {/* Clue 3: Lunar Date */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <span className="w-16 sm:w-18 md:w-20 shrink-0 text-xs sm:text-sm font-black text-emerald-400 tracking-wide">
                    음력 날짜
                  </span>
                  <div
                    className={`flex-1 min-h-[32px] sm:min-h-[38px] md:min-h-[44px] px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl border-2 text-sm sm:text-base md:text-lg font-black flex items-center justify-center transition-all ${
                      questionType === 'date' || isHintUsed
                        ? 'border-yellow-400 bg-zinc-900 text-white neon-active shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-700'
                    }`}
                  >
                    {questionType === 'date' || isHintUsed ? currentPhase.date : '? ? ?'}
                  </div>
                </div>
              </div>

              {/* 
                LOWER DISPLAY: Interactive Moon Slicing Component
              */}
              <div className="my-auto shrink-0">
                <InteractiveMoon
                  slices={userSlices}
                  onToggleSlice={handleToggleSlice}
                  onSetAll={handleSetAll}
                />
              </div>

              {/* 
                INTERNAL ACTION BUTTONS (SUBMIT, HINT, PASS)
                Scaled up by ~15% on mobile for comfortable touch and reduced empty space!
              */}
              <div className="flex items-center gap-2 pt-1.5 sm:pt-2 border-t border-emerald-500/20 shrink-0 select-none">
                {/* SUBMIT BUTTON */}
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  className="flex-1 h-13 sm:h-16 md:h-20 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 active:from-emerald-600 active:to-green-600 text-zinc-950 font-black text-sm sm:text-base md:text-xl rounded-xl sm:rounded-2xl arcade-btn shadow-[0_4px_0_#065f46] sm:shadow-[0_5px_0_#065f46] tracking-wider border-2 border-emerald-300 flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span>정답 확인</span>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-black/20 rounded">
                    SUBMIT
                  </span>
                </button>

                {/* HINT & PASS BUTTONS */}
                <div className="flex flex-col gap-1 sm:gap-1.5 w-26 sm:w-30 md:w-36 shrink-0">
                  <button
                    type="button"
                    onClick={handleUseHint}
                    disabled={isHintUsed}
                    className={`h-6 sm:h-7.5 md:h-9 px-1.5 sm:px-2 font-black text-[11px] sm:text-xs md:text-sm rounded-lg sm:rounded-xl arcade-btn flex items-center justify-center gap-1 border ${
                      isHintUsed
                        ? 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed'
                        : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 border-amber-300 shadow-[0_2.5px_0_#b45309] sm:shadow-[0_3px_0_#b45309]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>힌트 (-5)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePassQuestion}
                    className="h-6 sm:h-7.5 md:h-9 px-1.5 sm:px-2 font-black text-[11px] sm:text-xs md:text-sm bg-rose-600 hover:bg-rose-500 text-white rounded-lg sm:rounded-xl arcade-btn shadow-[0_2.5px_0_#881337] sm:shadow-[0_3px_0_#881337] border border-rose-400 flex items-center justify-center gap-1"
                  >
                    <span>패스 (-5)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 
          3. Physical Console Chassis Bottom
        */}
        <div className="w-full mt-0.5 sm:mt-1.5 px-2 py-0.5 flex items-center justify-between text-rose-200/80 text-[9px] sm:text-xs font-black select-none shrink-0">
          <div className="flex items-center gap-1.5 opacity-80">
            <div className="w-1.5 h-2 bg-zinc-900/90 rounded" />
            <div className="w-1.5 h-2 bg-zinc-900/90 rounded" />
            <div className="w-1.5 h-2 bg-zinc-900/90 rounded" />
            <div className="w-1.5 h-2 bg-zinc-900/90 rounded" />
          </div>

          <div className="tracking-widest">
            RETRO ARCADE 3000
          </div>

          <div className="flex items-center gap-1.5">
            <span>1 PLAYER</span>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: STUDY ALMANAC */}
      <StudyAlmanacModal
        isOpen={isAlmanacOpen}
        onClose={() => setIsAlmanacOpen(false)}
      />

      {/* MODAL 2: LEADERBOARD */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-950 border-4 border-amber-400 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] text-zinc-100 p-3 sm:p-4">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-zinc-800 gap-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold min-w-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <h3 className="text-xs sm:text-base font-black truncate">명예의 전당 (HIGH SCORES)</h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={loadScores}
                  disabled={isLoadingScores}
                  title="기록 새로고침"
                  className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 arcade-btn disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isLoadingScores ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick(300);
                    setIsLeaderboardOpen(false);
                  }}
                  className="text-zinc-400 hover:text-white text-xs px-2 py-1 bg-zinc-900 rounded border border-zinc-700"
                >
                  닫기 ✕
                </button>
              </div>
            </div>

            {/* Storage Mode Status Indicator */}
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 my-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800 text-[10px] sm:text-xs">
              <span className="text-zinc-400">데이터 동기화 상태:</span>
              <span className={`font-bold ${leaderboardSource === 'firestore' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {leaderboardSource === 'firestore' ? '🟢 온라인 공유 (Firestore)' : '🟡 로컬 모드 (기기 저장)'}
              </span>
            </div>

            <div className="py-2 sm:py-2.5 max-h-64 sm:max-h-72 overflow-y-auto space-y-1.5">
              {isLoadingScores ? (
                <div className="text-center py-8 text-zinc-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                  <span>랭킹 데이터를 동기화하는 중...</span>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs leading-relaxed text-justify-korean">
                  아직 등록된 기록이 없습니다.<br />첫 번째 챔피언에 도전해보세요!
                </div>
              ) : (
                leaderboard.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 text-center font-black shrink-0 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-500' : 'text-zinc-500'}`}>
                        {idx + 1}
                      </span>
                      <span className="text-zinc-200 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sky-400 text-[10px]">{item.accuracy}%</span>
                      <span className="text-yellow-300 font-black">{item.score} <span className="text-[10px] text-zinc-500 font-normal">PTS</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 
        MODAL 3: LANDSCAPE ORIENTATION WARNING OVERLAY
        Ensures the game remains strictly in portrait mode for mobile and tablet touch devices
      */}
      {isLandscape && (
        <div className="fixed inset-0 z-50 bg-zinc-950/98 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none text-zinc-100 animate-in fade-in duration-200">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(244,63,94,0.5)]">
            <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400 rotate-90 animate-bounce" />
          </div>
          <div className="text-xs sm:text-sm text-yellow-300 font-bold mb-1 tracking-widest">
            PORTRAIT ONLY
          </div>
          <h2 className="text-base sm:text-xl font-black text-rose-400 mb-2">
            세로 화면 전용 게임입니다
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xs leading-relaxed mb-4 text-justify-korean">
            본 과학 탐구 게임은 학생들의 수업과 학습 편의를 위해 모바일 및 태블릿 세로 화면에 최적화되어 있습니다. 기기를 세로(Portrait) 방향으로 회전해 주세요!
          </p>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            기기를 세로로 돌리면 화면이 즉시 복원됩니다.
          </div>
        </div>
      )}
    </div>
  );
}
