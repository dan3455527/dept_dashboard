[CmdletBinding()]
param(
    [string]$ReportsRoot = (Join-Path (Split-Path $PSScriptRoot -Parent) 'reports'),
    [string]$AssetsRoot = (Join-Path (Split-Path $PSScriptRoot -Parent) 'assets')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $ReportsRoot -PathType Container)) {
    throw "Reports folder not found: $ReportsRoot"
}
if (-not (Test-Path -LiteralPath $AssetsRoot -PathType Container)) {
    throw "Assets folder not found: $AssetsRoot"
}

function Get-RelativeUrl([string]$FromFile, [string]$ToFile) {
    $fromDirectory = [System.IO.Path]::GetFullPath((Split-Path -LiteralPath $FromFile -Parent) + [System.IO.Path]::DirectorySeparatorChar)
    $fromUri = New-Object -TypeName System.Uri -ArgumentList $fromDirectory
    $toUri = New-Object -TypeName System.Uri -ArgumentList ([System.IO.Path]::GetFullPath($ToFile))
    return [System.Uri]::UnescapeDataString($fromUri.MakeRelativeUri($toUri).ToString())
}

$styleFile = Join-Path $AssetsRoot 'excel-table-tools.css'
$scriptFile = Join-Path $AssetsRoot 'excel-table-tools.js'
if (-not (Test-Path -LiteralPath $styleFile) -or -not (Test-Path -LiteralPath $scriptFile)) {
    throw 'excel-table-tools.css and excel-table-tools.js must exist in the assets folder.'
}

# Excel's Web Page export places displayable sheets in a .fld folder.  Limiting
# processing to these files avoids altering the frameset wrapper HTML.
$sheets = Get-ChildItem -LiteralPath $ReportsRoot -Recurse -File -Filter '*.html' |
    Where-Object { $_.Directory.Name -like '*.fld' }

$encoding = New-Object System.Text.UTF8Encoding($false)
$updated = 0
foreach ($sheet in $sheets) {
    $html = [System.IO.File]::ReadAllText($sheet.FullName)
    if ($html -notmatch '(?is)<table\b') { continue }

    $html = [regex]::Replace($html, '(?is)\s*<link\b[^>]*\bdata-excel-table-tools\b[^>]*>', '')
    $html = [regex]::Replace($html, '(?is)\s*<script\b[^>]*\bdata-excel-table-tools\b[^>]*>\s*</script>', '')
    $styleUrl = Get-RelativeUrl $sheet.FullName $styleFile
    $scriptUrl = Get-RelativeUrl $sheet.FullName $scriptFile
    $injection = "`r`n<link rel=`"stylesheet`" href=`"$styleUrl`" data-excel-table-tools>`r`n<script src=`"$scriptUrl`" defer data-excel-table-tools></script>"

    if ($html -match '(?is)</head\s*>') {
        $html = [regex]::Replace($html, '(?is)</head\s*>', ($injection + "`r`n</head>"))
    } else {
        $html = $injection + "`r`n" + $html
    }
    [System.IO.File]::WriteAllText($sheet.FullName, $html, $encoding)
    Write-Host "Enhanced: $($sheet.FullName)"
    $updated += 1
}

Write-Host "Completed. Enhanced $updated worksheet file(s)."
