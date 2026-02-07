function formatCode() {
  const code = document.getElementById("inputCode").value;
  const language = document.getElementById("language").value;
  let formattedCode = "";

  if (!code.trim()) {
    alert("Please enter some code to format");
    return;
  }

  if (language === "html") {
    formattedCode = formatHTML(code);
  } 
  else if (language === "css") {
    formattedCode = formatCSS(code);
  } 
  else if (language === "js") {
    formattedCode = formatJS(code);
  }

  document.getElementById("outputCode").value = formattedCode;
}

function copyCode() {
  const outputCode = document.getElementById("outputCode").value;
  if (!outputCode.trim()) {
    alert("No formatted code to copy");
    return;
  }
  navigator.clipboard.writeText(outputCode).then(() => {
    const btn = document.querySelector('.copy-btn');
    const originalText = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    alert('Failed to copy code');
  });
}

/* ===== Enhanced Formatters ===== */

function formatHTML(code) {
  let formatted = code
    .replace(/></g, ">\n<")
    .replace(/\s{2,}/g, " ")
    .trim();
  
  // Add proper indentation
  let indent = 0;
  const lines = formatted.split('\n');
  const result = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('</')) indent--;
    result.push('  '.repeat(Math.max(0, indent)) + trimmed);
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      indent++;
    }
  });
  
  return result.join('\n');
}

function formatCSS(code) {
  let formatted = code
    .replace(/{/g, " {\n  ")
    .replace(/;/g, ";\n  ")
    .replace(/}/g, "\n}\n")
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return formatted;
}

function formatJS(code) {
  let formatted = code
    .replace(/{/g, " {\n  ")
    .replace(/;/g, ";\n  ")
    .replace(/}/g, "\n}\n")
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return formatted;
}
