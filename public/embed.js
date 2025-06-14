(function() {
  const script = document.currentScript;
  const commune = script.getAttribute('data-comuna');
  const m2 = script.getAttribute('data-m2');
  const bedrooms = script.getAttribute('data-bedrooms');
  const bathrooms = script.getAttribute('data-bathrooms');

  if (!commune || !m2 || !bedrooms || !bathrooms) {
    console.error('Faltan atributos requeridos en el script');
    return;
  }

  const url = new URL('/api/predict', window.location.origin);
  url.searchParams.set('comuna', commune);
  url.searchParams.set('m2', m2);
  url.searchParams.set('bedrooms', bedrooms);
  url.searchParams.set('bathrooms', bathrooms);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('Error:', data.error);
        return;
      }

      const container = document.createElement('div');
      container.style.cssText = `
        padding: 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        background: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        font-family: system-ui, -apple-system, sans-serif;
      `;

      const title = document.createElement('h3');
      title.textContent = 'Rango estimado de arriendo';
      title.style.cssText = `
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        color: #1a202c;
      `;

      const range = document.createElement('p');
      range.textContent = `$${data.min.toLocaleString()} - $${data.max.toLocaleString()} CLP`;
      range.style.cssText = `
        margin: 0;
        font-size: 1.5rem;
        font-weight: bold;
        color: #2d3748;
      `;

      container.appendChild(title);
      container.appendChild(range);
      script.parentNode.insertBefore(container, script.nextSibling);
    })
    .catch(error => {
      console.error('Error al obtener el rango:', error);
    });
})(); 