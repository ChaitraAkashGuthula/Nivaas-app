import { storage } from "./storage";
import { User } from "./types";

const USERS_KEY = "users";
const PASSWORDS_KEY = "passwords"; // storing separately for slight isolation

export const usersDb = {
  getAllUsers(): User[] {
    return storage.get<User[]>(USERS_KEY, []);
  },

  getUserById(id: string): User | null {
    const users = this.getAllUsers();
    return users.find((u) => u.id === id) || null;
  },

  getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find((u) => u.email === email) || null;
  },

  createUser(userData: Omit<User, "id">, passwordHash: string): User {
    const users = this.getAllUsers();
    const id = "usr_" + Math.random().toString(36).substring(2, 9);
    const newUser: User = { ...userData, id };
    users.push(newUser);
    storage.set(USERS_KEY, users);

    const passwords = storage.get<Record<string, string>>(PASSWORDS_KEY, {});
    passwords[id] = passwordHash;
    storage.set(PASSWORDS_KEY, passwords);

    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    storage.set(USERS_KEY, users);
    return users[index];
  },

  getPasswordHash(id: string): string | null {
    const passwords = storage.get<Record<string, string>>(PASSWORDS_KEY, {});
    return passwords[id] || null;
  },

  setPasswordHash(id: string, passwordHash: string): void {
    const passwords = storage.get<Record<string, string>>(PASSWORDS_KEY, {});
    passwords[id] = passwordHash;
    storage.set(PASSWORDS_KEY, passwords);
  },

  deleteUser(id: string): boolean {
    const users = this.getAllUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    storage.set(USERS_KEY, filtered);

    const passwords = storage.get<Record<string, string>>(PASSWORDS_KEY, {});
    delete passwords[id];
    storage.set(PASSWORDS_KEY, passwords);
    return true;
  },
};
