//  STORE 
function createStore(reducer, initialState) {
  let state = initialState;
  let listeners = [];

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach(l => l());
    },
    subscribe(listener) {
      listeners.push(listener);
    }
  };
}

// REDUCER 
function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "RESET":
      return { count: 0 };
    default:
      return state;
  }
}

//  TIME TRAVEL 
let history = [];
let pointer = -1;

const store = createStore(reducer, { count: 0 });

function record(action) {
  history = history.slice(0, pointer + 1);
  history.push({
    action,
    state: JSON.parse(JSON.stringify(store.getState()))
  });
  pointer++;
}

//  UI 
const currentStateEl = document.getElementById("currentState");
const historyEl = document.getElementById("history");

function render() {
  currentStateEl.textContent = JSON.stringify(store.getState(), null, 2);
  historyEl.innerHTML = "";

  history.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${index}: ${item.action.type}`;
    if (index === pointer) li.classList.add("active");

    li.onclick = () => jumpTo(index);
    historyEl.appendChild(li);
  });
}

function dispatch(action) {
  store.dispatch(action);
  record(action);
  render();
}

function jumpTo(index) {
  pointer = index;
  store.dispatch({ type: "__JUMP__", state: history[index].state });
  store.getState = () => history[index].state;
  render();
}

// CONTROLS 
document.querySelectorAll("[data-action]").forEach(btn => {
  btn.onclick = () => {
    const type = btn.dataset.action.toUpperCase();
    dispatch({ type });
  };
});

document.getElementById("undoBtn").onclick = () => {
  if (pointer > 0) jumpTo(pointer - 1);
};

document.getElementById("redoBtn").onclick = () => {
  if (pointer < history.length - 1) jumpTo(pointer + 1);
};

// Initial state
record({ type: "INIT" });
render();