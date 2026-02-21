$htmlFiles = Get-ChildItem -Path . -Filter *.html -File

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if responsive.css is before style.css
    if ($content -match '<link rel="stylesheet" href="./css/responsive.css">\s*<link rel="stylesheet" href="./css/style.css">') {
        $content = $content -replace '<link rel="stylesheet" href="./css/responsive.css">\s*<link rel="stylesheet" href="./css/style.css">', '<link rel="stylesheet" href="./css/style.css">`n    <link rel="stylesheet" href="./css/responsive.css">'
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Fixed: $($file.Name)"
    }
    elseif ($content -match '<link rel="stylesheet" href="./css/responsive.css" />\s*<link rel="stylesheet" href="./css/style.css" />') {
        $content = $content -replace '<link rel="stylesheet" href="./css/responsive.css" />\s*<link rel="stylesheet" href="./css/style.css" />', '<link rel="stylesheet" href="./css/style.css" />`n  <link rel="stylesheet" href="./css/responsive.css" />'
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Fixed: $($file.Name)"
    }
}
