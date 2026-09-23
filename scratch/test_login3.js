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

async function testFixedSignIn(identifier, password) {
  console.log(`Testing signIn for: ${identifier} with pass: ${password}`);

  let targetEmail = identifier.trim();

  // Try direct auth
  let { data, error } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password,
  });

  if (error) {
    console.log("Supabase Auth direct sign-in failed:", error.message);
    console.log("Executing fixed profile lookup...");

    let profileRecord = null;
    try {
      const { data: pEmail } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", targetEmail)
        .maybeSingle();
      profileRecord = pEmail;
    } catch (e) {}

    if (!profileRecord) {
      try {
        const { data: pNip } = await supabase
          .from("profiles")
          .select("*")
          .eq("NIP", targetEmail)
          .maybeSingle();
        profileRecord = pNip;
      } catch (e) {}
    }

    console.log("Found profileRecord:", profileRecord);

    if (profileRecord) {
      const profilePass = profileRecord.password || "";
      if (profilePass === password) {
        console.log("SUCCESS! Password matches profile record! User role:", profileRecord.role);
        return { success: true, profile: profileRecord };
      } else {
        console.log("Password mismatch. Input:", password, "DB:", profilePass);
      }
    }
  } else {
    console.log("Auth direct sign in success!");
    return { success: true, user: data.user };
  }
}

testFixedSignIn("ariadibsi@gmail.com", "ariadi123");
