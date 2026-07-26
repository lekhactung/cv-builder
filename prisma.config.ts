import path from "node:path";
import fs from "node:fs";
import { defineConfig } from "prisma/config";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
}

const dbUrl = process.env.DATABASE_URL!;

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  datasource: {
    url: dbUrl,
  },

});
