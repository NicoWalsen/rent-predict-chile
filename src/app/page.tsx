// src/app/page.tsx

import React from "react";
import Image from "next/image";

export default function Home() {
  // ← Aquí imprimimos en consola la variable de entorno
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-5xl font-bold text-blue-600 mb-8">
        Rent Widget 🚀
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        {/* ← Aquí mostramos la variable de entorno en la UI */}
        SUPABASE_URL is: {process.env.NEXT_PUBLIC_SUPABASE_URL}
      </p>

      {/* Opcional: si quieres mantener el logo de Next.js, lo puedes dejar */}
      <Image
        src="/next.svg"
        alt="Next.js Logo"
        width={180}
        height={38}
        className="mt-8 dark:invert"
        priority
      />
    </div>
  );
}
