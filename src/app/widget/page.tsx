"use client";
import React, { useState, useEffect } from "react";

export default function WidgetPage() {
  const [comuna, setComuna] = useState("");
  const [m2, setM2] = useState("");
  const [estacionamientos, setEstacionamientos] = useState("0");
  const [bodega, setBodega] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comunas, setComunas] = useState<string[]>([]);
  const [loadingComunas, setLoadingComunas] = useState(true);

  useEffect(() => {
    const fetchComunas = async () => {
      try {
        const res = await fetch('/api/comunas');
        if (res.ok) {
          const data = await res.json();
          setComunas(data.comunas);
        }
      } catch (error) {
        console.error('Error cargando comunas:', error);
      } finally {
        setLoadingComunas(false);
      }
    };

    fetchComunas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultado(null);
    setError(null);
    setLoading(true);
    try {
      const url = `/api/predict?comuna=${encodeURIComponent(comuna)}&m2=${encodeURIComponent(m2)}&estacionamientos=${encodeURIComponent(estacionamientos)}&bodega=${bodega}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error en la predicción");
      const data = await res.json();
      setResultado(`Rango estimado: $${data.min.toLocaleString()} - $${data.max.toLocaleString()}`);
    } catch {
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
            <select
              value={comuna}
              onChange={e => setComuna(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              required
              disabled={loadingComunas}
            >
              <option value="">
                {loadingComunas ? "Cargando comunas..." : "Selecciona una comuna"}
              </option>
              {comunas.map((comunaName) => (
                <option key={comunaName} value={comunaName}>
                  {comunaName}
                </option>
              ))}
            </select>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estacionamientos</label>
            <select
              value={estacionamientos}
              onChange={e => setEstacionamientos(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="0">Sin estacionamiento</option>
              <option value="1">1 estacionamiento</option>
              <option value="2">2 estacionamientos</option>
              <option value="3">3+ estacionamientos</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={bodega}
                onChange={e => setBodega(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-400"
              />
              <span>Incluye bodega</span>
            </label>
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