const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs.",
    "I told my computer I needed a break. It froze.",
    "Debugging: Being the detective in a crime movie where you are also the murderer.",
    "Why did the JavaScript developer go broke? Because they kept losing their cache.",
    "Why do Java developers wear glasses? Because they don’t C#.",
    "My code works. I have no idea why.",
    "There are only 10 types of people in the world: those who understand binary and those who don’t.",
    "I changed my password to 'incorrect'. Now when I forget it, my computer reminds me."
  ];
  
  const jokeEl = document.getElementById("joke");
  const btn = document.getElementById("jokeBtn");
  
  btn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * jokes.length);
    jokeEl.textContent = jokes[randomIndex];
  });
  