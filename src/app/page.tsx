// src/app/page.tsx

import React from "react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-5xl font-bold text-blue-600 mb-8">
        Rent Widget 🚀
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        Tu widget de estimación de renta está listo y en producción.
      </p>
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
