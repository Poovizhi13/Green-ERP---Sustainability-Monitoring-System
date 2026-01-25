
import { Supplier, Material, UserRole, User, ProcurementRecord, EnergyRecord } from './types';

export const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', role: UserRole.ADMIN },
  { id: '2', username: 'p_manager', role: UserRole.PROCUREMENT_MANAGER },
  { id: '3', username: 's_manager', role: UserRole.SUSTAINABILITY_MANAGER },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Eco-Dynamics Ltd', category: 'Raw Materials', sustainabilityScore: 88, carbonEfficiency: 12.5, certifications: ['ISO 14001', 'LEED'] },
  { id: 's2', name: 'Global Logistics Corp', category: 'Packaging', sustainabilityScore: 45, carbonEfficiency: 48.2, certifications: [] },
  { id: 's3', name: 'GreenSource Solutions', category: 'Raw Materials', sustainabilityScore: 92, carbonEfficiency: 8.4, certifications: ['B-Corp', 'Carbon Trust'] },
  { id: 's4', name: 'Standard Parts Inc', category: 'Components', sustainabilityScore: 62, carbonEfficiency: 32.1, certifications: ['ISO 9001'] },
];

export const INITIAL_MATERIALS: Material[] = [
  { id: 'm1', name: 'Recycled Aluminum', category: 'Metals', unit: 'kg', carbonFactor: 0.8, recyclabilityRate: 95, averagePrice: 4.5 },
  { id: 'm2', name: 'Virgin Aluminum', category: 'Metals', unit: 'kg', carbonFactor: 12.4, recyclabilityRate: 40, averagePrice: 3.8 },
  { id: 'm3', name: 'Biodegradable Plastic', category: 'Polymers', unit: 'kg', carbonFactor: 1.2, recyclabilityRate: 80, averagePrice: 2.1 },
  { id: 'm4', name: 'Standard PVC', category: 'Polymers', unit: 'kg', carbonFactor: 5.8, recyclabilityRate: 15, averagePrice: 1.4 },
];

export const INITIAL_PROCUREMENT: ProcurementRecord[] = [
  { id: 'p1', date: '2023-10-01', materialId: 'm2', supplierId: 's2', quantity: 500, totalCost: 1900 },
  { id: 'p2', date: '2023-10-05', materialId: 'm3', supplierId: 's1', quantity: 1200, totalCost: 2520 },
  { id: 'p3', date: '2023-10-12', materialId: 'm1', supplierId: 's3', quantity: 800, totalCost: 3600 },
];

export const INITIAL_ENERGY: EnergyRecord[] = [
  { id: 'e1', date: '2023-10-01', source: 'Electricity', amount: 4500, unit: 'kWh', carbonEquivalent: 1845 },
  { id: 'e2', date: '2023-10-15', source: 'Solar', amount: 1200, unit: 'kWh', carbonEquivalent: 0 },
  { id: 'e3', date: '2023-11-01', source: 'Electricity', amount: 4800, unit: 'kWh', carbonEquivalent: 1968 },
];
