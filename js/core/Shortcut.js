
export function keyevents() {
    document.addEventListener('keydown', handlekeyevents);
}

function handlekeyevents(e) {

    
    // Ignore shortcuts when typing (except Escape)
    

    // "/" → focus search
    if (e.key === '/') {
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
    else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // SHIFT + D → toggle theme ✅
    else if (e.key.toLowerCase() === 'g') {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}
}
