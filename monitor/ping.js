const fetch = require('node-fetch');

(async () => {
  try {
    const r = await fetch('https://rent-widget.vercel.app/api/predict?comuna=Providencia&m2=60');
    
    if (r.status >= 500) {
      console.error(`🔴 Predict 5xx (${r.status})`);
      
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔴 RentWidget /api/predict devolvió ${r.status}\nURL: https://rent-widget.vercel.app/api/predict?comuna=Providencia&m2=60`
        })
      });
    } else {
      console.log(`✅ Predict OK (${r.status})`);
    }
  } catch (error) {
    console.error('Error en el monitoreo:', error);
    
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🔴 RentWidget /api/predict error: ${error.message}`
      })
    });
  }
})(); 