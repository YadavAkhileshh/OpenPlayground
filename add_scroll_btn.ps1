$files = @(
    "contact.html",
    "contribution.html",
    "privacy.html",
    "sitemap.html",
    "starterTemplate.html",
    "stats.html",
    "terms.html"
)

$buttonHtml = @"
    <button id="scrollToTopBtn" class="scroll-top-btn" aria-label="Scroll to top">
        <svg class="progress-ring" viewBox="0 0 48 48" width="100%" height="100%">
            <circle class="progress-ring__circle" stroke="currentColor" stroke-width="3" fill="transparent" r="21"
                cx="24" cy="24" />
        </svg>
        <i class="ri-arrow-up-line" aria-hidden="true"></i>
    </button>
"@

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -notmatch 'id="scrollToTopBtn"') {
            $content = $content -replace '</body>', "$buttonHtml`n</body>"
            Set-Content $file -Value $content
            Write-Host "Added to $file"
        }
    }
}
