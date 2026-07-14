[CmdletBinding()]
param([switch]$Live)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$sourceRoot = (& git rev-parse --show-toplevel).Trim()
if (-not $sourceRoot) { throw 'Not inside the source repository.' }
$codex = Join-Path ([Environment]::GetFolderPath('ApplicationData')) 'npm\codex.cmd'
if ($Live -and -not (Test-Path -LiteralPath $codex)) { throw "Codex CLI not found: $codex" }
$schemaPath = Join-Path $sourceRoot 'automation/schemas/review.schema.json'
$pipelinePath = Join-Path $sourceRoot 'scripts/ai-pipeline.ps1'
$pipelineTokens = $null
$pipelineErrors = $null
$pipelineAst = [System.Management.Automation.Language.Parser]::ParseFile($pipelinePath, [ref]$pipelineTokens, [ref]$pipelineErrors)
if ($pipelineErrors.Count -gt 0) { throw 'Pipeline does not parse.' }
$reviewFunction = $pipelineAst.Find({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq 'Invoke-CodexReview' }, $true)
if (-not $reviewFunction) { throw 'Invoke-CodexReview not found.' }
$reviewFunctionText = $reviewFunction.Extent.Text
if ($reviewFunctionText -match 'StandardInputText' -or $reviewFunctionText -match "(?m)^\s*'-'\s*$") { throw 'Pipeline Reviewer still uses stdin.' }
if ($reviewFunctionText.IndexOf("'--output-schema'") -gt $reviewFunctionText.IndexOf("'review'")) { throw 'Pipeline Reviewer output options occur after review subcommand.' }
$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("reviewer-runner-{0}" -f ([guid]::NewGuid().ToString('N')))
$repoRoot = Join-Path $testRoot 'repo'
$outputRoot = Join-Path $testRoot 'output'
$reviewPath = Join-Path $outputRoot 'review.json'
$stdoutPath = Join-Path $outputRoot 'stdout.log'
$stderrPath = Join-Path $outputRoot 'stderr.log'
$originalLocation = Get-Location

function Quote-Argument {
    param([string]$Value)
    if ($null -eq $Value -or $Value.Length -eq 0) { return '""' }
    if ($Value -notmatch '[\s"]') { return $Value }
    return '"' + ($Value -replace '(\\*)"', '$1$1\"' -replace '(\\+)$', '$1$1') + '"'
}

try {
    New-Item -ItemType Directory -Path $repoRoot,$outputRoot -Force | Out-Null
    if (-not $Live) {
        $mockScript = Join-Path $testRoot 'mock-codex.ps1'
        $mockCommand = Join-Path $testRoot 'codex.cmd'
        @'
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$RemainingArgs)
$stdinText = [Console]::In.ReadToEnd()
if ($stdinText.Length -ne 0) { exit 91 }
$outputIndex = [Array]::IndexOf($RemainingArgs, '--output-last-message')
if ($outputIndex -lt 0 -or $outputIndex + 1 -ge $RemainingArgs.Count) { exit 92 }
$reviewIndex = [Array]::IndexOf($RemainingArgs, 'review')
if ($reviewIndex -lt 0 -or $reviewIndex + 1 -ge $RemainingArgs.Count -or $RemainingArgs[$reviewIndex + 1] -ne '--uncommitted') { exit 93 }
[ordered]@{
    approved = $true
    blockers = @()
    warnings = @()
    filesReviewed = @('fixture.txt')
    recommendedCommitMessage = 'test: controlled review'
} | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $RemainingArgs[$outputIndex + 1] -Encoding utf8
'controlled reviewer mock'
'controlled reviewer stderr' | Write-Error
exit 0
'@ | Set-Content -LiteralPath $mockScript -Encoding utf8
        "@powershell.exe -NoProfile -NonInteractive -File `"$mockScript`" %*" | Set-Content -LiteralPath $mockCommand -Encoding ascii
        $codex = $mockCommand
    }
    Set-Location -LiteralPath $repoRoot
    & git init --quiet
    & git config user.email 'automation-test@example.invalid'
    & git config user.name 'Automation Test'
    'baseline' | Set-Content -LiteralPath 'fixture.txt' -Encoding utf8
    & git add -- fixture.txt
    & git commit --quiet -m baseline
    'uncommitted review change' | Set-Content -LiteralPath 'fixture.txt' -Encoding utf8
    $statusBefore = @(& git status --short) -join "`n"

    $reviewArgs = @(
        'exec',
        '--ignore-user-config',
        '--ephemeral',
        '--sandbox', 'read-only',
        '--cd', $repoRoot,
        '--output-last-message', $reviewPath,
        '--output-schema', $schemaPath,
        'review',
        '--uncommitted'
    )
    if ($reviewArgs[-1] -eq '-') { throw 'Reviewer arguments must not end with stdin marker.' }
    $reviewIndex = [Array]::IndexOf($reviewArgs, 'review')
    foreach ($globalOption in @('--sandbox','--cd','--output-last-message','--output-schema')) {
        if ([Array]::IndexOf($reviewArgs, $globalOption) -gt $reviewIndex) { throw "Reviewer option is after subcommand: $globalOption" }
    }

    $commandLine = (Quote-Argument $codex) + ' ' + (@($reviewArgs | ForEach-Object { Quote-Argument $_ }) -join ' ')
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = (Join-Path $env:SystemRoot 'System32\cmd.exe')
    $startInfo.Arguments = "/d /s /c `"$commandLine`""
    $startInfo.WorkingDirectory = $repoRoot
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardInput = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    $null = $process.Start()
    $process.StandardInput.Close()
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    if (-not $process.WaitForExit(300000)) {
        & taskkill.exe /PID $process.Id /T /F | Out-Null
        throw 'Controlled Reviewer timed out.'
    }
    $stdout = $stdoutTask.Result
    $stderr = $stderrTask.Result
    $stdout | Out-File -LiteralPath $stdoutPath -Encoding utf8
    $stderr | Out-File -LiteralPath $stderrPath -Encoding utf8
    $exitCode = $process.ExitCode
    $process.Dispose()
    if ($exitCode -ne 0) { throw "Controlled Reviewer failed with exit code $exitCode. stderr: $stderr" }
    if (-not (Test-Path -LiteralPath $reviewPath -PathType Leaf)) { throw 'Controlled Reviewer did not create review.json.' }

    $review = Get-Content -LiteralPath $reviewPath -Raw | ConvertFrom-Json
    $required = @('approved','blockers','warnings','filesReviewed','recommendedCommitMessage')
    foreach ($property in $required) {
        if (-not ($review.PSObject.Properties.Name -contains $property)) { throw "review.json is missing schema property: $property" }
    }
    $extra = @($review.PSObject.Properties.Name | Where-Object { $required -notcontains $_ })
    if ($extra.Count -gt 0) { throw "review.json contains schema-forbidden properties: $($extra -join ', ')" }
    if ($review.approved -isnot [bool] -or $review.recommendedCommitMessage -isnot [string]) { throw 'review.json property types do not match schema.' }

    $statusAfter = @(& git status --short) -join "`n"
    if ($statusAfter -ne $statusBefore) { throw "Reviewer modified the temporary repository.`nBefore: $statusBefore`nAfter: $statusAfter" }
    if ($Live) {
        Write-Host 'Reviewer live controlled test: OK'
    } else {
        Write-Host 'Reviewer controlled test: OK'
    }
}
finally {
    Set-Location -LiteralPath $originalLocation
    $resolvedTempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
    $resolvedTestRoot = [System.IO.Path]::GetFullPath($testRoot)
    if ($resolvedTestRoot.StartsWith($resolvedTempRoot, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path $resolvedTestRoot)) {
        Remove-Item -LiteralPath $resolvedTestRoot -Recurse -Force
    }
}
