const splitWords = (s) => s.split(/[\s\-_.]+/).filter((w) => w.length > 0);
const splitLines = (s) => s.split("\n");

const Converters = {
	upper: (s) => s.toUpperCase(),
	lower: (s) => s.toLowerCase(),
	title: (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
	sentence: (s) =>
		s.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase()),
	swap: (s) =>
		s
			.split("")
			.map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
			.join(""),
	alternating: (s) =>
		s
			.split("")
			.map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
			.join(""),
	camel: (s) =>
		splitWords(s)
			.map((w, i) =>
				i === 0
					? w.toLowerCase()
					: w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
			)
			.join(""),
	snake: (s) =>
		splitWords(s)
			.map((w) => w.toLowerCase())
			.join("_"),
	kebab: (s) =>
		splitWords(s)
			.map((w) => w.toLowerCase())
			.join("-"),
	dot: (s) =>
		splitWords(s)
			.map((w) => w.toLowerCase())
			.join("."),
	space: (s) =>
		splitWords(s)
			.map((w) => w.toLowerCase())
			.join(" "),
	vowUp: (s) =>
		s
			.split("")
			.map((c) => (/[aeiou]/i.test(c) ? c.toUpperCase() : c.toLowerCase()))
			.join(""),
	constUp: (s) =>
		s
			.split("")
			.map((c) =>
				!/[aeiou]/i.test(c) && /[a-z]/i.test(c) ? c.toUpperCase() : c.toLowerCase()
			)
			.join(""),
	onlyVow: (s) => s.replace(/[^aeiou\s\n]/gi, ""),
	onlyConst: (s) => s.replace(/[aeiou]/gi, ""),
	vowNum: (s) =>
		s.replace(
			/[aeiou]/gi,
			(m) => ({ a: "4", e: "3", i: "1", o: "0", u: "4" }[m.toLowerCase()] || m)
		),
	revText: (s) => s.split("").reverse().join(""),
	revWordsChars: (s) =>
		s
			.split(" ")
			.map((w) => w.split("").reverse().join(""))
			.join(" "),
	revWordOrder: (s) =>
		splitLines(s)
			.map((l) => l.split(" ").reverse().join(" "))
			.join("\n"),
	initials: (s) =>
		splitWords(s)
			.map((w) => w.charAt(0))
			.join(""),
	invInitials: (s) =>
		splitWords(s)
			.map((w) => w.slice(-1))
			.join(""),
	noSpace: (s) => s.replace(/\s+/g, ""),
	norm: (s) =>
		splitLines(s)
			.map((l) => l.replace(/\s+/g, " ").trim())
			.join("\n"),
	trim: (s) =>
		splitLines(s)
			.map((l) => l.trim())
			.join("\n"),
	customSep: (s, p) => splitWords(s).join(p.sep || "-"),
	joinLines: (s, p) => splitLines(s).join(p.sep || " "),
	remNum: (s) => s.replace(/[0-9]/g, ""),
	remSpec: (s) => s.replace(/[^a-zA-Z0-9\s]/g, ""),
	prependAppend: (s, p) =>
		splitLines(s)
			.map((l) => (p.pre || "") + l + (p.suf || ""))
			.join("\n"),
	numbering: (s, p) => {
		let n = parseInt(p.start) || 1;
		return splitLines(s)
			.map((l, i) => n + i + (p.sep || ". ") + l)
			.join("\n");
	},
	replace: (s, p) => {
		if (!p.find) return s;
		try {
			return p.rx
				? s.replace(new RegExp(p.find, "g"), p.rep)
				: s.split(p.find).join(p.rep);
		} catch (e) {
			return s;
		}
	}
};

const LIBRARY = [
	{ id: "upper", cat: "Basic Letter Case", name: "Upper Case", fn: "upper" },
	{ id: "lower", cat: "Basic Letter Case", name: "Lower Case", fn: "lower" },
	{ id: "title", cat: "Basic Letter Case", name: "Title Case", fn: "title" },
	{
		id: "sentence",
		cat: "Basic Letter Case",
		name: "Sentence Case",
		fn: "sentence"
	},
	{ id: "swap", cat: "Basic Letter Case", name: "Swap Case", fn: "swap" },
	{
		id: "alt",
		cat: "Basic Letter Case",
		name: "Alternating Caps",
		fn: "alternating"
	},
	{ id: "camel", cat: "Programming / Style", name: "Camel Case", fn: "camel" },
	{ id: "snake", cat: "Programming / Style", name: "Snake Case", fn: "snake" },
	{ id: "kebab", cat: "Programming / Style", name: "Kebab Case", fn: "kebab" },
	{ id: "dot", cat: "Programming / Style", name: "Dot Case", fn: "dot" },
	{ id: "space", cat: "Programming / Style", name: "Space Case", fn: "space" },
	{ id: "vowUp", cat: "Vowels & Consonants", name: "Vowels Upper", fn: "vowUp" },
	{
		id: "constUp",
		cat: "Vowels & Consonants",
		name: "Consonants Upper",
		fn: "constUp"
	},
	{
		id: "onlyVow",
		cat: "Vowels & Consonants",
		name: "Only Vowels",
		fn: "onlyVow"
	},
	{
		id: "onlyConst",
		cat: "Vowels & Consonants",
		name: "Only Consonants",
		fn: "onlyConst"
	},
	{
		id: "vowNum",
		cat: "Vowels & Consonants",
		name: "Vowels to Numbers",
		fn: "vowNum"
	},
	{
		id: "revText",
		cat: "Word & Letter Manipulations",
		name: "Reverse Text",
		fn: "revText"
	},
	{
		id: "revWord",
		cat: "Word & Letter Manipulations",
		name: "Reverse Each Word",
		fn: "revWordsChars"
	},
	{
		id: "revOrd",
		cat: "Word & Letter Manipulations",
		name: "Reverse Word Order",
		fn: "revWordOrder"
	},
	{
		id: "init",
		cat: "Word & Letter Manipulations",
		name: "Initials",
		fn: "initials"
	},
	{
		id: "invInit",
		cat: "Word & Letter Manipulations",
		name: "Inverse Initials",
		fn: "invInitials"
	},
	{
		id: "nospace",
		cat: "Spaces & Separators",
		name: "No Spaces",
		fn: "noSpace"
	},
	{
		id: "norm",
		cat: "Spaces & Separators",
		name: "Normalize Spaces",
		fn: "norm"
	},
	{ id: "trim", cat: "Spaces & Separators", name: "Trim Lines", fn: "trim" },
	{
		id: "custSep",
		cat: "Spaces & Separators",
		name: "Custom Separator",
		fn: "customSep",
		params: { sep: "-" },
		render: (id, p) =>
			`<input class="p-input" value="${esc(
				p.sep
			)}" oninput="upd('${id}','sep',this.value)" placeholder="Separator">`
	},
	{
		id: "join",
		cat: "Spaces & Separators",
		name: "Join Lines",
		fn: "joinLines",
		params: { sep: ", " },
		render: (id, p) =>
			`<input class="p-input" value="${esc(
				p.sep
			)}" oninput="upd('${id}','sep',this.value)" placeholder="Delimiter">`
	},
	{
		id: "remNum",
		cat: "Advanced Utilities",
		name: "Remove Numbers",
		fn: "remNum"
	},
	{
		id: "remSpec",
		cat: "Advanced Utilities",
		name: "Remove Special Chars",
		fn: "remSpec"
	},
	{
		id: "preapp",
		cat: "Advanced Utilities",
		name: "Prepend / Append",
		fn: "prependAppend",
		params: { pre: "", suf: "" },
		render: (id, p) =>
			`<div class="p-row"><input class="p-input" value="${esc(
				p.pre
			)}" oninput="upd('${id}','pre',this.value)" placeholder="Prefix"><input class="p-input" value="${esc(
				p.suf
			)}" oninput="upd('${id}','suf',this.value)" placeholder="Suffix"></div>`
	},
	{
		id: "num",
		cat: "Advanced Utilities",
		name: "Line Numbering",
		fn: "numbering",
		params: { start: 1, sep: ". " },
		render: (id, p) =>
			`<div class="p-row"><input type="number" class="p-input" value="${
				p.start
			}" oninput="upd('${id}','start',this.value)"><input class="p-input" value="${esc(
				p.sep
			)}" oninput="upd('${id}','sep',this.value)" placeholder="Separator"></div>`
	},
	{
		id: "replace",
		cat: "Advanced Utilities",
		name: "Find / Replace",
		fn: "replace",
		params: { find: "", rep: "", rx: false },
		render: (id, p) =>
			`<div class="p-row"><input class="p-input" value="${esc(
				p.find
			)}" oninput="upd('${id}','find',this.value)" placeholder="Find..."><label class="p-chk"><input type="checkbox" ${
				p.rx ? "checked" : ""
			} onchange="upd('${id}','rx',this.checked)"> Rx</label></div><input class="p-input" value="${esc(
				p.rep
			)}" oninput="upd('${id}','rep',this.value)" placeholder="Replace with...">`
	}
];

let state = {
	text: "",
	pipeline: [],
	favorites: ["title", "sentence", "trim", "num"]
};
let history = [];
let historyIdx = -1;
let isUndoing = false;
let dragSrcEl = null;
const inEl = document.getElementById("inText");
const outEl = document.getElementById("outText");

function init() {
	injectToastStyles();
	const saved = localStorage.getItem("txtly_v22");
	if (saved) {
		try {
			const s = JSON.parse(saved);
			state.text = s.text || "";
			state.pipeline = s.pipeline || [];
			state.favorites = s.favorites || state.favorites;
			inEl.value = state.text;
			saveState(true);
		} catch (e) {}
	}
	renderLibrary();
	renderPipeline();
	runPipeline();
}

function saveState(force) {
	if (isUndoing) return;
	localStorage.setItem("txtly_v22", JSON.stringify(state));
	const json = JSON.stringify({ t: state.text, p: state.pipeline });
	const last = historyIdx >= 0 ? JSON.stringify(history[historyIdx]) : null;
	if (force || json !== last) {
		if (historyIdx < history.length - 1)
			history = history.slice(0, historyIdx + 1);
		history.push({ t: state.text, p: state.pipeline });
		historyIdx++;
		if (history.length > 50) {
			history.shift();
			historyIdx--;
		}
	}
}

function undo() {
	if (historyIdx > 0) {
		isUndoing = true;
		historyIdx--;
		restore(history[historyIdx]);
		isUndoing = false;
		showToast("Undo Action");
	}
}

function redo() {
	if (historyIdx < history.length - 1) {
		isUndoing = true;
		historyIdx++;
		restore(history[historyIdx]);
		isUndoing = false;
		showToast("Redo Action");
	}
}

function restore(s) {
	state.text = s.t;
	state.pipeline = JSON.parse(JSON.stringify(s.p));
	inEl.value = state.text;
	renderLibrary();
	renderPipeline();
	runPipeline();
}

function resetAll() {
	state.text = "";
	state.pipeline = [];
	inEl.value = "";
	renderPipeline();
	runPipeline();
	saveState();
	showToast("Application Reset");
}

function renderLibrary() {
	const cont = document.getElementById("libraryList");
	const search = document.getElementById("toolSearch").value.toLowerCase();
	cont.innerHTML = "";
	const activeIds = new Set(
		state.pipeline.map((s) => LIBRARY.find((t) => t.id === s.toolId).id)
	);
	const favs = LIBRARY.filter((t) => state.favorites.includes(t.id));

	if (!search) renderAccordion(cont, "Favorites", favs, activeIds, true);
	const groups = {};
	LIBRARY.forEach((t, i) => {
		if (t.name.toLowerCase().includes(search)) {
			if (!groups[t.cat]) groups[t.cat] = [];
			groups[t.cat].push({ ...t, libIdx: i });
		}
	});
	Object.keys(groups).forEach((cat) => {
		renderAccordion(cont, cat, groups[cat], activeIds, false);
	});
}

function renderAccordion(cont, title, tools, activeSet, isOpen) {
	if (tools.length === 0) return;
	const wrap = document.createElement("div");
	wrap.className = `accordion-wrapper acc-item ${isOpen ? "active" : ""}`;
	const html = tools
		.map((t) => {
			const isActive = activeSet.has(t.id) ? "is-active" : "";
			const isFav = state.favorites.includes(t.id) ? "active" : "";
			return `<div class="tool-card ${isActive}"><div class="tool-info"><i class="fa-solid fa-star fav-star ${isFav}" onclick="toggleFav('${t.id}')"></i><span class="tool-name">${t.name}</span></div><div class="tool-actions"><button class="sq-btn add" onclick="addStep('${t.id}')"><i class="fa-solid fa-plus"></i></button><button class="sq-btn run" onclick="runImmediate('${t.id}')"><i class="fa-solid fa-play"></i></button></div></div>`;
		})
		.join("");
	wrap.innerHTML = `<div class="acc-header" onclick="this.parentNode.classList.toggle('active')"><span>${title}</span><i class="fa-solid fa-chevron-down"></i></div><div class="acc-body">${html}</div>`;
	cont.appendChild(wrap);
}

function toggleFav(id) {
	const idx = state.favorites.indexOf(id);
	if (idx > -1) state.favorites.splice(idx, 1);
	else state.favorites.push(id);
	renderLibrary();
	saveState();
}

function addStep(toolId) {
	const t = LIBRARY.find((x) => x.id === toolId);
	state.pipeline.push({
		id: Math.random().toString(36).substr(2),
		toolId: toolId,
		params: t.params ? JSON.parse(JSON.stringify(t.params)) : null
	});
	renderPipeline();
	runPipeline();
	renderLibrary();
	saveState();
	setTimeout(
		() => (document.getElementById("pipelineContainer").scrollTop = 9999),
		50
	);
	showToast(`${t.name} added`);
}

function renderPipeline() {
	const c = document.getElementById("pipelineContainer");
	document.getElementById("stepCount").innerText = state.pipeline.length;
	if (!state.pipeline.length) {
		c.innerHTML = '<div class="msg-empty">Pipeline is empty</div>';
		return;
	}
	c.innerHTML = state.pipeline
		.map((s, i) => {
			const t = LIBRARY.find((x) => x.id === s.toolId);
			return `<div class="pipe-card" draggable="true" data-index="${i}"><div class="card-top"><div class="card-label"><i class="fa-solid fa-grip-vertical drag-handle"></i> ${
				t.name
			}</div><div class="card-ctrls"><button onclick="moveStep(${i},-1)"><i class="fa-solid fa-chevron-up"></i></button><button onclick="moveStep(${i},1)"><i class="fa-solid fa-chevron-down"></i></button><button class="del" onclick="remStep(${i})"><i class="fa-solid fa-xmark"></i></button></div></div>${
				t.render ? t.render(s.id, s.params) : ""
			}</div>`;
		})
		.join("");
	setupDrag();
}

function setupDrag() {
	document.querySelectorAll(".pipe-card").forEach((c) => {
		c.addEventListener("dragstart", (e) => {
			dragSrcEl = c;
			e.dataTransfer.effectAllowed = "move";
			c.classList.add("dragging");
		});
		c.addEventListener("dragend", (e) => {
			c.classList.remove("dragging");
		});
		c.addEventListener("dragover", (e) => e.preventDefault());
		c.addEventListener("drop", (e) => {
			e.stopPropagation();
			const sIdx = parseInt(dragSrcEl.dataset.index);
			const tIdx = parseInt(c.dataset.index);
			if (sIdx !== tIdx) {
				const item = state.pipeline.splice(sIdx, 1)[0];
				state.pipeline.splice(tIdx, 0, item);
				renderPipeline();
				runPipeline();
				saveState();
			}
		});
	});
}

function runPipeline() {
	let txt = state.text;
	state.pipeline.forEach((s) => {
		const t = LIBRARY.find((x) => x.id === s.toolId);
		txt = Converters[t.fn](txt, s.params);
	});
	outEl.value = txt;
	updateCounts();
}

function runPipelineUI() {
	runPipeline();
	outEl.style.boxShadow = "0 0 20px var(--c-accent-glow)";
	setTimeout(() => (outEl.style.boxShadow = "none"), 300);
}

function runImmediate(toolId) {
	const t = LIBRARY.find((x) => x.id === toolId);
	outEl.value = Converters[t.fn](inEl.value, t.params);
	updateCounts();
	showToast(`Ran ${t.name}`);
}

inEl.addEventListener("input", (e) => {
	state.text = e.target.value;
	runPipeline();
	clearTimeout(window.t);
	window.t = setTimeout(() => saveState(), 500);
});

function setInVal(v) {
	inEl.value = v;
	state.text = v;
	runPipeline();
	saveState();
}

function upd(id, k, v) {
	const s = state.pipeline.find((x) => x.id === id);
	if (s) {
		s.params[k] = v;
		runPipeline();
		saveState();
	}
}

function moveStep(i, d) {
	if (i + d >= 0 && i + d < state.pipeline.length) {
		[state.pipeline[i], state.pipeline[i + d]] = [
			state.pipeline[i + d],
			state.pipeline[i]
		];
		renderPipeline();
		runPipeline();
		saveState();
	}
}

function remStep(i) {
	state.pipeline.splice(i, 1);
	renderPipeline();
	runPipeline();
	renderLibrary();
	saveState();
}

function clearPipeline() {
	state.pipeline = [];
	renderPipeline();
	runPipeline();
	renderLibrary();
	saveState();
	showToast("Pipeline Cleared");
}

function esc(s) {
	return s ? s.replace(/"/g, "&quot;") : "";
}

function updateCounts() {
	const iT = inEl.value,
		oT = outEl.value;
	document.getElementById(
		"inStats"
	).innerHTML = ` <span class="counter">Words: ${
		iT.trim() ? iT.trim().split(/\s+/).length : 0
	}</span> <span class="counter">Chars: ${iT.length}</span>`;
	document.getElementById(
		"outStats"
	).innerHTML = ` <span class="counter">Words: ${
		oT.trim() ? oT.trim().split(/\s+/).length : 0
	}</span> <span class="counter">Chars: ${oT.length}</span>`;
}

function injectToastStyles() {
	if (!document.getElementById("toast-style")) {
		const style = document.createElement("style");
		style.id = "toast-style";
		style.textContent = `
            #toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
            .toast { background: rgba(25, 28, 36, 0.95); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 12px 18px; border-radius: 8px; color: #f0f0f0; font-size: 0.9rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 10px; animation: slideIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; pointer-events: all; border-left: 3px solid #1cbb3a; }
            .toast.error { border-left-color: #ff5b5b; }
            .toast i { font-size: 1.1em; }
            .toast.success i { color: #1cbb3a; }
            .toast.error i { color: #ff5b5b; }
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes fadeOut { to { transform: translateX(20px); opacity: 0; } }
        `;
		document.head.appendChild(style);
	}
}

function showToast(message, type = "success") {
	let container = document.getElementById("toast-container");
	if (!container) {
		container = document.createElement("div");
		container.id = "toast-container";
		document.body.appendChild(container);
	}
	const toast = document.createElement("div");
	toast.className = `toast ${type}`;
	let icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
	toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
	container.appendChild(toast);
	setTimeout(() => {
		toast.style.animation = "fadeOut 0.3s forwards";
		setTimeout(() => toast.remove(), 300);
	}, 3000);
}

function formatCopyMsg(text) {
	if (!text) return "Copied!";
	const preview = text.length > 20 ? text.substring(0, 20) + "..." : text;
	return `Copied: "${preview}"`;
}

function fallbackCopyText(text) {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.position = "fixed";
	textArea.style.opacity = "0";
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try {
		const success = document.execCommand("copy");
		if (success) showToast(formatCopyMsg(text));
		else showToast("Copy failed", "error");
	} catch (err) {
		showToast("Copy error", "error");
	}
	document.body.removeChild(textArea);
}

async function copyToClip(id) {
	const el = document.getElementById(id);
	if (!el) return;
	const text = el.value;

	if (navigator.clipboard && navigator.clipboard.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			showToast(formatCopyMsg(text));
			return;
		} catch (err) {
			console.warn("Clipboard API failed, using fallback");
		}
	}
	fallbackCopyText(text);
}

async function pasteToInput() {
	if (navigator.clipboard && navigator.clipboard.readText) {
		try {
			const text = await navigator.clipboard.readText();
			setInVal(text);
			showToast("Pasted from clipboard");
			return;
		} catch (e) {}
	}
	const text = prompt(
		"Browser blocked clipboard access. Please paste text here:"
	);
	if (text !== null) {
		setInVal(text);
		showToast("Pasted!");
	}
}

function loadOutputToInput() {
	setInVal(outEl.value);
	showToast("Output loaded to Input");
}

async function copyPipe() {
	const json = JSON.stringify(state.pipeline);
	if (navigator.clipboard && navigator.clipboard.writeText) {
		try {
			await navigator.clipboard.writeText(json);
			showToast(formatCopyMsg(json));
			return;
		} catch (err) {}
	}
	fallbackCopyText(json);
}

async function pastePipe() {
	let text = "";
	if (navigator.clipboard && navigator.clipboard.readText) {
		try {
			text = await navigator.clipboard.readText();
		} catch (e) {}
	}
	if (!text) {
		text = prompt("Browser blocked clipboard access. Paste pipeline JSON here:");
	}
	if (!text) return;

	try {
		const p = JSON.parse(text);
		if (Array.isArray(p)) {
			state.pipeline = p;
			renderPipeline();
			runPipeline();
			saveState();
			showToast("Pipeline loaded!");
		} else {
			showToast("Invalid JSON data", "error");
		}
	} catch (e) {
		showToast("Invalid JSON string", "error");
	}
}

function exportJSON() {
	const a = document.createElement("a");
	a.href =
		"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
	a.download = "txtly_data.json";
	a.click();
	showToast("File downloaded");
}

function importJSON(el) {
	const r = new FileReader();
	r.onload = (e) => {
		try {
			const d = JSON.parse(e.target.result);
			state.text = d.text !== undefined ? d.text : d.t || "";
			state.pipeline = d.pipeline || d.p || [];
			if (d.favorites) state.favorites = d.favorites;

			inEl.value = state.text;
			renderLibrary();
			renderPipeline();
			runPipeline();
			saveState(true);
			showToast("Configuration imported");
		} catch (e) {
			showToast("File import failed", "error");
		}
		el.value = "";
	};
	if (el.files.length) r.readAsText(el.files[0]);
}

function toggleModal(id) {
	const target = document.getElementById(id);
	if (!target) return;
	const isOpen = target.classList.contains("open");
	document
		.querySelectorAll(".modal-box")
		.forEach((m) => m.classList.remove("open"));
	if (!isOpen) target.classList.add("open");
}

function closeAllModals() {
	document
		.querySelectorAll(".modal-box")
		.forEach((m) => m.classList.remove("open"));
}

window.addEventListener("click", (e) => {
	if (!e.target.closest(".modal-box") && !e.target.closest(".nav-item")) {
		closeAllModals();
	}
});

window.shareTwitter = function () {
	const text =
		"Master your text formatting with Txtly! 🚀 The ultimate case converter.";
	const url = "https://codepen.io/Julibe/full/gbrzRmx";
	const hashtags = "textConvert,coollTools,productivity,tools";
	const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
		text
	)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
	window.open(twitterUrl, "_blank");
};

// ----------------------------------------------------
// EXPOSE FUNCTIONS TO WINDOW SCOPE
// This fixes the "Uncaught ReferenceError: ... is not defined"
// ----------------------------------------------------
window.addStep = addStep;
window.runImmediate = runImmediate;
window.toggleFav = toggleFav;
window.moveStep = moveStep;
window.remStep = remStep;
window.upd = upd;
window.importJSON = importJSON;
window.toggleModal = toggleModal;
window.copyToClip = copyToClip;
window.pasteToInput = pasteToInput;
window.loadOutputToInput = loadOutputToInput;
window.copyPipe = copyPipe;
window.pastePipe = pastePipe;
window.exportJSON = exportJSON;
window.undo = undo;
window.redo = redo;
window.resetAll = resetAll;

// Start the app
init();
