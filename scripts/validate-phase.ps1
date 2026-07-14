[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Phase,

    [string]$RunDirectory,

    [switch]$SkipScope,

    [switch]$VerboseLogs
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-RepoRoot {
    $root = & git rev-parse --show-toplevel 2>$null
    if (-not $root) {
        throw 'Not inside a Git repository.'
    }
    return ($root | Select-Object -First 1).Trim()
}

function Get-PowerShellExecutable {
    return (Get-Process -Id $PID).Path
}

function Resolve-CmdExecutable {
    $cmdPath = Join-Path $env:SystemRoot 'System32\cmd.exe'
    if (-not (Test-Path -LiteralPath $cmdPath)) {
        throw "cmd.exe not found: $cmdPath"
    }
    return $cmdPath
}

function Get-LogTextOrEmpty {
    param([AllowNull()][string]$Text)

    if ([string]::IsNullOrEmpty($Text)) {
        return ''
    }

    return $Text.TrimEnd()
}

function Get-PhaseObject {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Phase file not found: $Path"
    }

    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Assert-PhaseDefinition {
    param($Definition)

    $required = @(
        'id',
        'title',
        'description',
        'allowedFiles',
        'forbiddenFiles',
        'phpTests',
        'jsTests',
        'phpLint',
        'jsLint',
        'commitMessage'
    )

    foreach ($name in $required) {
        if (-not ($Definition.PSObject.Properties.Name -contains $name)) {
            throw "Phase definition missing required property: $name"
        }
    }

    foreach ($collectionName in @('allowedFiles', 'forbiddenFiles', 'phpTests', 'jsTests', 'phpLint', 'jsLint')) {
        $items = @($Definition.$collectionName)
        if ($items.Count -eq 0 -and $collectionName -in @('allowedFiles')) {
            throw "Phase definition requires at least one entry in $collectionName"
        }
    }
}

function Invoke-LoggedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $true)]
        [string]$Label,

        [string]$OutputDirectory
    )

    Write-Host "==> $Label"
    $cmdExe = Resolve-CmdExecutable
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $cmdExe
    $startInfo.Arguments = "/d /s /c `"$Command`""
    $startInfo.WorkingDirectory = (Get-Location).Path
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    $startedAt = Get-Date
    $null = $process.Start()
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    $exitCode = $process.ExitCode
    $duration = (Get-Date) - $startedAt

    $logText = @(
        "Command: $Command",
        "WorkingDirectory: $((Get-Location).Path)",
        "ExitCode: $exitCode",
        "DurationMs: $([int][Math]::Round($duration.TotalMilliseconds))",
        '',
        '--- STDOUT ---',
        (Get-LogTextOrEmpty -Text $stdout),
        '',
        '--- STDERR ---',
        (Get-LogTextOrEmpty -Text $stderr)
    ) -join [Environment]::NewLine

    if ($OutputDirectory) {
        $logPath = Join-Path $OutputDirectory ($Label -replace '[^A-Za-z0-9\-_]+', '_').ToLower() + '.log'
        $logText | Out-File -LiteralPath $logPath -Encoding utf8
    }

    if ($VerboseLogs) {
        if ($stdout) {
            (Get-LogTextOrEmpty -Text $stdout).Split([Environment]::NewLine) | ForEach-Object { Write-Host $_ }
        }
        if ($stderr) {
            (Get-LogTextOrEmpty -Text $stderr).Split([Environment]::NewLine) | ForEach-Object { Write-Host $_ }
        }
    }

    [pscustomobject]@{
        label      = $Label
        command    = $Command
        exitCode   = $exitCode
        durationMs = [int][Math]::Round($duration.TotalMilliseconds)
        passed     = ($exitCode -eq 0)
    }
}

$repoRoot = Resolve-RepoRoot
$powerShellExe = Get-PowerShellExecutable
Set-Location -LiteralPath $repoRoot

$phasePath = Join-Path $repoRoot $Phase
$phaseObject = Get-PhaseObject -Path $phasePath
Assert-PhaseDefinition -Definition $phaseObject

$results = New-Object System.Collections.Generic.List[object]

if (-not $SkipScope) {
    $scopeJson = & $powerShellExe -NoProfile -File (Join-Path $repoRoot 'scripts/check-scope.ps1') -Phase $Phase
    $scopeExitCode = $LASTEXITCODE

    if ($RunDirectory) {
        $scopeJson | Out-File -LiteralPath (Join-Path $RunDirectory 'scope.json') -Encoding utf8
    }

    if ($scopeExitCode -ne 0) {
        throw 'Scope validation failed.'
    }
}

foreach ($command in @($phaseObject.phpTests)) {
    $results.Add((Invoke-LoggedCommand -Command $command -Label "php-test-$($results.Count + 1)" -OutputDirectory $RunDirectory))
}

foreach ($command in @($phaseObject.jsTests)) {
    $results.Add((Invoke-LoggedCommand -Command $command -Label "js-test-$($results.Count + 1)" -OutputDirectory $RunDirectory))
}

foreach ($command in @($phaseObject.phpLint)) {
    $results.Add((Invoke-LoggedCommand -Command $command -Label "php-lint-$($results.Count + 1)" -OutputDirectory $RunDirectory))
}

foreach ($command in @($phaseObject.jsLint)) {
    $results.Add((Invoke-LoggedCommand -Command $command -Label "js-lint-$($results.Count + 1)" -OutputDirectory $RunDirectory))
}

$failed = @($results | Where-Object { -not $_.passed })
$summary = [pscustomobject]@{
    phaseId  = $phaseObject.id
    passed   = ($failed.Count -eq 0)
    results  = @($results)
    failed   = @($failed)
}

$summary | ConvertTo-Json -Depth 6

if ($failed.Count -gt 0) {
    exit 1
}
