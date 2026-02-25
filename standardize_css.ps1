$file = "css/style.css"
$content = Get-Content $file -Raw

# 1. Inject missing variables into :root
if ($content -notmatch '--primary-color:') {
    $content = $content -replace ':root \{', ":root {`n  --primary-color: #ff6b35;`n  --primary-hover: #ff5722;`n  --chatbot-bg: #f5e8d8;"
}
if ($content -notmatch 'html\[data-theme="dark"\] \{') {
    # It exists in line 242.
}

# Add dark mode specific chatbot bg
$content = $content -replace 'html\[data-theme="dark"\] \{', "html[data-theme=`"dark`"] {`n  --chatbot-bg: rgba(160, 82, 45, 0.15);"

# 2. Replace hardcoded colors
$content = $content -replace '#ff6b35', 'var(--primary-color)'
$content = $content -replace '#ff5722', 'var(--primary-hover)'
$content = $content -replace '#f5e8d8', 'var(--chatbot-bg)'
$content = $content -replace 'rgba\(160,\s*82,\s*45,\s*0\.15\)', 'var(--chatbot-bg)'

Set-Content $file -Value $content
Write-Host "Standardized CSS variables in $file"
