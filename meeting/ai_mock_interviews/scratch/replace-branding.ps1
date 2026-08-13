$files = Get-ChildItem -Recurse -Include "*.ts","*.tsx","*.json" -Path "app","components","lib"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match "PrepWise|SkillForge") {
        $newContent = $content -replace "PrepWise", "CareerNexa" -replace "SkillForge", "CareerNexa"
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Updated branding in: $($file.FullName)"
    }
}
Write-Host "Branding updated successfully to CareerNexa."
