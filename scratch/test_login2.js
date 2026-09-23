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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQueries(email) {
  console.log("1. Testing .or without quotes:");
  const res1 = await supabase
    .from("profiles")
    .select("*")
    .or(`email.eq.${email},NIP.eq.${email},nip.eq.${email}`)
    .maybeSingle();
  console.log("res1:", res1.data, "error:", res1.error);

  console.log("2. Testing direct eq('email', email):");
  const res2 = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  console.log("res2:", res2.data, "error:", res2.error);

  console.log("3. Testing .or with quotes:");
  const res3 = await supabase
    .from("profiles")
    .select("*")
    .or(`email.eq."${email}",NIP.eq."${email}",nip.eq."${email}"`)
    .maybeSingle();
  console.log("res3:", res3.data, "error:", res3.error);
}

testQueries("ariadibsi@gmail.com");
