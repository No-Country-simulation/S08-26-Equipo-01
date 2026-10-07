param(
    [switch]$ConfirmReset,
    [string]$DemoPassword
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$backendDir = Join-Path $repoRoot 'backend'
$envFile = Join-Path $backendDir '.env'
$demoStorageRoot = Join-Path $backendDir 'storage\demo-seed-documents'

function Import-DotEnv {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        Write-Host "[config] No se encontró backend/.env; se usarán las variables del entorno actual." -ForegroundColor Yellow
        return
    }

    foreach ($rawLine in Get-Content $Path) {
        $line = $rawLine.Trim()

        if (-not $line -or $line.StartsWith('#')) {
            continue
        }

        if ($line.StartsWith('export ')) {
            $line = $line.Substring(7).Trim()
        }

        $separatorIndex = $line.IndexOf('=')
        if ($separatorIndex -lt 1) {
            continue
        }

        $name = $line.Substring(0, $separatorIndex).Trim()
        $value = $line.Substring($separatorIndex + 1).Trim()

        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, 'Process'))) {
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }

    Write-Host "[config] Variables cargadas desde backend/.env." -ForegroundColor DarkGray
}

function Require-EnvironmentValue {
    param(
        [string]$Name,
        [string]$Message
    )

    $value = [Environment]::GetEnvironmentVariable($Name, 'Process')
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw $Message
    }

    return $value
}

function New-RandomBase64 {
    param([int]$ByteCount)

    $bytes = New-Object byte[] $ByteCount
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    }
    finally {
        $rng.Dispose()
    }

    return [Convert]::ToBase64String($bytes)
}

function New-DemoPassword {
    return "Qt!" + (New-RandomBase64 -ByteCount 18).Replace('+', 'A').Replace('/', 'B').TrimEnd('=')
}

function Invoke-PsqlScalar {
    param([string]$Sql)

    $psqlArgs = @(
        '--no-psqlrc',
        '--host', $env:DB_HOST,
        '--port', $env:DB_PORT,
        '--username', $env:DB_USER,
        '--dbname', $env:DB_NAME,
        '--no-password',
        '--tuples-only',
        '--no-align',
        '--set=ON_ERROR_STOP=1',
        '--command', $Sql
    )

    $result = & psql @psqlArgs

    if ($LASTEXITCODE -ne 0) {
        throw "psql terminó con código $LASTEXITCODE."
    }

    return ($result | Out-String).Trim()
}

function Assert-SafeResetTarget {
    if (-not $ConfirmReset) {
        throw "Reset cancelado. Vuelve a ejecutar con -ConfirmReset para confirmar explícitamente el borrado de la BD local."
    }

    $allowedHosts = @('localhost', '127.0.0.1', '::1')
    if ($allowedHosts -notcontains $env:DB_HOST.ToLowerInvariant()) {
        throw "Reset bloqueado: DB_HOST='$($env:DB_HOST)' no es un host local permitido."
    }

    $database = $env:DB_NAME.ToLowerInvariant()
    if ($database -in @('postgres', 'template0', 'template1')) {
        throw "Reset bloqueado: '$($env:DB_NAME)' es una base reservada de PostgreSQL."
    }

    if ($database -match '(prod|production|live)') {
        throw "Reset bloqueado: el nombre '$($env:DB_NAME)' parece corresponder a producción."
    }

    if ($database -notmatch '^qualitytrack([_-][a-z0-9_-]+)?$') {
        throw "Reset bloqueado: DB_NAME debe ser 'qualitytrack' o comenzar con 'qualitytrack_' / 'qualitytrack-'."
    }

    $profiles = [Environment]::GetEnvironmentVariable('SPRING_PROFILES_ACTIVE', 'Process')
    if ($profiles -and $profiles.ToLowerInvariant() -match '(prod|production)') {
        throw "Reset bloqueado: SPRING_PROFILES_ACTIVE parece contener un perfil de producción."
    }

    $otherConnections = Invoke-PsqlScalar @"
select count(*)
from pg_stat_activity
where datname = current_database()
  and pid <> pg_backend_pid();
"@

    if ([int]$otherConnections -gt 0) {
        throw "Reset bloqueado: hay $otherConnections conexión(es) adicional(es) a '$($env:DB_NAME)'. Detén el backend/IDE cliente de BD y vuelve a intentar."
    }
}

Import-DotEnv -Path $envFile

if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable('DB_PORT', 'Process'))) {
    $env:DB_PORT = '5432'
}

$env:DB_HOST = Require-EnvironmentValue 'DB_HOST' 'Falta DB_HOST. Configúralo en backend/.env o en el entorno.'
$env:DB_NAME = Require-EnvironmentValue 'DB_NAME' 'Falta DB_NAME. Configúralo en backend/.env o en el entorno.'
$env:DB_USER = Require-EnvironmentValue 'DB_USER' 'Falta DB_USER. Configúralo en backend/.env o en el entorno.'

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw "No se encontró 'psql' en PATH. Instala/agrega PostgreSQL CLI antes de ejecutar el reset."
}

$previousPgPassword = [Environment]::GetEnvironmentVariable('PGPASSWORD', 'Process')
$env:PGPASSWORD = [Environment]::GetEnvironmentVariable('DB_PASSWORD', 'Process')

try {
    Assert-SafeResetTarget

    if ([string]::IsNullOrWhiteSpace($DemoPassword)) {
        $configuredDemoPassword = [Environment]::GetEnvironmentVariable('DEMO_SEED_PASSWORD', 'Process')
        if (-not [string]::IsNullOrWhiteSpace($configuredDemoPassword)) {
            $DemoPassword = $configuredDemoPassword
        }
        else {
            $DemoPassword = New-DemoPassword
        }
    }

    if ($DemoPassword.Length -lt 12) {
        throw "DEMO_SEED_PASSWORD debe tener al menos 12 caracteres."
    }

    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable('JWT_SECRET', 'Process'))) {
        $env:JWT_SECRET = New-RandomBase64 -ByteCount 48
        Write-Host "[config] Se generó un JWT_SECRET efímero para esta ejecución local." -ForegroundColor DarkGray
    }

    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable('RESEND_APIKEY', 'Process'))) {
        $env:RESEND_APIKEY = 'demo-seed-not-used'
    }
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable('RESEND_EMAIL', 'Process'))) {
        $env:RESEND_EMAIL = 'demo@localhost.invalid'
    }

    Write-Host ""
    Write-Host "QualityTrack · reset y datos demo" -ForegroundColor Cyan
    Write-Host "Base: $($env:DB_NAME)@$($env:DB_HOST):$($env:DB_PORT)" -ForegroundColor DarkGray
    Write-Host ""

    Write-Host "[1/4] Reiniciando schema public..." -ForegroundColor Cyan

    $resetArgs = @(
        '--no-psqlrc',
        '--host', $env:DB_HOST,
        '--port', $env:DB_PORT,
        '--username', $env:DB_USER,
        '--dbname', $env:DB_NAME,
        '--no-password',
        '--set=ON_ERROR_STOP=1',
        '--command', 'BEGIN; DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; COMMIT;'
    )

    & psql @resetArgs

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo reiniciar el schema public."
    }

    Write-Host "[2/4] Limpiando almacenamiento exclusivo de demo..." -ForegroundColor Cyan
    if (Test-Path $demoStorageRoot) {
        Remove-Item $demoStorageRoot -Recurse -Force
    }
    New-Item -ItemType Directory -Path $demoStorageRoot -Force | Out-Null

    $env:DOCUMENT_STORAGE_PROVIDER = 'local'
    $env:DOCUMENT_STORAGE_ROOT = $demoStorageRoot

    Write-Host "[3/4] Configurando bootstrap y perfil seed-demo..." -ForegroundColor Cyan
    $env:APP_BOOTSTRAP_ADMIN_ENABLED = 'true'
    $env:APP_BOOTSTRAP_ADMIN_FIRST_NAME = 'QualityTrack'
    $env:APP_BOOTSTRAP_ADMIN_LAST_NAME = 'Admin'
    $env:APP_BOOTSTRAP_ADMIN_EMAIL = 'admin@qualitytrack.com'
    $env:APP_BOOTSTRAP_ADMIN_PASSWORD = $DemoPassword
    $env:DEMO_SEED_PASSWORD = $DemoPassword

    $activeProfiles = [Environment]::GetEnvironmentVariable('SPRING_PROFILES_ACTIVE', 'Process')
    if ([string]::IsNullOrWhiteSpace($activeProfiles)) {
        $env:SPRING_PROFILES_ACTIVE = 'seed-demo'
    }
    elseif (($activeProfiles -split ',') -notcontains 'seed-demo') {
        $env:SPRING_PROFILES_ACTIVE = "$activeProfiles,seed-demo"
    }

    Write-Host "[4/4] Iniciando backend: Flyway -> bootstrap admin -> demo seeder..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Credenciales de esta ejecución:" -ForegroundColor Green
    Write-Host "  Admin:      admin@qualitytrack.com" -ForegroundColor Green
    Write-Host "  Comercial:  ana.comercial@qualitytrack.test" -ForegroundColor Green
    Write-Host "  Ingeniería: diego.ingenieria@qualitytrack.test" -ForegroundColor Green
    Write-Host "  Producción: carlos.produccion@qualitytrack.test" -ForegroundColor Green
    Write-Host "  Calidad:    sofia.calidad@qualitytrack.test" -ForegroundColor Green
    Write-Host "  Logística:  luis.logistica@qualitytrack.test" -ForegroundColor Green
    Write-Host "  Cliente:    maria.lopez@maquinados.test" -ForegroundColor Green
    Write-Host "  Password:   $DemoPassword" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "El proceso de Spring quedará ejecutándose. Ctrl+C para detenerlo." -ForegroundColor DarkGray
    Write-Host ""

    Push-Location $backendDir
    try {
        & .\mvnw.cmd spring-boot:run
        $backendExitCode = $LASTEXITCODE
    }
    finally {
        Pop-Location
    }

    if ($backendExitCode -ne 0) {
        throw "El backend terminó con código $backendExitCode."
    }
}
finally {
    $env:PGPASSWORD = $previousPgPassword
}
