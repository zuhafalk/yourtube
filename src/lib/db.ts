import { Temporal } from "@js-temporal/polyfill";

(globalThis as any).Temporal = Temporal;

import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../prisma/contract.d";
import contractJson from "../prisma/contract.json" with { type: "json" };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export const db = postgres<Contract>({
  contractJson,
  url: connectionString,
});