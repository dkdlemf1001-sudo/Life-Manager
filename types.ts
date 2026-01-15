import { LucideIcon } from 'lucide-react';

export enum AppId {
  HOME = 'HOME',
  CAR = 'CAR',
  FINANCE = 'FINANCE',
  GOALS = 'GOALS',
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
