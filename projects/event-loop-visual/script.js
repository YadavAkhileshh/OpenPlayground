/* =========================================================
   JavaScript Event Loop Visual Debugger
   ========================================================= */

/* ================= DOM REFERENCES ================= */

const callStackEl = document.getElementById("callStack");
const microtaskQueueEl = document.getElementById("microtaskQueue");
const callbackQueueEl = document.getElementById("callbackQueue");
const logContainer = document.getElementById("logContainer");

const syncBtn = document.getElementById("syncBtn");
const timeoutBtn = document.getElementById("timeoutBtn");
const promiseBtn = document.getElementById("promiseBtn");
const asyncBtn = document.getElementById("asyncBtn");
const clearBtn = document.getElementById("clearBtn");

/* ================= UTILITIES ================= */

function log(message) {
  const div = document.createElement("div");
  div.className = "log-entry";
  div.innerText = message;
  logContainer.appendChild(div);
  logContainer.scrollTop = logContainer.scrollHeight;
}

function createItem(text, type) {
  const div = document.createElement("div");
  div.className = `item ${type}`;
  div.innerText = text;
  return div;
}

/* ================= STACK OPERATIONS ================= */

function pushCall(name) {
  callStackEl.appendChild(createItem(name, "call"));
  log(`Pushed to call stack: ${name}`);
}

function popCall() {
  const item = callStackEl.lastElementChild;
  if (item) {
    callStackEl.removeChild(item);
    log(`Popped from call stack`);
  }
}

function enqueueMicrotask(name) {
  microtaskQueueEl.appendChild(createItem(name, "micro"));
  log(`Enqueued microtask: ${name}`);
}

function enqueueCallback(name) {
  callbackQueueEl.appendChild(createItem(name, "callback"));
  log(`Enqueued callback: ${name}`);
}

/* ================= EVENT LOOP SIM ================= */

function runEventLoop() {
  if (microtaskQueueEl.children.length > 0) {
    const task = microtaskQueueEl.lastElementChild;
    microtaskQueueEl.removeChild(task);
    pushCall(task.innerText);

    setTimeout(() => {
      popCall();
      runEventLoop();
    }, 600);

  } else if (callbackQueueEl.children.length > 0) {
    const task = callbackQueueEl.lastElementChild;
    callbackQueueEl.removeChild(task);
    pushCall(task.innerText);

    setTimeout(() => {
      popCall();
      runEventLoop();
    }, 600);
  }
}

/* ================= DEMOS ================= */

syncBtn.addEventListener("click", () => {
  pushCall("syncFunction()");
  setTimeout(popCall, 600);
});

timeoutBtn.addEventListener("click", () => {
  enqueueCallback("setTimeout()");
  setTimeout(runEventLoop, 800);
});

promiseBtn.addEventListener("click", () => {
  enqueueMicrotask("Promise.then()");
  setTimeout(runEventLoop, 800);
});

asyncBtn.addEventListener("click", () => {
  pushCall("asyncFunction()");
  enqueueMicrotask("await Promise");
  setTimeout(popCall, 600);
  setTimeout(runEventLoop, 800);
});

/* ================= CLEAR ================= */

clearBtn.addEventListener("click", () => {
  callStackEl.innerHTML = "";
  microtaskQueueEl.innerHTML = "";
  callbackQueueEl.innerHTML = "";
  logContainer.innerHTML = "";
});