$issues = @(
    @{ title = 'Improve Accessibility (a11y) for index.html button elements'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I would like to improve the accessibility (a11y) of buttons in the `index.html` page by adding appropriate aria-labels and roles.' },
    @{ title = 'Add a Dark Mode toggle to the navigation bar'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I want to implement a dark mode toggle in the navigation bar to improve the user experience at night.' },
    @{ title = 'Optimize image assets to reduce page load time'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I would like to optimize the images across the repository to decrease the overall page load time.' },
    @{ title = 'Create a dedicated 404 Error Page'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I would like to design and implement a custom 404 Not Found page for better navigation.' },
    @{ title = 'Fix responsive design issues on mobile for about.html'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I want to fix some CSS media queries to ensure the `about.html` page looks perfect on smaller mobile screens.' },
    @{ title = 'Add a "Back to Top" floating button'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I would like to add a smooth "Back to Top" button that appears when the user scrolls down on long pages.' },
    @{ title = 'Implement lazy loading for images'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I want to add the `loading="lazy"` attribute to images across the site to improve initial load performance.' },
    @{ title = 'Standardize CSS variables for color themes'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I would like to refactor the CSS files to use CSS variables consistently for colors, making it easier to maintain and theme.' },
    @{ title = 'Add a copy-to-clipboard button for code snippets'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I want to implement a small JS utility that adds a "Copy" button to code blocks, enhancing the developer experience.' },
    @{ title = 'Refactor JS utility functions to modern ES6 syntax'; body = 'Hey @YadavAkhileshh! Could you please assign this issue to me? I would like to update older JavaScript code in the `js/` directory to use ES6+ features like arrow functions and destructuring.' }
)

foreach ($issue in $issues) {
    Write-Host "Creating issue: $($issue.title)"
    gh issue create --repo YadavAkhileshh/OpenPlayground --title $issue.title --body $issue.body
    Start-Sleep -Seconds 2
}
