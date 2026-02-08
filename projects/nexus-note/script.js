class NexusNotes {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('nexusNotes')) || [];
        this.currentNoteId = null;
        this.graphData = { nodes: [], links: [] };
        this.isGraphView = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadNotes();
        this.renderNotesList();
        this.updateStats();
        
        
        if (this.notes.length === 0) {
            this.createSampleData();
        }
    }
    
    setupEventListeners() {
        
        document.getElementById('newNoteBtn').addEventListener('click', () => {
            this.openNewNoteModal();
        });
        
        
        document.getElementById('toggleViewBtn').addEventListener('click', () => {
            this.toggleView();
        });
        
        
        document.getElementById('saveNoteBtn').addEventListener('click', () => {
            this.saveCurrentNote();
        });
        
        
        document.getElementById('deleteNoteBtn').addEventListener('click', () => {
            this.deleteCurrentNote();
        });
        
        
        document.getElementById('noteTitle').addEventListener('input', (e) => {
            if (this.currentNoteId) {
                const note = this.getNoteById(this.currentNoteId);
                if (note) {
                    note.title = e.target.value;
                    this.renderNotesList();
                }
            }
        });
        
        
        document.getElementById('noteContent').addEventListener('input', (e) => {
            if (this.currentNoteId) {
                const note = this.getNoteById(this.currentNoteId);
                if (note) {
                    note.content = e.target.value;
                    const noteItem = document.querySelector(`[data-note-id="${this.currentNoteId}"] .note-item-preview`);
                    if (noteItem) {
                        noteItem.textContent = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
                    }
                }
            }
        });
        
        
        document.getElementById('tagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.addTagToCurrentNote(e.target.value.trim());
                e.target.value = '';
            }
        });
        
        
        document.getElementById('noteSearch').addEventListener('input', (e) => {
            this.filterNotes(e.target.value);
        });
        
        
        document.getElementById('createNoteBtn').addEventListener('click', () => {
            this.createNewNote();
        });
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('newNoteModal').classList.add('hidden');
            });
        });
        
        
        document.getElementById('centerGraphBtn').addEventListener('click', () => {
            this.centerGraph();
        });
        
        document.getElementById('clearGraphBtn').addEventListener('click', () => {
            this.clearGraph();
        });
        
        
        document.getElementById('newNoteModal').addEventListener('click', (e) => {
            if (e.target.id === 'newNoteModal') {
                e.target.classList.add('hidden');
            }
        });
    }
    
    loadNotes() {
        
        const savedNotes = localStorage.getItem('nexusNotes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
        }
    }
    
    saveNotes() {
        localStorage.setItem('nexusNotes', JSON.stringify(this.notes));
        this.updateStats();
    }
    
    getNoteById(id) {
        return this.notes.find(note => note.id === id);
    }
    
    openNewNoteModal() {
        document.getElementById('modalNoteTitle').value = '';
        document.getElementById('modalNoteType').value = 'idea';
        
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector('.color-option').classList.add('active');
        
        document.getElementById('newNoteModal').classList.remove('hidden');
    }
    
    createNewNote() {
        const title = document.getElementById('modalNoteTitle').value.trim();
        const type = document.getElementById('modalNoteType').value;
        const color = document.querySelector('.color-option.active').getAttribute('data-color');
        
        if (!title) {
            alert('Please enter a note title');
            return;
        }
        
        const newNote = {
            id: Date.now().toString(),
            title,
            type,
            color,
            content: '',
            tags: [],
            connections: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.push(newNote);
        this.saveNotes();
        this.renderNotesList();
        this.openNote(newNote.id);
        
        
        document.getElementById('newNoteModal').classList.add('hidden');
    }
    
    openNote(noteId) {
        this.currentNoteId = noteId;
        const note = this.getNoteById(noteId);
        
        if (!note) return;
        
        
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
        
        
        this.renderTags(note.tags);
        
        
        this.renderConnections(note.connections);
        
        
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-note-id') === noteId) {
                item.classList.add('active');
            }
        });
        
        
        note.updatedAt = new Date().toISOString();
        this.saveNotes();
    }
    
    saveCurrentNote() {
        if (!this.currentNoteId) {
            alert('No note selected');
            return;
        }
        
        const note = this.getNoteById(this.currentNoteId);
        if (note) {
            note.title = document.getElementById('noteTitle').value;
            note.content = document.getElementById('noteContent').value;
            note.updatedAt = new Date().toISOString();
            
            this.saveNotes();
            this.renderNotesList();
            
            
            const saveBtn = document.getElementById('saveNoteBtn');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
            }, 1500);
        }
    }
    
    deleteCurrentNote() {
        if (!this.currentNoteId) {
            alert('No note selected');
            return;
        }
        
        if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            
            this.notes = this.notes.filter(note => note.id !== this.currentNoteId);
            
            
            this.notes.forEach(note => {
                note.connections = note.connections.filter(conn => conn.noteId !== this.currentNoteId);
            });
            
            this.saveNotes();
            this.renderNotesList();
            
            
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            document.getElementById('tagsContainer').innerHTML = '';
            document.getElementById('connectionsList').innerHTML = '<p class="empty-state">No connections yet. Link this note to others in Graph View.</p>';
            
            this.currentNoteId = null;
            
            
            if (this.isGraphView) {
                this.renderGraph();
            }
        }
    }
    
    addTagToCurrentNote(tagText) {
        if (!this.currentNoteId) {
            alert('Please select a note first');
            return;
        }
        
        const note = this.getNoteById(this.currentNoteId);
        if (note && !note.tags.includes(tagText)) {
            note.tags.push(tagText);
            this.saveNotes();
            this.renderTags(note.tags);
            
            
            const noteItem = document.querySelector(`[data-note-id="${this.currentNoteId}"] .note-item-tags`);
            if (noteItem) {
                this.renderNoteTags(noteItem, note.tags);
            }
        }
    }
    
    removeTagFromCurrentNote(tagText) {
        if (!this.currentNoteId) return;
        
        const note = this.getNoteById(this.currentNoteId);
        if (note) {
            note.tags = note.tags.filter(tag => tag !== tagText);
            this.saveNotes();
            this.renderTags(note.tags);
            
            
            const noteItem = document.querySelector(`[data-note-id="${this.currentNoteId}"] .note-item-tags`);
            if (noteItem) {
                this.renderNoteTags(noteItem, note.tags);
            }
        }
    }
    
    renderTags(tags) {
        const tagsContainer = document.getElementById('tagsContainer');
        tagsContainer.innerHTML = '';
        
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <span class="tag-remove" data-tag="${tag}">&times;</span>
            `;
            tagsContainer.appendChild(tagElement);
        });
        
        
        tagsContainer.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.getAttribute('data-tag');
                this.removeTagFromCurrentNote(tag);
            });
        });
    }
    
    renderNoteTags(container, tags) {
        container.innerHTML = '';
        tags.slice(0, 3).forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'note-tag';
            tagElement.textContent = tag;
            container.appendChild(tagElement);
        });
        
        if (tags.length > 3) {
            const moreTag = document.createElement('span');
            moreTag.className = 'note-tag';
            moreTag.textContent = `+${tags.length - 3}`;
            container.appendChild(moreTag);
        }
    }
    
    renderConnections(connections) {
        const connectionsList = document.getElementById('connectionsList');
        
        if (connections.length === 0) {
            connectionsList.innerHTML = '<p class="empty-state">No connections yet. Link this note to others in Graph View.</p>';
            return;
        }
        
        connectionsList.innerHTML = '';
        
        connections.forEach(conn => {
            const connectedNote = this.getNoteById(conn.noteId);
            if (!connectedNote) return;
            
            const connectionElement = document.createElement('div');
            connectionElement.className = 'connection-item';
            connectionElement.innerHTML = `
                <div class="connection-info">
                    <h5>${connectedNote.title}</h5>
                    <p>${conn.type}</p>
                </div>
                <div class="connection-remove" data-connection-id="${conn.noteId}">
                    <i class="fas fa-unlink"></i>
                </div>
            `;
            connectionsList.appendChild(connectionElement);
        });
        
        
        connectionsList.querySelectorAll('.connection-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteId = e.target.closest('.connection-remove').getAttribute('data-connection-id');
                this.removeConnection(this.currentNoteId, noteId);
            });
        });
    }
    
    removeConnection(fromNoteId, toNoteId) {
        const fromNote = this.getNoteById(fromNoteId);
        const toNote = this.getNoteById(toNoteId);
        
        if (fromNote && toNote) {
            fromNote.connections = fromNote.connections.filter(conn => conn.noteId !== toNoteId);
            toNote.connections = toNote.connections.filter(conn => conn.noteId !== fromNoteId);
            
            this.saveNotes();
            this.renderConnections(fromNote.connections);
            
            
            if (this.isGraphView) {
                this.renderGraph();
            }
        }
    }
    
    renderNotesList(filterText = '') {
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';
        
        const filteredNotes = filterText 
            ? this.notes.filter(note => 
                note.title.toLowerCase().includes(filterText.toLowerCase()) ||
                note.content.toLowerCase().includes(filterText.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(filterText.toLowerCase()))
              )
            : this.notes;
        
        
        filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = `note-item ${note.id === this.currentNoteId ? 'active' : ''}`;
            noteElement.setAttribute('data-note-id', note.id);
            noteElement.style.borderLeftColor = note.color;
            
            
            const typeIcons = {
                'idea': '💡',
                'task': '✓',
                'reference': '📚',
                'question': '❓'
            };
            
            noteElement.innerHTML = `
                <div class="note-item-header">
                    <div>
                        <div class="note-item-title">${typeIcons[note.type] || ''} ${note.title}</div>
                        <div class="note-item-type">${note.type}</div>
                    </div>
                    <div class="note-date">${new Date(note.updatedAt).toLocaleDateString()}</div>
                </div>
                <div class="note-item-preview">${note.content.substring(0, 100) || 'No content yet...'}</div>
                <div class="note-item-tags"></div>
            `;
            
            
            const tagsContainer = noteElement.querySelector('.note-item-tags');
            this.renderNoteTags(tagsContainer, note.tags);
            
            
            noteElement.addEventListener('click', () => {
                this.openNote(note.id);
            });
            
            notesList.appendChild(noteElement);
        });
    }
    
    filterNotes(searchText) {
        this.renderNotesList(searchText);
    }
    
    toggleView() {
        this.isGraphView = !this.isGraphView;
        
        const editorContainer = document.querySelector('.editor-container');
        const graphContainer = document.querySelector('.graph-container');
        const toggleBtn = document.getElementById('toggleViewBtn');
        
        if (this.isGraphView) {
            editorContainer.style.display = 'none';
            graphContainer.classList.remove('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-edit"></i> Editor View';
            this.renderGraph();
        } else {
            editorContainer.style.display = 'flex';
            graphContainer.classList.add('hidden');
            toggleBtn.innerHTML = '<i class="fas fa-sitemap"></i> Graph View';
        }
    }
    
    renderGraph() {
        const graphContainer = document.getElementById('graphVisualization');
        graphContainer.innerHTML = '';
        
        
        this.graphData.nodes = this.notes.map(note => ({
            id: note.id,
            title: note.title,
            type: note.type,
            color: note.color
        }));
        
        this.graphData.links = [];
        
        
        this.notes.forEach(note => {
            note.connections.forEach(conn => {
               
                const linkExists = this.graphData.links.some(link => 
                    (link.source === note.id && link.target === conn.noteId) ||
                    (link.source === conn.noteId && link.target === note.id)
                );
                
                if (!linkExists) {
                    this.graphData.links.push({
                        source: note.id,
                        target: conn.noteId,
                        type: conn.type
                    });
                }
            });
        });
        
        
        const width = graphContainer.clientWidth;
        const height = graphContainer.clientHeight;
        
        
        const svg = d3.select('#graphVisualization')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });
        
        svg.call(zoom);
        
        
        const g = svg.append('g');
        
        
        const simulation = d3.forceSimulation(this.graphData.nodes)
            .force('link', d3.forceLink(this.graphData.links).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(50));
        
        
        const link = g.append('g')
            .selectAll('line')
            .data(this.graphData.links)
            .enter()
            .append('line')
            .attr('class', 'graph-link')
            .attr('stroke-width', 2);
        
        
        const node = g.append('g')
            .selectAll('g')
            .data(this.graphData.nodes)
            .enter()
            .append('g')
            .attr('class', 'graph-node')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));
        
        
        node.append('circle')
            .attr('r', 30)
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 3);
        
        
        node.append('text')
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .attr('pointer-events', 'none')
            .text(d => d.title.length > 15 ? d.title.substring(0, 15) + '...' : d.title);
        
        
        const typeIcons = {
            'idea': '💡',
            'task': '✓',
            'reference': '📚',
            'question': '❓'
        };
        
        node.append('text')
            .attr('dy', '1.8em')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '20px')
            .attr('pointer-events', 'none')
            .text(d => typeIcons[d.type] || '');
        
        
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            
            node
                .attr('transform', d => `translate(${d.x}, ${d.y})`);
        });
        
        
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        
        
        node.on('click', (event, d) => {
            this.isGraphView = false;
            this.toggleView();
            this.openNote(d.id);
        });
        
        
        let linkSource = null;
        
        node.on('dblclick', (event, d) => {
            if (!linkSource) {
                linkSource = d;
                event.target.style.stroke = '#f59e0b';
                event.target.style.strokeWidth = '5px';
            } else {
                
                if (linkSource.id !== d.id) {
                    
                    const connectionExists = this.notes.find(n => n.id === linkSource.id)
                        ?.connections?.some(conn => conn.noteId === d.id);
                    
                    if (!connectionExists) {
                        
                        const sourceNote = this.getNoteById(linkSource.id);
                        const targetNote = this.getNoteById(d.id);
                        
                        if (sourceNote && targetNote) {
                            sourceNote.connections.push({
                                noteId: d.id,
                                type: 'related to'
                            });
                            
                            targetNote.connections.push({
                                noteId: linkSource.id,
                                type: 'related to'
                            });
                            
                            this.saveNotes();
                            
                            
                            if (this.currentNoteId === sourceNote.id || this.currentNoteId === targetNote.id) {
                                const currentNote = this.getNoteById(this.currentNoteId);
                                this.renderConnections(currentNote.connections);
                            }
                            
                            
                            this.renderGraph();
                        }
                    }
                }
                
                
                d3.select(event.target).style('stroke', '#fff').style('stroke-width', '3px');
                linkSource = null;
            }
        });
    }
    
    centerGraph() {
        alert('Graph centered (functionality would be implemented with D3 zoom)');
    }
    
    clearGraph() {
        if (confirm('Clear all connections from all notes? This cannot be undone.')) {
            this.notes.forEach(note => {
                note.connections = [];
            });
            
            this.saveNotes();
            
            if (this.currentNoteId) {
                const note = this.getNoteById(this.currentNoteId);
                this.renderConnections(note.connections);
            }
            
            this.renderGraph();
        }
    }
    
    updateStats() {
        document.getElementById('totalNotes').textContent = `${this.notes.length} notes`;
        
        
        let totalConnections = 0;
        this.notes.forEach(note => {
            totalConnections += note.connections.length;
        });
        
        document.getElementById('totalConnections').textContent = `${totalConnections} connections`;
    }
    
    createSampleData() {
        const sampleNotes = [
            {
                id: '1',
                title: 'Project Idea: Nexus Notes',
                type: 'idea',
                color: '#4f46e5',
                content: 'A visual note-taking app that shows connections between ideas. Users can create nodes for notes and connect them to visualize relationships.',
                tags: ['project', 'app', 'visualization'],
                connections: [{ noteId: '2', type: 'inspires' }],
                createdAt: '2023-10-01T10:00:00Z',
                updatedAt: '2023-10-05T14:30:00Z'
            },
            {
                id: '2',
                title: 'Mind Mapping Research',
                type: 'reference',
                color: '#10b981',
                content: 'Research shows that visual connections between concepts improve memory retention and creative thinking by up to 40%.',
                tags: ['research', 'learning', 'memory'],
                connections: [
                    { noteId: '1', type: 'supports' },
                    { noteId: '3', type: 'related to' }
                ],
                createdAt: '2023-10-02T11:00:00Z',
                updatedAt: '2023-10-04T16:20:00Z'
            },
            {
                id: '3',
                title: 'Implement D3.js for graphs',
                type: 'task',
                color: '#f59e0b',
                content: 'Use D3.js library to create interactive force-directed graphs for visualizing note connections.',
                tags: ['implementation', 'd3', 'graph'],
                connections: [
                    { noteId: '2', type: 'builds on' },
                    { noteId: '4', type: 'prerequisite for' }
                ],
                createdAt: '2023-10-03T09:15:00Z',
                updatedAt: '2023-10-05T11:45:00Z'
            },
            {
                id: '4',
                title: 'How to save notes locally?',
                type: 'question',
                color: '#ef4444',
                content: 'Should we use localStorage or IndexedDB for saving notes in the browser? IndexedDB has more storage but localStorage is simpler.',
                tags: ['technical', 'storage', 'browser'],
                connections: [{ noteId: '3', type: 'questions' }],
                createdAt: '2023-10-04T14:00:00Z',
                updatedAt: '2023-10-05T10:30:00Z'
            },
            {
                id: '5',
                title: 'Color Coding System',
                type: 'idea',
                color: '#8b5cf6',
                content: 'Different note types should have different colors: Ideas (blue), Tasks (yellow), References (green), Questions (red).',
                tags: ['design', 'ux', 'colors'],
                connections: [],
                createdAt: '2023-10-05T08:45:00Z',
                updatedAt: '2023-10-05T08:45:00Z'
            }
        ];
        
        this.notes = sampleNotes;
        this.saveNotes();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.nexusNotes = new NexusNotes();
    
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    
    setTimeout(() => {
        if (window.nexusNotes.notes.length > 0 && !window.nexusNotes.currentNoteId) {
            window.nexusNotes.openNote(window.nexusNotes.notes[0].id);
        }
    }, 100);
});