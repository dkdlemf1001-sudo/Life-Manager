import { LucideIcon } from 'lucide-react';

export enum AppId {
  HOME = 'HOME',
  CAR = 'CAR',
  FINANCE = 'FINANCE',
  GOALS = 'GOALS',
  IDEAL_TYPE = 'IDEAL_TYPE',
  GAGEBU = 'GAGEBU',
  AI_ASSISTANT = 'AI_ASSISTANT',
  SETTINGS = 'SETTINGS'
}

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export interface Goal {
  id: string;
  title: string;
  category: '커리어' | '개인' | '건강' | '금융';
  progress: number; // 0-100
  targetDate: string;
}

export interface MaintenanceItem {
  id: string;
  name: string;
  lastServiceDate: string;
  lastServiceMileage: number;
  intervalMonths: number;
  intervalKm: number;
  status: '양호' | '점검 필요' | '긴급';
}

export interface MaintenanceRecord {
  id: string;
  itemName: string;
  date: string;
  mileage: number;
  cost: number;
  shopName?: string;
  note?: string;
}

export interface StockHolding {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  name: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: number;
  category: string;
  note: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  span?: string; // e.g. 'col-span-2 row-span-2'
}

export interface Muse {
  id: string;
  name: string;      // English Name
  koreanName: string; // Korean Name
  group: string;
  birthDate: string;
  role: string;
  description: string;
  profileImage: string;
  gallery: GalleryImage[];
  themeColor: string; // Tailwind color class prefix e.g. 'pink' or hex
}

export interface GlobalData {
  stocks: StockHolding[];
  carItems: MaintenanceItem[];
  carRecords: MaintenanceRecord[];
  carMileage: number;
  carInfo: { model: string; plate: string };
  goals: Goal[];
  expenses: ExpenseRecord[];
  muses: Muse[];
  lastUpdate: string;
}