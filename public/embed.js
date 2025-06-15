(async () => {
  const script = document.currentScript;
  const { comuna, m2, bedrooms, bathrooms } = script.dataset;

  // Crear el div del widget
  const widget = document.createElement('div');
  widget.id = 'rw-widget';
  widget.style.cssText = `
    font-family: Arial, sans-serif;
    border: 1px solid #ccc;
    padding: 12px;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;

  // Mostrar estado de carga
  widget.innerHTML = '<div style="color: #666;">Calculando...</div>';

  try {
    // Insertar antes del script
    script.parentNode.insertBefore(widget, script);

    // Hacer las peticiones en paralelo
    const [rangeResponse, mlResponse] = await Promise.all([
      fetch(`/api/predict?comuna=${encodeURIComponent(comuna)}&m2=${encodeURIComponent(m2)}`),
      fetch(`/api/predict-ml?comuna=${encodeURIComponent(comuna)}&m2=${encodeURIComponent(m2)}&bedrooms=${bedrooms || 0}&bathrooms=${bathrooms || 0}`)
    ]);

    const rangeData = await rangeResponse.json();
    const mlData = await mlResponse.json();

    if (rangeResponse.status === 200 && mlResponse.status === 200) {
      // Formatear números con separadores de miles
      const min = new Intl.NumberFormat('es-CL').format(rangeData.min);
      const max = new Intl.NumberFormat('es-CL').format(rangeData.max);
      const predicted = new Intl.NumberFormat('es-CL').format(mlData.predicted);

      // Verificar si la predicción está dentro del rango
      const isInRange = mlData.predicted >= rangeData.min && mlData.predicted <= rangeData.max;
      const mlColor = isInRange ? '#22c55e' : '#ef4444';

      widget.innerHTML = `
        <div style="font-weight: bold; font-size: 1.1em;">RentWidget 🚀</div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div>
            <span style="font-weight: bold;">IA:</span>
            <span style="color: ${mlColor};">CLP ${predicted}</span>
          </div>
          <div>
            <span style="font-weight: bold;">Rango:</span>
            <span>CLP ${min} – ${max}</span>
          </div>
          <div style="font-size: 0.9em; color: #666;">
            (${rangeData.count} avisos)
          </div>
        </div>
      `;
    } else if (rangeResponse.status === 404) {
      widget.innerHTML = '<div style="color: #666;">Sin datos suficientes</div>';
    } else {
      widget.innerHTML = '<div style="color: #ef4444;">Error interno</div>';
    }
  } catch (error) {
    console.error('Error en el widget:', error);
    widget.innerHTML = '<div style="color: #ef4444;">Error de conexión</div>';
  }
})(); 