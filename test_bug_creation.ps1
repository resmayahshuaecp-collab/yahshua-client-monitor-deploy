# Test script to verify bug creation with proper authentication

# Create a session to maintain cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Step 1: GET CSRF cookie
Write-Host "Step 1: Getting CSRF cookie..." -ForegroundColor Cyan
$csrfResponse = Invoke-WebRequest -Uri "http://localhost:8085/api/auth/csrf" -Method GET -WebSession $session -ErrorAction SilentlyContinue
Write-Host "CSRF Response: $($csrfResponse.StatusCode)"
Write-Host "Cookies after CSRF: $($session.Cookies | Format-Table -AutoSize)"

# Step 2: Login with test credentials
Write-Host "`nStep 2: Logging in..." -ForegroundColor Cyan
$loginBody = @{email='admin@example.com'; password='admin'} | ConvertTo-Json
$loginResponse = Invoke-WebRequest -Uri "http://localhost:8085/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody `
    -WebSession $session `
    -ErrorAction SilentlyContinue

if ($loginResponse.StatusCode -eq 200) {
    Write-Host "Login successful!" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "Actor: $($loginData.actor | ConvertTo-Json)"
    Write-Host "Cookies after login: $($session.Cookies | Format-Table -AutoSize)"
} else {
    Write-Host "Login failed with status $($loginResponse.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($loginResponse.Content)"
}

# Step 3: Try creating a bug
Write-Host "`nStep 3: Creating a bug..." -ForegroundColor Cyan
$bugBody = @{title='Test Bug 123'; priority='MEDIUM'} | ConvertTo-Json
$bugResponse = Invoke-WebRequest -Uri "http://localhost:8085/api/concerns/bugs" `
    -Method POST `
    -ContentType "application/json" `
    -Body $bugBody `
    -WebSession $session `
    -ErrorAction SilentlyContinue

if ($bugResponse.StatusCode -eq 201 -or $bugResponse.StatusCode -eq 200) {
    Write-Host "Bug created successfully!" -ForegroundColor Green
    $bugData = $bugResponse.Content | ConvertFrom-Json
    Write-Host "Bug: $($bugData | ConvertTo-Json)"
} else {
    Write-Host "Bug creation failed with status $($bugResponse.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($bugResponse.Content)"
}
