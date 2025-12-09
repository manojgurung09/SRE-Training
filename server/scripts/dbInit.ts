import fs from "fs";
import path from "path";
import { supabase } from "../config/supabase";

/* -------------------------------------------------- */
/*  SAFE PROCESS ACCESS                              */
/* -------------------------------------------------- */

const argv = (globalThis as any)?.process?.argv ?? [];
const exit = (code: number) =>
  (globalThis as any)?.process?.exit?.(code);

const shouldReset = Array.isArray(argv) && argv.includes("--reset");

/* -------------------------------------------------- */
/*  🚨 HARD SAFETY: NEVER ALLOW RESET IN PROD         */
/* -------------------------------------------------- */

if (process.env.NODE_ENV === "production" && shouldReset) {
  console.error("❌ RESET is BLOCKED in production environment");
  exit(1);
}

/* -------------------------------------------------- */
/*  PATHS                                             */
/* -------------------------------------------------- */

const BASE_SCHEMA_PATH = path.resolve(
  "supabase/migrations/00000000000002_base_schema.sql"
);
const SEED_PATH = path.resolve(
  "supabase/migrations/00000000000003_seed.sql"
);
const RESET_PATH = path.resolve("supabase/reset.sql");

/* -------------------------------------------------- */
/*  UTILS                                             */
/* -------------------------------------------------- */

function requireFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required SQL file missing: ${filePath}`);
    exit(1);
  }
}

/* -------------------------------------------------- */
/*  ✅ SAFE SQL RUNNER                                */
/* -------------------------------------------------- */

async function runSQL(filePath: string, label: string) {
  requireFile(filePath);

  const sql = fs.readFileSync(filePath, "utf-8");

  console.log(`📄 ${label} SQL size:`, sql.length);
  console.log(`🚀 Running: ${label}`);

  const { error } = await supabase.rpc("exec_sql", { sql });

  if (error) {
    console.error(`❌ ${label} FAILED`);
    console.error(error);
    exit(1);
  }

  console.log(`✅ ${label} SUCCESS`);
}

/* -------------------------------------------------- */
/*  SERVICE ROLE SAFE TABLE EXIST CHECK               */
/* -------------------------------------------------- */

async function tableExists() {
  const { data, error } = await supabase.rpc("exec_sql", {
    sql: `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name   = 'users'
      );
    `
  });

  if (error) {
    console.error("❌ Failed to check table existence:", error);
    exit(1);
  }

  return data?.[0]?.exists === true;
}

/* -------------------------------------------------- */
/*  ✅ AUTO ADMIN CREATION (AUTH + PROFILE SYNC)     */
/* -------------------------------------------------- */

async function ensureAdminUser() {
  const DEFAULT_EMAIL = "admin@bharatmart.com";
  const DEFAULT_PASSWORD = "Admin@123";

  const ADMIN_EMAIL =
    process.env.ADMIN_EMAIL ||
    (process.env.NODE_ENV !== "production" ? DEFAULT_EMAIL : null);

  const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? DEFAULT_PASSWORD : null);

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("❌ ADMIN_EMAIL / ADMIN_PASSWORD missing");
    exit(1);
  }

  console.log("🔐 Ensuring admin user exists in Auth...");
  console.log("📧 Admin Email:", ADMIN_EMAIL);

  const { data: listData, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Failed to list auth users:", listError);
    exit(1);
  }

  const existingAuth = listData.users.find(
    (u) => u.email === ADMIN_EMAIL
  );

  let authUserId: string;

  if (existingAuth) {
    authUserId = existingAuth.id;
    console.log("✅ Admin already exists in Auth");
  } else {
    console.log("🆕 Creating admin in Auth...");

    const { data, error } =
      await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL || undefined,
        password: ADMIN_PASSWORD || undefined,
        email_confirm: true
      });

    if (error || !data.user) {
      console.error("❌ Failed to create admin:", error);
      exit(1);
    }

    authUserId = data.user?.id || "";
    console.log("✅ Admin created:", authUserId);
  }

  const { data: existingProfile, error: profileFetchError } =
    await supabase
      .from("users")
      .select("id")
      .eq("email", ADMIN_EMAIL)
      .maybeSingle();

  if (profileFetchError) {
    console.error("❌ Failed to fetch admin profile:", profileFetchError);
    exit(1);
  }

  if (existingProfile) {
    const { error: updateError } =
      await supabase
        .from("users")
        .update({ id: authUserId })
        .eq("email", ADMIN_EMAIL);

    if (updateError) {
      console.error("❌ Failed to update admin profile:", updateError);
      exit(1);
    }
  } else {
    const { error: insertError } =
      await supabase.from("users").insert({
        id: authUserId,
        email: ADMIN_EMAIL,
        full_name: "Admin User",
        role: "admin"
      });

    if (insertError) {
      console.error("❌ Failed to insert admin:", insertError);
      exit(1);
    }
  }

  console.log("✅ Admin Auth ↔ users sync complete");
}

/* -------------------------------------------------- */
/*  MAIN                                             */
/* -------------------------------------------------- */

async function main() {
  console.log("--------------------------------------");
  console.log(" DB INIT SCRIPT STARTED");
  console.log(" RESET MODE:", shouldReset);
  console.log("--------------------------------------");

  if (shouldReset) {
    console.log("🔥 RESETTING DATABASE...");

    await runSQL(RESET_PATH, "Schema Reset");
    await runSQL(BASE_SCHEMA_PATH, "Base Schema");
    await runSQL(SEED_PATH, "Seed Data");
    await ensureAdminUser();

    console.log("✅ FULL DB RESET COMPLETE");
    exit(0);
  }

  const exists = await tableExists();

  if (!exists) {
    console.log("🆕 Fresh database detected");

    await runSQL(BASE_SCHEMA_PATH, "Base Schema");
    await ensureAdminUser();

    console.log("✅ DB initialized");
  } else {
    console.log("✅ DB already initialized — skipping");
  }

  exit(0);
}

main().catch((err) => {
  console.error("❌ DB INIT FAILED:", err);
  exit(1);
});
