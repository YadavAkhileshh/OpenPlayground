$updates = @(
    @{ number = 3400; newTitle = "Fix: Improve Accessibility (a11y) for index.html button elements" },
    @{ number = 3401; newTitle = "Feat: Add a Dark Mode toggle to the navigation bar" },
    @{ number = 3402; newTitle = "Perf: Optimize image assets to reduce page load time" },
    @{ number = 3403; newTitle = "Feat: Create a dedicated 404 Error Page" },
    @{ number = 3404; newTitle = "Fix: Fix responsive design issues on mobile for about.html" },
    @{ number = 3405; newTitle = "Feat: Add a 'Back to Top' floating button" },
    @{ number = 3406; newTitle = "Perf: Implement lazy loading for images" },
    @{ number = 3407; newTitle = "Refactor: Standardize CSS variables for color themes" },
    @{ number = 3408; newTitle = "Feat: Add a copy-to-clipboard button for code snippets" },
    @{ number = 3409; newTitle = "Refactor: Refactor JS utility functions to modern ES6 syntax" }
)

foreach ($update in $updates) {
    Write-Host "Updating issue #$($update.number) to: $($update.newTitle)"
    gh issue edit $update.number --repo YadavAkhileshh/OpenPlayground --title $update.newTitle
    Start-Sleep -Seconds 1
}
