const snippets = document.querySelectorAll('.snippet');

for (let i = 0; i < snippets.length; i++) {
  snippets[i].addEventListener('mouseleave', clearTooltip);
  snippets[i].addEventListener('blur', clearTooltip);
}

function showTooltip(el, msg) {
  el.setAttribute('class', 'snippet tooltip');
  el.setAttribute('aria-label', msg);
}

function clearTooltip(e) {
  e.currentTarget.setAttribute('class', 'snippet');
  e.currentTarget.removeAttribute('aria-label');
}

const clipboardSnippets = new ClipboardJS('.snippet', {
  text: trigger => trigger.getAttribute('data-title')
});

clipboardSnippets.on('success', e => {
  e.clearSelection();
  showTooltip(e.trigger, 'Copied!');
});

clipboardSnippets.on('error', e => {
  showTooltip(e.trigger, 'Copy failed!');
});