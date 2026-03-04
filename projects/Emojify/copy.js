function copyEmoji(emoji) {
  navigator.clipboard.writeText(emoji).then(() => {
    alert(`Copied ${emoji} to clipboard!`);
  });
}
