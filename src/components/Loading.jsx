import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 text-[#009688] animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-500">Memuat halaman...</p>
    </div>
  );
}
