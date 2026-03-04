  (function() {
    // ---------- AI TOOLS DATA ----------
    const tools = [
      { id:1, name:'ChatMind', desc:'Advanced conversational AI for brainstorming & writing.', icon:'fa-comment-dots', category:'writing', price:'free', popular:true },
      { id:2, name:'PromptStudio', desc:'Generate, test and optimize prompts for any LLM.', icon:'fa-pen-ruler', category:'writing', price:'freemium' },
      { id:3, name:'DeepArtisan', desc:'Turn sketches into stunning artwork and illustrations.', icon:'fa-paint-brush', category:'image', price:'premium' },
      { id:4, name:'CodeWhisper', desc:'AI that explains, reviews and generates code in real time.', icon:'fa-terminal', category:'code', price:'free' },
      { id:5, name:'DataSage', desc:'Research assistant: summarise papers and extract insights.', icon:'fa-chart-line', category:'research', price:'freemium' },
      { id:6, name:'StoryForge', desc:'Creative writing partner for novels, scripts & plots.', icon:'fa-book-open', category:'writing', price:'paid' },
      { id:7, name:'PixelDream', desc:'Text-to-image generator with style control.', icon:'fa-camera-retro', category:'image', price:'free' },
      { id:8, name:'GitGuru', desc:'Automated code review & refactoring suggestions.', icon:'fa-code-branch', category:'code', price:'freemium' },
      { id:9, name:'ScholarAI', desc:'Research papers, citations & literature mapping.', icon:'fa-graduation-cap', category:'research', price:'free' },
      { id:10, name:'Briefly', desc:'Meeting summarizer & action item extractor.', icon:'fa-file-lines', category:'writing', price:'paid' },
      { id:11, name:'VidSynth', desc:'Generate short video clips from text prompts.', icon:'fa-video', category:'image', price:'premium' },
      { id:12, name:'DocMind', desc:'Intelligent document processing for PDFs and scans.', icon:'fa-file-pdf', category:'research', price:'freemium' },
      { id:13, name:'SpeechFlow', desc:'Realistic text-to-speech with voice cloning.', icon:'fa-waveform', category:'writing', price:'free' },
      { id:14, name:'AutoCoder', desc:'Full-stack code generator from natural language.', icon:'fa-laptop-code', category:'code', price:'freemium' },
      { id:15, name:'IdeaPlot', desc:'Mind mapping and brainstorming with AI assistance.', icon:'fa-diagram-project', category:'writing', price:'free' },
      { id:16, name:'ColorMind', desc:'AI color palette & design suggestion tool.', icon:'fa-palette', category:'image', price:'free' },
    ];

    // references
    const grid = document.getElementById('toolGrid');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const toolCountSpan = document.getElementById('toolCount');

    // filter chips
    const filterAll = document.getElementById('filterAll');
    const filterWriting = document.getElementById('filterWriting');
    const filterImage = document.getElementById('filterImage');
    const filterCode = document.getElementById('filterCode');
    const filterResearch = document.getElementById('filterResearch');
    const filterFree = document.getElementById('filterFree');

    const allChips = [filterAll, filterWriting, filterImage, filterCode, filterResearch, filterFree];

    // current state
    let activeFilter = 'all';     // 'all', 'writing', 'image', 'code', 'research', 'free'
    let searchQuery = '';

    // ----- helpers -----
    function removeActiveClass() {
      allChips.forEach(chip => chip.classList.remove('active'));
    }

    function setActiveChip(filterId) {
      removeActiveClass();
      const target = allChips.find(chip => chip.id === `filter${filterId.charAt(0).toUpperCase() + filterId.slice(1)}` || 
                                             (filterId === 'free' && chip.id === 'filterFree') ||
                                             (filterId === 'all' && chip.id === 'filterAll'));
      if (target) target.classList.add('active');
      else filterAll.classList.add('active'); // fallback
    }

    // filter + search logic
    function filterTools() {
      return tools.filter(tool => {
        // search match (name or description)
        const matchesSearch = searchQuery === '' || 
          tool.name.toLowerCase().includes(searchQuery) || 
          tool.desc.toLowerCase().includes(searchQuery);
        if (!matchesSearch) return false;

        // category / price filter
        if (activeFilter === 'all') return true;
        if (activeFilter === 'free') return tool.price === 'free';
        return tool.category === activeFilter;
      });
    }

    function renderGrid() {
      const filtered = filterTools();
      toolCountSpan.innerText = filtered.length;

      if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-results"><i class="fa-regular fa-face-frown"></i><br />No AI tools match your criteria. Try another filter!</div>`;
        return;
      }

      let htmlStr = '';
      filtered.forEach(t => {
        const priceClass = (t.price === 'free' || t.price === 'freemium') ? 'free' : '';
        const displayPrice = t.price === 'free' ? 'Free' : (t.price === 'freemium' ? 'Freemium' : (t.price === 'premium' ? 'Premium' : 'Paid'));
        // icon fallback
        const icon = t.icon || 'fa-robot';
        htmlStr += `
          <div class="tool-card" data-id="${t.id}">
            <div class="card-header">
              <div class="icon-bg"><i class="fas ${icon}"></i></div>
              <div class="tool-name">${t.name}</div>
            </div>
            <div class="tool-desc">${t.desc}</div>
            <div class="tool-tags">
              <span class="tag">${t.category}</span>
              ${t.price === 'free' ? '<span class="tag">free</span>' : (t.price === 'freemium' ? '<span class="tag">freemium</span>' : '')}
            </div>
            <div class="card-footer">
              <span class="price ${priceClass}"><i class="fa-regular fa-circle-check"></i> ${displayPrice}</span>
              <span class="visit-btn" onclick="window.open('https://example.com/${t.name.toLowerCase()}','_blank')"><i class="fa-regular fa-eye"></i> visit</span>
            </div>
          </div>
        `;
      });
      grid.innerHTML = htmlStr;
    }

    // event handlers for chips
    function setFilter(filter) {
      activeFilter = filter;
      setActiveChip(filter);
      renderGrid();
    }

    filterAll.addEventListener('click', () => setFilter('all'));
    filterWriting.addEventListener('click', () => setFilter('writing'));
    filterImage.addEventListener('click', () => setFilter('image'));
    filterCode.addEventListener('click', () => setFilter('code'));
    filterResearch.addEventListener('click', () => setFilter('research'));
    filterFree.addEventListener('click', () => setFilter('free'));

    // search handler (both button and input keyup)
    function handleSearch() {
      const query = searchInput.value.trim().toLowerCase();
      searchQuery = query;
      renderGrid();
    }

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      } else {
        // live search (optional – you can also debounce, but it's fine)
        searchQuery = searchInput.value.trim().toLowerCase();
        renderGrid();
      }
    });

    // initial render
    renderGrid();
    // ensure active chip is "all"
    setActiveChip('all');
  })();