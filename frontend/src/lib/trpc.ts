import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../backend/routers";

export const trpc = createTRPCReact<AppRouter>();
