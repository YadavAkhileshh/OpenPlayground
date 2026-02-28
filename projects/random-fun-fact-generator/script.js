const facts = [
  "Honey never spoils.",
  "Bananas are berries, but strawberries are not.",
  "Octopuses have three hearts.",
  "A day on Venus is longer than a year on Venus.",
  "Wombat poop is cube-shaped.",
  "Sharks existed before trees.",
  "Humans share DNA with bananas.",
  "There are more stars than grains of sand on Earth.",
  "Butterflies remember being caterpillars.",
  "The Eiffel Tower grows taller in summer.",
  "A single cloud can weigh over a million tons.",
  "Tardigrades can survive in space.",
  "Sloths can hold their breath longer than dolphins.",
  "Dolphins have names for each other.",
  "Octopuses can taste with their suckers.",
  "Koalas have fingerprints like humans.",
  "Cows have best friends.",
  "Lightning is hotter than the sun.",
  "Some metals explode in water.",
  "Snails can sleep for years.",
  "Cats can’t taste sweetness.",
  "A blue whale’s heart is the size of a car.",
  "Hot water can freeze faster than cold water.",
  "You shed thousands of skin cells every minute.",
  "The tongue print is unique.",
  "Scotland has hundreds of words for snow.",
  "Some turtles breathe through their butts.",
  "Cockroaches can live without heads.",
  "Dolphins sleep with one eye open.",
  "Goldfish can recognize human faces.",
  "Elephants can’t jump.",
  "Birds don’t urinate.",
  "Clouds can produce millions of liters of rain.",
  "Ants never sleep.",
  "Bones are stronger than steel by weight.",
  "Octopuses escape almost any enclosure.",
  "A duck’s quack does echo.",
  "Humans can live without a spleen.",
  "Some cats are allergic to humans.",
  "Ice cream was once medicine.",
  "The first computer mouse was wooden.",
  "Ears never stop growing.",
  "Spiders can float using electricity.",
  "The dot over the letter i is called a tittle.",
  "Penguins propose with pebbles.",
  "Some frogs freeze and come back to life.",
  "The brain uses more energy than any organ.",
  "You can’t taste food without saliva.",
  "Cats have many muscles in their ears.",
  "The largest volcano is underwater.",
  "The human eye sees more green shades.",
  "Bananas glow blue under UV light.",
  "The first oranges were green.",
  "Laughing boosts immunity.",
  "Heartbeats can sync with music.",
  "Owls rotate their heads far around.",
  "Old book smell comes from chemicals.",
  "Some fish cough.",
  "Humans glow faintly in the dark.",
  "Bees recognize human faces.",
  "Cats can jump many times their length.",
  "The shortest bone is in the ear.",
  "Taste receptors exist in the lungs.",
  "The brain doesn’t feel pain.",
  "Some turtles live over a century.",
  "The heart beats billions of times.",
  "Butterflies taste with their feet.",
  "Crocodiles can’t stick out their tongues.",
  "Clouds can weigh more than airplanes.",
  "You blink thousands of times daily.",
  "Sloths move slower than grass grows.",
  "Octopuses have blue blood.",
  "Starfish don’t have brains.",
  "Snails have thousands of teeth.",
  "Rats laugh when tickled.",
  "Sea otters hold hands while sleeping.",
  "Jellyfish are mostly water.",
  "Flamingos are naturally pink.",
  "Horses can’t vomit.",
  "Camels have three eyelids.",
  "Goats have rectangular pupils.",
  "Parrots can live for decades.",
  "Antarctica is the driest continent.",
  "The human nose detects many smells.",
  "Frogs absorb water through skin.",
  "Cats sleep most of their lives.",
  "Humans dream every night.",
  "Elephants recognize themselves.",
  "Sharks don’t have bones.",
  "Butterflies live on liquid diets"
];

const btn = document.getElementById("btn");
const backBtn = document.getElementById("back-btn");
const cardInner = document.querySelector(".card-inner");
const factBack = document.getElementById("fact-back");

let autoFlipTimeout = null;

btn.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * facts.length);
  factBack.textContent = facts[randomIndex];
  cardInner.classList.add("flipped");

  // reset any existing auto-flip timer
  if (autoFlipTimeout) {
    clearTimeout(autoFlipTimeout);
  }

  // automatically flip back after 4 seconds
  autoFlipTimeout = setTimeout(() => {
    cardInner.classList.remove("flipped");
    autoFlipTimeout = null;
  }, 4000);
});

backBtn.addEventListener("click", () => {
  cardInner.classList.remove("flipped");
  if (autoFlipTimeout) {
    clearTimeout(autoFlipTimeout);
    autoFlipTimeout = null;
  }
});