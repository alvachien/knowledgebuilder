param(
    [string]$Prefix = ''
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$inputFile = Join-Path $scriptDir "question.txt"
$outputFile = Join-Path $scriptDir "questions.json"

if ($Prefix) {
    python "$scriptDir\parse_questions.py" $inputFile $outputFile $Prefix
} else {
    python "$scriptDir\parse_questions.py" $inputFile $outputFile
}

if ($LASTEXITCODE -eq 0 -and (Test-Path $outputFile)) {
    Write-Host "Output saved to: $outputFile"
}