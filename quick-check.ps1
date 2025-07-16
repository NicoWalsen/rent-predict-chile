#################################################
# Quick production check – Rent Widget (PowerShell) #
#################################################

$env:PROD_URL = "https://rent-widget.vercel.app"
$env:ADMIN_KEY = "Detonador07"
$Q = "?comuna=Providencia&m2=80"

Write-Host "── /api/predict"
try {
    $response = Invoke-RestMethod "$env:PROD_URL/api/predict$Q" -Method Get
    $status = (Invoke-WebRequest "$env:PROD_URL/api/predict$Q" -Method Get -SkipHttpErrorCheck).StatusCode
    Write-Host $response | ConvertTo-Json -Depth 1
    Write-Host "HTTP:$status"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "── /api/predict-ml"
try {
    $response = Invoke-RestMethod "$env:PROD_URL/api/predict-ml$Q" -Method Get
    $status = (Invoke-WebRequest "$env:PROD_URL/api/predict-ml$Q" -Method Get -SkipHttpErrorCheck).StatusCode
    Write-Host $response | ConvertTo-Json -Depth 1
    Write-Host "HTTP:$status"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "── /admin"
try {
    $status = (Invoke-WebRequest "$env:PROD_URL/admin?key=$($env:ADMIN_KEY)" -Method Get -SkipHttpErrorCheck).StatusCode
    Write-Host "HTTP:$status"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "── widget"
try {
    $html = Invoke-WebRequest "$env:PROD_URL/example.html" -UseBasicParsing
    $clpMatch = [regex]::Match($html.Content, "CLP [0-9,]+")
    if ($clpMatch.Success) {
        Write-Host $clpMatch.Value
    } else {
        Write-Host "No CLP found"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "──────── SUMMARY ────────" 