const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.game-container');
    
    const dpr = window.devicePixelRatio || 1;
    let width, height;
    
    function resize() {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    }
    
    resize();
    window.addEventListener('resize', resize);

    const colors = {
      background: '#F5F3EF',
      node: '#3D3A36',
      nodeHover: '#5B8C6A',
      nodeDrag: '#5B8C6A',
      nodeHint: '#D4A574',
      ghost: 'rgba(212, 165, 116, 0.4)',
      ghostStroke: 'rgba(212, 165, 116, 0.8)',
      lineCrossing: '#C9665A',
      lineClear: '#8BA895',
      lineSolved: '#5B8C6A',
      shadow: 'rgba(61, 58, 54, 0.15)'
    };

    const levelConfigs = [
      { nodes: 4, diagonals: 0 },
      { nodes: 5, diagonals: 0 },
      { nodes: 5, diagonals: 1 },
      { nodes: 6, diagonals: 1 },
      { nodes: 6, diagonals: 2 },
      { nodes: 7, diagonals: 2 },
      { nodes: 8, diagonals: 2 },
      { nodes: 8, diagonals: 2 },
      { nodes: 9, diagonals: 1 },
      { nodes: 10, diagonals: 2 },
    ];

    let nodes = [];
    let edges = [];
    let draggedNode = null;
    let hoveredNode = null;
    let hintedNode = null;
    let ghostPosition = null;
    let level = 1;
    const maxLevels = 10;
    let solved = false;
    let celebrating = false;
    let crossingCount = 0;
    let gameStarted = false;
    let hintPulse = 0;
    let solvedTransition = 0;

    class Node {
      constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.radius = 14;
        this.scale = 1;
        this.shadowOffset = 3;
        this.hintGlow = 0;
      }

      draw() {
        const isHovered = hoveredNode === this;
        const isDragged = draggedNode === this;
        const isHinted = hintedNode === this;
        

        if (isHinted && this.hintGlow > 0) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * this.scale + 8 + Math.sin(hintPulse) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(212, 165, 116, ${this.hintGlow * 0.6})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        

        ctx.beginPath();
        ctx.arc(
          this.x + (isDragged ? 6 : this.shadowOffset), 
          this.y + (isDragged ? 8 : this.shadowOffset), 
          this.radius * this.scale, 
          0, 
          Math.PI * 2
        );
        ctx.fillStyle = isDragged ? 'rgba(61, 58, 54, 0.2)' : colors.shadow;
        ctx.fill();


        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.scale, 0, Math.PI * 2);
        
        if (solvedTransition > 0) {
          ctx.fillStyle = colors.lineSolved;
        } else if (isDragged) {
          ctx.fillStyle = colors.nodeDrag;
        } else if (isHinted && this.hintGlow > 0) {
          ctx.fillStyle = colors.nodeHint;
        } else if (isHovered) {
          ctx.fillStyle = colors.nodeHover;
        } else {
          ctx.fillStyle = colors.node;
        }
        ctx.fill();
      }

      contains(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        return dx * dx + dy * dy <= (this.radius + 12) * (this.radius + 12);
      }
    }

    function segmentsIntersect(p1, p2, p3, p4) {
      const ccw = (A, B, C) => {
        return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
      };
      
      if ((p1.id === p3.id || p1.id === p4.id || p2.id === p3.id || p2.id === p4.id)) {
        return false;
      }
      
      return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
    }

    function countIntersections() {
      let count = 0;
      for (let i = 0; i < edges.length; i++) {
        for (let j = i + 1; j < edges.length; j++) {
          const e1 = edges[i];
          const e2 = edges[j];
          if (segmentsIntersect(e1.a, e1.b, e2.a, e2.b)) {
            count++;
          }
        }
      }
      return count;
    }

    function countNodeCrossings(node) {
      let count = 0;
      const nodeEdges = edges.filter(e => e.a === node || e.b === node);
      
      for (const edge of nodeEdges) {
        for (const other of edges) {
          if (edge === other) continue;
          if (segmentsIntersect(edge.a, edge.b, other.a, other.b)) {
            count++;
          }
        }
      }
      return count;
    }

    function countCrossingsIfNodeAt(node, x, y) {
      const originalX = node.x;
      const originalY = node.y;
      node.x = x;
      node.y = y;
      const count = countNodeCrossings(node);
      node.x = originalX;
      node.y = originalY;
      return count;
    }

    function findWorstNode() {
      let worstNode = null;
      let maxCrossings = 0;
      
      for (const node of nodes) {
        const crossings = countNodeCrossings(node);
        if (crossings > maxCrossings) {
          maxCrossings = crossings;
          worstNode = node;
        }
      }
      return worstNode;
    }

    function findBetterPosition(node) {
      const currentCrossings = countNodeCrossings(node);
      if (currentCrossings === 0) return null;
      
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 100;
      
      let bestPos = null;
      let bestCrossings = currentCrossings;
      

      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
        for (let r = radius * 0.3; r <= radius * 0.95; r += radius * 0.1) {
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          
          const crossings = countCrossingsIfNodeAt(node, x, y);
          if (crossings < bestCrossings) {
            bestCrossings = crossings;
            bestPos = { x, y };
          }
        }
      }
      
      return bestPos;
    }

    function edgeCrosses(edge) {
      for (const other of edges) {
        if (edge === other) continue;
        if (segmentsIntersect(edge.a, edge.b, other.a, other.b)) {
          return true;
        }
      }
      return false;
    }

    function showHint() {
      if (solved || celebrating || !gameStarted) return;
      
      if (hintedNode) {
        gsap.to(hintedNode, { hintGlow: 0, duration: 0.3 });
      }
      ghostPosition = null;
      
      const worstNode = findWorstNode();
      if (!worstNode) return;
      
      const betterPos = findBetterPosition(worstNode);

      if (!betterPos) return;
      
      hintedNode = worstNode;
      ghostPosition = { 
        x: betterPos.x, 
        y: betterPos.y, 
        opacity: 0,
        nodeId: worstNode.id 
      };
      

      gsap.to(ghostPosition, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      const hintText = document.getElementById('hint-text');
      hintText.textContent = 'Drag to the ghost';
      hintText.classList.add('visible');
      
      gsap.to(worstNode, { 
        hintGlow: 1, 
        duration: 0.5,
        ease: 'power2.out'
      });
      

      gsap.to(worstNode, { 
        hintGlow: 0, 
        duration: 0.5,
        delay: 4,
        ease: 'power2.in',
        onComplete: () => {
          hintedNode = null;
          hintText.classList.remove('visible');
        }
      });
      
      gsap.to(ghostPosition, {
        opacity: 0,
        duration: 0.5,
        delay: 4,
        ease: 'power2.in',
        onComplete: () => {
          ghostPosition = null;
        }
      });
    }

    function generateLevel(levelNum) {
      nodes = [];
      edges = [];
      solved = false;
      celebrating = false;
      solvedTransition = 0;
      hintedNode = null;
      ghostPosition = null;
      
      const config = levelConfigs[levelNum - 1];
      const nodeCount = config.nodes;
      const diagonalCount = config.diagonals;
      
      const padding = 100;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - padding;

      for (let i = 0; i < nodeCount; i++) {
        const scrambleRadius = radius * 0.7;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * scrambleRadius * 0.5 + scrambleRadius * 0.25;
        const x = centerX + Math.cos(angle) * dist;
        const y = centerY + Math.sin(angle) * dist;
        nodes.push(new Node(x, y, i));
      }

      for (let i = 0; i < nodeCount; i++) {
        edges.push({ a: nodes[i], b: nodes[(i + 1) % nodeCount] });
      }

      for (let i = 0; i < diagonalCount; i++) {
        const a = i;
        const b = (i + Math.floor(nodeCount / 2)) % nodeCount;
        edges.push({ a: nodes[a], b: nodes[b] });
      }

      const minCrossings = levelNum <= 2 ? 1 : 2;
      let attempts = 0;
      while (countIntersections() < minCrossings && attempts < 100) {
        for (const node of nodes) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * radius * 0.5 + radius * 0.2;
          node.x = centerX + Math.cos(angle) * dist;
          node.y = centerY + Math.sin(angle) * dist;
        }
        attempts++;
      }

      updateCrossingCount();
    }

    function resetLevel() {
      if (!gameStarted || solved || celebrating) return;
      
      document.getElementById('hint-text').classList.remove('visible');
      hintedNode = null;
      ghostPosition = null;
      
      gsap.to(nodes, {
        scale: 0,
        duration: 0.2,
        stagger: 0.01,
        ease: 'power2.in',
        onComplete: () => {
          generateLevel(level);
          nodes.forEach(node => node.scale = 0);
          gsap.to(nodes, {
            scale: 1,
            duration: 0.3,
            stagger: 0.02,
            ease: 'back.out(1.5)'
          });
        }
      });
    }

    function updateCrossingCount() {
      crossingCount = countIntersections();
      const el = document.getElementById('crossings');
      el.textContent = crossingCount;
      
      if (crossingCount === 0 && !solved && !celebrating && gameStarted) {
        el.classList.add('solved');
        onSolved();
      } else {
        el.classList.remove('solved');
      }
    }

    function onSolved() {
      solved = true;
      celebrating = true;
      

      document.getElementById('hint-text').classList.remove('visible');
      if (hintedNode) {
        gsap.to(hintedNode, { hintGlow: 0, duration: 0.2 });
        hintedNode = null;
      }
      ghostPosition = null;
      

      gsap.to({ val: 0 }, {
        val: 1,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: function() {
          solvedTransition = this.targets()[0].val;
        }
      });


      setTimeout(() => {
        const message = document.getElementById('message');
        const overlay = document.getElementById('message-overlay');
        
        overlay.classList.add('visible');
        gsap.to(message, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
        message.classList.add('visible');
        celebrating = false;
      }, 1500);

      updateProgress();
    }

    function updateProgress() {
      const progress = document.getElementById('progress');
      progress.innerHTML = '';
      
      for (let i = 1; i <= maxLevels; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (i < level) dot.classList.add('completed');
        if (i === level) dot.classList.add('current');
        if (i === level && solved) dot.classList.add('completed');
        progress.appendChild(dot);
      }
    }

    function nextLevel() {
      const message = document.getElementById('message');
      const overlay = document.getElementById('message-overlay');
      
      message.classList.remove('visible');
      overlay.classList.remove('visible');
      gsap.to(message, { opacity: 0, duration: 0.3 });

      level++;
      if (level > maxLevels) {
        level = 1;
      }
      
      document.getElementById('level-num').textContent = level;
      
      gsap.to(nodes, {
        scale: 0,
        duration: 0.3,
        stagger: 0.02,
        ease: 'power2.in',
        onComplete: () => {
          generateLevel(level);
          updateProgress();
          
          nodes.forEach(node => node.scale = 0);
          gsap.to(nodes, {
            scale: 1,
            duration: 0.4,
            stagger: 0.03,
            ease: 'back.out(1.5)'
          });
        }
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, width, height);

      if (!gameStarted) {
        requestAnimationFrame(draw);
        return;
      }

      hintPulse += 0.08;


      if (ghostPosition && ghostPosition.opacity > 0) {

        ctx.beginPath();
        ctx.arc(ghostPosition.x, ghostPosition.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 165, 116, ${ghostPosition.opacity * 0.3})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(212, 165, 116, ${ghostPosition.opacity * 0.8})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        

        const pulseRadius = 14 + 8 + Math.sin(hintPulse * 2) * 4;
        ctx.beginPath();
        ctx.arc(ghostPosition.x, ghostPosition.y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 165, 116, ${ghostPosition.opacity * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.lineCap = 'round';
      ctx.lineWidth = 2.5;
      

      for (const edge of edges) {
        const crosses = edgeCrosses(edge);
        
        ctx.beginPath();
        ctx.moveTo(edge.a.x, edge.a.y);
        ctx.lineTo(edge.b.x, edge.b.y);
        
        if (solvedTransition > 0) {

          ctx.strokeStyle = colors.lineSolved;
        } else if (crosses) {
          ctx.strokeStyle = colors.lineCrossing;
        } else {
          ctx.strokeStyle = colors.lineClear;
        }
        
        ctx.stroke();
      }

      const sortedNodes = [...nodes].sort((a, b) => {
        if (a === draggedNode) return 1;
        if (b === draggedNode) return -1;
        return 0;
      });

      for (const node of sortedNodes) {
        node.draw();
      }

      requestAnimationFrame(draw);
    }

    function getMousePos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function onPointerDown(e) {
      if (!gameStarted || solved || celebrating) return;
      
      const pos = getMousePos(e);
      
      for (const node of nodes) {
        if (node.contains(pos.x, pos.y)) {
          draggedNode = node;
          
          if (node === hintedNode) {
            gsap.to(node, { hintGlow: 0, duration: 0.2 });
            hintedNode = null;
            document.getElementById('hint-text').classList.remove('visible');
          }
          
          gsap.to(node, { scale: 1.15, duration: 0.2, ease: 'back.out(2)' });
          canvas.style.cursor = 'grabbing';
          break;
        }
      }
    }

    function onPointerMove(e) {
      if (!gameStarted) return;
      
      const pos = getMousePos(e);
      
      if (draggedNode) {
        draggedNode.x = pos.x;
        draggedNode.y = pos.y;
        updateCrossingCount();
        

        if (ghostPosition && ghostPosition.nodeId === draggedNode.id) {
          const dx = pos.x - ghostPosition.x;
          const dy = pos.y - ghostPosition.y;
          if (dx * dx + dy * dy < 400) {
            gsap.to(ghostPosition, { opacity: 0, duration: 0.2 });
          }
        }
      } else if (!solved && !celebrating) {
        let found = null;
        for (const node of nodes) {
          if (node.contains(pos.x, pos.y)) {
            found = node;
            break;
          }
        }
        
        if (found !== hoveredNode) {
          if (hoveredNode && hoveredNode !== hintedNode) {
            gsap.to(hoveredNode, { scale: 1, duration: 0.2 });
          }
          hoveredNode = found;
          if (hoveredNode) {
            gsap.to(hoveredNode, { scale: 1.1, duration: 0.2 });
            canvas.style.cursor = 'grab';
          } else {
            canvas.style.cursor = 'default';
          }
        }
      }
    }

    function onPointerUp() {
      if (draggedNode) {
        gsap.to(draggedNode, { scale: 1, duration: 0.3, ease: 'back.out(1.5)' });
        draggedNode = null;
        canvas.style.cursor = hoveredNode ? 'grab' : 'default';
      }
    }

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mouseleave', onPointerUp);

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onPointerDown(e);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      onPointerMove(e);
    }, { passive: false });
    
    canvas.addEventListener('touchend', onPointerUp);

    document.getElementById('next-btn').addEventListener('click', nextLevel);
    document.getElementById('reset-btn').addEventListener('click', resetLevel);
    document.getElementById('hint-btn').addEventListener('click', showHint);
    
    document.getElementById('start-btn').addEventListener('click', () => {
      const intro = document.getElementById('intro');
      intro.classList.add('hidden');
      
      gameStarted = true;
      document.getElementById('controls').style.display = 'flex';
      
      generateLevel(level);
      updateProgress();
      
      nodes.forEach(node => node.scale = 0);
      gsap.to(nodes, {
        scale: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out(1.5)'
      });
    });

    draw();

