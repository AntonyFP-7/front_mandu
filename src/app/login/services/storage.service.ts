import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage = localStorage;
  get<T>(key: string): T | null {
    const data = this._storage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  set<T>(key: string, value: T): void {
    this._storage.setItem(key, JSON.stringify(value));
  }
  remove(key: string): void {
    this._storage.removeItem(key);
  }
}
