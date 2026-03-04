const rawHtml = document.getElementById('rawHtml');
const formattedHtml = document.getElementById('formattedHtml');
const formatBtn = document.getElementById('formatBtn');
const minifyBtn = document.getElementById('minifyBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearInputBtn = document.getElementById('clearInputBtn');
const clearOutputBtn = document.getElementById('clearOutputBtn');
const themeToggle = document.getElementById('themeToggle');
const livePreview = document.getElementById('livePreview');

function formatHTML(html) {
	// Improved HTML beautifier
	let tab = '    ';
	let result = '';
	let indent = 0;
	html = html.replace(/>\s+</g, '><'); // Remove whitespace between tags
	html.split(/(?=<)/g).forEach(line => {
		if (/^<\/.+>/.test(line)) indent--;
		result += tab.repeat(indent) + line.trim() + '\n';
		if (/^<[^!/].*[^/]?>$/.test(line) && !/^<.*input|br|hr|img|meta|link/i.test(line)) indent++;
	});
	return result.trim();
}

function minifyHTML(html) {
	// Remove comments, whitespace between tags, and line breaks
	return html.replace(/<!--.*?-->/gs, '')
		.replace(/>\s+</g, '><')
		.replace(/\n/g, '')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

function updateLivePreview(html) {
	livePreview.srcdoc = html;
}

formatBtn.addEventListener('click', () => {
	const html = rawHtml.value;
	const beautified = html ? formatHTML(html) : '';
	formattedHtml.value = beautified;
	updateLivePreview(beautified);
});

minifyBtn.addEventListener('click', () => {
	const html = rawHtml.value;
	const minified = html ? minifyHTML(html) : '';
	formattedHtml.value = minified;
	updateLivePreview(minified);
});

copyBtn.addEventListener('click', () => {
	formattedHtml.select();
	document.execCommand('copy');
	copyBtn.textContent = 'Copied!';
	setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
});

downloadBtn.addEventListener('click', () => {
	const html = formattedHtml.value;
	if (!html) return;
	const blob = new Blob([html], { type: 'text/html' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = 'formatted.html';
	a.click();
});

clearInputBtn.addEventListener('click', () => {
	rawHtml.value = '';
});

clearOutputBtn.addEventListener('click', () => {
	formattedHtml.value = '';
	updateLivePreview('');
});

themeToggle.addEventListener('click', () => {
	document.body.classList.toggle('dark');
	themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Live preview on input
rawHtml.addEventListener('input', () => {
	updateLivePreview(rawHtml.value);
});
