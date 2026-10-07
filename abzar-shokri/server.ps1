# Static file server for Abzar Shokri — pure PowerShell + TcpListener, no dependencies.
# Mirrors server.js: serves project root (default port 3000, PORT env var honored,
# tries successive ports if one is taken). Writes the bound port to .freebuff/server.port.
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$basePort = 3000
$parsed = $env:PORT -as [int]
if ($parsed -and $parsed -gt 0) { $basePort = $parsed }

$mime = @{
    '.html'  = 'text/html; charset=utf-8'
    '.css'   = 'text/css; charset=utf-8'
    '.js'    = 'application/javascript; charset=utf-8'
    '.json'  = 'application/json; charset=utf-8'
    '.webmanifest' = 'application/manifest+json; charset=utf-8'
    '.png'   = 'image/png'
    '.jpg'   = 'image/jpeg'
    '.jpeg'  = 'image/jpeg'
    '.gif'   = 'image/gif'
    '.webp'  = 'image/webp'
    '.svg'   = 'image/svg+xml'
    '.ico'   = 'image/x-icon'
    '.woff'  = 'font/woff'
    '.woff2' = 'font/woff2'
    '.ttf'   = 'font/ttf'
    '.map'   = 'application/json'
}

$listener = $null
$boundPort = $null
for ($p = $basePort; $p -lt $basePort + 20; $p++) {
    try {
        $l = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $p)
        $l.Start()
        $listener = $l
        $boundPort = $p
        break
    } catch {
        Write-Output "Port ${p}: in use, trying next"
    }
}

if (-not $listener) {
    Write-Output "FATAL: could not bind any port from $basePort to $($basePort + 19)"
    exit 1
}

$portFile = Join-Path $root ".freebuff\server.port"
Set-Content -Path $portFile -Value "$boundPort" -Encoding ASCII

Write-Output "Abzar Shokri dev server running at http://127.0.0.1:$boundPort"
Write-Output "PID: $PID"
[Console]::Out.Flush()

$utf8 = [System.Text.Encoding]::UTF8

function Send-Response($stream, [int]$code, [string]$status, [string]$contentType, [byte[]]$body) {
    $head = "HTTP/1.1 $code $status`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nCache-Control: no-cache`r`n`r`n"
    $headBytes = [System.Text.Encoding]::ASCII.GetBytes($head)
    $stream.Write($headBytes, 0, $headBytes.Length)
    if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
    $stream.Flush()
}

while ($true) {
    $client = $null
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $stream.ReadTimeout = 5000

        # Read request head (single small read is enough for browser GETs)
        $buffer = New-Object byte[] 16384
        $n = $stream.Read($buffer, 0, $buffer.Length)
        if ($n -le 0) { $client.Close(); continue }

        $reqHead = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $n)
        $firstLine = ($reqHead -split "`r`n")[0]
        $parts = $firstLine -split ' '
        $method = if ($parts.Count -ge 1) { $parts[0] } else { 'GET' }
        $rawPath = if ($parts.Count -ge 2) { $parts[1] } else { '/' }
        $rawPath = ($rawPath -split '\?')[0]
        $rawPath = [Uri]::UnescapeDataString($rawPath)
        if ($rawPath -eq '/') { $rawPath = '/index.html' }

        $candidate = Join-Path $root ($rawPath.TrimStart('/') -replace '/', '\')
        $resolved = (Resolve-Path -LiteralPath $candidate -ErrorAction SilentlyContinue)
        if ($resolved -and $resolved.Path.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -and -not (Test-Path $resolved.Path -PathType Container)) {
            $bytes = [System.IO.File]::ReadAllBytes($resolved.Path)
            $ext = [System.IO.Path]::GetExtension($resolved.Path).ToLowerInvariant()
            $ct = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
            if ($method -eq 'HEAD') {
                Send-Response $stream 200 'OK' $ct ([byte[]]@())
            } else {
                Send-Response $stream 200 'OK' $ct $bytes
            }
        } else {
            Send-Response $stream 404 'Not Found' 'text/plain; charset=utf-8' ($utf8.GetBytes('404 Not Found'))
        }
    } catch {
        Write-Output "Request error: $($_.Exception.Message)"
    } finally {
        if ($client) { try { $client.Close() } catch {} }
    }
}
