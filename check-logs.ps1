#################################################
# Check Vercel Production Logs - Rent Widget   #
#################################################

Write-Host "── Obteniendo logs de producción (últimos 30)"
Write-Host "Proyecto: rent-widget"
Write-Host "─────────────────────────────────────────────"

vercel logs rent-widget --prod -n 30

Write-Host "─────────────────────────────────────────────"
Write-Host "Logs obtenidos. Revisa arriba para ver errores o problemas." 