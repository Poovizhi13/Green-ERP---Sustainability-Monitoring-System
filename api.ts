
import { Supplier, Material, ProcurementRecord, EnergyRecord, User, UserRole } from './types';
import { INITIAL_USERS, INITIAL_SUPPLIERS, INITIAL_MATERIALS, INITIAL_PROCUREMENT, INITIAL_ENERGY } from './constants';

/**
 * MOCK BACKEND SERVICE
 * This simulates a Python/Flask API with a persistent Database (localStorage).
 * In a real MCA project, these methods would use fetch() to call your Python backend.
 */
class SustainabilityApi {
  private storageKey = 'green_erp_db';

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialDb = {
        users: INITIAL_USERS,
        suppliers: INITIAL_SUPPLIERS,
        materials: INITIAL_MATERIALS,
        procurement: INITIAL_PROCUREMENT,
        energy: INITIAL_ENERGY
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialDb));
    }
  }

  private getDb() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
  }

  private saveDb(db: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }

  private simulateLatency() {
    return new Promise(resolve => setTimeout(resolve, 400));
  }

  // --- AUTH ---
  async login(username: string, role: UserRole): Promise<User | null> {
    await this.simulateLatency();
    const db = this.getDb();
    const user = db.users.find((u: User) => 
      u.username.toLowerCase() === username.toLowerCase() && u.role === role
    );
    return user || null;
  }

  async checkUserExists(username: string): Promise<boolean> {
    const db = this.getDb();
    return db.users.some((u: User) => u.username.toLowerCase() === username.toLowerCase());
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    await this.simulateLatency();
    return this.getDb().users;
  }

  async createUser(user: User): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    db.users.push(user);
    this.saveDb(db);
  }

  async deleteUser(id: string): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    db.users = db.users.filter((u: User) => u.id !== id);
    this.saveDb(db);
  }

  async updateUser(user: User): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    db.users = db.users.map((u: User) => u.id === user.id ? user : u);
    this.saveDb(db);
  }

  // --- SETTINGS ---
  async getSettings(): Promise<any> {
    await this.simulateLatency();
    const db = this.getDb();
    return db.settings || { carbonThreshold: 5000, notifications: true };
  }

  async saveSettings(settings: any): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    db.settings = settings;
    this.saveDb(db);
  }

  async resetSettings(): Promise<any> {
    await this.simulateLatency();
    const defaultSettings = { carbonThreshold: 5000, notifications: true };
    const db = this.getDb();
    db.settings = defaultSettings;
    this.saveDb(db);
    return defaultSettings;
  }

  async purgeCache(): Promise<void> {
    await this.simulateLatency();
    // Simulate clearing local storage items that aren't the main DB
    Object.keys(localStorage).forEach(key => {
      if (key !== 'green_erp_db' && key.startsWith('green_erp_')) {
        localStorage.removeItem(key);
      }
    });
  }

  async resetDatabase(): Promise<void> {
    await this.simulateLatency();
    localStorage.removeItem(this.storageKey);
    window.location.reload();
  }

  // --- MASTER DATA ---
  async getSuppliers(): Promise<Supplier[]> {
    await this.simulateLatency();
    return this.getDb().suppliers;
  }

  async saveSupplier(supplier: Supplier, mode: 'add' | 'edit'): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    if (mode === 'add') db.suppliers.push(supplier);
    else db.suppliers = db.suppliers.map((s: Supplier) => s.id === supplier.id ? supplier : s);
    this.saveDb(db);
  }

  async deleteSupplier(id: string): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    db.suppliers = db.suppliers.filter((s: Supplier) => s.id !== id);
    this.saveDb(db);
  }

  async getMaterials(): Promise<Material[]> {
    await this.simulateLatency();
    return this.getDb().materials;
  }

  async saveMaterial(material: Material, mode: 'add' | 'edit'): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    if (mode === 'add') db.materials.push(material);
    else db.materials = db.materials.map((m: Material) => m.id === material.id ? material : m);
    this.saveDb(db);
  }

  async deleteMaterial(id: string): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    db.materials = db.materials.filter((m: Material) => m.id !== id);
    this.saveDb(db);
  }

  // --- TRANSACTIONS ---
  async getProcurement(): Promise<ProcurementRecord[]> {
    await this.simulateLatency();
    return this.getDb().procurement;
  }

  async addProcurement(record: ProcurementRecord): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    db.procurement.unshift(record);
    this.saveDb(db);
  }

  async getEnergy(): Promise<EnergyRecord[]> {
    await this.simulateLatency();
    return this.getDb().energy;
  }

  async addEnergy(record: EnergyRecord): Promise<void> {
    await this.simulateLatency();
    const db = this.getDb();
    db.energy.unshift(record);
    this.saveDb(db);
  }
}

export const api = new SustainabilityApi();
