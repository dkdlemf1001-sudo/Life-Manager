import { AppId, AppDefinition, MaintenanceItem, StockHolding, Goal, Muse } from './types';
import { 
  Car, 
  TrendingUp, 
  Target, 
  Bot, 
  Settings, 
  LayoutDashboard,
  Heart,
  CreditCard
} from 'lucide-react';

export const APPS: AppDefinition[] = [
  {
    id: AppId.HOME,
    name: '대시보드',
    icon: LayoutDashboard,
    color: 'bg-indigo-500',
    description: '전체 요약'
  },
  {
    id: AppId.IDEAL_TYPE,
    name: '이상형 갤러리',
    icon: Heart,
    color: 'bg-pink-500',
    description: 'My Muses'
  },
  {
    id: AppId.GAGEBU,
    name: '가계부',
    icon: CreditCard,
    color: 'bg-orange-500',
    description: '소비 기록 및 분석'
  },
  {
    id: AppId.CAR,
    name: '차량 관리',
    icon: Car,
    color: 'bg-blue-500',
    description: '정비 및 로그'
  },
  {
    id: AppId.FINANCE,
    name: '투자 관리',
    icon: TrendingUp,
    color: 'bg-green-500',
    description: '주식 및 자산'
  },
  {
    id: AppId.GOALS,
    name: '목표 관리',
    icon: Target,
    color: 'bg-red-500',
    description: '진행 상황 추적'
  },
  {
    id: AppId.AI_ASSISTANT,
    name: 'AI 비서',
    icon: Bot,
    color: 'bg-purple-600',
    description: '라이프 어시스턴트'
  },
  {
    id: AppId.SETTINGS,
    name: '설정',
    icon: Settings,
    color: 'bg-gray-500',
    description: '시스템 설정'
  },
];

export const EXPENSE_CATEGORIES = [
  '식비', '교통/차량', '쇼핑', '주거/통신', '문화/여가', '의료/건강', '저축/투자', '기타'
];

export const INITIAL_MAINTENANCE: MaintenanceItem[] = [
  {
    id: '1',
    name: '엔진 오일',
    lastServiceDate: '2023-10-15',
    lastServiceMileage: 45000,
    intervalMonths: 6,
    intervalKm: 10000,
    status: '점검 필요'
  },
  {
    id: '2',
    name: '타이어 위치 교환',
    lastServiceDate: '2023-08-01',
    lastServiceMileage: 42000,
    intervalMonths: 6,
    intervalKm: 12000,
    status: '양호'
  },
  {
    id: '3',
    name: '브레이크 오일',
    lastServiceDate: '2022-05-20',
    lastServiceMileage: 30000,
    intervalMonths: 24,
    intervalKm: 40000,
    status: '긴급'
  },
  {
    id: '4',
    name: '에어컨 필터',
    lastServiceDate: '2023-06-01',
    lastServiceMileage: 40000,
    intervalMonths: 6,
    intervalKm: 10000,
    status: '점검 필요'
  },
  {
    id: '5',
    name: '와이퍼',
    lastServiceDate: '2023-07-15',
    lastServiceMileage: 41000,
    intervalMonths: 12,
    intervalKm: 20000,
    status: '양호'
  },
  {
    id: '6',
    name: '냉각수(부동액)',
    lastServiceDate: '2021-12-01',
    lastServiceMileage: 25000,
    intervalMonths: 24,
    intervalKm: 40000,
    status: '긴급'
  }
];

export const INITIAL_STOCKS: StockHolding[] = [
  { symbol: 'AAPL', name: '애플', shares: 15, avgPrice: 150, currentPrice: 175 },
  { symbol: 'TSLA', name: '테슬라', shares: 5, avgPrice: 200, currentPrice: 180 },
  { symbol: 'NVDA', name: '엔비디아', shares: 2, avgPrice: 400, currentPrice: 850 },
  { symbol: 'VOO', name: 'S&P 500 ETF', shares: 10, avgPrice: 380, currentPrice: 450 },
];

export const INITIAL_GOALS: Goal[] = [
  { id: '1', title: '2,000만원 저축하기', category: '금융', progress: 65, targetDate: '2024-12-31' },
  { id: '2', title: '책 12권 읽기', category: '개인', progress: 25, targetDate: '2024-12-31' },
  { id: '3', title: '하프 마라톤 완주', category: '건강', progress: 40, targetDate: '2024-09-15' },
  { id: '4', title: '타입스크립트 마스터', category: '커리어', progress: 90, targetDate: '2024-06-01' },
];

export const INITIAL_MUSES: Muse[] = [
  {
    id: 'moka',
    name: 'MOKA',
    koreanName: '모카',
    group: 'ILLIT',
    birthDate: '2004-10-08',
    role: 'Main Dancer',
    themeColor: 'pink',
    description: '"The coffee-like charm that wakes you up." 아일릿의 사랑스러운 모카와 함께하는 데일리 라이프.',
    profileImage: 'https://i.pinimg.com/originals/a0/0d/17/a00d1709403328221804f55331f7743d.jpg',
    gallery: [
      { id: '1', url: 'https://i.pinimg.com/originals/a0/0d/17/a00d1709403328221804f55331f7743d.jpg', title: 'Main Mood', span: 'col-span-2 row-span-2' },
      { id: '2', url: 'https://pbs.twimg.com/media/GIv_y8ibcAAtz3u.jpg', title: 'Selfie Mode', span: 'col-span-1 row-span-1' },
      { id: '3', url: 'https://i.pinimg.com/736x/2b/35/6b/2b356b73894452174304677732d84786.jpg', title: 'Stage Moment', span: 'col-span-1 row-span-2' },
      { id: '4', url: 'https://i.pinimg.com/736x/89/3e/32/893e3257008803734062168971f14d87.jpg', title: 'Casual Chic', span: 'col-span-1 row-span-1' },
      { id: '5', url: 'https://pbs.twimg.com/media/GH0_1hXbEAAr4qS?format=jpg&name=large', title: 'Dreamy', span: 'col-span-1 row-span-1' },
    ]
  },
  {
    id: 'wonhee',
    name: 'WONHEE',
    koreanName: '원희',
    group: 'ILLIT',
    birthDate: '2007-06-26',
    role: 'Vocal',
    themeColor: 'blue',
    description: '청량함 그 자체, 아일릿의 막내 같은 매력.',
    profileImage: 'https://i.pinimg.com/736x/7d/51/6e/7d516e88536067f537042578587d4681.jpg',
    gallery: [
      { id: '1', url: 'https://i.pinimg.com/736x/7d/51/6e/7d516e88536067f537042578587d4681.jpg', title: 'Blue Mood', span: 'col-span-2 row-span-2' }
    ]
  }
];