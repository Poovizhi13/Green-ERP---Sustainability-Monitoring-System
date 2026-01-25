
export enum UserRole {
  ADMIN = 'ADMIN',
  PROCUREMENT_MANAGER = 'PROCUREMENT_MANAGER',
  SUSTAINABILITY_MANAGER = 'SUSTAINABILITY_MANAGER'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  sustainabilityScore: number; // 0-100
  carbonEfficiency: number; // kg CO2 per $1000
  certifications: string[];
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  carbonFactor: number; // kg CO2 per unit
  recyclabilityRate: number; // 0-100
  averagePrice: number;
}

export interface ProcurementRecord {
  id: string;
  date: string;
  materialId: string;
  supplierId: string;
  quantity: number;
  totalCost: number;
}

export interface EnergyRecord {
  id: string;
  date: string;
  source: 'Electricity' | 'Natural Gas' | 'Solar' | 'Diesel';
  amount: number; // kWh or Liters
  unit: string;
  carbonEquivalent: number; // kg CO2
}

export interface Recommendation {
  id: string;
  type: 'SUPPLIER' | 'MATERIAL' | 'OPTIMIZATION';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}
