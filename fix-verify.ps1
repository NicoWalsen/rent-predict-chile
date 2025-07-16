############################################
#  FIX & VERIFY PRODUCTION (PowerShell)    #
############################################

# 0) Ajusta estos valores si cambian
$env:VERCEL_PROJECT = "rent-widget"
$env:PROD_URL = "https://rent-widget.vercel.app"
$env:ADMIN_KEY = "Detonador07"
$env:DATABASE_URL = "postgresql://postgres:Detonador07!@db.edxiveestulqjvflkrhi.supabase.co:5432/postgres"
$env:NEXT_PUBLIC_SUPABASE_URL = "https://edxiveestulqjvflkrhi.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzd..."
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SERVICE_ROLE..."

# 1) Variables requeridas
$REQUIRED = @(
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY"
)

Write-Host "── 1) Variables en producción"
vercel env ls $env:VERCEL_PROJECT --prod --json | Out-File -Encoding utf8 envs.json
$envs = Get-Content envs.json | ConvertFrom-Json
$envs.envs | ForEach-Object { Write-Host "$($_.key)=$($_.value)" }

$ADDED = $false
foreach ($V in $REQUIRED) {
    if (-not ($envs.envs | Where-Object { $_.key -eq $V })) {
        Write-Host "➕ Añadiendo $V"
        $value = [Environment]::GetEnvironmentVariable($V, "Process")
        if (-not $value) { $value = $env:$V }
        $value | vercel env add $V production
        $ADDED = $true
    }
}

# 2) Password Protection off (si existiera)
Write-Host "── 2) Desactivando Password Protection"
vercel project ls --json | Out-File -Encoding utf8 projects.json
$projects = Get-Content projects.json | ConvertFrom-Json
$PID = ($projects.projects | Where-Object { $_.name -eq $env:VERCEL_PROJECT }).id
if ($PID) {
    vercel project edit $PID --no-password-protection --yes
}

# 3) Redeploy si cambió algo
if ($ADDED) {
    Write-Host "── 3) Redeploy"
    vercel --prod --confirm
}

# 4) Pruebas de endpoint, admin y widget
Write-Host "── 4) Tests producción"
Invoke-RestMethod "$env:PROD_URL/api/predict?comuna=Providencia&m2=80" -OutFile predict.json
$predictStatus = (Invoke-WebRequest "$env:PROD_URL/api/predict?comuna=Providencia&m2=80" -Method Get -SkipHttpErrorCheck).StatusCode

Invoke-RestMethod "$env:PROD_URL/api/predict-ml?comuna=Providencia&m2=80" -OutFile predictml.json
$predictmlStatus = (Invoke-WebRequest "$env:PROD_URL/api/predict-ml?comuna=Providencia&m2=80" -Method Get -SkipHttpErrorCheck).StatusCode

$adminStatus = (Invoke-WebRequest "$env:PROD_URL/admin?key=$($env:ADMIN_KEY)" -Method Get -SkipHttpErrorCheck).StatusCode

Invoke-WebRequest "$env:PROD_URL/example.html" -OutFile widget.html
$widgetOK = Select-String -Path widget.html -Pattern "CLP"

# 5) Resumen
Write-Host "──────── RESUMEN ────────"
Write-Host "Predict   : HTTP:$predictStatus"
Write-Host "Predict-ML: HTTP:$predictmlStatus"
Write-Host "Admin     : HTTP:$adminStatus"
Write-Host ("Widget    : " + ($(if ($widgetOK) { "OK" } else { "FAIL" })))
Write-Host "─────────────────────────" 