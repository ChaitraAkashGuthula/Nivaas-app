import { storage } from "./storage";
import { User, Session } from "./types";
import { usersDb } from "./users";

const SESSION_KEY = "session";

// A simple utility to hash passwords for local dev (not secure for prod)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const auth = {
  getCurrentSession(): Session | null {
    return storage.get<Session | null>(SESSION_KEY, null);
  },

  getCurrentUser(): User | null {
    const session = this.getCurrentSession();
    if (!session) return null;
    return usersDb.getUserById(session.userId);
  },

  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  },

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const user = usersDb.getUserByEmail(email);
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const hashedPassword = await hashPassword(password);
    const storedHash = usersDb.getPasswordHash(user.id);

    if (hashedPassword !== storedHash) {
      return { success: false, error: "Invalid email or password" };
    }

    const session: Session = {
      token: Math.random().toString(36).substring(2),
      userId: user.id,
    };
    storage.set(SESSION_KEY, session);
    return { success: true };
  },

  async signup(
    userData: Omit<User, "id">,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    const existingUser = usersDb.getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    const hashedPassword = await hashPassword(password);
    const user = usersDb.createUser(userData, hashedPassword);

    const session: Session = {
      token: Math.random().toString(36).substring(2),
      userId: user.id,
    };
    storage.set(SESSION_KEY, session);
    return { success: true };
  },

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const storedHash = usersDb.getPasswordHash(userId);
    if (storedHash) {
      const currentHashed = await hashPassword(currentPassword);
      if (currentHashed !== storedHash) {
        return { success: false, error: "Current password is incorrect" };
      }
    }
    const newHashed = await hashPassword(newPassword);
    usersDb.setPasswordHash(userId, newHashed);
    return { success: true };
  },

  logout(): void {
    storage.remove(SESSION_KEY);
  },
};
