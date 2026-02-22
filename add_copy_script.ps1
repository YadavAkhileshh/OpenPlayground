$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse -File

foreach ($file in $htmlFiles) {
    if ($file.FullName -match 'node_modules' -or $file.FullName -match '\.git') {
        continue
    }

    $content = Get-Content $file.FullName -Raw

    if ($content -match '<pre') {
        # Check if we already injected it
        if ($content -notmatch 'copyCode.js') {
            # Determine depth
            $relativePath = Resolve-Path -Relative $file.FullName
            $depth = ($relativePath.Split('\/').Count) - 2
            
            $scriptSrc = ""
            if ($depth -lt 0) {
                $scriptSrc = "./js/copyCode.js"
            } elseif ($depth -eq 0) {
                # Just one folder deep like projects/
                $scriptSrc = "../js/copyCode.js"
            } elseif ($depth -eq 1) {
                # Two folders deep like projects/foo/
                $scriptSrc = "../../js/copyCode.js"
            } elseif ($depth -eq 2) {
                $scriptSrc = "../../../js/copyCode.js"
            }
            
            if ($scriptSrc -ne "") {
                $scriptHtml = "<script src=`"$scriptSrc`" defer></script>`n</body>"
                $content = $content -replace '</body>', $scriptHtml
                Set-Content -Path $file.FullName -Value $content
                Write-Host "Injected $scriptSrc into $($file.Name)"
            }
        }
    }
}
