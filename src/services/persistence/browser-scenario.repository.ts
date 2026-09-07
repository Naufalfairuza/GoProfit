"use client";

import type {
  SavedCalculation,
  ScenarioRepository,
} from "./scenario.repository";

const STORAGE_KEY = "goprofit:saved-calculations:v1";

export class BrowserScenarioRepository implements ScenarioRepository {
  private readAll(): SavedCalculation[] {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as SavedCalculation[]) : [];
    } catch {
      return [];
    }
  }

  private writeAll(values: SavedCalculation[]): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }

  async list(): Promise<SavedCalculation[]> {
    return this.readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<SavedCalculation | null> {
    return this.readAll().find((item) => item.id === id) ?? null;
  }

  async save(value: SavedCalculation): Promise<void> {
    const current = this.readAll();
    const index = current.findIndex((item) => item.id === value.id);
    if (index >= 0) current[index] = value;
    else current.push(value);
    this.writeAll(current);
  }

  async delete(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((item) => item.id !== id));
  }
}
