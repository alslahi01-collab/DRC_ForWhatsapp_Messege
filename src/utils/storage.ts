import { AddedPerson } from '../types';

const STORAGE_KEY_PERSONS = 'risalat_al_tamaninah_persons_v1';

export function createEmptyPerson(): AddedPerson {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: '',
    city: '',
    status: 'آمن',
  };
}

export function loadSavedPersons(): AddedPerson[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERSONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => ({
          id: p.id || createEmptyPerson().id,
          name: p.name || '',
          city: p.city || '',
          status: p.status || 'آمن',
        }));
      }
    }
  } catch (err) {
    console.warn('Failed to load persons from localStorage', err);
  }

  // Default initial state: 1 blank person for user to enter their name
  return [createEmptyPerson()];
}

export function savePersonsToStorage(persons: AddedPerson[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PERSONS, JSON.stringify(persons));
  } catch (err) {
    console.warn('Failed to save persons to localStorage', err);
  }
}
