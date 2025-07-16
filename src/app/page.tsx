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
  const [resultado, setResultado] = useState<{
    predicted_price?: number;
    sample_size?: number;
    confidence?: number;
    percentiles?: {
      p10?: number;
      p25?: number;
      p50?: number;
      p75?: number;
      p90?: number;
    };
    market_condition?: string;
  } | null>(null);

  // Cargar comunas al iniciar
  useEffect(() => {
    const fetchComunas = async () => {
      try {
        const response = await fetch('/api/comunas');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verificar que data.comunas existe y es un array
        if (data && Array.isArray(data.comunas)) {
          setComunas(data.comunas);
        } else {
          console.warn('API response invalid, using fallback comunas');
          setComunas(['Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Macul', 'Maipú', 'La Florida']);
        }
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

      console.log('🌐 URL:', `/api/predict-simple?${params.toString()}`);
      
      const response = await fetch(`/api/predict-simple?${params.toString()}`);
      
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
        {/* Premium Professional Header */}
        <header className="relative bg-gradient-to-r from-slate-50 via-white to-slate-50 shadow-2xl border border-gray-200/50 rounded-3xl mb-6 lg:mb-8 p-6 lg:p-8 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="flex items-center space-x-4 lg:space-x-5">
                  {/* Enhanced Logo */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl blur-sm opacity-75 animate-pulse"></div>
                    <div className="relative w-14 h-14 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm">
                      <svg className="w-7 h-7 lg:w-11 lg:h-11 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10zm0 0h18M8 3v4m8-4v4M8 21v-4m8 4v-4" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Enhanced Branding */}
                  <div className="text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-2xl lg:text-4xl font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-tight">
                        RentPredict
                      </h1>
                      <div className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs lg:text-sm font-bold rounded-lg shadow-md">
                        CHILE
                      </div>
                    </div>
                    <p className="text-sm lg:text-lg text-gray-700 font-semibold tracking-wide">
                      Predicción Inteligente de Arriendos
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500 mt-1 font-medium">
                      Tecnología avanzada • Resultados confiables
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 lg:gap-3">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 rounded-full text-xs lg:text-sm font-bold border-2 border-emerald-200/50 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>SEGURO SSL</span>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 rounded-full text-xs lg:text-sm font-bold border-2 border-blue-200/50 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>IA AVANZADA</span>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800 rounded-full text-xs lg:text-sm font-bold border-2 border-purple-200/50 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <span>TIEMPO REAL</span>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 rounded-full text-xs lg:text-sm font-bold border-2 border-amber-200/50 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>PREMIUM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trust Indicator Line */}
            <div className="mt-6 lg:mt-8 pt-4 border-t border-gray-200/50">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 text-xs lg:text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">12,108+ propiedades analizadas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">5 fuentes de datos</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-green-700">Verificado y confiable</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-5">
            <div className="relative bg-gradient-to-br from-white via-slate-50/50 to-white rounded-3xl shadow-xl border border-gray-200/60 p-6 lg:p-8 animate-fade-in overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-blue-50/10 to-purple-50/20 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100/30 to-transparent rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-6 flex items-center">
                  <div className="relative mr-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-sm opacity-20"></div>
                    <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                    Datos de la Propiedad
                  </span>
                </h2>
              
              <div className="space-y-6">
                {/* Comuna */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Comuna</label>
                  {loadingComunas ? (
                    <div className="animate-pulse bg-gray-200 rounded-lg h-11"></div>
                  ) : (
                    <div className="relative">
                      <select
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-colors appearance-none pr-10"
                      >
                        <option value="">Selecciona una comuna</option>
                        {comunas.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metros Cuadrados */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Metros Cuadrados</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={m2}
                      onChange={(e) => setM2(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-colors"
                      placeholder="Ej: 80"
                      min="20"
                      max="500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">m²</span>
                    </div>
                  </div>
                </div>

                {/* Tipo de Propiedad */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Tipo de Propiedad</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoPropiedad('departamento')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        tipoPropiedad === 'departamento'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🏢 Departamento
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPropiedad('casa')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        tipoPropiedad === 'casa'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🏠 Casa
                    </button>
                  </div>
                </div>

                {/* Dormitorios */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Dormitorios</label>
                  <select
                    value={dormitorios}
                    onChange={(e) => setDormitorios(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-colors appearance-none"
                  >
                    <option value="1">1 Dormitorio</option>
                    <option value="2">2 Dormitorios</option>
                    <option value="3">3 Dormitorios</option>
                    <option value="4">4 Dormitorios</option>
                    <option value="5">5+ Dormitorios</option>
                  </select>
                </div>

                {/* Características Adicionales */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Estacionamientos</label>
                    <div className="flex space-x-3">
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setEstacionamientos(num.toString())}
                          className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                            estacionamientos === num.toString()
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bodega}
                        onChange={(e) => setBodega(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-semibold text-gray-800">Bodega incluida</span>
                    </label>
                  </div>
                </div>

                {/* Botón de Predicción */}
                <button
                  onClick={handlePrediction}
                  disabled={loading || !comuna || !m2}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 transform shadow-xl ${
                    loading || !comuna || !m2
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 hover:scale-105 active:scale-95 shadow-indigo-500/25'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Prediciendo...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Predecir Arriendo
                    </div>
                  )}
                </button>
              </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-7">
            <div className="relative bg-gradient-to-br from-white via-slate-50/50 to-white rounded-3xl shadow-xl border border-gray-200/60 p-6 lg:p-8 animate-fade-in overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-green-50/10 to-teal-50/20 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-6 flex items-center">
                  <div className="relative mr-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-sm opacity-20"></div>
                    <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                    Resultados de la Predicción
                  </span>
                </h2>
              
              <div className="h-full min-h-[400px] lg:min-h-[500px]">
                {resultado ? (
                  <div className="space-y-6">
                    {/* Precio Predicho Destacado */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Precio Predicho</h3>
                      <div className="text-4xl font-bold text-green-900 mb-2">
                        ${resultado.predicted_price?.toLocaleString('es-CL')} CLP
                      </div>
                      <div className="text-sm text-green-700">
                        Basado en {resultado.sample_size} propiedades similares
                      </div>
                      
                      {/* Confianza del modelo */}
                      <div className="mt-3 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          (resultado.confidence ?? 0) >= 80 ? 'bg-green-100 text-green-800' :
                          (resultado.confidence ?? 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {resultado.confidence ?? 0}% Confianza
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          ML Similarity v2.0
                        </div>
                      </div>
                    </div>

                    {/* Rango de Precios */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Rango de Precios</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        {[
                          { label: 'Mínimo', value: resultado.percentiles?.p10, color: 'bg-red-100 text-red-800' },
                          { label: 'P25', value: resultado.percentiles?.p25, color: 'bg-orange-100 text-orange-800' },
                          { label: 'Mediana', value: resultado.percentiles?.p50, color: 'bg-yellow-100 text-yellow-800' },
                          { label: 'P75', value: resultado.percentiles?.p75, color: 'bg-green-100 text-green-800' },
                          { label: 'Máximo', value: resultado.percentiles?.p90, color: 'bg-blue-100 text-blue-800' }
                        ].map((item, idx) => (
                          <div key={idx} className={`text-center p-3 rounded-lg ${item.color}`}>
                            <div className="text-xs font-medium opacity-75">{item.label}</div>
                            <div className="text-sm font-bold">
                              ${item.value?.toLocaleString('es-CL')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Condición del Mercado */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Condición del Mercado</h3>
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          resultado.market_condition === 'estable' ? 'bg-green-100 text-green-800' :
                          resultado.market_condition === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                          resultado.market_condition === 'volátil' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {resultado.market_condition}
                        </div>
                        <span className="text-blue-700 text-sm">
                          basado en dispersión de precios
                        </span>
                      </div>
                    </div>

                    {/* Información de Calidad */}
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">Calidad de Datos</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Propiedades analizadas:</span>
                          <span className="font-medium text-purple-900">{resultado.sample_size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Fuentes de datos:</span>
                          <span className="font-medium text-purple-900">5 portales</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Actualización:</span>
                          <span className="font-medium text-purple-900">Tiempo real</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Algoritmo:</span>
                          <span className="font-medium text-purple-900">ML Similarity v2.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
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
      </div>
    </div>
  );
}