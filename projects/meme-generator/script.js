const captions = [
    "When your code works but you don’t know why",
    "Me: I'll sleep early today 🤡",
    "Debugging is just emotional damage",
    "That moment when tests pass",
    "Attendance is temporary, regret is permanent",
    "When you submit without testing",
    "99 bugs in the code, take one down, 127 bugs now",
    "Coding at 2 AM hits different",
    "Monday mornings be like",
    "When you find out the deadline was yesterday",
    "Me pretending to understand what's happening",
    "First time? No, this is my fifth attempt",
    "My code: Fine. Also my code: 💀",
    "Coffee fixes everything... right?",
    "When someone asks 'Did you test it?'",
    "POV: You just deleted the wrong file",
    "My commit messages vs my actual code",
    "Stack Overflow: 'Have you tried turning it off?'",
    "When production breaks at 11:59 PM",
    "Me looking at my code from 3 months ago",
    "That one person who actually reads the docs",
    "When someone says 'it works on my machine'",
    "Ctrl+Z saves relationships",
    "That feeling when you finally fix the bug",
    "Why is everyone looking at me in meetings?",
    "Me at work vs me at home",
    "Plot twist: It was a typo all along",
    "When the design is perfect but code is chaos",
    "Me: *ships code* Also me: *immediately regrets*",
    "Your code is poetry... tragic poetry"
];

const memes = [
    "https://i.imgflip.com/30b1gx.jpg", // Drake
    "https://i.imgflip.com/1ur9b0.jpg", // Distracted Boyfriend
    "https://i.imgflip.com/1g8my4.jpg", // Two Buttons
    "https://i.imgflip.com/1jwhww.jpg", // Expanding Brain
    "https://i.imgflip.com/2bgj5.jpg", // Futurama Fry
    "https://i.imgflip.com/4t0m5.jpg", // Woman Yelling at Cat
    "https://i.imgflip.com/37lii5.jpg", // Spongebob Mocking
    "https://i.imgflip.com/345v97.jpg", // Change My Mind
    "https://i.imgflip.com/26jxvz.jpg", // Always Has Been
    "https://i.imgflip.com/50lvsy.jpg", // Bernie Sanders Mittens
    "https://i.imgflip.com/1a7eab.jpg", // Not Bad
    "https://i.imgflip.com/1bik3i.jpg", // Me and the Boys
    "https://i.imgflip.com/23ls5.jpg", // This Is Fine
    "https://i.imgflip.com/2w3iw9.jpg", // Epic Handshake
    "https://i.imgflip.com/55adyw.jpg", // You Get What You Deserve
    "https://i.imgflip.com/2r3umj.jpg", // Brain Expansion
    "https://i.imgflip.com/12p7f6.jpg", // Squidward Tentacles
    "https://i.imgflip.com/1bhf.jpg", // Me Gusta
    "https://i.imgflip.com/1tl71a.jpg", // Distracted Boyfriend Alt
    "https://i.imgflip.com/1t3rgb.jpg", // Third World Success Kid
    "https://i.imgflip.com/15bv7i.jpg", // Simpsons Homer Bush
    "https://i.imgflip.com/3qmh9z.jpg", // No One Cares
    "https://i.imgflip.com/5a5qyb.jpg", // Corporate Needs You
    "https://i.imgflip.com/33w02w.jpg", // This is Brilliant
    "https://i.imgflip.com/1w7ylt.jpg"  // One Does Not Simply
];

function generateMeme() {
    const randomCaption = captions[Math.floor(Math.random() * captions.length)];
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];

    document.getElementById("caption").innerText = randomCaption;
    document.getElementById("memeImage").src = randomMeme;
}
