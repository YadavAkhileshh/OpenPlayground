
let commandPaletteInstance = null;

export function keyevents(commandPalette = null) {
    commandPaletteInstance = commandPalette;
    document.addEventListener('keydown', handlekeyevents);
}

function handlekeyevents(e) {

    // Ctrl+K or Cmd+K → Open Command Palette ✨
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (commandPaletteInstance) {
            commandPaletteInstance.open();
        }
        return; // Prevent other shortcuts
    }

    // Ignore shortcuts when typing in search or command palette
    const isSearching = e.target.id === 'project-search' || e.target.id === 'command-search';
    const isCommandPalette = e.target.closest('#command-palette');
    
    if (isCommandPalette && e.key !== 'Escape') {
        return; // Let command palette handle its own shortcuts
    }

    // "/" → focus search
    if (e.key === '/' && !isSearching) {
        e.preventDefault();
        document.getElementById('project-search')?.focus();
    }

    // ESC → clear search
    else if (e.key === 'Escape' && e.target.id === 'project-search') {
        e.preventDefault();
        e.target.value = "";
        e.target.blur();
    }

    // "t" → scroll to top
    else if (e.key.toLowerCase() === 't' && !isSearching) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // "g" → scroll to bottom ✅
    else if (e.key.toLowerCase() === 'g' && !isSearching) {
        e.preventDefault();
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }
}
