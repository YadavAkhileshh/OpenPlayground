function aiGenerate(prompt, tone, platform) {

  if (!prompt.trim()) return "⚠ Please enter a topic first.";

  return `
Tone: ${tone}
Platform: ${platform}

Generated Content:

Here is a ${tone.toLowerCase()} ${platform.toLowerCase()} post about:

"${prompt}"

This content is crafted to match your selected style and audience.
Add your final personal touch before publishing
  `;
}
