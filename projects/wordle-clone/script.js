/* ============================================
   WORDLE CLONE - Complete Game Logic
   ============================================ */

// ==========================================
// SECTION 1: Word Lists
// ==========================================

const ANSWER_WORDS = [
    "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult", "after", "again",
    "agent", "agree", "ahead", "alarm", "album", "alert", "alien", "align", "alive", "alley",
    "allow", "alone", "along", "alter", "among", "angel", "anger", "angle", "angry", "apart",
    "apple", "apply", "arena", "argue", "arise", "armor", "army", "aroma", "aside", "asset",
    "atlas", "avoid", "award", "aware", "badly", "baker", "bases", "basic", "basis", "beach",
    "began", "begin", "being", "below", "bench", "berry", "birth", "black", "blade", "blame",
    "blank", "blast", "blaze", "bleed", "blend", "bless", "blind", "block", "blood", "bloom",
    "blown", "board", "bonus", "boost", "booth", "bound", "brain", "brand", "brave", "bread",
    "break", "breed", "brick", "bride", "brief", "bring", "broad", "broke", "brook", "brown",
    "brush", "buddy", "build", "built", "bunch", "burst", "buyer", "cabin", "cable", "camel",
    "candy", "cargo", "carry", "catch", "cause", "cedar", "chain", "chair", "chaos", "charm",
    "chart", "chase", "cheap", "check", "cheek", "cheer", "chess", "chest", "chief", "child",
    "china", "chose", "chunk", "civic", "civil", "claim", "clash", "class", "clean", "clear",
    "clerk", "click", "cliff", "climb", "cling", "clock", "clone", "close", "cloth", "cloud",
    "coach", "coast", "color", "comet", "comic", "coral", "count", "court", "cover", "crack",
    "craft", "crane", "crash", "crazy", "cream", "creek", "creep", "crime", "crisp", "cross",
    "crowd", "crown", "cruel", "crush", "curve", "cycle", "daily", "dance", "datum", "death",
    "debut", "decay", "delay", "demon", "dense", "depot", "depth", "derby", "desire","digit",
    "dirty", "donor", "doubt", "dough", "draft", "drain", "drake", "drama", "drank", "drawn",
    "dream", "dress", "dried", "drift", "drill", "drink", "drive", "drove", "drown", "dying",
    "eager", "eagle", "early", "earth", "eight", "elder", "elect", "elite", "email", "ember",
    "empty", "enemy", "enjoy", "enter", "entry", "equal", "error", "essay", "event", "every",
    "exact", "exile", "exist", "extra", "fable", "faith", "false", "fancy", "fatal", "fault",
    "feast", "fence", "ferry", "fever", "fiber", "field", "fifth", "fifty", "fight", "final",
    "first", "fixed", "flame", "flash", "fleet", "flesh", "flies", "float", "flood", "floor",
    "flour", "fluid", "flush", "flute", "focal", "focus", "force", "forge", "forth", "forum",
    "found", "frame", "frank", "fraud", "fresh", "front", "frost", "froze", "fruit", "fully",
    "fungi", "gauge", "genre", "ghost", "giant", "given", "glass", "globe", "gloom", "glory",
    "gloss", "glove", "going", "grace", "grade", "grain", "grand", "grant", "graph", "grasp",
    "grass", "grave", "great", "green", "greet", "grief", "grill", "grind", "grip", "gross",
    "group", "grove", "grown", "guard", "guess", "guest", "guide", "guild", "guilt", "guise",
    "habit", "happy", "harsh", "haven", "heart", "heavy", "hedge", "hence", "herbs", "hinge",
    "hobby", "honor", "horse", "hotel", "house", "human", "humor", "hurry", "ideal", "image",
    "imply", "index", "indie", "inner", "input", "irony", "issue", "ivory", "jelly", "jewel",
    "joint", "joker", "judge", "juice", "juicy", "jumbo", "karma", "kayak", "kebab", "knack",
    "kneel", "knife", "knock", "known", "label", "labor", "lance", "large", "laser", "latch",
    "later", "laugh", "layer", "learn", "least", "leave", "legal", "lemon", "level", "light",
    "limit", "linen", "liner", "liver", "local", "logic", "login", "loose", "lover", "lower",
    "loyal", "lunar", "lunch", "lying", "magic", "major", "maker", "manor", "maple", "march",
    "marry", "mason", "match", "mayor", "media", "mercy", "merge", "merit", "metal", "meter",
    "might", "midst", "minor", "minus", "model", "money", "month", "moral", "motor", "mount",
    "mourn", "mouse", "mouth", "movie", "muddy", "music", "naive", "nerve", "never", "night",
    "noble", "noise", "north", "noted", "novel", "nurse", "nylon", "occur", "ocean", "offer",
    "often", "olive", "onset", "opera", "orbit", "order", "organ", "other", "outer", "owned",
    "owner", "oxide", "ozone", "paint", "panel", "panic", "paper", "party", "pasta", "paste",
    "patch", "pause", "peace", "peach", "pearl", "penny", "phase", "phone", "photo", "piano",
    "piece", "pilot", "pinch", "pitch", "pixel", "place", "plain", "plane", "plant", "plate",
    "plaza", "plead", "pluck", "plumb", "plume", "plunge","point", "polar", "popup", "porch",
    "poser", "power", "press", "price", "pride", "prime", "prince","print", "prior", "prize",
    "probe", "prone", "proof", "prose", "proud", "prove", "proxy", "psalm", "pulse", "pupil",
    "purse", "queen", "query", "quest", "queue", "quick", "quiet", "quota", "quote", "radar",
    "radio", "raise", "rally", "ranch", "range", "rapid", "ratio", "reach", "react", "ready",
    "realm", "rebel", "refer", "reign", "relax", "relay", "renew", "reply", "rider", "ridge",
    "rifle", "right", "rigid", "risky", "rival", "river", "roast", "robot", "rocky", "rouge",
    "rough", "round", "route", "royal", "rugby", "ruler", "rural", "saint", "salad", "sauce",
    "scale", "scene", "scope", "score", "sense", "serve", "setup", "seven", "shade", "shaft",
    "shake", "shall", "shame", "shape", "share", "shark", "sharp", "sheep", "sheer", "sheet",
    "shelf", "shell", "shift", "shine", "shirt", "shock", "shoot", "shore", "short", "shout",
    "sight", "sigma", "since", "sixth", "sixty", "sized", "skill", "skull", "slash", "slave",
    "sleep", "slice", "slide", "slope", "smart", "smell", "smile", "smoke", "snake", "solar",
    "solid", "solve", "sorry", "sound", "south", "space", "spare", "speak", "speed", "spend",
    "spent", "spice", "spine", "spite", "split", "spoke", "sport", "spray", "squad", "stack",
    "staff", "stage", "stain", "stair", "stake", "stale", "stall", "stamp", "stand", "stare",
    "stark", "start", "state", "stays", "steak", "steal", "steam", "steel", "steep", "steer",
    "stern", "stick", "stiff", "still", "stock", "stone", "stood", "store", "storm", "story",
    "stove", "strap", "straw", "strip", "stuck", "study", "stuff", "style", "sugar", "suite",
    "sunny", "super", "surge", "swamp", "swear", "sweep", "sweet", "swift", "swing", "sword",
    "sworn", "syrup", "table", "taken", "taste", "teach", "teeth", "tempo", "tends", "tense",
    "tenth", "terms", "theme", "thick", "thief", "thing", "think", "third", "thorn", "those",
    "three", "threw", "throw", "thumb", "tiger", "tight", "timer", "tired", "title", "today",
    "token", "topic", "total", "touch", "tough", "towel", "tower", "toxic", "trace", "track",
    "trade", "trail", "train", "trait", "trash", "treat", "trend", "trial", "tribe", "trick",
    "tried", "troop", "truck", "truly", "trump", "trunk", "trust", "truth", "tumor", "tuner",
    "twice", "twist", "tying", "ultra", "uncle", "under", "union", "unity", "until", "upper",
    "upset", "urban", "usage", "usual", "utter", "vague", "valid", "value", "valve", "vault",
    "venue", "verge", "verse", "video", "vigor", "viral", "virus", "visit", "vista", "vital",
    "vivid", "vocal", "vodka", "voice", "voter", "wagon", "waist", "waste", "watch", "water",
    "weave", "whale", "wheat", "wheel", "where", "which", "while", "white", "whole", "whose",
    "width", "witch", "woman", "women", "world", "worry", "worse", "worst", "worth", "would",
    "wound", "wrath", "wrist", "write", "wrong", "wrote", "yield", "young", "youth", "zebra"
];

const VALID_GUESSES = new Set([
    ...ANSWER_WORDS,
    "aahed", "aalii", "abaca", "abaci", "aback", "abaft", "abamp", "abase", "abash", "abate",
    "abbey", "abbot", "abeam", "abele", "abets", "abhor", "abide", "abler", "abode", "abohm",
    "abort", "abound","ached", "aches", "acids", "acidy", "acing", "ackee", "acmes", "acned",
    "acnes", "acorn", "acres", "acrid", "acted", "actin", "adapt", "added", "adder", "addle",
    "adept", "adieu", "admin", "admix", "adobe", "adore", "adorn", "adrift","adult", "aegis",
    "afoot", "afore", "agape", "agate", "agave", "agent", "aggro", "agile", "aging", "aglow",
    "agone", "agony", "agree", "ahold", "aided", "aider", "aimed", "aimer", "aired", "aisle",
    "alarm", "album", "alder", "algae", "algal", "alias", "alibi", "align", "aline", "alkyd",
    "alkyl", "allay", "allot", "alloy", "allude","aloft", "aloha", "alone", "aloof", "aloud",
    "alpha", "altar", "alter", "altos", "amass", "amaze", "amber", "amble", "amend", "amine",
    "amino", "amiss", "amity", "among", "ample", "amply", "amuse", "angel", "anger", "angle",
    "angry", "angst", "anime", "anise", "ankle", "annex", "annoy", "antic", "anvil", "aorta",
    "apart", "aphid", "apple", "apply", "apron", "aptly", "arbor", "ardor", "arena", "argue",
    "arise", "armor", "aroma", "arose", "array", "arrow", "arson", "artsy", "ascot", "ashen",
    "ashes", "aside", "asked", "asset", "atlas", "atoll", "atone", "attic", "audio", "audit",
    "augur", "aunty", "avail", "avian", "avoid", "await", "awake", "award", "aware", "awash",
    "awful", "awoke", "axial", "axiom", "azure", "bacon", "badge", "badly", "bagel", "baggy",
    "baker", "banal", "bands", "bangs", "banjo", "banks", "baron", "basal", "based", "bases",
    "basic", "basil", "basin", "basis", "batch", "baton", "bayou", "beach", "beads", "beady",
    "beard", "beast", "began", "begin", "beige", "being", "belle", "belly", "below", "bench",
    "berry", "berth", "beset", "bible", "bicep", "bikes", "binge", "biome", "birch", "birth",
    "black", "blade", "blame", "bland", "blank", "blare", "blast", "blaze", "bleak", "bleat",
    "bleed", "blend", "bless", "blimp", "blind", "blink", "bliss", "blitz", "bloat", "block",
    "bloke", "blond", "blood", "bloom", "blown", "blues", "bluff", "blunt", "blurb", "blurt",
    "blush", "board", "boast", "boats", "bogey", "bogus", "bolts", "bonds", "bones", "bonus",
    "books", "boost", "booth", "boots", "booze", "boozy", "bored", "borne", "bosom", "bossy",
    "botch", "bough", "bound", "boxes", "brace", "braid", "brain", "brake", "brand", "brash",
    "brass", "brave", "brawn", "bread", "break", "breed", "brick", "bride", "brief", "brine",
    "bring", "brink", "briny", "brisk", "broad", "broil", "broke", "brood", "brook", "broth",
    "brown", "brush", "brunt", "buddy", "budge", "buggy", "build", "built", "bulge", "bulky",
    "bully", "bunch", "bunny", "burnt", "burst", "bushy", "butch", "buyer", "bylaw", "cabal",
    "cabin", "cable", "cadet", "cadre", "camel", "cameo", "campo", "candy", "canny", "canoe",
    "canon", "caper", "carat", "cargo", "carol", "carry", "carve", "catch", "cater", "cause",
    "cavil", "cease", "cedar", "cello", "chain", "chair", "chalk", "champ", "chant", "chaos",
    "charm", "chart", "chase", "cheap", "cheat", "check", "cheek", "cheer", "chess", "chest",
    "chick", "chief", "child", "chili", "chill", "chime", "china", "chirp", "chomp", "chord",
    "chore", "chose", "chunk", "churn", "cider", "cigar", "cinch", "civic", "civil", "claim",
    "clamp", "clang", "clank", "clash", "clasp", "class", "clean", "clear", "clerk", "click",
    "cliff", "climb", "cling", "clink", "cloak", "clock", "clone", "close", "cloth", "cloud",
    "clout", "clown", "clubs", "cluck", "clued", "clues", "clump", "clung", "coach", "coast",
    "cobra", "cocoa", "coils", "coins", "color", "comet", "comic", "comma", "conch", "condo",
    "coral", "corps", "couch", "could", "count", "coupe", "court", "cover", "covet", "crack",
    "craft", "cramp", "crane", "crank", "crash", "crass", "crate", "crave", "crawl", "craze",
    "crazy", "creak", "cream", "greed", "creek", "creep", "crest", "crick", "cried", "crime",
    "crimp", "crisp", "croak", "crock", "crone", "crook", "cross", "crowd", "crown", "crude",
    "cruel", "crush", "crust", "cubic", "curly", "curry", "curse", "curve", "cycle", "cynic",
    "daddy", "daily", "dairy", "daisy", "dance", "dandy", "datum", "death", "debit", "debug",
    "debut", "decal", "decay", "decor", "decoy", "decry", "deeds", "deity", "delay", "delta",
    "delve", "demon", "demur", "denim", "dense", "depot", "depth", "derby", "detox", "deuce",
    "devil", "diary", "digit", "dimly", "diner", "dingy", "dirty", "disco", "ditch", "ditto",
    "ditty", "diver", "dizzy", "dodge", "dodgy", "dogma", "doing", "dolly", "donor", "donut",
    "doses", "doubt", "dough", "dowdy", "draft", "drain", "drake", "drama", "drank", "drape",
    "drawn", "dread", "dream", "dress", "dried", "drift", "drill", "drink", "drive", "droit",
    "droll", "drone", "drool", "droop", "drops", "dross", "drove", "drown", "drugs", "drums",
    "drunk", "dryer", "dryly", "duchy", "dully", "dummy", "dunce", "dusty", "dutch", "duvet",
    "dwarf", "dwell", "dying", "eager", "eagle", "early", "earth", "easel", "eaten", "eater",
    "ebony", "edged", "edges", "edict", "eerie", "eight", "eject", "elbow", "elder", "elect",
    "elfin", "elite", "elope", "elude", "email", "embed", "ember", "emcee", "emote", "empty",
    "ended", "enemy", "enjoy", "ennui", "ensue", "enter", "entry", "envoy", "epoch", "equal",
    "equip", "erase", "erode", "error", "essay", "ether", "ethic", "evade", "event", "every",
    "evict", "evoke", "exact", "exalt", "excel", "exert", "exile", "exist", "expat", "expel",
    "extol", "extra", "exude", "exult", "fable", "facet", "fagot", "faint", "fairy", "faith",
    "false", "famed", "fancy", "farce", "fatal", "fatty", "fault", "fauna", "feast", "feign",
    "fella", "felon", "femur", "fence", "feral", "ferry", "fetal", "fetch", "fetid", "fetus",
    "fever", "fiber", "fibre", "field", "fiend", "fifth", "fifty", "fight", "filly", "filmy",
    "filth", "final", "finch", "finer", "first", "fishy", "fixed", "fixer", "fizzy", "fjord",
    "flack", "flail", "flair", "flake", "flaky", "flame", "flank", "flare", "flash", "flask",
    "fleet", "flesh", "flies", "fling", "flint", "float", "flock", "flood", "floor", "flora",
    "floss", "flour", "flout", "flown", "fluid", "fluke", "flung", "flunk", "flush", "flute",
    "foamy", "focal", "focus", "foggy", "folly", "foray", "force", "forge", "forgo", "forte",
    "forth", "forty", "forum", "fossil","found", "foyer", "frail", "frame", "frank", "fraud",
    "freak", "freed", "fresh", "friar", "fried", "frill", "frisk", "front", "frost", "froze",
    "fruit", "frump", "fully", "fungi", "funky", "funny", "furry", "fussy", "fuzzy", "gaffe",
    "gauge", "gavel", "gawky", "geeky", "genre", "ghost", "giant", "giddy", "given", "giver",
    "gland", "glare", "glass", "glaze", "gleam", "glean", "glide", "glint", "gloat", "globe",
    "gloom", "glory", "gloss", "glove", "glyph", "gnash", "goats", "godly", "going", "golem",
    "gonad", "goner", "goody", "goofy", "goose", "gorge", "gouge", "gourd", "grace", "grade",
    "graft", "grail", "grain", "grand", "grant", "grape", "graph", "grasp", "grass", "grate",
    "grave", "gravy", "great", "greed", "green", "greet", "grief", "grill", "grime", "grimy",
    "grind", "gripe", "groan", "groin", "groom", "grope", "gross", "group", "grout", "grove",
    "growl", "grown", "gruel", "gruff", "grunt", "guard", "guava", "guess", "guest", "guide",
    "guild", "guilt", "guise", "gulch", "gully", "gumbo", "gummy", "guppy", "gusto", "gusty",
    "gutter","gypsy", "habit", "hairy", "halve", "handy", "happy", "hardy", "haste", "hasty",
    "hatch", "haunt", "haven", "hazel", "heady", "heart", "heavy", "hedge", "heels", "hefty",
    "heist", "helix", "hello", "hence", "herbs", "heron", "hilly", "hinge", "hippo", "hippy",
    "hitch", "hoard", "hobby", "homer", "honey", "honor", "hoped", "horde", "horny", "horse",
    "hotel", "hotly", "hound", "house", "hovid", "howdy", "human", "humid", "humor", "humps",
    "humus", "hurry", "hyena", "hyper", "icily", "icing", "ideal", "idiot", "idyll", "igloo",
    "image", "imbue", "impel", "imply", "inane", "incur", "index", "indie", "inept", "inert",
    "infer", "ingot", "inner", "input", "inter", "intro", "ionic", "irate", "irony", "issue",
    "ivory", "jazzy", "jeans", "jelly", "jenny", "jerky", "jewel", "jiffy", "jimmy", "joker",
    "jolly", "joust", "judge", "juice", "juicy", "jumbo", "jumpy", "juror", "karma", "kayak",
    "kebab", "khaki", "kinky", "kiosk", "kitty", "knack", "knead", "kneel", "knelt", "knife",
    "knack", "knock", "knoll", "known", "koala", "kudos", "label", "labor", "laden", "lance",
    "lanky", "lapel", "lapse", "large", "larva", "laser", "lasso", "latch", "later", "lathe",
    "latte", "laugh", "layer", "leach", "leafy", "leaky", "learn", "lease", "leash", "least",
    "leave", "ledge", "leech", "legal", "leggy", "lemon", "lemur", "level", "lever", "libel",
    "light", "lilac", "limbo", "limit", "lined", "linen", "liner", "lingo", "links", "liver",
    "llama", "local", "lodge", "lofty", "logic", "login", "loopy", "loose", "lorry", "loser",
    "lossy", "lotus", "lousy", "lover", "lower", "lowly", "loyal", "lucid", "lucky", "lumen",
    "lumpy", "lunar", "lunch", "lunge", "lusty", "lying", "lynch", "lyric", "macaw", "macho",
    "macro", "mafia", "magic", "magma", "major", "maker", "manga", "mango", "mania", "manic",
    "manor", "maple", "march", "mares", "marry", "marsh", "mason", "match", "matte", "mauve",
    "maxim", "maybe", "mayor", "mealy", "media", "medic", "mercy", "merge", "merit", "merry",
    "messy", "metal", "meter", "might", "milky", "mimic", "mince", "minor", "minus", "mirth",
    "miser", "misty", "model", "modem", "mogul", "moist", "molar", "moldy", "money", "month",
    "moody", "moose", "moral", "morph", "mossy", "motel", "motif", "motor", "motto", "moult",
    "mound", "mount", "mourn", "mouse", "mousy", "mouth", "mover", "movie", "mucky", "muddy",
    "muggy", "mulch", "mummy", "mural", "murky", "mushy", "music", "musky", "musty", "myrrh",
    "nadir", "naive", "nanny", "nasal", "nasty", "naval", "nerve", "never", "newer", "newly",
    "nexus", "niche", "night", "ninja", "nippy", "noble", "nobly", "noise", "noisy", "nomad",
    "north", "notch", "noted", "novel", "nudge", "nurse", "nutty", "nylon", "nymph", "oaken",
    "oasis", "occur", "ocean", "oddly", "offal", "offer", "often", "olive", "omega", "onset",
    "opera", "optic", "orbit", "order", "organ", "other", "otter", "ought", "ounce", "outer",
    "outdo", "outwit","owned", "owner", "oxide", "ozone", "paddy", "pagan", "paint", "palms",
    "panda", "panel", "panic", "pansy", "papal", "paper", "parka", "parry", "parse", "party",
    "pasta", "paste", "pasty", "patch", "patio", "pause", "peace", "peach", "pearl", "pecan",
    "pedal", "penny", "perch", "peril", "perky", "pesky", "petal", "petty", "phase", "phone",
    "photo", "piano", "picky", "piece", "piggy", "pilot", "pinch", "piper", "pique", "pitch",
    "pithy", "pixel", "pixie", "pizza", "place", "plaid", "plain", "plane", "plank", "plant",
    "plate", "plaza", "plead", "pleat", "plied", "plier", "pluck", "plumb", "plume", "plump",
    "plunk", "plush", "poach", "point", "poise", "poker", "polar", "polka", "polyp", "poppy",
    "popup", "porch", "poser", "posit", "posse", "pouch", "pound", "pouty", "power", "prank",
    "prawn", "press", "price", "prick", "pride", "prime", "primo", "print", "prior", "prism",
    "privy", "prize", "probe", "prone", "prong", "proof", "prose", "proud", "prove", "prowl",
    "proxy", "prude", "prune", "psalm", "pubic", "pudgy", "pulse", "punch", "pupil", "puppy",
    "puree", "purge", "purse", "pushy", "putty", "pygmy", "quack", "qualm", "quart", "quasi",
    "queen", "query", "quest", "queue", "quick", "quiet", "quill", "quirk", "quota", "quote",
    "rabbi", "rabid", "racer", "radar", "radio", "rainy", "raise", "rally", "ramen", "ranch",
    "range", "rapid", "rarer", "rascal","ratio", "ratty", "raven", "rayon", "reach", "react",
    "ready", "realm", "rebel", "rebut", "recap", "recur", "reedy", "refer", "reign", "relax",
    "relay", "relic", "remit", "renal", "renew", "repay", "repel", "reply", "rerun", "reset",
    "resin", "retro", "retry", "revel", "rider", "ridge", "rifle", "right", "rigid", "rigor",
    "rinse", "ripen", "risen", "risky", "rival", "river", "rivet", "roach", "roast", "robin",
    "robot", "rocky", "rodeo", "rogue", "roman", "roomy", "roost", "rouge", "rough", "round",
    "rouse", "route", "rover", "rowdy", "royal", "rugby", "ruins", "ruled", "ruler", "rumba",
    "rumor", "rupee", "rural", "rusty", "sadly", "saint", "salad", "salon", "salsa", "salty",
    "salve", "salvo", "sandy", "saner", "sapid", "sappy", "satin", "satyr", "sauce", "saucy",
    "sauna", "saute", "savor", "savvy", "scale", "scalp", "scald", "scaly", "scamp", "scant",
    "scare", "scarf", "scary", "scene", "scent", "scion", "scoff", "scold", "scone", "scoop",
    "scope", "score", "scorn", "scout", "scowl", "scram", "scrap", "scrub", "sedan", "seize",
    "sense", "sepia", "serif", "serve", "setup", "seven", "sever", "shade", "shady", "shaft",
    "shake", "shaky", "shall", "shame", "shank", "shape", "shard", "share", "shark", "sharp",
    "shawl", "shear", "sheen", "sheep", "sheer", "sheet", "shelf", "shell", "shift", "shily",
    "shine", "shiny", "shire", "shirt", "shock", "shone", "shook", "shoot", "shore", "shorn",
    "short", "shout", "shove", "shown", "showy", "shrub", "shrug", "shrub", "shuck", "shunt",
    "sided", "siege", "sieve", "sight", "sigma", "since", "sinew", "singe", "siren", "sissy",
    "sixth", "sixty", "sized", "skate", "skein", "skill", "skimp", "skirt", "skull", "skunk",
    "slain", "slang", "slant", "slash", "slate", "slave", "sleek", "sleep", "sleet", "slept",
    "slice", "slide", "slime", "slimy", "sling", "slink", "slope", "slosh", "sloth", "slump",
    "slung", "slunk", "small", "smart", "smash", "smear", "smell", "smelt", "smile", "smirk",
    "smite", "smith", "smock", "smoke", "smoky", "snack", "snafu", "snail", "snake", "snare",
    "snarl", "sneak", "sneer", "snide", "sniff", "snoop", "snore", "snort", "snout", "snowy",
    "snuck", "snuff", "soapy", "sober", "soggy", "solar", "solid", "solve", "sonic", "soothe",
    "sorry", "sound", "south", "space", "spade", "spank", "spare", "spark", "spasm", "spawn",
    "speak", "spear", "speck", "speed", "spell", "spend", "spent", "spice", "spicy", "spied",
    "spiel", "spike", "spill", "spine", "spite", "splat", "split", "spoil", "spoke", "spook",
    "spool", "spoon", "spore", "sport", "spout", "spray", "spree", "sprig", "spunk", "spurn",
    "spurt", "squad", "squat", "squid", "stack", "staff", "stage", "staid", "stain", "stair",
    "stake", "stale", "stalk", "stall", "stamp", "stand", "stank", "stare", "stark", "start",
    "stash", "state", "stays", "stave", "steak", "steal", "steam", "steed", "steel", "steep",
    "steer", "stern", "stick", "stiff", "still", "stilt", "sting", "stink", "stint", "stock",
    "stoic", "stoke", "stole", "stomp", "stone", "stood", "stool", "stoop", "store", "stork",
    "storm", "story", "stout", "stove", "strap", "straw", "stray", "strip", "strum", "strut",
    "stuck", "study", "stuff", "stump", "stung", "stunk", "stunt", "style", "sugar", "suite",
    "sulky", "sunny", "super", "surge", "sushi", "swamp", "swarm", "swath", "swear", "sweat",
    "sweep", "sweet", "swell", "swept", "swift", "swill", "swine", "swing", "swipe", "swirl",
    "swish", "swoon", "swoop", "sword", "swore", "sworn", "swung", "syrup", "tabby", "table",
    "tacit", "taken", "taker", "talon", "tangy", "tango", "tapir", "tardy", "taste", "tasty",
    "tatty", "taunt", "tawny", "teach", "teary", "tease", "teeth", "tempo", "tends", "tense",
    "tenth", "tepee", "tepid", "terms", "terra", "terse", "testy", "theme", "these", "thick",
    "thief", "thigh", "thing", "think", "third", "thorn", "those", "three", "threw", "throb",
    "throw", "thrum", "thumb", "thump", "thyme", "tiara", "tidal", "tiger", "tight", "tilde",
    "timer", "timid", "tippy", "tipsy", "tired", "titan", "title", "toast", "today", "token",
    "tonal", "tonic", "topic", "topaz", "torch", "torso", "total", "totem", "touch", "tough",
    "towel", "tower", "toxic", "trace", "track", "tract", "trade", "trail", "train", "trait",
    "tramp", "trash", "trawl", "tread", "treat", "trend", "triad", "trial", "tribe", "trick",
    "tried", "trite", "troll", "troop", "troth", "trout", "truce", "truck", "truly", "trump",
    "trunk", "truss", "trust", "truth", "tulip", "tumor", "tuner", "tunic", "turbo", "tutor",
    "twang", "tweak", "tweed", "twice", "twigs", "twill", "twine", "twirl", "twist", "tying",
    "udder", "ulcer", "ultra", "umbra", "uncle", "uncut", "under", "undid", "undue", "unfit",
    "union", "unite", "unity", "unlit", "until", "unzip", "upper", "upset", "urban", "usage",
    "usher", "using", "usual", "usurp", "utter", "vague", "valid", "valor", "value", "valve",
    "vapid", "vault", "vaunt", "vegan", "venue", "verge", "verse", "vibes", "video", "vigor",
    "villa", "vinyl", "viola", "viper", "viral", "virus", "visit", "visor", "vista", "vital",
    "vivid", "vixen", "vocal", "vodka", "vogue", "voice", "voila", "voter", "vouch", "vowel",
    "vulva", "wacky", "wader", "wafer", "wager", "wagon", "waist", "waste", "watch", "water",
    "waver", "waxen", "weary", "weave", "wedge", "weedy", "weigh", "weird", "welch", "whale",
    "wheat", "wheel", "where", "which", "while", "whiff", "whine", "whiny", "whirl", "whisk",
    "white", "whole", "whose", "widen", "wider", "widow", "width", "wield", "winch", "windy",
    "wiper", "wired", "witch", "witty", "woken", "woman", "women", "woody", "wooly", "world",
    "wormy", "worry", "worse", "worst", "worth", "would", "wound", "wrath", "wreak", "wreck",
    "wrest", "wring", "wrist", "write", "wrong", "wrote", "wrung", "xenon", "yacht", "yearn",
    "yeast", "yield", "young", "youth", "zebra", "zesty", "zippy", "zloty", "zonal"
]);

// ==========================================
// SECTION 2: Game State & Constants
// ==========================================

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const FLIP_DURATION = 500;
const BOUNCE_DELAY = 100;

const KEYBOARD_STATE_PRIORITY = {
    'correct': 3,
    'present': 2,
    'absent': 1,
    'default': 0
};

let gameState = {
    secret: '',
    guesses: [],
    currentGuess: '',
    currentRow: 0,
    gameOver: false,
    gameWon: false,
    hardMode: false,
    darkTheme: true,
    highContrast: false,
    keyboardState: {},
    revealedHints: []
};

let stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
};

// ==========================================
// SECTION 3: DOM References
// ==========================================

const boardEl = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const toastContainer = document.getElementById('toast-container');
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');

const modalHelp = document.getElementById('modal-help');
const modalStats = document.getElementById('modal-stats');
const modalSettings = document.getElementById('modal-settings');

const btnHelp = document.getElementById('btn-help');
const btnStats = document.getElementById('btn-stats');
const btnSettings = document.getElementById('btn-settings');
const btnShare = document.getElementById('btn-share');
const btnNewGame = document.getElementById('btn-new-game');
const btnResetStats = document.getElementById('btn-reset-stats');

const toggleHardMode = document.getElementById('toggle-hard-mode');
const toggleDarkTheme = document.getElementById('toggle-dark-theme');
const toggleHighContrast = document.getElementById('toggle-high-contrast');

const statPlayed = document.getElementById('stat-played');
const statWinPct = document.getElementById('stat-win-pct');
const statStreak = document.getElementById('stat-streak');
const statMaxStreak = document.getElementById('stat-max-streak');
const guessDistEl = document.getElementById('guess-distribution');

// ==========================================
// SECTION 4: Board Initialization
// ==========================================

function createBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < MAX_GUESSES; r++) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.setAttribute('data-row', r);
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-col', c);
            tile.setAttribute('data-state', 'empty');
            row.appendChild(tile);
        }
        boardEl.appendChild(row);
    }
}

function getTile(row, col) {
    const rowEl = boardEl.querySelector(`.row[data-row="${row}"]`);
    if (!rowEl) return null;
    return rowEl.querySelector(`.tile[data-col="${col}"]`);
}

function getRow(row) {
    return boardEl.querySelector(`.row[data-row="${row}"]`);
}

// ==========================================
// SECTION 5: Game Initialization
// ==========================================

function pickRandomWord() {
    const idx = Math.floor(Math.random() * ANSWER_WORDS.length);
    return ANSWER_WORDS[idx].toUpperCase();
}

function initGame() {
    gameState.secret = pickRandomWord();
    gameState.guesses = [];
    gameState.currentGuess = '';
    gameState.currentRow = 0;
    gameState.gameOver = false;
    gameState.gameWon = false;
    gameState.keyboardState = {};
    gameState.revealedHints = [];

    createBoard();
    resetKeyboardUI();
    clearAllToasts();

    console.log('Secret word (debug):', gameState.secret);
}

function resetKeyboardUI() {
    const keys = keyboardEl.querySelectorAll('.key');
    keys.forEach(key => {
        key.removeAttribute('data-state');
    });
}

// ==========================================
// SECTION 6: Input Handling
// ==========================================

function handleKeyPress(key) {
    if (gameState.gameOver) return;

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACKSPACE') {
        deleteLetter();
    } else if (/^[A-Z]$/.test(key)) {
        addLetter(key);
    }
}

function addLetter(letter) {
    if (gameState.currentGuess.length >= WORD_LENGTH) return;

    gameState.currentGuess += letter;
    const col = gameState.currentGuess.length - 1;
    const tile = getTile(gameState.currentRow, col);
    if (tile) {
        tile.textContent = letter;
        tile.setAttribute('data-state', 'tbd');
    }
}

function deleteLetter() {
    if (gameState.currentGuess.length === 0) return;

    const col = gameState.currentGuess.length - 1;
    const tile = getTile(gameState.currentRow, col);
    if (tile) {
        tile.textContent = '';
        tile.setAttribute('data-state', 'empty');
    }
    gameState.currentGuess = gameState.currentGuess.slice(0, -1);
}

// ==========================================
// SECTION 7: Guess Submission & Validation
// ==========================================

function submitGuess() {
    const guess = gameState.currentGuess;

    if (guess.length !== WORD_LENGTH) {
        showToast('Not enough letters');
        shakeRow(gameState.currentRow);
        return;
    }

    if (!isValidWord(guess)) {
        showToast('Not in word list');
        shakeRow(gameState.currentRow);
        return;
    }

    if (gameState.hardMode && gameState.revealedHints.length > 0) {
        const hardModeError = checkHardMode(guess);
        if (hardModeError) {
            showToast(hardModeError);
            shakeRow(gameState.currentRow);
            return;
        }
    }

    const evaluation = evaluateGuess(guess, gameState.secret);

    gameState.guesses.push(guess);

    updateRevealedHints(guess, evaluation);

    revealTiles(gameState.currentRow, guess, evaluation, () => {
        updateKeyboard(guess, evaluation);

        if (guess === gameState.secret) {
            handleWin();
        } else if (gameState.currentRow >= MAX_GUESSES - 1) {
            handleLoss();
        } else {
            gameState.currentRow++;
            gameState.currentGuess = '';
        }
    });
}

function isValidWord(word) {
    return VALID_GUESSES.has(word.toLowerCase());
}

function evaluateGuess(guess, secret) {
    const result = new Array(WORD_LENGTH).fill('absent');
    const secretLetters = secret.split('');
    const guessLetters = guess.split('');
    const used = new Array(WORD_LENGTH).fill(false);

    // First pass: mark correct
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] === secretLetters[i]) {
            result[i] = 'correct';
            used[i] = true;
        }
    }

    // Second pass: mark present
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] === 'correct') continue;
        for (let j = 0; j < WORD_LENGTH; j++) {
            if (!used[j] && guessLetters[i] === secretLetters[j]) {
                result[i] = 'present';
                used[j] = true;
                break;
            }
        }
    }

    return result;
}

// ==========================================
// SECTION 8: Hard Mode Validation
// ==========================================

function updateRevealedHints(guess, evaluation) {
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (evaluation[i] === 'correct') {
            const existing = gameState.revealedHints.find(
                h => h.type === 'correct' && h.position === i
            );
            if (!existing) {
                gameState.revealedHints.push({
                    type: 'correct',
                    letter: guess[i],
                    position: i
                });
            }
        } else if (evaluation[i] === 'present') {
            const existing = gameState.revealedHints.find(
                h => h.type === 'present' && h.letter === guess[i]
            );
            if (!existing) {
                gameState.revealedHints.push({
                    type: 'present',
                    letter: guess[i],
                    position: i
                });
            }
        }
    }
}

function checkHardMode(guess) {
    for (const hint of gameState.revealedHints) {
        if (hint.type === 'correct') {
            if (guess[hint.position] !== hint.letter) {
                const pos = hint.position + 1;
                return `${pos}${getOrdinalSuffix(pos)} letter must be ${hint.letter}`;
            }
        } else if (hint.type === 'present') {
            if (!guess.includes(hint.letter)) {
                return `Guess must contain ${hint.letter}`;
            }
        }
    }
    return null;
}

function getOrdinalSuffix(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

// ==========================================
// SECTION 9: Tile Reveal Animation
// ==========================================

function revealTiles(row, guess, evaluation, callback) {
    const tiles = [];
    for (let c = 0; c < WORD_LENGTH; c++) {
        tiles.push(getTile(row, c));
    }

    let revealed = 0;

    tiles.forEach((tile, index) => {
        const delay = index * (FLIP_DURATION / 2.5);

        setTimeout(() => {
            tile.classList.add('flip-in');

            setTimeout(() => {
                tile.classList.remove('flip-in');
                tile.setAttribute('data-state', evaluation[index]);
                tile.textContent = guess[index];
                tile.classList.add('flip-out');

                setTimeout(() => {
                    tile.classList.remove('flip-out');
                    revealed++;
                    if (revealed === WORD_LENGTH && callback) {
                        callback();
                    }
                }, FLIP_DURATION / 2);
            }, FLIP_DURATION / 2);
        }, delay);
    });
}

// ==========================================
// SECTION 10: Keyboard State Update
// ==========================================

function updateKeyboard(guess, evaluation) {
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = guess[i];
        const newState = evaluation[i];
        const currentState = gameState.keyboardState[letter] || 'default';

        const newPriority = KEYBOARD_STATE_PRIORITY[newState] || 0;
        const currentPriority = KEYBOARD_STATE_PRIORITY[currentState] || 0;

        if (newPriority > currentPriority) {
            gameState.keyboardState[letter] = newState;
        }
    }

    updateKeyboardUI();
}

function updateKeyboardUI() {
    const keys = keyboardEl.querySelectorAll('.key');
    keys.forEach(key => {
        const letter = key.getAttribute('data-key');
        if (letter && gameState.keyboardState[letter]) {
            key.setAttribute('data-state', gameState.keyboardState[letter]);
        }
    });
}

// ==========================================
// SECTION 11: Win / Loss Handling
// ==========================================

const WIN_MESSAGES = [
    'Genius!',
    'Magnificent!',
    'Impressive!',
    'Splendid!',
    'Great!',
    'Phew!'
];

function handleWin() {
    gameState.gameOver = true;
    gameState.gameWon = true;

    const guessCount = gameState.currentRow + 1;
    const message = WIN_MESSAGES[guessCount - 1] || 'You won!';

    setTimeout(() => {
        showToast(message, 2500);
        bounceRow(gameState.currentRow);
        launchConfetti();
    }, 200);

    updateStats(true, guessCount);

    setTimeout(() => {
        openModal(modalStats);
    }, 3500);
}

function handleLoss() {
    gameState.gameOver = true;
    gameState.gameWon = false;

    setTimeout(() => {
        showToast(gameState.secret, 4000);
    }, 200);

    updateStats(false, 0);

    setTimeout(() => {
        openModal(modalStats);
    }, 3000);
}

// ==========================================
// SECTION 12: Row Animations
// ==========================================

function shakeRow(rowIndex) {
    const row = getRow(rowIndex);
    if (!row) return;
    row.classList.add('shake');
    row.addEventListener('animationend', () => {
        row.classList.remove('shake');
    }, { once: true });
}

function bounceRow(rowIndex) {
    for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = getTile(rowIndex, c);
        if (!tile) continue;
        setTimeout(() => {
            tile.classList.add('bounce');
            tile.addEventListener('animationend', () => {
                tile.classList.remove('bounce');
            }, { once: true });
        }, c * BOUNCE_DELAY);
    }
}

// ==========================================
// SECTION 13: Toast Notifications
// ==========================================

function showToast(message, duration = 1500) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    toastContainer.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => {
                toast.remove();
            }, { once: true });
        }, duration);
    }

    return toast;
}

function clearAllToasts() {
    toastContainer.innerHTML = '';
}

// ==========================================
// SECTION 14: Confetti System
// ==========================================

let confettiParticles = [];
let confettiAnimationId = null;

function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function createConfettiParticle() {
    const colors = ['#538d4e', '#b59f3b', '#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22'];
    return {
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height * -1 - 50,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        decay: Math.random() * 0.005 + 0.002
    };
}

function launchConfetti() {
    resizeConfettiCanvas();
    confettiParticles = [];

    for (let i = 0; i < 150; i++) {
        confettiParticles.push(createConfettiParticle());
    }

    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
    }

    animateConfetti();
}

function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0) return;

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
    });

    confettiParticles = confettiParticles.filter(p => p.opacity > 0 && p.y < confettiCanvas.height + 50);

    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiAnimationId = null;
    }
}

// ==========================================
// SECTION 15: Statistics Management
// ==========================================

function loadStats() {
    try {
        const saved = localStorage.getItem('wordle-stats');
        if (saved) {
            const parsed = JSON.parse(saved);
            stats.gamesPlayed = parsed.gamesPlayed || 0;
            stats.gamesWon = parsed.gamesWon || 0;
            stats.currentStreak = parsed.currentStreak || 0;
            stats.maxStreak = parsed.maxStreak || 0;
            if (parsed.guessDistribution) {
                for (let i = 1; i <= 6; i++) {
                    stats.guessDistribution[i] = parsed.guessDistribution[i] || 0;
                }
            }
        }
    } catch (e) {
        console.warn('Failed to load stats:', e);
    }
}

function saveStats() {
    try {
        localStorage.setItem('wordle-stats', JSON.stringify(stats));
    } catch (e) {
        console.warn('Failed to save stats:', e);
    }
}

function updateStats(won, guessCount) {
    stats.gamesPlayed++;

    if (won) {
        stats.gamesWon++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        if (guessCount >= 1 && guessCount <= 6) {
            stats.guessDistribution[guessCount]++;
        }
    } else {
        stats.currentStreak = 0;
    }

    saveStats();
}

function resetStats() {
    stats = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    };
    saveStats();
    renderStatsModal();
    showToast('Statistics reset', 1500);
}

// ==========================================
// SECTION 16: Statistics Modal Rendering
// ==========================================

function renderStatsModal() {
    statPlayed.textContent = stats.gamesPlayed;
    statWinPct.textContent = stats.gamesPlayed > 0
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
        : 0;
    statStreak.textContent = stats.currentStreak;
    statMaxStreak.textContent = stats.maxStreak;

    renderGuessDistribution();
}

function renderGuessDistribution() {
    guessDistEl.innerHTML = '';

    const maxVal = Math.max(...Object.values(stats.guessDistribution), 1);
    const lastGuess = gameState.gameWon ? gameState.guesses.length : -1;

    for (let i = 1; i <= 6; i++) {
        const count = stats.guessDistribution[i];
        const pct = (count / maxVal) * 100;

        const row = document.createElement('div');
        row.classList.add('dist-row');

        const label = document.createElement('span');
        label.classList.add('dist-label');
        label.textContent = i;

        const barContainer = document.createElement('div');
        barContainer.classList.add('dist-bar-container');

        const bar = document.createElement('div');
        bar.classList.add('dist-bar');
        bar.style.width = `${Math.max(pct, 8)}%`;
        bar.textContent = count;

        if (i === lastGuess) {
            bar.classList.add('highlight');
        }

        barContainer.appendChild(bar);
        row.appendChild(label);
        row.appendChild(barContainer);
        guessDistEl.appendChild(row);
    }
}

// ==========================================
// SECTION 17: Share Results
// ==========================================

function generateShareText() {
    if (gameState.guesses.length === 0) {
        showToast('No game to share');
        return;
    }

    const guessCount = gameState.gameWon ? gameState.guesses.length : 'X';
    let text = `Wordle Clone ${guessCount}/${MAX_GUESSES}`;

    if (gameState.hardMode) {
        text += '*';
    }

    text += '\n\n';

    for (const guess of gameState.guesses) {
        const evaluation = evaluateGuess(guess, gameState.secret);
        let line = '';
        for (const state of evaluation) {
            if (gameState.highContrast) {
                if (state === 'correct') line += '\uD83D\uDFE7'; // orange
                else if (state === 'present') line += '\uD83D\uDFE6'; // blue
                else line += '\u2B1B'; // black
            } else {
                if (state === 'correct') line += '\uD83D\uDFE9'; // green
                else if (state === 'present') line += '\uD83D\uDFE8'; // yellow
                else line += '\u2B1B'; // black
            }
        }
        text += line + '\n';
    }

    return text.trim();
}

function shareResults() {
    const text = generateShareText();
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Copied to clipboard!');
    } catch {
        showToast('Failed to copy');
    }
    document.body.removeChild(textarea);
}

// ==========================================
// SECTION 18: Modal Management
// ==========================================

function openModal(modalEl) {
    closeAllModals();
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');

    if (modalEl === modalStats) {
        renderStatsModal();
    }
}

function closeModal(modalEl) {
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
}

function closeAllModals() {
    [modalHelp, modalStats, modalSettings].forEach(m => closeModal(m));
}

// ==========================================
// SECTION 19: Settings Management
// ==========================================

function loadSettings() {
    try {
        const saved = localStorage.getItem('wordle-settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            gameState.hardMode = parsed.hardMode || false;
            gameState.darkTheme = parsed.darkTheme !== undefined ? parsed.darkTheme : true;
            gameState.highContrast = parsed.highContrast || false;
        }
    } catch (e) {
        console.warn('Failed to load settings:', e);
    }

    applyTheme();
    applyHighContrast();
    toggleHardMode.checked = gameState.hardMode;
    toggleDarkTheme.checked = gameState.darkTheme;
    toggleHighContrast.checked = gameState.highContrast;
}

function saveSettings() {
    try {
        localStorage.setItem('wordle-settings', JSON.stringify({
            hardMode: gameState.hardMode,
            darkTheme: gameState.darkTheme,
            highContrast: gameState.highContrast
        }));
    } catch (e) {
        console.warn('Failed to save settings:', e);
    }
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', gameState.darkTheme ? 'dark' : 'light');
}

function applyHighContrast() {
    document.documentElement.setAttribute('data-high-contrast', gameState.highContrast ? 'true' : 'false');
}

// ==========================================
// SECTION 20: Event Listeners
// ==========================================

// Physical keyboard
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Ignore when modals are open
    if (modalHelp.classList.contains('active') ||
        modalStats.classList.contains('active') ||
        modalSettings.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
        return;
    }

    let key = e.key.toUpperCase();
    if (key === 'ENTER') {
        e.preventDefault();
        handleKeyPress('ENTER');
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
        handleKeyPress('BACKSPACE');
    } else if (key.length === 1 && /^[A-Z]$/.test(key)) {
        handleKeyPress(key);
    }
});

// On-screen keyboard
keyboardEl.addEventListener('click', (e) => {
    const keyEl = e.target.closest('.key');
    if (!keyEl) return;

    const key = keyEl.getAttribute('data-key');
    if (key) {
        handleKeyPress(key);
    }
});

// Prevent double-tap zoom on mobile keyboard
keyboardEl.addEventListener('touchend', (e) => {
    e.preventDefault();
    const keyEl = e.target.closest('.key');
    if (!keyEl) return;

    const key = keyEl.getAttribute('data-key');
    if (key) {
        handleKeyPress(key);
    }
});

// Header buttons
btnHelp.addEventListener('click', () => openModal(modalHelp));
btnStats.addEventListener('click', () => openModal(modalStats));
btnSettings.addEventListener('click', () => openModal(modalSettings));

// Modal close buttons
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) closeModal(modal);
    });
});

// Close modal by clicking overlay
[modalHelp, modalStats, modalSettings].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
});

// Share button
btnShare.addEventListener('click', shareResults);

// New game button
btnNewGame.addEventListener('click', () => {
    closeModal(modalStats);
    initGame();
});

// Reset stats button
btnResetStats.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        resetStats();
    }
});

// Settings toggles
toggleHardMode.addEventListener('change', () => {
    if (toggleHardMode.checked && gameState.guesses.length > 0 && !gameState.gameOver) {
        showToast('Hard mode can only be enabled at the start of a round');
        toggleHardMode.checked = false;
        return;
    }
    gameState.hardMode = toggleHardMode.checked;
    saveSettings();
});

toggleDarkTheme.addEventListener('change', () => {
    gameState.darkTheme = toggleDarkTheme.checked;
    applyTheme();
    saveSettings();
});

toggleHighContrast.addEventListener('change', () => {
    gameState.highContrast = toggleHighContrast.checked;
    applyHighContrast();
    saveSettings();
});

// Window resize for confetti
window.addEventListener('resize', () => {
    resizeConfettiCanvas();
});

// ==========================================
// SECTION 21: Saved Game State (Persistence)
// ==========================================

function saveGameState() {
    try {
        localStorage.setItem('wordle-game-state', JSON.stringify({
            secret: gameState.secret,
            guesses: gameState.guesses,
            currentRow: gameState.currentRow,
            gameOver: gameState.gameOver,
            gameWon: gameState.gameWon,
            keyboardState: gameState.keyboardState,
            revealedHints: gameState.revealedHints
        }));
    } catch (e) {
        console.warn('Failed to save game state:', e);
    }
}

function loadGameState() {
    try {
        const saved = localStorage.getItem('wordle-game-state');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load game state:', e);
    }
    return null;
}

function restoreGame(savedState) {
    gameState.secret = savedState.secret;
    gameState.guesses = savedState.guesses || [];
    gameState.currentRow = savedState.currentRow || 0;
    gameState.gameOver = savedState.gameOver || false;
    gameState.gameWon = savedState.gameWon || false;
    gameState.keyboardState = savedState.keyboardState || {};
    gameState.revealedHints = savedState.revealedHints || [];
    gameState.currentGuess = '';

    createBoard();
    resetKeyboardUI();

    // Replay all previous guesses visually (no animation)
    for (let r = 0; r < gameState.guesses.length; r++) {
        const guess = gameState.guesses[r];
        const evaluation = evaluateGuess(guess, gameState.secret);

        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = getTile(r, c);
            if (tile) {
                tile.textContent = guess[c];
                tile.setAttribute('data-state', evaluation[c]);
            }
        }
    }

    updateKeyboardUI();

    if (gameState.gameOver) {
        gameState.currentRow = gameState.guesses.length - 1;
    } else {
        gameState.currentRow = gameState.guesses.length;
    }
}

// Override submit to auto-save after each guess
const originalSubmitGuess = submitGuess;
// We already defined submitGuess, so we hook into game state changes
function hookAutoSave() {
    const originalHandleWin = handleWin;
    const originalHandleLoss = handleLoss;

    // We save after each reveal completes by patching revealTiles callback pattern
    const _revealTiles = revealTiles;

    // Simpler approach: Save periodically and after key actions
    setInterval(() => {
        if (!gameState.gameOver && gameState.guesses.length > 0) {
            saveGameState();
        }
    }, 2000);
}

// ==========================================
// SECTION 22: Daily Word Feature
// ==========================================

function getDailyWord() {
    const epoch = new Date(2024, 0, 1).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    const dayIndex = Math.floor((now - epoch) / (1000 * 60 * 60 * 24));
    return ANSWER_WORDS[dayIndex % ANSWER_WORDS.length].toUpperCase();
}

// ==========================================
// SECTION 23: Accessibility Announcements
// ==========================================

function announceForScreenReader(message) {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'alert');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.style.position = 'absolute';
    announcer.style.left = '-9999px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    announcer.textContent = message;
    document.body.appendChild(announcer);

    setTimeout(() => {
        document.body.removeChild(announcer);
    }, 1000);
}

// ==========================================
// SECTION 24: Utility & Helper Functions
// ==========================================

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getLetterFrequency(word) {
    const freq = {};
    for (const ch of word) {
        freq[ch] = (freq[ch] || 0) + 1;
    }
    return freq;
}

function countMatchingLetters(guess, secret) {
    let count = 0;
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === secret[i]) count++;
    }
    return count;
}

function isVowel(char) {
    return 'AEIOU'.includes(char.toUpperCase());
}

function getUniqueLetters(word) {
    return [...new Set(word.split(''))];
}

// ==========================================
// SECTION 25: Advanced Confetti Shapes
// ==========================================

function createStarConfetti() {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return {
        x: Math.random() * confettiCanvas.width,
        y: -20,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 2 + 1.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.003 + 0.001,
        shape: Math.random() > 0.5 ? 'star' : 'circle',
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.1
    };
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function launchStarConfetti() {
    resizeConfettiCanvas();
    const starParticles = [];

    for (let i = 0; i < 100; i++) {
        starParticles.push(createStarConfetti());
    }

    function animateStars() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        for (let idx = starParticles.length - 1; idx >= 0; idx--) {
            const p = starParticles[idx];
            p.wobble += p.wobbleSpeed;
            p.x += p.vx + Math.sin(p.wobble) * 0.5;
            p.y += p.vy;
            p.vy += 0.03;
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > confettiCanvas.height + 50) {
                starParticles.splice(idx, 1);
                continue;
            }

            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);
            confettiCtx.globalAlpha = Math.max(0, p.opacity);
            confettiCtx.fillStyle = p.color;

            if (p.shape === 'star') {
                drawStar(confettiCtx, 0, 0, 5, p.size, p.size / 2);
            } else {
                confettiCtx.beginPath();
                confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                confettiCtx.fill();
            }

            confettiCtx.restore();
        }

        if (starParticles.length > 0) {
            requestAnimationFrame(animateStars);
        } else {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    animateStars();
}

// ==========================================
// SECTION 26: Game Timer
// ==========================================

let gameTimer = {
    startTime: null,
    elapsed: 0,
    interval: null,
    running: false
};

function startTimer() {
    if (gameTimer.running) return;
    gameTimer.startTime = Date.now() - gameTimer.elapsed;
    gameTimer.running = true;
    gameTimer.interval = setInterval(() => {
        gameTimer.elapsed = Date.now() - gameTimer.startTime;
    }, 1000);
}

function stopTimer() {
    if (!gameTimer.running) return;
    gameTimer.running = false;
    clearInterval(gameTimer.interval);
    gameTimer.interval = null;
}

function resetTimer() {
    stopTimer();
    gameTimer.elapsed = 0;
    gameTimer.startTime = null;
}

function getElapsedSeconds() {
    return Math.floor(gameTimer.elapsed / 1000);
}

// ==========================================
// SECTION 27: Word Analysis Utilities
// ==========================================

function scoreWordByFrequency(word) {
    const letterFreq = {
        E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1,
        R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2,
        G: 2.0, Y: 2.0, P: 1.9, B: 1.5, V: 1.0, K: 0.8, J: 0.2, X: 0.2,
        Q: 0.1, Z: 0.1
    };

    let score = 0;
    const seen = new Set();
    for (const ch of word.toUpperCase()) {
        if (!seen.has(ch)) {
            score += letterFreq[ch] || 0;
            seen.add(ch);
        }
    }
    return score;
}

function getWordDifficulty(word) {
    const score = scoreWordByFrequency(word);
    const uniqueLetters = getUniqueLetters(word).length;

    if (score > 30 && uniqueLetters === 5) return 'easy';
    if (score > 20) return 'medium';
    return 'hard';
}

function findAnagrams(word) {
    const sorted = word.toUpperCase().split('').sort().join('');
    return ANSWER_WORDS.filter(w => {
        return w.toUpperCase().split('').sort().join('') === sorted;
    });
}

function getCommonPositionLetters(position) {
    const freq = {};
    for (const word of ANSWER_WORDS) {
        const letter = word[position].toUpperCase();
        freq[letter] = (freq[letter] || 0) + 1;
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

// ==========================================
// SECTION 28: Hint System
// ==========================================

function getHint() {
    if (gameState.gameOver) return;

    const secret = gameState.secret;
    const guessedLetters = new Set();

    for (const guess of gameState.guesses) {
        for (const ch of guess) {
            guessedLetters.add(ch);
        }
    }

    // Find an unrevealed letter in the secret
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = secret[i];
        if (!guessedLetters.has(letter)) {
            showToast(`Hint: The word contains "${letter}"`, 3000);
            return;
        }
    }

    // If all letters have been guessed, give position hint
    for (let i = 0; i < WORD_LENGTH; i++) {
        let positionKnown = false;
        for (const guess of gameState.guesses) {
            if (guess[i] === secret[i]) {
                positionKnown = true;
                break;
            }
        }
        if (!positionKnown) {
            const pos = i + 1;
            showToast(`Hint: ${pos}${getOrdinalSuffix(pos)} letter is "${secret[i]}"`, 3000);
            return;
        }
    }

    showToast('No more hints available!', 2000);
}

// ==========================================
// SECTION 29: Animation Utilities
// ==========================================

function pulseElement(element, duration = 300) {
    element.style.transition = `transform ${duration}ms ease`;
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, duration);
}

function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = progress;
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

function fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = initialOpacity * (1 - progress);
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.style.display = 'none';
        }
    }

    requestAnimationFrame(step);
}

function typewriterEffect(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ==========================================
// SECTION 30: Color Utilities
// ==========================================

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function lerpColor(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    if (!c1 || !c2) return color1;

    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);

    return rgbToHex(r, g, b);
}

function getContrastColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return '#ffffff';
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

// ==========================================
// SECTION 31: Local Storage Utilities
// ==========================================

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}

function clearGameStorage() {
    removeLocalStorage('wordle-game-state');
    removeLocalStorage('wordle-stats');
    removeLocalStorage('wordle-settings');
}

// ==========================================
// SECTION 32: Performance Monitoring
// ==========================================

const perfMonitor = {
    marks: {},

    start(label) {
        this.marks[label] = performance.now();
    },

    end(label) {
        if (!this.marks[label]) return 0;
        const duration = performance.now() - this.marks[label];
        delete this.marks[label];
        return duration;
    },

    measure(label, fn) {
        this.start(label);
        const result = fn();
        const duration = this.end(label);
        console.debug(`[Perf] ${label}: ${duration.toFixed(2)}ms`);
        return result;
    }
};

// ==========================================
// SECTION 33: Event Emitter (Pub/Sub)
// ==========================================

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(cb => {
            try {
                cb(...args);
            } catch (e) {
                console.error(`Error in event handler for "${event}":`, e);
            }
        });
    }

    once(event, callback) {
        const wrapper = (...args) => {
            callback(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}

const gameEvents = new EventEmitter();

gameEvents.on('guess', (guess, evaluation) => {
    console.debug('Guess:', guess, 'Evaluation:', evaluation);
});

gameEvents.on('win', (guessCount) => {
    console.debug('Game won in', guessCount, 'guesses');
});

gameEvents.on('lose', (secret) => {
    console.debug('Game lost. Word was:', secret);
});

// ==========================================
// SECTION 34: Keyboard Shortcut Manager
// ==========================================

const shortcuts = {
    bindings: [],

    register(key, modifiers, callback, description) {
        this.bindings.push({ key: key.toUpperCase(), modifiers, callback, description });
    },

    handle(e) {
        const key = e.key.toUpperCase();
        for (const binding of this.bindings) {
            if (binding.key !== key) continue;
            const ctrl = binding.modifiers.includes('ctrl');
            const shift = binding.modifiers.includes('shift');
            const alt = binding.modifiers.includes('alt');

            if (ctrl === e.ctrlKey && shift === e.shiftKey && alt === e.altKey) {
                e.preventDefault();
                binding.callback();
                return true;
            }
        }
        return false;
    }
};

// Register shortcuts
shortcuts.register('H', ['ctrl'], () => openModal(modalHelp), 'Open help');
shortcuts.register('S', ['ctrl', 'shift'], () => openModal(modalStats), 'Open statistics');

document.addEventListener('keydown', (e) => {
    shortcuts.handle(e);
});

// ==========================================
// SECTION 35: Application Init
// ==========================================

function init() {
    resizeConfettiCanvas();
    loadSettings();
    loadStats();

    const savedGame = loadGameState();
    if (savedGame && !savedGame.gameOver) {
        restoreGame(savedGame);
        startTimer();
    } else {
        initGame();
        startTimer();
    }

    // Show help on first visit
    const hasVisited = localStorage.getItem('wordle-visited');
    if (!hasVisited) {
        setTimeout(() => {
            openModal(modalHelp);
            localStorage.setItem('wordle-visited', 'true');
        }, 500);
    }
}

// Start the app
init();
