class MicroservicesSimulator {
  constructor() {
    this.services = [];
    this.connections = [];
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      circuitBreakersOpen: 0,
      latencies: [],
    };
    this.features = {
      circuitBreaker: true,
      rateLimit: true,
      loadBalance: true,
    };
    this.isRunning = false;
    this.requestRate = 10;
    this.failureRate = 10;
    this.selectedService = null;
    this.logs = [];
    this.init();
  }

  init() {
    this.createDefaultArchitecture();
    this.setupEventListeners();
    this.updateUI();
  }

  createDefaultArchitecture() {
    const apiGateway = {
      id: "api-gateway-1",
      name: "API Gateway",
      type: "api-gateway",
      x: 100,
      y: 50,
      status: "healthy",
      metrics: { requests: 0, latency: 0, cpu: 20, memory: 30 },
      rateLimit: { current: 0, max: 100 },
      circuitBreaker: { failures: 0, state: "closed" },
    };

    const loadBalancer = {
      id: "lb-1",
      name: "Load Balancer",
      type: "load-balancer",
      x: 100,
      y: 200,
      status: "healthy",
      metrics: { requests: 0, latency: 0, cpu: 15, memory: 25 },
      rateLimit: { current: 0, max: 100 },
      circuitBreaker: { failures: 0, state: "closed" },
    };

    const serviceDiscovery = {
      id: "sd-1",
      name: "Service Discovery",
      type: "service-discovery",
      x: 400,
      y: 50,
      status: "healthy",
      metrics: { requests: 0, latency: 0, cpu: 10, memory: 20 },
      rateLimit: { current: 0, max: 100 },
      circuitBreaker: { failures: 0, state: "closed" },
    };

    const services = [
      { id: "user-service", name: "User Service", x: 300, y: 200 },
      { id: "order-service", name: "Order Service", x: 500, y: 200 },
      { id: "payment-service", name: "Payment Service", x: 700, y: 200 },
      { id: "inventory-service", name: "Inventory Service", x: 300, y: 400 },
      {
        id: "notification-service",
        name: "Notification Service",
        x: 500,
        y: 400,
      },
    ];

    this.services.push(apiGateway, loadBalancer, serviceDiscovery);

    services.forEach((svc) => {
      this.services.push({
        id: svc.id,
        name: svc.name,
        type: "microservice",
        x: svc.x,
        y: svc.y,
        status: "healthy",
        metrics: {
          requests: 0,
          latency: 0,
          cpu: Math.random() * 30,
          memory: Math.random() * 40,
        },
        rateLimit: { current: 0, max: 50 },
        circuitBreaker: { failures: 0, state: "closed" },
      });
    });

    this.connections = [
      { from: "api-gateway-1", to: "lb-1" },
      { from: "lb-1", to: "user-service" },
      { from: "lb-1", to: "order-service" },
      { from: "lb-1", to: "payment-service" },
      { from: "order-service", to: "inventory-service" },
      { from: "payment-service", to: "notification-service" },
      { from: "sd-1", to: "user-service" },
      { from: "sd-1", to: "order-service" },
      { from: "sd-1", to: "payment-service" },
    ];

    this.renderArchitecture();
  }

  setupEventListeners() {
    document.getElementById("requestRate").addEventListener("input", (e) => {
      document.getElementById("rpsValue").textContent = e.target.value;
    });
    document.getElementById("failureRate").addEventListener("input", (e) => {
      document.getElementById("failureValue").textContent = e.target.value;
    });
  }

  renderArchitecture() {
    const canvas = document.getElementById("canvas");
    canvas.innerHTML = "";

    this.connections.forEach((conn) => {
      const fromService = this.services.find((s) => s.id === conn.from);
      const toService = this.services.find((s) => s.id === conn.to);
      if (fromService && toService) {
        this.drawConnection(fromService, toService, canvas);
      }
    });

    this.services.forEach((service) => {
      const node = this.createServiceNode(service);
      canvas.appendChild(node);
    });
  }

  drawConnection(from, to, canvas) {
    const line = document.createElement("div");
    line.className = "connection-line";

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    line.style.width = length + "px";
    line.style.left = from.x + "px";
    line.style.top = from.y + "px";
    line.style.transform = `rotate(${angle}deg)`;

    canvas.appendChild(line);
  }

  createServiceNode(service) {
    const node = document.createElement("div");
    node.className = `service-node ${service.status}`;
    if (service.type === "api-gateway") node.classList.add("api-gateway");
    if (service.type === "load-balancer") node.classList.add("load-balancer");
    if (service.type === "service-discovery")
      node.classList.add("service-discovery");
    if (service.circuitBreaker.state === "open")
      node.classList.add("circuit-open");

    node.style.left = service.x + "px";
    node.style.top = service.y + "px";
    node.id = service.id;

    const circuitIndicator =
      service.circuitBreaker.state === "open"
        ? '<div class="circuit-breaker-indicator">⚡</div>'
        : "";

    node.innerHTML = `
                    ${circuitIndicator}
                    <div class="service-header">
                        <div class="service-name">${service.name}</div>
                        <div class="service-status ${service.status}"></div>
                    </div>
                    <div class="service-metrics">
                        <div class="service-metric">
                            <span>CPU:</span>
                            <span>${service.metrics.cpu.toFixed(1)}%</span>
                        </div>
                        <div class="service-metric">
                            <span>Memory:</span>
                            <span>${service.metrics.memory.toFixed(1)}%</span>
                        </div>
                        <div class="service-metric">
                            <span>Latency:</span>
                            <span>${service.metrics.latency.toFixed(0)}ms</span>
                        </div>
                        <div class="rate-limit-bar">
                            <div class="rate-limit-fill" style="width: ${
                              (service.rateLimit.current /
                                service.rateLimit.max) *
                              100
                            }%"></div>
                        </div>
                    </div>
                `;

    node.addEventListener("click", () => {
      this.selectedService = service;
      this.log(`Selected service: ${service.name}`, "info");
    });

    this.makeDraggable(node, service);

    return node;
  }

  makeDraggable(element, service) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - element.offsetLeft;
      offsetY = e.clientY - element.offsetTop;
      element.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        service.x = e.clientX - offsetX;
        service.y = e.clientY - offsetY;
        this.renderArchitecture();
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      element.style.cursor = "move";
    });
  }

  startSimulation() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.log("Simulation started", "success");
    this.simulationLoop();
  }

  pauseSimulation() {
    this.isRunning = false;
    this.log("Simulation paused", "warning");
  }

  resetSimulation() {
    this.isRunning = false;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      circuitBreakersOpen: 0,
      latencies: [],
    };
    this.services.forEach((service) => {
      service.status = "healthy";
      service.metrics = {
        requests: 0,
        latency: 0,
        cpu: Math.random() * 30,
        memory: Math.random() * 40,
      };
      service.rateLimit.current = 0;
      service.circuitBreaker = { failures: 0, state: "closed" };
    });
    this.logs = [];
    this.log("System reset", "info");
    this.updateUI();
    this.renderArchitecture();
  }

  simulationLoop() {
    if (!this.isRunning) return;

    const interval = 1000 / this.requestRate;

    setTimeout(() => {
      this.processRequest();
      this.updateMetrics();
      this.updateUI();
      this.simulationLoop();
    }, interval);
  }

  processRequest() {
    this.metrics.totalRequests++;
    const apiGateway = this.services.find((s) => s.type === "api-gateway");

    if (!apiGateway) return;

    if (
      this.features.rateLimit &&
      apiGateway.rateLimit.current >= apiGateway.rateLimit.max
    ) {
      this.metrics.rateLimitedRequests++;
      this.log(`Request rate limited at API Gateway`, "warning");
      return;
    }

    apiGateway.rateLimit.current++;
    setTimeout(() => apiGateway.rateLimit.current--, 1000);

    const targetService = this.selectTargetService();
    if (!targetService) return;

    const shouldFail = Math.random() * 100 < this.failureRate;
    const latency = this.calculateLatency(targetService);

    if (shouldFail || targetService.status === "unhealthy") {
      this.handleFailedRequest(targetService);
    } else {
      this.handleSuccessfulRequest(targetService, latency);
    }

    this.animateRequest(apiGateway, targetService);
  }

  selectTargetService() {
    const microservices = this.services.filter(
      (s) => s.type === "microservice" && s.status === "healthy"
    );
    if (microservices.length === 0) return null;

    if (this.features.loadBalance) {
      return microservices.reduce((min, service) =>
        service.metrics.requests < min.metrics.requests ? service : min
      );
    }

    return microservices[Math.floor(Math.random() * microservices.length)];
  }

  calculateLatency(service) {
    let baseLatency = 50 + Math.random() * 100;

    if (service.status === "degraded") baseLatency *= 2;
    if (service.metrics.cpu > 70) baseLatency *= 1.5;
    if (service.metrics.memory > 80) baseLatency *= 1.3;

    return baseLatency;
  }

  handleSuccessfulRequest(service, latency) {
    this.metrics.successfulRequests++;
    this.metrics.latencies.push(latency);

    service.metrics.requests++;
    service.metrics.latency = latency;
    service.circuitBreaker.failures = Math.max(
      0,
      service.circuitBreaker.failures - 1
    );

    if (
      service.circuitBreaker.state === "open" &&
      service.circuitBreaker.failures === 0
    ) {
      service.circuitBreaker.state = "closed";
      this.log(`Circuit breaker closed for ${service.name}`, "success");
    }

    this.log(
      `✓ Request to ${service.name} succeeded (${latency.toFixed(0)}ms)`,
      "success"
    );
  }

  handleFailedRequest(service) {
    this.metrics.failedRequests++;
    service.circuitBreaker.failures++;

    if (this.features.circuitBreaker && service.circuitBreaker.failures >= 5) {
      service.circuitBreaker.state = "open";
      this.metrics.circuitBreakersOpen++;
      this.log(`⚡ Circuit breaker opened for ${service.name}`, "error");
    }

    this.log(`✗ Request to ${service.name} failed`, "error");
  }

  animateRequest(from, to) {
    const canvas = document.getElementById("canvas");
    const particle = document.createElement("div");
    particle.className = "request-particle";

    const startX = from.x + 75;
    const startY = from.y + 50;
    const endX = to.x + 75;
    const endY = to.y + 50;

    particle.style.left = startX + "px";
    particle.style.top = startY + "px";
    canvas.appendChild(particle);

    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;

      particle.style.left = currentX + "px";
      particle.style.top = currentY + "px";

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };

    animate();
  }

  updateMetrics() {
    this.services.forEach((service) => {
      service.metrics.cpu = Math.max(
        0,
        Math.min(100, service.metrics.cpu + (Math.random() - 0.5) * 10)
      );
      service.metrics.memory = Math.max(
        0,
        Math.min(100, service.metrics.memory + (Math.random() - 0.5) * 5)
      );

      if (service.metrics.cpu > 90 || service.metrics.memory > 90) {
        service.status = "degraded";
      } else if (
        service.status === "degraded" &&
        service.metrics.cpu < 70 &&
        service.metrics.memory < 70
      ) {
        service.status = "healthy";
      }
    });

    if (this.metrics.latencies.length > 100) {
      this.metrics.latencies = this.metrics.latencies.slice(-100);
    }
  }

  updateUI() {
    document.getElementById("totalRequests").textContent =
      this.metrics.totalRequests;

    const successRate =
      this.metrics.totalRequests > 0
        ? (
            (this.metrics.successfulRequests / this.metrics.totalRequests) *
            100
          ).toFixed(1)
        : 100;
    document.getElementById("successRate").textContent = successRate + "%";

    const avgLatency =
      this.metrics.latencies.length > 0
        ? (
            this.metrics.latencies.reduce((a, b) => a + b, 0) /
            this.metrics.latencies.length
          ).toFixed(0)
        : 0;
    document.getElementById("avgLatency").textContent = avgLatency + "ms";

    const sortedLatencies = [...this.metrics.latencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p95 = sortedLatencies[p95Index] || 0;
    document.getElementById("p95Latency").textContent = p95.toFixed(0) + "ms";

    const healthyServices = this.services.filter(
      (s) => s.status === "healthy"
    ).length;
    document.getElementById("activeServices").textContent = healthyServices;

    document.getElementById("circuitBreakersOpen").textContent =
      this.services.filter((s) => s.circuitBreaker.state === "open").length;
    document.getElementById("rateLimited").textContent =
      this.metrics.rateLimitedRequests;
    document.getElementById("failedRequests").textContent =
      this.metrics.failedRequests;
    document.getElementById("avgResponseTime").textContent = avgLatency + "ms";

    document.getElementById("currentRPS").textContent = this.requestRate;
    document.getElementById("bandwidth").textContent = (
      this.requestRate * 0.05
    ).toFixed(2);
    document.getElementById("connectionPool").textContent = `${Math.min(
      this.services.length * 5,
      100
    )}/100`;

    this.updateServiceHealthList();
    this.renderArchitecture();
  }

  updateServiceHealthList() {
    const container = document.getElementById("serviceHealthList");
    if (!container) return;

    container.innerHTML = this.services
      .map(
        (service) => `
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: white; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid ${
                      service.status === "healthy"
                        ? "#28a745"
                        : service.status === "degraded"
                        ? "#ffc107"
                        : "#dc3545"
                    }">
                        <span><strong>${service.name}</strong></span>
                        <span style="color: ${
                          service.status === "healthy"
                            ? "#28a745"
                            : service.status === "degraded"
                            ? "#ffc107"
                            : "#dc3545"
                        }">${service.status.toUpperCase()}</span>
                    </div>
                `
      )
      .join("");
  }

  log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    this.logs.unshift(logEntry);

    if (this.logs.length > 100) this.logs.pop();

    const container = document.getElementById("logsContainer");
    if (container) {
      const entry = document.createElement("div");
      entry.className = `log-entry log-${type}`;
      entry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;
      container.insertBefore(entry, container.firstChild);

      if (container.children.length > 100) {
        container.removeChild(container.lastChild);
      }
    }
  }

  addService() {
    const name =
      document.getElementById("serviceName").value ||
      `service-${this.services.length + 1}`;
    const type = document.getElementById("serviceType").value;

    const newService = {
      id: `${type}-${Date.now()}`,
      name: name,
      type: type,
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      status: "healthy",
      metrics: {
        requests: 0,
        latency: 0,
        cpu: Math.random() * 30,
        memory: Math.random() * 40,
      },
      rateLimit: { current: 0, max: type === "api-gateway" ? 100 : 50 },
      circuitBreaker: { failures: 0, state: "closed" },
    };

    this.services.push(newService);
    this.log(`Added new service: ${name}`, "success");
    this.renderArchitecture();
  }

  removeService() {
    if (!this.selectedService) {
      this.log("No service selected", "warning");
      return;
    }

    this.services = this.services.filter(
      (s) => s.id !== this.selectedService.id
    );
    this.connections = this.connections.filter(
      (c) =>
        c.from !== this.selectedService.id && c.to !== this.selectedService.id
    );

    this.log(`Removed service: ${this.selectedService.name}`, "info");
    this.selectedService = null;
    this.renderArchitecture();
  }

  toggleFeature(feature) {
    this.features[feature] = !this.features[feature];
    const btn = document.getElementById(
      `toggle${feature.charAt(0).toUpperCase() + feature.slice(1)}`
    );
    btn.style.opacity = this.features[feature] ? "1" : "0.5";
    this.log(
      `${feature} ${this.features[feature] ? "enabled" : "disabled"}`,
      "info"
    );
  }

  injectLatency() {
    const service =
      this.services[Math.floor(Math.random() * this.services.length)];
    service.metrics.latency += 500;
    service.status = "degraded";
    this.log(`Injected latency into ${service.name}`, "warning");
    setTimeout(() => {
      service.metrics.latency = Math.max(0, service.metrics.latency - 500);
      if (service.metrics.cpu < 70 && service.metrics.memory < 70) {
        service.status = "healthy";
      }
    }, 5000);
  }

  causeServiceFailure() {
    const microservices = this.services.filter(
      (s) => s.type === "microservice"
    );
    if (microservices.length === 0) return;

    const service =
      microservices[Math.floor(Math.random() * microservices.length)];
    service.status = "unhealthy";
    this.log(`Service failure: ${service.name}`, "error");

    setTimeout(() => {
      service.status = "healthy";
      service.circuitBreaker.failures = 0;
      this.log(`Service recovered: ${service.name}`, "success");
    }, 10000);
  }

  networkPartition() {
    const numServices = Math.floor(this.services.length / 2);
    const affectedServices = this.services.slice(0, numServices);

    affectedServices.forEach((service) => {
      service.status = "degraded";
      service.metrics.latency += 1000;
    });

    this.log(`Network partition affecting ${numServices} services`, "error");

    setTimeout(() => {
      affectedServices.forEach((service) => {
        service.status = "healthy";
        service.metrics.latency = Math.max(0, service.metrics.latency - 1000);
      });
      this.log("Network partition resolved", "success");
    }, 8000);
  }

  memoryLeak() {
    const service =
      this.services[Math.floor(Math.random() * this.services.length)];
    this.log(`Memory leak detected in ${service.name}`, "warning");

    const interval = setInterval(() => {
      service.metrics.memory = Math.min(100, service.metrics.memory + 10);
      if (service.metrics.memory >= 95) {
        service.status = "unhealthy";
        clearInterval(interval);
        this.log(`${service.name} crashed due to memory leak`, "error");
        setTimeout(() => {
          service.metrics.memory = 30;
          service.status = "healthy";
          this.log(`${service.name} restarted`, "success");
        }, 3000);
      }
    }, 1000);
  }

  healAllServices() {
    this.services.forEach((service) => {
      service.status = "healthy";
      service.metrics.cpu = Math.random() * 30;
      service.metrics.memory = Math.random() * 40;
      service.metrics.latency = 0;
      service.circuitBreaker = { failures: 0, state: "closed" };
    });
    this.log("All services healed", "success");
    this.renderArchitecture();
  }

  updateRequestRate(value) {
    this.requestRate = parseInt(value);
    document.getElementById("rpsValue").textContent = value;
  }

  updateFailureRate(value) {
    this.failureRate = parseInt(value);
    document.getElementById("failureValue").textContent = value;
  }

  switchTab(tabName) {
    document
      .querySelectorAll(".tab")
      .forEach((tab) => tab.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));

    event.target.classList.add("active");
    document.getElementById(tabName).classList.add("active");
  }
}

const simulator = new MicroservicesSimulator();
