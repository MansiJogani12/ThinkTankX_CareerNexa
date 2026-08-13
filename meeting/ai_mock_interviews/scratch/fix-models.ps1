$files = Get-ChildItem -Recurse -Include "*.ts","*.tsx" -Path "app","lib"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match "gemini-1\.5-flash-latest|gemini-2\.0-flash-exp") {
        $newContent = $content -replace "gemini-1\.5-flash-latest", "gemini-1.5-flash" -replace "gemini-2\.0-flash-exp", "gemini-1.5-flash"
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Updated: $($file.FullName)"
    }
}
Write-Host "Done."
