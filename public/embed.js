(async () => {
  const script = document.currentScript;
  const { comuna, m2, bedrooms, bathrooms } = script.dataset;

  // Crear el div del widget
  const widget = document.createElement('div');
  widget.id = 'rw-widget';
  widget.style.cssText = `
    font-family: Arial, sans-serif;
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;

  // Mostrar estado de carga
  widget.textContent = 'Calculando...';

  try {
    // Insertar antes del script
    script.parentNode.insertBefore(widget, script);

    // Hacer la petición a la API
    const response = await fetch(`/api/predict?comuna=${encodeURIComponent(comuna)}&m2=${encodeURIComponent(m2)}`);
    const data = await response.json();

    if (response.status === 200) {
      // Formatear números con separadores de miles
      const min = new Intl.NumberFormat('es-CL').format(data.min);
      const max = new Intl.NumberFormat('es-CL').format(data.max);
      widget.textContent = `CLP ${min} – ${max} (${data.count} avisos)`;
    } else if (response.status === 404) {
      widget.textContent = 'Sin datos suficientes';
    } else {
      widget.textContent = 'Error interno';
    }
  } catch (error) {
    console.error('Error en el widget:', error);
    widget.textContent = 'Error de conexión';
  }
})(); 