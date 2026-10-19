export interface MoonPhase {
  id: string;
  name: string;
  alternateName?: string;
  date: string;
  angle: number; // Orbit angle in degrees (0 = new moon / right towards sun)
  target: [number, number, number, number]; // [left-outer, left-inner, right-inner, right-outer]
  description: string;
  tip: string;
}

export type QuestionType = 'name' | 'orbit' | 'date';

export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

export interface ScoreRecord {
  id: string;
  name: string;
  score: number;
  date: string;
  accuracy: number;
}

export const MOON_PHASES: MoonPhase[] = [
  {
    id: 'new_moon',
    name: '삭',
    alternateName: '그믐~초승 사이',
    date: '음력 1일경',
    angle: 0,
    target: [0, 0, 0, 0],
    description: '달이 태양과 지구 사이에 있어 보이지 않는 상태입니다.',
    tip: '태양 빛을 받는 면이 지구 반대편이라 밤하늘에서 보이지 않아요.'
  },
  {
    id: 'waxing_crescent',
    name: '초승달',
    alternateName: '오른쪽 눈썹달',
    date: '음력 2~3일경',
    angle: -45,
    target: [0, 0, 0, 1],
    description: '해 질 무렵 서쪽 하늘에 잠시 보이는 오른쪽이 얇은 눈썹달입니다.',
    tip: '오른쪽 가장자리만 살짝 빛나요.'
  },
  {
    id: 'first_quarter',
    name: '상현달',
    alternateName: '오른쪽 반달',
    date: '음력 7~8일경',
    angle: -90,
    target: [0, 0, 1, 1],
    description: '오른쪽 반쪽이 밝게 빛나는 반달로, 초저녁 남쪽 하늘에서 볼 수 있습니다.',
    tip: '오른쪽 반쪽이 꽉 찬 반달이에요.'
  },
  {
    id: 'waxing_gibbous',
    name: '상현~망 사이',
    alternateName: '차오르는 달',
    date: '음력 11~12일경',
    angle: -135,
    target: [0, 1, 1, 1],
    description: '상현달을 지나 보름달로 점점 차오르는 볼록한 달입니다.',
    tip: '왼쪽 가장자리 일부를 제외하고 대부분 빛나요.'
  },
  {
    id: 'full_moon',
    name: '보름달 (망)',
    alternateName: '둥근 달',
    date: '음력 15일경',
    angle: 180,
    target: [1, 1, 1, 1],
    description: '달 전체가 햇빛을 받아 둥글고 밝게 빛나는 달입니다.',
    tip: '지구가 태양과 달 사이에 있어 둥근 면 전체가 환해요.'
  },
  {
    id: 'waning_gibbous',
    name: '망~하현 사이',
    alternateName: '기우는 달',
    date: '음력 18~19일경',
    angle: 135,
    target: [1, 1, 1, 0],
    description: '보름달에서 하현달로 가면서 오른쪽부터 조금씩 이지러지는 달입니다.',
    tip: '오른쪽 가장자리 일부를 제외하고 왼쪽이 가득 차 있어요.'
  },
  {
    id: 'third_quarter',
    name: '하현달',
    alternateName: '왼쪽 반달',
    date: '음력 22~23일경',
    angle: 90,
    target: [1, 1, 0, 0],
    description: '왼쪽 반쪽이 밝게 빛나는 반달로, 자정 무렵 동쪽에서 뜹니다.',
    tip: '왼쪽 반쪽이 밝은 반달이에요.'
  },
  {
    id: 'waning_crescent',
    name: '그믐달',
    alternateName: '왼쪽 눈썹달',
    date: '음력 27~28일경',
    angle: 45,
    target: [1, 0, 0, 0],
    description: '새벽녘 동쪽 하늘에 가늘게 보이는 왼쪽이 얇은 눈썹달입니다.',
    tip: '왼쪽 가장자리만 얇게 빛나요.'
  }
];
