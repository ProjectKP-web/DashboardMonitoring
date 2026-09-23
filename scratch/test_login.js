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

async function testSignIn(email, password) {
  console.log(`Testing signIn with email: ${email}, password: ${password}`);
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log("Supabase Auth signInWithPassword error:", error.message);

    // Test Fallback
    const { data: profileRecord, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .or(`email.eq.${email},NIP.eq.${email},nip.eq.${email}`)
      .maybeSingle();

    console.log("Profile record found:", profileRecord);
    if (profileRecord) {
      console.log("Profile password:", profileRecord.password);
      console.log("Password match?", profileRecord.password === password);
    }
  } else {
    console.log("Auth SUCCESS! User:", data.user.id, data.user.email);
  }
}

testSignIn("ariadibsi@gmail.com", "ariadi123");
