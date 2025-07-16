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
                <div className="text-left">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                    RentPredict Chile
                  </h1>
                  <p className="text-sm lg:text-base text-gray-600 mt-1">
                    Predicción de arriendos con IA
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full text-xs lg:text-sm font-medium border border-emerald-200">
                🔒 Seguro
              </div>
              <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs lg:text-sm font-medium border border-blue-200">
                🤖 ML v2.0
              </div>
              <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-xs lg:text-sm font-medium border border-purple-200">
                ⚡ Tiempo real
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 6v6m6-6v6m-6 0H4a2 2 0 01-2-2v-2M18 19a2 2 0 01-2 2v-2a2 2 0 012-2z" />
                </svg>
                Datos de la Propiedad
              </h2>
              
              <div className="space-y-6">
                {/* Comuna */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comuna</label>
                  {loadingComunas ? (
                    <div className="animate-pulse bg-gray-200 rounded-lg h-11"></div>
                  ) : (
                    <div className="relative">
                      <select
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-colors"
                      >
                        <option value="">Selecciona una comuna</option>
                        {comunas.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metros Cuadrados */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metros Cuadrados</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Propiedad</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dormitorios</label>
                  <select
                    value={dormitorios}
                    onChange={(e) => setDormitorios(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-colors"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estacionamientos</label>
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
                      <span className="text-sm font-medium text-gray-700">Bodega incluida</span>
                    </label>
                  </div>
                </div>

                {/* Botón de Predicción */}
                <button
                  onClick={handlePrediction}
                  disabled={loading || !comuna || !m2}
                  className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all duration-200 transform shadow-lg ${
                    loading || !comuna || !m2
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 active:scale-95'
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

          {/* Right Column - Results */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Resultados de la Predicción
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
                          resultado.confidence >= 80 ? 'bg-green-100 text-green-800' :
                          resultado.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {resultado.confidence}% Confianza
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
  );
}