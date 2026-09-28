export const NAMESPACE = "nivaas_";

export function getStorageKey(key: string) {
  return `${NAMESPACE}${key}`;
}

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(getStorageKey(key));
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch (e) {
      console.error(`Failed to parse local storage key ${key}`, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(getStorageKey(key), JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to set local storage key ${key}`, e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(getStorageKey(key));
    } catch (e) {
      console.error(`Failed to remove local storage key ${key}`, e);
    }
  },

  clearNamespace(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(NAMESPACE)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.error("Failed to clear namespace", e);
    }
  },
};
