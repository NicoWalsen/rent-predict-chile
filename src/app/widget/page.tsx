"use client";
import React, { useState } from "react";

export default function WidgetPage() {
  const [comuna, setComuna] = useState("");
  const [m2, setM2] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultado(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/predict?comuna=${encodeURIComponent(comuna)}&m2=${encodeURIComponent(m2)}`);
      if (!res.ok) throw new Error("Error en la predicción");
      const data = await res.json();
      setResultado(`Rango estimado: $${data.min.toLocaleString()} - $${data.max.toLocaleString()}`);
    } catch (err: any) {
      setError("No se pudo obtener la predicción. Verifica los datos e inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-indigo-100">
        <h1 className="text-3xl font-extrabold mb-6 text-indigo-700 text-center">Widget de Predicción de Arriendo</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
            <input
              type="text"
              value={comuna}
              onChange={e => setComuna(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej: Providencia"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metros cuadrados (m²)</label>
            <input
              type="number"
              value={m2}
              onChange={e => setM2(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ej: 60"
              min={1}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Calculando..." : "Predecir"}
          </button>
        </form>
        {resultado && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg text-center font-semibold animate-fade-in">
            {resultado}
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg text-center font-semibold animate-fade-in">
            {error}
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s;
        }
      `}</style>
    </main>
  );
} 