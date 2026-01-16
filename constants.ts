
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
  }
];

export const INITIAL_STOCKS: StockHolding[] = [
  { symbol: 'AAPL', name: '애플', shares: 15, avgPrice: 150, currentPrice: 175 },
  { symbol: 'NVDA', name: '엔비디아', shares: 2, avgPrice: 400, currentPrice: 850 },
];

export const INITIAL_GOALS: Goal[] = [
  { id: '1', title: '2,000만원 저축하기', category: '금융', progress: 65, targetDate: '2024-12-31' },
];

export const INITIAL_MUSES: Muse[] = [
  {
    id: 'moka-default',
    name: 'MOKA',
    koreanName: '모카',
    group: 'ILLIT',
    birthDate: '2004-10-08',
    role: 'Idol',
    themeColor: 'pink',
    description: '나만의 아카이브에 오신 것을 환영합니다.',
    profileImage: 'https://i.pinimg.com/originals/a0/0d/17/a00d1709403328221804f55331f7743d.jpg',
    gallery: []
  }
];
