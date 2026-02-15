// ==================== UTILITY CLASSES ====================

class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  subtract(v) {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  multiply(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  distance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const len = this.length();
    if (len === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / len, this.y / len);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  midpoint(v) {
    return new Vector2D((this.x + v.x) / 2, (this.y + v.y) / 2);
  }

  clone() {
    return new Vector2D(this.x, this.y);
  }
}

// ==================== COMMAND PATTERN ====================

class Command {
  execute() {}
  undo() {}
}

class AddShapeCommand extends Command {
  constructor(shapeManager, shape) {
    super();
    this.shapeManager = shapeManager;
    this.shape = shape;
  }

  execute() {
    this.shapeManager.addShape(this.shape);
  }

  undo() {
    this.shapeManager.removeShape(this.shape);
  }
}

class RemoveShapeCommand extends Command {
  constructor(shapeManager, shape) {
    super();
    this.shapeManager = shapeManager;
    this.shape = shape;
  }

  execute() {
    this.shapeManager.removeShape(this.shape);
  }

  undo() {
    this.shapeManager.addShape(this.shape);
  }
}

class ModifyShapeCommand extends Command {
  constructor(shape, property, oldValue, newValue) {
    super();
    this.shape = shape;
    this.property = property;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }

  execute() {
    this.shape.setProperty(this.property, this.newValue);
  }

  undo() {
    this.shape.setProperty(this.property, this.oldValue);
  }
}

class TransformShapeCommand extends Command {
  constructor(shape, oldTransform, newTransform) {
    super();
    this.shape = shape;
    this.oldTransform = { ...oldTransform };
    this.newTransform = { ...newTransform };
  }

  execute() {
    Object.assign(this.shape, this.newTransform);
    this.shape.updateElement();
  }

  undo() {
    Object.assign(this.shape, this.oldTransform);
    this.shape.updateElement();
  }
}

class CommandHistory {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  execute(command) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop();
      command.undo();
      this.redoStack.push(command);
      return true;
    }
    return false;
  }

  redo() {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop();
      command.execute();
      this.undoStack.push(command);
      return true;
    }
    return false;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}

// ==================== OBSERVER PATTERN ====================

class Observable {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

// ==================== SHAPE CLASSES ====================

let shapeIdCounter = 0;

class Shape extends Observable {
  constructor(type) {
    super();
    this.id = `shape_${shapeIdCounter++}`;
    this.type = type;
    this.fill = "#00ff88";
    this.stroke = "#000000";
    this.strokeWidth = 2;
    this.opacity = 1;
    this.visible = true;
    this.element = null;
  }

  setProperty(property, value) {
    this[property] = value;
    this.updateElement();
    this.notify({ type: "propertyChanged", property, value });
  }

  createElement() {
    // Override in subclasses
  }

  updateElement() {
    // Override in subclasses
  }

  getBounds() {
    // Override in subclasses
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  containsPoint(x, y) {
    const bounds = this.getBounds();
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      opacity: this.opacity,
      visible: this.visible,
    };
  }

  static deserialize(data) {
    // Override in factory
  }
}

class RectShape extends Shape {
  constructor(x, y, width, height) {
    super("rect");
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  createElement() {
    this.element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    this.element.setAttribute("data-shape-id", this.id);
    this.updateElement();
    return this.element;
  }

  updateElement() {
    if (!this.element) return;
    this.element.setAttribute("x", this.x);
    this.element.setAttribute("y", this.y);
    this.element.setAttribute("width", Math.abs(this.width));
    this.element.setAttribute("height", Math.abs(this.height));
    this.element.setAttribute("fill", this.fill);
    this.element.setAttribute("stroke", this.stroke);
    this.element.setAttribute("stroke-width", this.strokeWidth);
    this.element.setAttribute("opacity", this.opacity);
    this.element.style.display = this.visible ? "block" : "none";
  }

  getBounds() {
    return {
      x: Math.min(this.x, this.x + this.width),
      y: Math.min(this.y, this.y + this.height),
      width: Math.abs(this.width),
      height: Math.abs(this.height),
    };
  }

  serialize() {
    return {
      ...super.serialize(),
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

class CircleShape extends Shape {
  constructor(cx, cy, radius) {
    super("circle");
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
  }

  createElement() {
    this.element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    this.element.setAttribute("data-shape-id", this.id);
    this.updateElement();
    return this.element;
  }

  updateElement() {
    if (!this.element) return;
    this.element.setAttribute("cx", this.cx);
    this.element.setAttribute("cy", this.cy);
    this.element.setAttribute("r", Math.abs(this.radius));
    this.element.setAttribute("fill", this.fill);
    this.element.setAttribute("stroke", this.stroke);
    this.element.setAttribute("stroke-width", this.strokeWidth);
    this.element.setAttribute("opacity", this.opacity);
    this.element.style.display = this.visible ? "block" : "none";
  }

  getBounds() {
    return {
      x: this.cx - this.radius,
      y: this.cy - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  containsPoint(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  serialize() {
    return {
      ...super.serialize(),
      cx: this.cx,
      cy: this.cy,
      radius: this.radius,
    };
  }
}

class LineShape extends Shape {
  constructor(x1, y1, x2, y2) {
    super("line");
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.fill = "none";
  }

  createElement() {
    this.element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    this.element.setAttribute("data-shape-id", this.id);
    this.updateElement();
    return this.element;
  }

  updateElement() {
    if (!this.element) return;
    this.element.setAttribute("x1", this.x1);
    this.element.setAttribute("y1", this.y1);
    this.element.setAttribute("x2", this.x2);
    this.element.setAttribute("y2", this.y2);
    this.element.setAttribute("stroke", this.stroke);
    this.element.setAttribute("stroke-width", this.strokeWidth);
    this.element.setAttribute("opacity", this.opacity);
    this.element.style.display = this.visible ? "block" : "none";
  }

  getBounds() {
    return {
      x: Math.min(this.x1, this.x2),
      y: Math.min(this.y1, this.y2),
      width: Math.abs(this.x2 - this.x1),
      height: Math.abs(this.y2 - this.y1),
    };
  }

  serialize() {
    return {
      ...super.serialize(),
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
    };
  }
}

class PathShape extends Shape {
  constructor(points = []) {
    super("path");
    this.points = points; // Array of {x, y, cp1x, cp1y, cp2x, cp2y, type: 'M'|'L'|'C'}
    this.closed = false;
  }

  addPoint(point) {
    this.points.push(point);
    this.updateElement();
  }

  createElement() {
    this.element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    this.element.setAttribute("data-shape-id", this.id);
    this.updateElement();
    return this.element;
  }

  updateElement() {
    if (!this.element) return;
    const d = this.generatePathData();
    this.element.setAttribute("d", d);
    this.element.setAttribute("fill", this.closed ? this.fill : "none");
    this.element.setAttribute("stroke", this.stroke);
    this.element.setAttribute("stroke-width", this.strokeWidth);
    this.element.setAttribute("opacity", this.opacity);
    this.element.style.display = this.visible ? "block" : "none";
  }

  generatePathData() {
    if (this.points.length === 0) return "";

    let d = "";
    this.points.forEach((point, index) => {
      if (point.type === "M" || index === 0) {
        d += `M ${point.x} ${point.y} `;
      } else if (point.type === "L") {
        d += `L ${point.x} ${point.y} `;
      } else if (point.type === "C") {
        d += `C ${point.cp1x} ${point.cp1y}, ${point.cp2x} ${point.cp2y}, ${point.x} ${point.y} `;
      }
    });

    if (this.closed) {
      d += "Z";
    }

    return d.trim();
  }

  getBounds() {
    if (this.points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    this.points.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  serialize() {
    return {
      ...super.serialize(),
      points: this.points,
      closed: this.closed,
    };
  }
}

// ==================== SHAPE MANAGER ====================

class ShapeManager extends Observable {
  constructor(container) {
    super();
    this.container = container;
    this.shapes = [];
    this.selectedShapes = [];
  }

  addShape(shape) {
    this.shapes.push(shape);
    const element = shape.createElement();
    this.container.appendChild(element);
    this.notify({ type: "shapeAdded", shape });
  }

  removeShape(shape) {
    const index = this.shapes.indexOf(shape);
    if (index > -1) {
      this.shapes.splice(index, 1);
      if (shape.element && shape.element.parentNode) {
        shape.element.parentNode.removeChild(shape.element);
      }
      this.deselectShape(shape);
      this.notify({ type: "shapeRemoved", shape });
    }
  }

  getShapeById(id) {
    return this.shapes.find((s) => s.id === id);
  }

  getShapeByElement(element) {
    const id = element.getAttribute("data-shape-id");
    return this.getShapeById(id);
  }

  selectShape(shape, addToSelection = false) {
    if (!addToSelection) {
      this.selectedShapes = [];
    }
    if (!this.selectedShapes.includes(shape)) {
      this.selectedShapes.push(shape);
    }
    this.notify({ type: "selectionChanged", shapes: this.selectedShapes });
  }

  deselectShape(shape) {
    const index = this.selectedShapes.indexOf(shape);
    if (index > -1) {
      this.selectedShapes.splice(index, 1);
      this.notify({ type: "selectionChanged", shapes: this.selectedShapes });
    }
  }

  deselectAll() {
    this.selectedShapes = [];
    this.notify({ type: "selectionChanged", shapes: [] });
  }

  getShapesInRect(x, y, width, height) {
    return this.shapes.filter((shape) => {
      const bounds = shape.getBounds();
      return (
        bounds.x >= x &&
        bounds.y >= y &&
        bounds.x + bounds.width <= x + width &&
        bounds.y + bounds.height <= y + height
      );
    });
  }

  bringToFront(shape) {
    const index = this.shapes.indexOf(shape);
    if (index > -1) {
      this.shapes.splice(index, 1);
      this.shapes.push(shape);
      this.container.appendChild(shape.element);
      this.notify({ type: "layerOrderChanged" });
    }
  }

  sendToBack(shape) {
    const index = this.shapes.indexOf(shape);
    if (index > -1) {
      this.shapes.splice(index, 1);
      this.shapes.unshift(shape);
      this.container.insertBefore(shape.element, this.container.firstChild);
      this.notify({ type: "layerOrderChanged" });
    }
  }

  clear() {
    this.shapes.forEach((shape) => {
      if (shape.element && shape.element.parentNode) {
        shape.element.parentNode.removeChild(shape.element);
      }
    });
    this.shapes = [];
    this.selectedShapes = [];
    this.notify({ type: "cleared" });
  }

  serialize() {
    return this.shapes.map((shape) => shape.serialize());
  }

  deserialize(data) {
    this.clear();
    data.forEach((shapeData) => {
      let shape;
      switch (shapeData.type) {
        case "rect":
          shape = new RectShape(
            shapeData.x,
            shapeData.y,
            shapeData.width,
            shapeData.height
          );
          break;
        case "circle":
          shape = new CircleShape(shapeData.cx, shapeData.cy, shapeData.radius);
          break;
        case "line":
          shape = new LineShape(
            shapeData.x1,
            shapeData.y1,
            shapeData.x2,
            shapeData.y2
          );
          break;
        case "path":
          shape = new PathShape(shapeData.points);
          shape.closed = shapeData.closed;
          break;
      }
      if (shape) {
        shape.fill = shapeData.fill;
        shape.stroke = shapeData.stroke;
        shape.strokeWidth = shapeData.strokeWidth;
        shape.opacity = shapeData.opacity;
        shape.visible = shapeData.visible;
        this.addShape(shape);
      }
    });
  }
}

// ==================== VIEWPORT CONTROLLER ====================

class ViewportController {
  constructor(svg, viewport) {
    this.svg = svg;
    this.viewport = viewport;
    this.pan = new Vector2D(0, 0);
    this.zoom = 1.0;
    this.minZoom = 0.1;
    this.maxZoom = 10;
    this.isPanning = false;
    this.lastPanPoint = null;

    // Touch support
    this.touches = {};
    this.lastTouchDistance = null;

    this.setupEventListeners();
    this.updateTransform();
  }

  setupEventListeners() {
    // Mouse events
    this.svg.addEventListener("wheel", (e) => this.handleWheel(e));
    this.svg.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.svg.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.svg.addEventListener("mouseup", (e) => this.handleMouseUp(e));

    // Touch events
    this.svg.addEventListener("touchstart", (e) => this.handleTouchStart(e), {
      passive: false,
    });
    this.svg.addEventListener("touchmove", (e) => this.handleTouchMove(e), {
      passive: false,
    });
    this.svg.addEventListener("touchend", (e) => this.handleTouchEnd(e), {
      passive: false,
    });
    this.svg.addEventListener("touchcancel", (e) => this.handleTouchEnd(e), {
      passive: false,
    });
  }

  handleTouchStart(e) {
    // Store all touches
    Array.from(e.touches).forEach((touch) => {
      this.touches[touch.identifier] = {
        x: touch.clientX,
        y: touch.clientY,
      };
    });

    if (e.touches.length === 2) {
      // Two-finger pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      this.lastTouchDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    } else if (e.touches.length === 1) {
      // Single finger pan (only if shift key or two-finger later)
      const touch = e.touches[0];
      this.lastPanPoint = new Vector2D(touch.clientX, touch.clientY);
    }
  }

  handleTouchMove(e) {
    if (e.touches.length === 2) {
      // Pinch zoom and pan
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      const currentCenter = new Vector2D(centerX, centerY);

      if (this.lastTouchDistance && this.lastPanPoint) {
        // Handle zoom
        const delta = currentDistance / this.lastTouchDistance;
        const newZoom = Math.max(
          this.minZoom,
          Math.min(this.maxZoom, this.zoom * delta)
        );

        const rect = this.svg.getBoundingClientRect();
        const mouseX = centerX - rect.left;
        const mouseY = centerY - rect.top;

        const worldBeforeZoom = this.screenToWorld(
          new Vector2D(mouseX, mouseY)
        );
        this.zoom = newZoom;
        const worldAfterZoom = this.screenToWorld(new Vector2D(mouseX, mouseY));

        this.pan.x += (worldAfterZoom.x - worldBeforeZoom.x) * this.zoom;
        this.pan.y += (worldAfterZoom.y - worldBeforeZoom.y) * this.zoom;

        // Handle pan
        const panDelta = currentCenter.subtract(this.lastPanPoint);
        this.pan = this.pan.add(panDelta);

        this.updateTransform();
        this.updateZoomDisplay();
      }

      this.lastTouchDistance = currentDistance;
      this.lastPanPoint = currentCenter;
      this.isPanning = false;
    } else if (
      e.touches.length === 1 &&
      this.lastPanPoint &&
      !this.viewportController.isPanning
    ) {
      // Single touch - only update position for coordinate display
      const touch = e.touches[0];
      this.lastPanPoint = new Vector2D(touch.clientX, touch.clientY);
    }
  }

  handleTouchEnd(e) {
    // Remove ended touches
    Array.from(e.changedTouches).forEach((touch) => {
      delete this.touches[touch.identifier];
    });

    if (e.touches.length < 2) {
      this.lastTouchDistance = null;
    }

    if (e.touches.length === 0) {
      this.isPanning = false;
      this.lastPanPoint = null;
    }
  }

  handleWheel(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.zoom * delta)
      );

      // Zoom towards mouse position
      const rect = this.svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldBeforeZoom = this.screenToWorld(new Vector2D(mouseX, mouseY));
      this.zoom = newZoom;
      const worldAfterZoom = this.screenToWorld(new Vector2D(mouseX, mouseY));

      this.pan.x += (worldAfterZoom.x - worldBeforeZoom.x) * this.zoom;
      this.pan.y += (worldAfterZoom.y - worldBeforeZoom.y) * this.zoom;

      this.updateTransform();
      this.updateZoomDisplay();
    }
  }

  handleMouseDown(e) {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse or Shift+Click
      e.preventDefault();
      this.isPanning = true;
      this.lastPanPoint = new Vector2D(e.clientX, e.clientY);
      this.svg.style.cursor = "grabbing";
    }
  }

  handleMouseMove(e) {
    if (this.isPanning && this.lastPanPoint) {
      const current = new Vector2D(e.clientX, e.clientY);
      const delta = current.subtract(this.lastPanPoint);
      this.pan = this.pan.add(delta);
      this.lastPanPoint = current;
      this.updateTransform();
    }
  }

  handleMouseUp(e) {
    if (this.isPanning) {
      this.isPanning = false;
      this.lastPanPoint = null;
      this.svg.style.cursor = "";
    }
  }

  updateTransform() {
    this.viewport.setAttribute(
      "transform",
      `translate(${this.pan.x}, ${this.pan.y}) scale(${this.zoom})`
    );
  }

  updateZoomDisplay() {
    const zoomPercent = Math.round(this.zoom * 100);
    document.getElementById("zoomLevel").textContent = `Zoom: ${zoomPercent}%`;
  }

  screenToWorld(screenPoint) {
    const rect = this.svg.getBoundingClientRect();
    return new Vector2D(
      (screenPoint.x - rect.left - this.pan.x) / this.zoom,
      (screenPoint.y - rect.top - this.pan.y) / this.zoom
    );
  }

  worldToScreen(worldPoint) {
    const rect = this.svg.getBoundingClientRect();
    return new Vector2D(
      worldPoint.x * this.zoom + this.pan.x + rect.left,
      worldPoint.y * this.zoom + this.pan.y + rect.top
    );
  }

  reset() {
    this.pan = new Vector2D(400, 300);
    this.zoom = 1.0;
    this.updateTransform();
    this.updateZoomDisplay();
  }
}

// ==================== TOOL SYSTEM ====================

class Tool {
  constructor(app) {
    this.app = app;
    this.active = false;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  onMouseDown(e, worldPos) {}
  onMouseMove(e, worldPos) {}
  onMouseUp(e, worldPos) {}
  onKeyDown(e) {}
}

class SelectTool extends Tool {
  constructor(app) {
    super(app);
    this.dragStart = null;
    this.dragging = false;
    this.draggedShape = null;
    this.shapeStartPos = null;
    this.marqueeStart = null;
    this.marqueeRect = null;
  }

  activate() {
    super.activate();
    this.app.canvas.style.cursor = "default";
  }

  onMouseDown(e, worldPos) {
    const target = e.target;
    const shape = this.app.shapeManager.getShapeByElement(target);

    if (shape) {
      if (
        !e.shiftKey &&
        !this.app.shapeManager.selectedShapes.includes(shape)
      ) {
        this.app.shapeManager.deselectAll();
      }
      this.app.shapeManager.selectShape(shape, e.shiftKey);

      // Start dragging
      this.dragging = true;
      this.draggedShape = shape;
      this.dragStart = worldPos.clone();

      if (shape.type === "rect") {
        this.shapeStartPos = { x: shape.x, y: shape.y };
      } else if (shape.type === "circle") {
        this.shapeStartPos = { cx: shape.cx, cy: shape.cy };
      } else if (shape.type === "line") {
        this.shapeStartPos = {
          x1: shape.x1,
          y1: shape.y1,
          x2: shape.x2,
          y2: shape.y2,
        };
      }
    } else {
      // Start marquee selection
      this.app.shapeManager.deselectAll();
      this.marqueeStart = worldPos.clone();
      this.createMarqueeRect();
    }
  }

  onMouseMove(e, worldPos) {
    if (this.dragging && this.draggedShape) {
      const delta = worldPos.subtract(this.dragStart);
      const shape = this.draggedShape;

      if (shape.type === "rect") {
        shape.x = this.shapeStartPos.x + delta.x;
        shape.y = this.shapeStartPos.y + delta.y;
      } else if (shape.type === "circle") {
        shape.cx = this.shapeStartPos.cx + delta.x;
        shape.cy = this.shapeStartPos.cy + delta.y;
      } else if (shape.type === "line") {
        shape.x1 = this.shapeStartPos.x1 + delta.x;
        shape.y1 = this.shapeStartPos.y1 + delta.y;
        shape.x2 = this.shapeStartPos.x2 + delta.x;
        shape.y2 = this.shapeStartPos.y2 + delta.y;
      }
      shape.updateElement();
      this.app.updateSelectionBox();
    } else if (this.marqueeStart) {
      this.updateMarqueeRect(worldPos);
    }
  }

  onMouseUp(e, worldPos) {
    if (this.dragging && this.draggedShape) {
      const delta = worldPos.subtract(this.dragStart);
      if (delta.length() > 0.1) {
        const oldTransform = { ...this.shapeStartPos };
        const newTransform = {};
        const shape = this.draggedShape;

        if (shape.type === "rect") {
          newTransform.x = shape.x;
          newTransform.y = shape.y;
        } else if (shape.type === "circle") {
          newTransform.cx = shape.cx;
          newTransform.cy = shape.cy;
        } else if (shape.type === "line") {
          newTransform.x1 = shape.x1;
          newTransform.y1 = shape.y1;
          newTransform.x2 = shape.x2;
          newTransform.y2 = shape.y2;
        }

        const command = new TransformShapeCommand(
          shape,
          oldTransform,
          newTransform
        );
        this.app.history.execute(command);
      }

      this.dragging = false;
      this.draggedShape = null;
    } else if (this.marqueeStart) {
      this.finishMarqueeSelection(worldPos);
    }
  }

  createMarqueeRect() {
    this.marqueeRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    this.marqueeRect.classList.add("selection-box");
    this.app.selectionGroup.appendChild(this.marqueeRect);
  }

  updateMarqueeRect(worldPos) {
    if (!this.marqueeRect) return;
    const x = Math.min(this.marqueeStart.x, worldPos.x);
    const y = Math.min(this.marqueeStart.y, worldPos.y);
    const width = Math.abs(worldPos.x - this.marqueeStart.x);
    const height = Math.abs(worldPos.y - this.marqueeStart.y);

    this.marqueeRect.setAttribute("x", x);
    this.marqueeRect.setAttribute("y", y);
    this.marqueeRect.setAttribute("width", width);
    this.marqueeRect.setAttribute("height", height);
  }

  finishMarqueeSelection(worldPos) {
    const x = Math.min(this.marqueeStart.x, worldPos.x);
    const y = Math.min(this.marqueeStart.y, worldPos.y);
    const width = Math.abs(worldPos.x - this.marqueeStart.x);
    const height = Math.abs(worldPos.y - this.marqueeStart.y);

    const shapesInRect = this.app.shapeManager.getShapesInRect(
      x,
      y,
      width,
      height
    );
    shapesInRect.forEach((shape) =>
      this.app.shapeManager.selectShape(shape, true)
    );

    if (this.marqueeRect) {
      this.marqueeRect.remove();
      this.marqueeRect = null;
    }
    this.marqueeStart = null;
  }
}

class PenTool extends Tool {
  constructor(app) {
    super(app);
    this.currentPath = null;
    this.tempLine = null;
    this.lastPoint = null;
    this.isDrawing = false;
  }

  activate() {
    super.activate();
    this.app.canvas.style.cursor = "crosshair";
  }

  deactivate() {
    super.deactivate();
    this.finishPath();
  }

  onMouseDown(e, worldPos) {
    if (!this.isDrawing) {
      // Start new path
      this.currentPath = new PathShape();
      this.currentPath.fill = this.app.getCurrentFill();
      this.currentPath.stroke = this.app.getCurrentStroke();
      this.currentPath.strokeWidth = this.app.getCurrentStrokeWidth();

      this.currentPath.addPoint({ x: worldPos.x, y: worldPos.y, type: "M" });
      this.lastPoint = worldPos.clone();
      this.isDrawing = true;

      const command = new AddShapeCommand(
        this.app.shapeManager,
        this.currentPath
      );
      this.app.history.execute(command);
    } else {
      // Add point to existing path
      this.currentPath.addPoint({ x: worldPos.x, y: worldPos.y, type: "L" });
      this.lastPoint = worldPos.clone();
    }

    this.removeTempLine();
  }

  onMouseMove(e, worldPos) {
    if (this.isDrawing && this.lastPoint) {
      this.updateTempLine(worldPos);
    }
  }

  updateTempLine(worldPos) {
    this.removeTempLine();
    this.tempLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    this.tempLine.setAttribute("x1", this.lastPoint.x);
    this.tempLine.setAttribute("y1", this.lastPoint.y);
    this.tempLine.setAttribute("x2", worldPos.x);
    this.tempLine.setAttribute("y2", worldPos.y);
    this.tempLine.classList.add("bezier-line");
    this.app.selectionGroup.appendChild(this.tempLine);
  }

  removeTempLine() {
    if (this.tempLine) {
      this.tempLine.remove();
      this.tempLine = null;
    }
  }

  finishPath() {
    this.removeTempLine();
    this.isDrawing = false;
    this.currentPath = null;
    this.lastPoint = null;
  }

  onKeyDown(e) {
    if (e.key === "Escape" || e.key === "Enter") {
      this.finishPath();
    }
  }
}

class RectTool extends Tool {
  constructor(app) {
    super(app);
    this.startPoint = null;
    this.currentRect = null;
  }

  activate() {
    super.activate();
    this.app.canvas.style.cursor = "crosshair";
  }

  onMouseDown(e, worldPos) {
    this.startPoint = worldPos.clone();
    this.currentRect = new RectShape(worldPos.x, worldPos.y, 0, 0);
    this.currentRect.fill = this.app.getCurrentFill();
    this.currentRect.stroke = this.app.getCurrentStroke();
    this.currentRect.strokeWidth = this.app.getCurrentStrokeWidth();

    const command = new AddShapeCommand(
      this.app.shapeManager,
      this.currentRect
    );
    this.app.history.execute(command);
  }

  onMouseMove(e, worldPos) {
    if (this.currentRect && this.startPoint) {
      this.currentRect.width = worldPos.x - this.startPoint.x;
      this.currentRect.height = worldPos.y - this.startPoint.y;
      this.currentRect.updateElement();
    }
  }

  onMouseUp(e, worldPos) {
    if (this.currentRect) {
      this.app.shapeManager.selectShape(this.currentRect);
    }
    this.currentRect = null;
    this.startPoint = null;
  }
}

class CircleTool extends Tool {
  constructor(app) {
    super(app);
    this.centerPoint = null;
    this.currentCircle = null;
  }

  activate() {
    super.activate();
    this.app.canvas.style.cursor = "crosshair";
  }

  onMouseDown(e, worldPos) {
    this.centerPoint = worldPos.clone();
    this.currentCircle = new CircleShape(worldPos.x, worldPos.y, 0);
    this.currentCircle.fill = this.app.getCurrentFill();
    this.currentCircle.stroke = this.app.getCurrentStroke();
    this.currentCircle.strokeWidth = this.app.getCurrentStrokeWidth();

    const command = new AddShapeCommand(
      this.app.shapeManager,
      this.currentCircle
    );
    this.app.history.execute(command);
  }

  onMouseMove(e, worldPos) {
    if (this.currentCircle && this.centerPoint) {
      const radius = this.centerPoint.distance(worldPos);
      this.currentCircle.radius = radius;
      this.currentCircle.updateElement();
    }
  }

  onMouseUp(e, worldPos) {
    if (this.currentCircle) {
      this.app.shapeManager.selectShape(this.currentCircle);
    }
    this.currentCircle = null;
    this.centerPoint = null;
  }
}

class LineTool extends Tool {
  constructor(app) {
    super(app);
    this.startPoint = null;
    this.currentLine = null;
  }

  activate() {
    super.activate();
    this.app.canvas.style.cursor = "crosshair";
  }

  onMouseDown(e, worldPos) {
    this.startPoint = worldPos.clone();
    this.currentLine = new LineShape(
      worldPos.x,
      worldPos.y,
      worldPos.x,
      worldPos.y
    );
    this.currentLine.stroke = this.app.getCurrentStroke();
    this.currentLine.strokeWidth = this.app.getCurrentStrokeWidth();

    const command = new AddShapeCommand(
      this.app.shapeManager,
      this.currentLine
    );
    this.app.history.execute(command);
  }

  onMouseMove(e, worldPos) {
    if (this.currentLine && this.startPoint) {
      this.currentLine.x2 = worldPos.x;
      this.currentLine.y2 = worldPos.y;
      this.currentLine.updateElement();
    }
  }

  onMouseUp(e, worldPos) {
    if (this.currentLine) {
      this.app.shapeManager.selectShape(this.currentLine);
    }
    this.currentLine = null;
    this.startPoint = null;
  }
}

class NodeTool extends Tool {
  constructor(app) {
    super(app);
    this.selectedNode = null;
    this.nodeHandles = [];
  }

  activate() {
    super.activate();
    this.app.canvas.style.cursor = "default";
    this.showNodeHandles();
  }

  deactivate() {
    super.deactivate();
    this.clearNodeHandles();
  }

  showNodeHandles() {
    this.clearNodeHandles();
    const selected = this.app.shapeManager.selectedShapes[0];
    if (!selected) return;

    if (selected.type === "path") {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const baseRadius = isTouchDevice ? 8 : 5;
      const radius = baseRadius / this.app.viewportController.zoom;

      selected.points.forEach((point, index) => {
        const handle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        handle.setAttribute("cx", point.x);
        handle.setAttribute("cy", point.y);
        handle.setAttribute("r", radius);
        handle.classList.add("control-handle");
        handle.dataset.pointIndex = index;
        this.app.selectionGroup.appendChild(handle);
        this.nodeHandles.push(handle);
      });
    }
  }

  clearNodeHandles() {
    this.nodeHandles.forEach((handle) => handle.remove());
    this.nodeHandles = [];
  }

  onMouseDown(e, worldPos) {
    const target = e.target;
    if (target.classList.contains("control-handle")) {
      this.selectedNode = parseInt(target.dataset.pointIndex);
    }
  }

  onMouseMove(e, worldPos) {
    if (this.selectedNode !== null) {
      const selected = this.app.shapeManager.selectedShapes[0];
      if (selected && selected.type === "path") {
        selected.points[this.selectedNode].x = worldPos.x;
        selected.points[this.selectedNode].y = worldPos.y;
        selected.updateElement();
        this.showNodeHandles();
      }
    }
  }

  onMouseUp(e, worldPos) {
    this.selectedNode = null;
  }
}

// ==================== MAIN APPLICATION ====================

class VectorDraftApp {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.viewport = document.getElementById("viewport");
    this.mainGroup = document.getElementById("mainGroup");
    this.selectionGroup = document.getElementById("selectionGroup");

    this.shapeManager = new ShapeManager(this.mainGroup);
    this.viewportController = new ViewportController(
      this.canvas,
      this.viewport
    );
    this.history = new CommandHistory();

    this.tools = {
      select: new SelectTool(this),
      pen: new PenTool(this),
      rect: new RectTool(this),
      circle: new CircleTool(this),
      line: new LineTool(this),
      node: new NodeTool(this),
    };

    this.currentTool = this.tools.select;
    this.currentTool.activate();

    this.setupEventListeners();
    this.setupPropertyPanel();
    this.updateLayersList();

    // Subscribe to shape manager updates
    this.shapeManager.subscribe({
      update: (data) => this.handleShapeManagerUpdate(data),
    });

    // Initial viewport position
    this.viewportController.reset();

    // Show mobile help on touch devices
    this.showMobileHelpIfNeeded();
  }

  showMobileHelpIfNeeded() {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isMobile = window.innerWidth <= 768;
    const hasSeenHelp = localStorage.getItem("vectordraft_mobile_help_seen");

    if (isTouchDevice && isMobile && !hasSeenHelp) {
      setTimeout(() => {
        document.getElementById("mobileHelp").classList.add("show");
      }, 1000);
    }
  }

  closeMobileHelp() {
    document.getElementById("mobileHelp").classList.remove("show");
    localStorage.setItem("vectordraft_mobile_help_seen", "true");
  }

  setupEventListeners() {
    // Tool selection
    document.querySelectorAll(".tool-icon").forEach((btn) => {
      btn.addEventListener("click", () => {
        const toolName = btn.dataset.tool;
        this.selectTool(toolName);
      });
    });

    // Canvas events - Mouse
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));

    // Canvas events - Touch
    this.canvas.addEventListener(
      "touchstart",
      (e) => this.handleTouchStart(e),
      { passive: false }
    );
    this.canvas.addEventListener("touchmove", (e) => this.handleTouchMove(e), {
      passive: false,
    });
    this.canvas.addEventListener("touchend", (e) => this.handleTouchEnd(e), {
      passive: false,
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Update cursor position
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const screenPos = new Vector2D(
        e.clientX - rect.left,
        e.clientY - rect.top
      );
      const worldPos = this.viewportController.screenToWorld(screenPos);
      document.getElementById("cursorPos").textContent = `X: ${Math.round(
        worldPos.x
      )}, Y: ${Math.round(worldPos.y)}`;
    });

    // Close mobile menus when clicking outside
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        const propertiesPanel = document.querySelector(".properties-panel");
        const propertiesToggle = document.querySelector(".properties-toggle");
        const backdrop = document.querySelector(".backdrop");

        if (
          propertiesPanel.classList.contains("active") &&
          !propertiesPanel.contains(e.target) &&
          e.target !== propertiesToggle &&
          e.target !== backdrop
        ) {
          propertiesPanel.classList.remove("active");
          backdrop.classList.remove("active");
        }
      }
    });
  }

  handleTouchStart(e) {
    // Skip if this is a two-finger gesture (handled by viewport)
    if (e.touches.length >= 2) return;

    const touch = e.touches[0];
    const mockEvent = this.createMouseEventFromTouch(touch, e);
    this.handleMouseDown(mockEvent);
  }

  handleTouchMove(e) {
    // Skip if this is a multi-finger gesture (handled by viewport)
    if (e.touches.length >= 2) return;

    const touch = e.touches[0];
    const mockEvent = this.createMouseEventFromTouch(touch, e);
    this.handleMouseMove(mockEvent);
  }

  handleTouchEnd(e) {
    // Use the last known touch position
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const mockEvent = this.createMouseEventFromTouch(touch, e);
      this.handleMouseUp(mockEvent);
    }
  }

  createMouseEventFromTouch(touch, originalEvent) {
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: originalEvent.target,
      button: 0,
      shiftKey: false,
      preventDefault: () => originalEvent.preventDefault(),
    };
  }

  toggleMobileMenu() {
    const toolbar = document.querySelector(".toolbar");
    toolbar.classList.toggle("active");
  }

  togglePropertiesPanel() {
    const panel = document.querySelector(".properties-panel");
    const backdrop = document.querySelector(".backdrop");
    panel.classList.toggle("active");
    backdrop.classList.toggle("active");
  }

  selectTool(toolName) {
    if (this.currentTool) {
      this.currentTool.deactivate();
    }
    this.currentTool = this.tools[toolName];
    this.currentTool.activate();

    // Update UI
    document.querySelectorAll(".tool-icon").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === toolName);
    });
  }

  handleMouseDown(e) {
    if (e.button === 0 && !e.shiftKey) {
      // Left click only
      const worldPos = this.getWorldPosition(e);
      this.currentTool.onMouseDown(e, worldPos);
    }
  }

  handleMouseMove(e) {
    const worldPos = this.getWorldPosition(e);
    this.currentTool.onMouseMove(e, worldPos);
  }

  handleMouseUp(e) {
    const worldPos = this.getWorldPosition(e);
    this.currentTool.onMouseUp(e, worldPos);
  }

  handleKeyDown(e) {
    // Tool shortcuts
    if (!e.ctrlKey && !e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "v":
          this.selectTool("select");
          break;
        case "p":
          this.selectTool("pen");
          break;
        case "r":
          this.selectTool("rect");
          break;
        case "c":
          this.selectTool("circle");
          break;
        case "l":
          this.selectTool("line");
          break;
        case "a":
          this.selectTool("node");
          break;
      }
    }

    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
    }

    // Delete
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      this.deleteSelected();
    }

    // Pass to current tool
    this.currentTool.onKeyDown(e);
  }

  getWorldPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    const screenPos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);
    return this.viewportController.screenToWorld(screenPos);
  }

  setupPropertyPanel() {
    // Property inputs
    document.getElementById("fillColor").addEventListener("change", (e) => {
      this.updateSelectedShapesProperty("fill", e.target.value);
    });

    document.getElementById("strokeColor").addEventListener("change", (e) => {
      this.updateSelectedShapesProperty("stroke", e.target.value);
    });

    document.getElementById("strokeWidth").addEventListener("input", (e) => {
      this.updateSelectedShapesProperty(
        "strokeWidth",
        parseFloat(e.target.value)
      );
    });

    document.getElementById("opacity").addEventListener("input", (e) => {
      this.updateSelectedShapesProperty("opacity", parseFloat(e.target.value));
    });

    document.getElementById("posX").addEventListener("input", (e) => {
      const shape = this.shapeManager.selectedShapes[0];
      if (!shape) return;

      if (shape.type === "rect") {
        shape.x = parseFloat(e.target.value);
      } else if (shape.type === "circle") {
        shape.cx = parseFloat(e.target.value);
      }
      shape.updateElement();
    });

    document.getElementById("posY").addEventListener("input", (e) => {
      const shape = this.shapeManager.selectedShapes[0];
      if (!shape) return;

      if (shape.type === "rect") {
        shape.y = parseFloat(e.target.value);
      } else if (shape.type === "circle") {
        shape.cy = parseFloat(e.target.value);
      }
      shape.updateElement();
    });

    document.getElementById("shapeWidth").addEventListener("input", (e) => {
      const shape = this.shapeManager.selectedShapes[0];
      if (!shape || shape.type !== "rect") return;
      shape.width = parseFloat(e.target.value);
      shape.updateElement();
    });

    document.getElementById("shapeHeight").addEventListener("input", (e) => {
      const shape = this.shapeManager.selectedShapes[0];
      if (!shape || shape.type !== "rect") return;
      shape.height = parseFloat(e.target.value);
      shape.updateElement();
    });
  }

  updateSelectedShapesProperty(property, value) {
    this.shapeManager.selectedShapes.forEach((shape) => {
      const oldValue = shape[property];
      const command = new ModifyShapeCommand(shape, property, oldValue, value);
      this.history.execute(command);
    });
  }

  updatePropertiesPanel() {
    const shape = this.shapeManager.selectedShapes[0];
    if (!shape) return;

    document.getElementById("fillColor").value = shape.fill || "#00ff88";
    document.getElementById("strokeColor").value = shape.stroke || "#000000";
    document.getElementById("strokeWidth").value = shape.strokeWidth || 2;
    document.getElementById("opacity").value = shape.opacity || 1;

    if (shape.type === "rect") {
      document.getElementById("posX").value = shape.x;
      document.getElementById("posY").value = shape.y;
      document.getElementById("shapeWidth").value = shape.width;
      document.getElementById("shapeHeight").value = shape.height;
    } else if (shape.type === "circle") {
      document.getElementById("posX").value = shape.cx;
      document.getElementById("posY").value = shape.cy;
      document.getElementById("shapeWidth").value = shape.radius * 2;
      document.getElementById("shapeHeight").value = shape.radius * 2;
    }
  }

  handleShapeManagerUpdate(data) {
    if (data.type === "selectionChanged") {
      this.updateSelectionBox();
      this.updatePropertiesPanel();
      this.updateLayersList();
    }
    if (
      data.type === "shapeAdded" ||
      data.type === "shapeRemoved" ||
      data.type === "layerOrderChanged"
    ) {
      this.updateLayersList();
    }
  }

  updateSelectionBox() {
    // Clear existing selection visuals
    this.selectionGroup
      .querySelectorAll(".selection-box")
      .forEach((el) => el.remove());
    this.selectionGroup
      .querySelectorAll(".control-handle")
      .forEach((el) => el.remove());

    if (this.shapeManager.selectedShapes.length === 0) return;

    this.shapeManager.selectedShapes.forEach((shape) => {
      const bounds = shape.getBounds();

      // Draw selection box
      const box = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      box.classList.add("selection-box");
      box.setAttribute("x", bounds.x - 2);
      box.setAttribute("y", bounds.y - 2);
      box.setAttribute("width", bounds.width + 4);
      box.setAttribute("height", bounds.height + 4);
      this.selectionGroup.appendChild(box);

      // Draw corner handles - make them bigger on touch devices
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const baseHandleSize = isTouchDevice ? 10 : 6;
      const handleSize = baseHandleSize / this.viewportController.zoom;
      const corners = [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
      ];

      corners.forEach((corner) => {
        const handle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        handle.classList.add("control-handle");
        handle.setAttribute("x", corner.x - handleSize / 2);
        handle.setAttribute("y", corner.y - handleSize / 2);
        handle.setAttribute("width", handleSize);
        handle.setAttribute("height", handleSize);
        this.selectionGroup.appendChild(handle);
      });
    });
  }

  updateLayersList() {
    const layersList = document.getElementById("layersList");
    layersList.innerHTML = "";

    const shapes = [...this.shapeManager.shapes].reverse(); // Reverse for visual stacking
    shapes.forEach((shape, index) => {
      const layerItem = document.createElement("div");
      layerItem.classList.add("layer-item");
      if (this.shapeManager.selectedShapes.includes(shape)) {
        layerItem.classList.add("selected");
      }

      layerItem.innerHTML = `
                        <div>
                            <div class="layer-name">${shape.type}_${
        shape.id.split("_")[1]
      }</div>
                            <div class="layer-type">${shape.type}</div>
                        </div>
                        <button class="layer-visibility">${
                          shape.visible ? "👁" : "👁‍🗨"
                        }</button>
                    `;

      layerItem
        .querySelector(".layer-visibility")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          shape.visible = !shape.visible;
          shape.updateElement();
          this.updateLayersList();
        });

      layerItem.addEventListener("click", (e) => {
        if (!e.shiftKey) {
          this.shapeManager.deselectAll();
        }
        this.shapeManager.selectShape(shape, e.shiftKey);
      });

      layersList.appendChild(layerItem);
    });
  }

  getCurrentFill() {
    return document.getElementById("fillColor").value;
  }

  getCurrentStroke() {
    return document.getElementById("strokeColor").value;
  }

  getCurrentStrokeWidth() {
    return parseFloat(document.getElementById("strokeWidth").value);
  }

  undo() {
    if (this.history.undo()) {
      this.updateSelectionBox();
      this.updateLayersList();
      this.setStatus("Undo");
    }
  }

  redo() {
    if (this.history.redo()) {
      this.updateSelectionBox();
      this.updateLayersList();
      this.setStatus("Redo");
    }
  }

  deleteSelected() {
    this.shapeManager.selectedShapes.forEach((shape) => {
      const command = new RemoveShapeCommand(this.shapeManager, shape);
      this.history.execute(command);
    });
    this.setStatus("Deleted shapes");
  }

  duplicateSelected() {
    const newShapes = [];
    this.shapeManager.selectedShapes.forEach((shape) => {
      let newShape;
      const offset = 20;

      if (shape.type === "rect") {
        newShape = new RectShape(
          shape.x + offset,
          shape.y + offset,
          shape.width,
          shape.height
        );
      } else if (shape.type === "circle") {
        newShape = new CircleShape(
          shape.cx + offset,
          shape.cy + offset,
          shape.radius
        );
      } else if (shape.type === "line") {
        newShape = new LineShape(
          shape.x1 + offset,
          shape.y1 + offset,
          shape.x2 + offset,
          shape.y2 + offset
        );
      } else if (shape.type === "path") {
        const newPoints = shape.points.map((p) => ({
          ...p,
          x: p.x + offset,
          y: p.y + offset,
        }));
        newShape = new PathShape(newPoints);
        newShape.closed = shape.closed;
      }

      if (newShape) {
        newShape.fill = shape.fill;
        newShape.stroke = shape.stroke;
        newShape.strokeWidth = shape.strokeWidth;
        newShape.opacity = shape.opacity;

        const command = new AddShapeCommand(this.shapeManager, newShape);
        this.history.execute(command);
        newShapes.push(newShape);
      }
    });

    this.shapeManager.deselectAll();
    newShapes.forEach((shape) => this.shapeManager.selectShape(shape, true));
    this.setStatus("Duplicated shapes");
  }

  newDocument() {
    if (confirm("Create new document? This will clear the current canvas.")) {
      this.shapeManager.clear();
      this.history.clear();
      this.viewportController.reset();
      this.setStatus("New document created");
    }
  }

  saveToLocalStorage() {
    const data = {
      shapes: this.shapeManager.serialize(),
      viewport: {
        pan: {
          x: this.viewportController.pan.x,
          y: this.viewportController.pan.y,
        },
        zoom: this.viewportController.zoom,
      },
    };
    localStorage.setItem("vectordraft_save", JSON.stringify(data));
    this.setStatus("Saved to browser storage");
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem("vectordraft_save");
    if (!saved) {
      alert("No saved document found");
      return;
    }

    const data = JSON.parse(saved);
    this.shapeManager.deserialize(data.shapes);

    if (data.viewport) {
      this.viewportController.pan = new Vector2D(
        data.viewport.pan.x,
        data.viewport.pan.y
      );
      this.viewportController.zoom = data.viewport.zoom;
      this.viewportController.updateTransform();
      this.viewportController.updateZoomDisplay();
    }

    this.setStatus("Loaded from browser storage");
  }

  exportSVG() {
    // Create a clean SVG without UI elements
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "800");
    svg.setAttribute("height", "600");
    svg.setAttribute("viewBox", "0 0 800 600");

    // Clone all shapes
    this.shapeManager.shapes.forEach((shape) => {
      const clone = shape.element.cloneNode(true);
      svg.appendChild(clone);
    });

    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "vectordraft_export.svg";
    link.click();

    URL.revokeObjectURL(url);
    this.setStatus("SVG exported");
  }

  setStatus(message) {
    document.getElementById("statusText").textContent = message;
    setTimeout(() => {
      document.getElementById("statusText").textContent = "Ready";
    }, 2000);
  }
}

// Initialize application
let app;
window.addEventListener("DOMContentLoaded", () => {
  app = new VectorDraftApp();
});

// Handle orientation changes on mobile
window.addEventListener("orientationchange", () => {
  if (app) {
    setTimeout(() => {
      app.viewportController.updateTransform();
      app.updateSelectionBox();
    }, 100);
  }
});

// Handle window resize
window.addEventListener("resize", () => {
  if (app) {
    // Close mobile menus on resize to desktop
    if (window.innerWidth > 768) {
      document.querySelector(".toolbar").classList.remove("active");
      document.querySelector(".properties-panel").classList.remove("active");
      document.querySelector(".backdrop").classList.remove("active");
    }
  }
});
