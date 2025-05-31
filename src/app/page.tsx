import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-5xl font-bold text-blue-600 mb-8">
        Rent Widget 🚀
      </h1>

      {/* Si quieres mantener un logo de Next.js u otra imagen */}
      <Image
        src="/next.svg"
        alt="Next.js Logo"
        width={180}
        height={38}
        className="mb-8 dark:invert"
        priority
      />

      <p className="text-lg text-gray-700 dark:text-gray-300">
        Tu widget de estimación de renta en producción.
      </p>
    </div>
  );
}

