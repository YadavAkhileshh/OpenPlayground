const STORIES = {
  mystery: {
    titles: [
      "The Vanishing Hour",
      "The Third Envelope",
      "What Mrs. Hartley Knew",
      "The Curator's Secret",
    ],
    openings: [
      `The letter arrived on a Tuesday, which Detective Marlowe always considered suspicious. Tuesdays were the day people made mistakes — they were too far from the weekend to be careful, too close to Monday to have recovered their wits. He turned the envelope over once in his gloved hand, noting the absence of a return address, the unusual weight, and the faint smell of cedar that clung to the paper like a confession half-spoken.`,
      `She had been missing for exactly eleven days when the clockwork music box on her mantelpiece began to play — a melody no one in the house recognized, in a key that didn't quite belong to any instrument they'd heard before. Inspector Caldwell pressed his ear to the cold mahogany and listened until the last note wound itself back into silence.`,
    ],
    continuations: [
      `"There's something you should know," said the man at the door — a Mr. Fennick, according to his card — and those were the last honest words he would speak for a very long time. He had the hands of someone who had recently held something too tightly and let go too late.`,
      `The basement held nothing remarkable: a boiler, three seasons of canned peaches, and a single photograph tacked without ceremony to the wall behind the furnace. It showed four people at a pier. Three of them were smiling. The fourth was looking at something just outside the frame — something that had made them stop entirely.`,
      `The suspect's alibi was perfect, which meant it was fabricated. In Marlowe's experience, genuine innocence was always flawed, always inconsistent, always embarrassed by itself. Only lies arrived fully formed.`,
    ],
  },
  scifi: {
    titles: [
      "The Slow Collapse",
      "Remnants of 2489",
      "Beyond the Helix Gate",
      "What the Probes Remember",
    ],
    openings: [
      `The signal had traveled for nine thousand years to reach the satellite array orbiting Europa. When the translation algorithms finally finished their work — one hundred and twelve days later, using every processor on three moons — the message was seven words long: Do not answer. We cannot protect you.`,
      `Commander Voss had been awake for six minutes before she understood that the ship had grown. Not expanded — grown. The walls of her cabin showed the faint tracery of new veins, pale blue and pulsing just below the surface, and the air tasted faintly of something she associated with forests on Earth.`,
    ],
    continuations: [
      `The last archive of human language was stored in a structure no larger than a fist, orbiting a red dwarf in what had once been called the Boötes Void. It contained 2.3 million languages, seventeen of which had never been spoken aloud — only written, in materials that had outlasted every civilization that had created them.`,
      `"It's learning," said Dr. Rhen quietly, watching the readouts scroll. She did not mean the AI. She meant the star.`,
      `On the colony ships, children were born who had never seen a sky that wasn't manufactured. They grew up knowing what weather was supposed to look like, what rain sounded like on a tin roof, what distance meant — and they carried all of this knowledge the way you might carry a photograph of someone you had never met but had been told to love.`,
    ],
  },
  horror: {
    titles: [
      "The Hollow Season",
      "When the Walls Learn",
      "Below the Floorboards",
      "The Neighbor's Garden",
    ],
    openings: [
      `The house had been empty for eight years, which was how long it took the new owners to stop noticing the handprints. They appeared on the inside of windows during rain, pressed flat against the glass from within rooms that no one entered. Small. Child-sized. Warm to the touch, even in January.`,
      `She began keeping a log the second week, after she realized the sound wasn't coming from outside. It came from between the walls — a slow, patient scraping that started precisely at 3:04 a.m. and stopped exactly forty minutes later. On the twelfth night, she left her hand against the plaster and felt it press back.`,
    ],
    continuations: [
      `The children in the neighborhood had stopped walking past the elm tree on Verne Street. When asked why, they gave the same answer without having discussed it: "It's listening." The tree had not changed. It stood where it always had. But its shadow, the residents began to notice, no longer matched the angle of the sun.`,
      `Father Brennan had performed ninety-one exorcisms over thirty years of ministry, and he had stopped believing in them forty-one years before that. But the thing in the girl's room made him forget everything he no longer believed, one certainty at a time.`,
      `The attic smelled like iron and old wood and something else — a low, wet smell she couldn't place until she realized it was the smell of a living thing, breathing slowly in the dark, conserving itself.`,
    ],
  },
  romance: {
    titles: [
      "The Last Train North",
      "Before the Leaves Turn",
      "A Language Only We Knew",
      "The Bookshop on Rue Valois",
    ],
    openings: [
      `She had decided, somewhere between the third glass of Burgundy and the rain beginning to fall against the café window, that she was not going to fall in love in Paris. It was too obvious. She had read all the books. She knew all the rules. And then he sat down across from her without asking and ordered two more glasses, and said: "You look like someone who just changed their mind about something."`,
      `They met the way people who are meant to find each other always do — at the worst possible moment, in the wrong city, with someone else's umbrella between them and the rain. He said he was sorry. She said the umbrella wasn't hers either. They stood beneath it anyway.`,
    ],
    continuations: [
      `The problem with loving someone careful was that you had to become reckless for both of you. Mara had always known this. She had simply never expected to enjoy it.`,
      `He left a book on her doorstep every Thursday for a month before she finally put a note inside the one she returned: I've read this one. Try the next shelf down.`,
      `She had been in the habit of cataloguing what people carried — bags, umbrellas, the particular weight of expectation — and what she noticed about him, from the beginning, was that he carried nothing he wasn't willing to put down.`,
    ],
  },
  adventure: {
    titles: [
      "The Map with No Edge",
      "Into the Unmeasured South",
      "What the Tides Kept",
      "The Cartographer's Gamble",
    ],
    openings: [
      `The map ended at the shoreline, as all maps eventually do — but it was what had been written below the final longitude that made Captain Reyes fold it carefully, pocket it, and begin making arrangements to disobey every direct order she had ever received. In the margin, in ink that was newer than the rest: They found it. Three months. Go now.`,
      `He had been hiking for nine days when the valley revealed itself — a depression in the mountain that no satellite had charted, no survey team had recorded, tucked into the geography with the deliberateness of something hidden rather than overlooked. Inside it: ruins, a fire that was still warm, and a journal written in a language he recognized as his grandmother's.`,
    ],
    continuations: [
      `The river changed direction on the fourth day. Not subtly — not the gradual curve of a waterway finding its grade — but decisively, overnight, as though it had been waiting for them to be deep enough in to make turning back seem equal to going forward.`,
      `"The stories say there are three gates," said their guide, not looking up from the fire. "The first one everyone finds. The second one finds you, if you're patient. The third one you never find at all — but it opens anyway, when the time is right, whether you're ready or not."`,
      `She had climbed the mountain the first time to prove something to herself and the second time to undo it. The third time, she brought nothing — no gear, no plan, no reason she could name — and that was when it finally let her reach the top.`,
    ],
  },
};

let currentGenre = "mystery";
let passageIndex = 0;
let pageNum = 1;
let wordCount = 0;
let isTyping = false;
let storyHistory = [];

document.querySelectorAll(".genre-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (isTyping) return;
    document
      .querySelectorAll(".genre-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentGenre = btn.dataset.genre;
    resetStory();
  });
});

function resetStory() {
  passageIndex = 0;
  pageNum = 1;
  wordCount = 0;
  storyHistory = [];
  document.getElementById("page-num").textContent = "Page 1";
  document.getElementById("word-count").textContent = "0 words";
  const genre = STORIES[currentGenre];
  const title = genre.titles[Math.floor(Math.random() * genre.titles.length)];
  document.getElementById("chapter-title").textContent = title;
  document.getElementById("story-text").innerHTML =
    '<span class="cursor"></span>';
  generate();
}

function pickText() {
  const genre = STORIES[currentGenre];
  if (passageIndex === 0) {
    return genre.openings[Math.floor(Math.random() * genre.openings.length)];
  }
  const pool = genre.continuations.filter((_, i) => !storyHistory.includes(i));
  if (!pool.length) storyHistory = [];
  const available = genre.continuations.filter(
    (_, i) => !storyHistory.includes(i),
  );
  const pick = Math.floor(Math.random() * available.length);
  storyHistory.push(genre.continuations.indexOf(available[pick]));
  return available[pick];
}

async function generate() {
  if (isTyping) return;
  isTyping = true;
  document.getElementById("gen-btn").disabled = true;

  const storyEl = document.getElementById("story-text");
  if (passageIndex > 0) {
    storyEl.innerHTML += "<br><br>";
    pageNum++;
    document.getElementById("page-num").textContent = `Page ${pageNum}`;
  } else {
    storyEl.innerHTML = "";
  }

  const text = pickText();
  const span = document.createElement("span");
  storyEl.appendChild(span);
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  storyEl.appendChild(cursor);

  let i = 0;
  await new Promise((resolve) => {
    function type() {
      if (i < text.length) {
        span.appendChild(document.createTextNode(text[i]));
        i++;
        wordCount = storyEl.textContent
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        document.getElementById("word-count").textContent =
          `${wordCount} words`;
        const c = text[i - 1];
        setTimeout(
          type,
          c === "." || c === "!" || c === "?" ? 60 : c === "," ? 30 : 18,
        );
      } else {
        resolve();
      }
    }
    type();
  });

  passageIndex++;
  isTyping = false;
  document.getElementById("gen-btn").disabled = false;
}

resetStory();
