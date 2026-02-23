class TimeDiary {
  constructor() {
    this.messages = [];
    this.currentTimeZone = "present";
    this.timeOffset = 0; // years offset from present
    this.timeWarpActive = false;

    this.init();
  }

  async init() {
    await this.loadTimeData();
    this.setupEventListeners();
    this.updateTimeDisplay();
    this.loadMessagesFromStorage();
    this.startChronometer();
    this.createPortals();
    this.startTimeVortex();
  }

  async loadTimeData() {
    try {
      const response = await fetch("project.json");
      const data = await response.json();
      this.timeQuotes = data.timeQuotes;
      this.eraColors = data.eraColors;
    } catch (error) {
      console.error("Failed to load time data:", error);
      // Fallback quotes
      this.timeQuotes = [
        "Time is a river without banks",
        "The only reason for time is so that everything doesn't happen at once",
        "Time is what we want most, but what we use worst",
      ];
    }
  }

  setupEventListeners() {
    document.getElementById("pastBtn").addEventListener("click", () => {
      this.travelToPast();
    });

    document.getElementById("futureBtn").addEventListener("click", () => {
      this.travelToFuture();
    });

    document.getElementById("sendTimeBtn").addEventListener("click", () => {
      this.sendThroughTime();
    });

    document.getElementById("timeJump").addEventListener("change", (e) => {
      this.timeOffset = parseInt(e.target.value);
      this.updateTimeZone();
    });

    // Keyboard shortcut: Ctrl+Enter to send
    document.getElementById("timeLetter").addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.sendThroughTime();
      }
    });
  }

  travelToPast() {
    this.timeWarp("past");
    this.timeOffset = Math.max(-100, this.timeOffset - 10);
    this.updateTimeZone();
    this.addMessage("You traveled 10 years into the past...", "past");
  }

  travelToFuture() {
    this.timeWarp("future");
    this.timeOffset = Math.min(100, this.timeOffset + 10);
    this.updateTimeZone();
    this.addMessage("You jumped 10 years into the future...", "future");
  }

  timeWarp(direction) {
    if (this.timeWarpActive) return;

    this.timeWarpActive = true;
    const container = document.querySelector(".diary-container");
    container.classList.add("time-warp");

    // Change colors based on direction
    const vortex = document.getElementById("timeVortex");
    if (direction === "past") {
      vortex.style.background =
        "conic-gradient(from 0deg, #ff6b6b, #ffb3b3, #ff6b6b)";
    } else {
      vortex.style.background =
        "conic-gradient(from 0deg, #4ecdc4, #a8e6cf, #4ecdc4)";
    }

    setTimeout(() => {
      container.classList.remove("time-warp");
      this.timeWarpActive = false;
    }, 500);
  }

  updateTimeZone() {
    const timeZoneElement = document.getElementById("currentTimeZone");
    const timeDate = document.getElementById("timeDate");

    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setFullYear(now.getFullYear() + this.timeOffset);

    if (this.timeOffset < 0) {
      this.currentTimeZone = "past";
      timeZoneElement.textContent = `🔴 PAST (${Math.abs(this.timeOffset)} years ago)`;
      timeZoneElement.style.color = "#ff6b6b";
    } else if (this.timeOffset > 0) {
      this.currentTimeZone = "future";
      timeZoneElement.textContent = `🔵 FUTURE (${this.timeOffset} years ahead)`;
      timeZoneElement.style.color = "#4ecdc4";
    } else {
      this.currentTimeZone = "present";
      timeZoneElement.textContent = `⚪ PRESENT`;
      timeZoneElement.style.color = "#ffffff";
    }

    timeDate.textContent = futureDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Update capsule border color
    const capsule = document.querySelector(".time-capsule");
    capsule.style.borderColor = this.getCurrentEraColor();
  }

  getCurrentEraColor() {
    if (this.timeOffset < 0) return "#ff6b6b";
    if (this.timeOffset > 0) return "#4ecdc4";
    return "#ffffff";
  }

  sendThroughTime() {
    const letter = document.getElementById("timeLetter").value.trim();
    if (!letter) {
      this.addMessage("Cannot send empty messages through time...", "present");
      return;
    }

    const targetYear = this.timeOffset;
    const message = {
      id: Date.now(),
      text: letter,
      fromYear: 0, // present
      toYear: targetYear,
      timestamp: new Date().toISOString(),
      emotions: this.analyzeEmotions(letter),
    };

    // Add visual effect
    this.createTimeRipple();

    // Save message
    this.messages.unshift(message);
    if (this.messages.length > 20) this.messages.pop();

    // Store in localStorage (simulating time travel storage)
    const timeCapsules = JSON.parse(
      localStorage.getItem("timeCapsules") || "[]",
    );
    timeCapsules.unshift({
      ...message,
      received: false,
      deliveryTime: Date.now() + Math.abs(targetYear) * 1000, // Simulate time travel delay
    });
    localStorage.setItem("timeCapsules", JSON.stringify(timeCapsules));

    // Show confirmation
    const targetTime =
      targetYear === 0
        ? "present"
        : targetYear < 0
          ? `${Math.abs(targetYear)} years past`
          : `${targetYear} years future`;
    this.addMessage(`📨 Message sent to ${targetTime}!`, this.currentTimeZone);

    // Clear input
    document.getElementById("timeLetter").value = "";

    // Update timeline
    this.updateMessageStream();
  }

  createTimeRipple() {
    const ripple = document.createElement("div");
    ripple.className = "time-ripple-large";
    ripple.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, #fff, transparent);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: timeRipple 1s ease-out forwards;
            z-index: 1000;
        `;
    document.body.appendChild(ripple);

    setTimeout(() => ripple.remove(), 1000);
  }

  analyzeEmotions(text) {
    const emotions = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes("love") || lowerText.includes("happy"))
      emotions.push("❤️");
    if (lowerText.includes("sad") || lowerText.includes("cry"))
      emotions.push("😢");
    if (lowerText.includes("future") || lowerText.includes("tomorrow"))
      emotions.push("🚀");
    if (lowerText.includes("past") || lowerText.includes("remember"))
      emotions.push("📜");
    if (lowerText.includes("wish") || lowerText.includes("hope"))
      emotions.push("✨");

    return emotions.length ? emotions : ["💫"];
  }

  addMessage(text, type) {
    const stream = document.getElementById("messageStream");
    const message = document.createElement("div");
    message.className = `time-message message-${type}`;
    message.textContent = `⏰ ${new Date().toLocaleTimeString()} - ${text}`;

    stream.insertBefore(message, stream.firstChild);

    // Keep only last 10 messages
    while (stream.children.length > 10) {
      stream.removeChild(stream.lastChild);
    }
  }

  loadMessagesFromStorage() {
    const timeCapsules = JSON.parse(
      localStorage.getItem("timeCapsules") || "[]",
    );
    const now = Date.now();

    // Check for delivered messages
    timeCapsules.forEach((capsule) => {
      if (!capsule.received && capsule.deliveryTime <= now) {
        capsule.received = true;
        this.addMessage(
          `✨ Message received from ${capsule.fromYear === 0 ? "present" : "past"}!`,
          "present",
        );
        this.messages.unshift(capsule);
      }
    });

    localStorage.setItem("timeCapsules", JSON.stringify(timeCapsules));
    this.updateMessageStream();
  }

  updateMessageStream() {
    // Display recent messages in timeline
    const stream = document.getElementById("messageStream");
    stream.innerHTML = this.messages
      .slice(0, 5)
      .map((msg) => {
        const yearDiff = msg.toYear;
        const type =
          yearDiff < 0 ? "past" : yearDiff > 0 ? "future" : "present";
        return `
                <div class="time-message message-${type}">
                    <small>${new Date(msg.timestamp).toLocaleString()}</small><br>
                    "${msg.text.substring(0, 50)}${msg.text.length > 50 ? "..." : ""}"
                    ${msg.emotions ? msg.emotions.join(" ") : ""}
                </div>
            `;
      })
      .join("");
  }

  startChronometer() {
    const chrono = document.getElementById("chronometer");
    let seconds = 0;

    setInterval(() => {
      seconds++;
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      chrono.textContent = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

      // Add random time quotes
      if (seconds % 30 === 0 && this.timeQuotes) {
        const quote =
          this.timeQuotes[Math.floor(Math.random() * this.timeQuotes.length)];
        this.addMessage(`"${quote}"`, "present");
      }
    }, 1000);
  }

  createPortals() {
    const portals = document.getElementById("timePortals");
    for (let i = 0; i < 5; i++) {
      const portal = document.createElement("div");
      portal.className = "portal";
      portal.style.left = Math.random() * 100 + "%";
      portal.style.top = Math.random() * 100 + "%";
      portal.style.animationDelay = Math.random() * 5 + "s";
      portals.appendChild(portal);
    }
  }

  startTimeVortex() {
    const vortex = document.getElementById("timeVortex");
    let hue = 0;

    setInterval(() => {
      hue = (hue + 1) % 360;
      if (!this.timeWarpActive) {
        vortex.style.background = `conic-gradient(from ${hue}deg, #ff6b6b, #4ecdc4, #a8e6cf, #ff6b6b)`;
      }
    }, 100);
  }
}

// Add keyframe animation dynamically
const style = document.createElement("style");
style.textContent = `
    @keyframes timeRipple {
        0% {
            width: 10px;
            height: 10px;
            opacity: 0.8;
        }
        100% {
            width: 500px;
            height: 500px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize
const timeDiary = new TimeDiary();
