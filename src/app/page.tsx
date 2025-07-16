"use client";
import React, { useState, useEffect } from 'react';

export default function App() {
  const [comuna, setComuna] = useState('');
  const [m2, setM2] = useState('');
  const [estacionamientos, setEstacionamientos] = useState('0');
  const [bodega, setBodega] = useState(false);
  const [tipoPropiedad, setTipoPropiedad] = useState('departamento');
  const [dormitorios, setDormitorios] = useState('2');
  const [comunas, setComunas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingComunas, setLoadingComunas] = useState(true);
  const [resultado, setResultado] = useState<any>(null);

  // Cargar comunas al iniciar
  useEffect(() => {
    const fetchComunas = async () => {
      try {
        const response = await fetch('/api/comunas');
        const data = await response.json();
        setComunas(data.comunas);
      } catch (error) {
        console.error('Error cargando comunas:', error);
        setComunas(['Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Macul', 'Maipú', 'La Florida']);
      } finally {
        setLoadingComunas(false);
      }
    };

    fetchComunas();
  }, []);

  const handlePrediction = async () => {
    console.log('🚀 Iniciando predicción...');
    console.log('📝 Datos:', { comuna, m2, estacionamientos, bodega, tipoPropiedad, dormitorios });
    
    if (!comuna || !m2) {
      console.log('❌ Datos incompletos');
      alert('Por favor completa comuna y metros cuadrados');
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const params = new URLSearchParams({
        comuna,
        m2: m2.toString(),
        estacionamientos: estacionamientos.toString(),
        bodega: bodega.toString(),
        tipoPropiedad,
        dormitorios: dormitorios.toString()
      });

      console.log('🌐 URL:', `/api/predict-enhanced?${params.toString()}`);
      
      const response = await fetch(`/api/predict-enhanced?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Respuesta mejorada recibida:', data);
      setResultado(data);
      
    } catch (error) {
      console.error('❌ Error en predicción:', error);
      alert(`Error al predecir: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Unified Responsive Layout */}
      <div className="container mx-auto px-4 lg:px-6 py-4 lg:py-6 max-w-7xl">
          {/* Professional Header */}
          <header className="bg-white shadow-sm border border-gray-200 rounded-2xl mb-6 lg:mb-8 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-center lg:text-left">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">RentPredict</h1>
                    <p className="text-gray-600 font-medium text-sm lg:text-base">Inteligencia Artificial Inmobiliaria</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 text-xs lg:text-sm font-medium">Live Data</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-700 text-xs lg:text-sm font-medium">AI Certified</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Form Section */}
            <div className="lg:col-span-7">
              <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 lg:p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Análisis de Propiedad</h2>
                      <p className="text-gray-600 mt-1">Ingresa los datos para obtener una estimación precisa</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Formulario</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-indigo-600 h-1 rounded-full transition-all duration-300" style={{width: comuna && m2 ? '100%' : '50%'}}></div>
                  </div>
                </div>
              
                <div className="space-y-8">
                  {/* Comuna */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Ubicación</span>
                        <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <div className="relative">
                      <select
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        disabled={loadingComunas}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white text-base font-medium appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-wait"
                      >
                        <option value="" className="text-gray-500">
                          {loadingComunas ? "Cargando comunas..." : "Selecciona una comuna"}
                        </option>
                        {comunas.map((c) => (
                          <option key={c} value={c} className="text-gray-900">{c}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* M2 and Property Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a1 1 0 011-1h14a1 1 0 011 1v4M4 8h16M4 8v8a1 1 0 001 1h14a1 1 0 001-1V8" />
                          </svg>
                          <span>Superficie</span>
                          <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={m2}
                          onChange={(e) => setM2(e.target.value)}
                          placeholder="Ej: 65"
                          className="w-full p-4 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all text-base font-medium pr-12"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <span className="text-gray-500 text-sm font-medium">m²</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Tipo de Propiedad</span>
                        </div>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTipoPropiedad('departamento')}
                          className={`p-4 rounded-xl border-2 transition-all font-medium text-sm flex items-center justify-center space-x-2 ${
                            tipoPropiedad === 'departamento'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                              : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Departamento</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoPropiedad('casa')}
                          className={`p-4 rounded-xl border-2 transition-all font-medium text-sm flex items-center justify-center space-x-2 ${
                            tipoPropiedad === 'casa'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                              : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>Casa</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bedrooms and Parking */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span>Dormitorios</span>
                        </div>
                      </label>
                      <div className="relative">
                        <select
                          value={dormitorios}
                          onChange={(e) => setDormitorios(e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white text-base font-medium appearance-none cursor-pointer"
                        >
                          {[1,2,3,4,5].map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'dormitorio' : 'dormitorios'}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                          </svg>
                          <span>Estacionamientos</span>
                        </div>
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[0,1,2,3].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setEstacionamientos(num.toString())}
                            className={`p-3 rounded-xl border-2 transition-all font-medium text-sm flex items-center justify-center ${
                              estacionamientos === num.toString()
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Features */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>Características Adicionales</span>
                      </div>
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={bodega}
                          onChange={(e) => setBodega(e.target.checked)}
                          className="w-5 h-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500/20 focus:ring-2"
                        />
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900">Incluye bodega</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={handlePrediction}
                      disabled={loading || !comuna || !m2}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg relative overflow-hidden"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                          <span className="font-semibold">Analizando propiedad...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="font-semibold">Generar Estimación</span>
                        </div>
                      )}
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-3">
                      Análisis basado en {loading ? "..." : "1,000+"} propiedades similares
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-5">
              <div className="space-y-6">
                {resultado ? (
                  <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border border-slate-200 animate-fade-in">
                    <div className="text-center mb-6">
                      <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2 flex items-center justify-center">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 mr-2 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Estimación IA para {resultado.comuna}
                      </h3>
                      <p className="text-slate-600 text-base lg:text-lg">
                        {resultado.m2}m² • {resultado.tipoPropiedad} • {resultado.dormitorios} dormitorios
                      </p>
                      {/* Confianza del modelo */}
                      <div className="mt-3 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          resultado.confidence >= 80 ? 'bg-green-100 text-green-800' :
                          resultado.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {resultado.confidence}% Confianza
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          Modelo IA v2.0
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Precio Predicho Principal */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 lg:p-6 rounded-2xl border border-indigo-200">
                        <div className="text-center">
                          <p className="text-sm font-medium text-indigo-700 mb-2">Precio Predicho con IA</p>
                          <p className="text-2xl lg:text-4xl font-bold text-indigo-800 mb-2">
                            {resultado.predictedFmt || resultado.avgFmt}
                          </p>
                          <p className="text-sm text-indigo-600">
                            Rango: {resultado.minFmt} - {resultado.maxFmt}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Statistics Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                        <div className="text-center p-3 lg:p-4 bg-blue-50 rounded-2xl border border-blue-200">
                          <p className="text-xs font-medium text-blue-700 mb-1">Percentil 25</p>
                          <p className="text-base lg:text-lg font-bold text-blue-800">{resultado.p25Fmt}</p>
                        </div>
                        <div className="text-center p-3 lg:p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                          <p className="text-xs font-medium text-indigo-700 mb-1">Más Probable</p>
                          <p className="text-base lg:text-lg font-bold text-indigo-800">{resultado.mostLikelyFmt || resultado.p50Fmt}</p>
                        </div>
                        <div className="text-center p-3 lg:p-4 bg-purple-50 rounded-2xl border border-purple-200">
                          <p className="text-xs font-medium text-purple-700 mb-1">Percentil 75</p>
                          <p className="text-base lg:text-lg font-bold text-purple-800">{resultado.p75Fmt}</p>
                        </div>
                      </div>
                      
                      {/* Rango Extendido */}
                      {resultado.p10Fmt && resultado.p90Fmt && (
                        <div className="bg-gray-50 p-3 lg:p-4 rounded-2xl border border-gray-200">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">Rango Extendido (P10-P90)</p>
                            <p className="text-base lg:text-lg font-bold text-gray-800">
                              {resultado.p10Fmt} - {resultado.p90Fmt}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Data Quality */}
                      <div className="bg-slate-50 p-4 lg:p-6 rounded-2xl border border-slate-200">
                        <div className="text-center">
                          <p className="text-sm text-slate-600 mb-3 flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Análisis con IA basado en {resultado.count} propiedades similares
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-xs text-slate-500">
                            <div className="flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Actualizado: {resultado.dataQuality?.lastUpdated || 'Hoy'}
                            </div>
                            <div className="flex items-center justify-center">
                              <svg className="w-3 h-3 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Fuentes: 5 portales inmobiliarios
                            </div>
                            <div className="flex items-center justify-center">
                              <svg className="w-3 h-3 text-purple-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Mercado: {resultado.marketCondition === 'stable' ? 'Estable' : 
                                       resultado.marketCondition === 'moderate' ? 'Moderado' : 
                                       resultado.marketCondition === 'volatile' ? 'Volátil' : 'Muy Volátil'}
                            </div>
                            <div className="flex items-center justify-center">
                              <svg className="w-3 h-3 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Algoritmo: ML Similarity v2.0
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="text-xl font-medium text-slate-500 mb-2">Predicción de Arriendo</h3>
                      <p className="text-slate-400">Completa los datos de la propiedad para obtener una estimación</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}