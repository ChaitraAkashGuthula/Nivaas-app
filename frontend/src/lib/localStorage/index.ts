import { auth } from "./auth";
import { usersDb } from "./users";
// we'll add others as we go
export const localDb = {
  auth,
  users: usersDb,
};

export * from "./types";
