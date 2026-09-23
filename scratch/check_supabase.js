import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = fs.readFileSync(path.join(__dirname, "../.env"), "utf8");

const env = {};
envFile.split("\n").forEach((line) => {
  const [k, v] = line.split("=");
  if (k && v) env[k.trim()] = v.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("--- PROFILES TABLE ---");
  const { data: profiles, error: pErr } = await supabase.from("profiles").select("*");
  if (pErr) console.error("Profiles error:", pErr);
  else console.log(JSON.stringify(profiles, null, 2));
}

check();
