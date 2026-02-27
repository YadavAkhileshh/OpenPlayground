var pokemon_selector = document.getElementById("pokemons");
var catch_screen = document.getElementById("catch_screen");
var pokemon = document.getElementById("pokemon");
var shiny = document.getElementById("shiny");
var stats = document.getElementById("stats");
var encounters_stat = document.getElementById("encounters_stat");
var shinies_stat = document.getElementById("shinies_stat");
var streak_stat = document.getElementById("streak_stat");
var worst_streak_stat = document.getElementById("worst_streak_stat");
var best_streak_stat = document.getElementById("best_streak_stat");
var flash = document.getElementById("flash");

// Odds are based on reports from thesilphroad.com and shinyrates.com
// They're instinctively rounded to the nearest power of 2
var pokemons = {
	1: ["Bulbasaur", 512],
	4: ["Charmander", 512],
	7: ["Squirtle", 512],
  10: ["Caterpie", 512],
  16: ["Pidgey", 512],
  19: ["Rattata", 512],
  23: ["Ekans", 512],
  25: ["Pikachu", 512],
  27: ["Sandshrew", 512],
  29: ["Nidoran ♀", 512],
  32: ["Nidoran ♂", 512],
  41: ["Zubat", 512],
  43: ["Oddish", 512],
  48: ["Venonat", 512],
  50: ["Diglett", 512],
  52: ["Meowth", 512],
  54: ["Psyduck", 512],
  56: ["Mankey", 512],
  58: ["Growlithe", 512],
  60: ["Poliwag", 512],
  63: ["Abra", 512],
  66: ["Machop", 512],
  72: ["Tentacool", 512],
  74: ["Geodude", 512],
  77: ["Ponyta", 512],
  81: ["Magnemite", 512],
  83: ["Farfetch'd", 256],
  86: ["Seel", 512],
  88: ["Grimer", 512],
  90: ["Shellder", 512],
  92: ["Gastly", 512],
  95: ["Onix", 64],
  96: ["Drowzee", 512],
  98: ["Krabby", 512],
  100: ["Voltorb", 512],
  102: ["Exeggcute", 512],
  104: ["Cubone", 512],
  108: ["Lickitung", 64],
  109: ["Koffing", 512],
  111: ["Rhyhorn", 512],
  113: ["Chansey", 64],
  115: ["Kangaskhan", 256],
  116: ["Horsea", 512],
  122: ["Mr. Mime", 256],
  123: ["Scyther", 64],
  126: ["Magmar", 512],
  127: ["Pinsir", 512],
  128: ["Tauros", 256],
  129: ["Magikarp", 512],
  131: ["Lapras", 64],
  133: ["Eevee", 512],
  138: ["Omanyte", 512],
  140: ["Kabuto", 512],
  142: ["Aerodactyl", 64],
  144: ["Articuno", 16],
  145: ["Zapdos", 16],
  146: ["Moltres", 16],
  147: ["Dratini", 512],
  150: ["Mewtwo", 16],
  152: ["Chikorita", 512],
  155: ["Cyndaquil", 512],
  158: ["Totodile", 512],
  161: ["Sentret", 512],
  170: ["Chinchou", 512],
  172: ["Pichu", 64],
  173: ["Cleffa", 64],
  174: ["Igglybuff", 64],
  175: ["Togepi", 64],
  177: ["Natu", 512],
  179: ["Mareep", 512],
  183: ["Marill", 512],
  185: ["Sudowoodo", 512],
  190: ["Aipom", 512],
  191: ["Sunkern", 512],
  193: ["Yanma", 512],
  198: ["Murkrow", 512],
  200: ["Misdreavus", 512],
  202: ["Wobbuffet", 512],
  204: ["Pineco", 64],
  206: ["Dunsparce", 512],
  207: ["Gligar", 64],
  209: ["Snubull", 512],
  213: ["Shuckle", 512],
  215: ["Sneasel", 64],
  216: ["Teddiursa", 512],
  220: ["Swinub", 512],
  225: ["Delibird", 512],
  227: ["Skarmory", 64],
  228: ["Houndour", 512],
  234: ["Stantler", 512],
  238: ["Smoochum", 64],
  239: ["Elekid", 64],
  240: ["Magby", 64],
  246: ["Larvitar", 512],
  249: ["Lugia", 16],
  250: ["Ho-Oh", 16],
  252: ["Treecko", 512],
  255: ["Torchic", 512],
  258: ["Mudkip", 512],
  261: ["Poochyena", 512],
  263: ["Zigzagoon", 512],
  265: ["Wurmple", 512],
  270: ["Lotad", 512],
  276: ["Tailow", 512],
  278: ["Wingull", 512],
  280: ["Ralts", 512],
  287: ["Slakoth", 512],
  290: ["Nincada", 64],
  296: ["Makuhita", 512],
  298: ["Azurill", 64],
  300: ["Skitty", 512],
  302: ["Sableye", 512],
  303: ["Mawile", 64],
  304: ["Aron", 512],
  307: ["Meditite", 512],
  309: ["Electrike", 512],
  311: ["Plusle", 512],
  312: ["Minun", 512],
  313: ["Volbeat", 512],
  314: ["Illumise", 512],
  315: ["Roselia", 512],
  318: ["Carvahna", 512],
  320: ["Wailmer", 512],
  325: ["Spoink", 512],
  327: ["Spinda", 64],
  328: ["Trapinch", 512],
  333: ["Swablu", 512],
  335: ["Zangoose", 512],
  336: ["Seviper", 512],
  337: ["Lunatone", 512],
  338: ["Solrock", 512],
  339: ["Barboach", 512],
  343: ["Baltoy", 512],
  345: ["Lileep", 512],
  347: ["Anorith", 512],
  349: ["Feebas", 64],
  351: ["Castform", 512],
  353: ["Shuppet", 512],
  355: ["Duskull", 512],
  359: ["Absol", 64],
  360: ["Wynaut", 64],
  361: ["Snorunt", 512],
  366: ["Clamperl", 64],
  370: ["Luvdisc", 512],
  371: ["Bagon", 512],
  374: ["Beldum", 512],
  377: ["Regirock", 16],
  378: ["Regice", 16],
  379: ["Registeel", 16],
  380: ["Latias", 16],
  381: ["Latios", 16],
  382: ["Kyogre", 16],
  383: ["Groudon", 16],
  384: ["Rayquaza", 16],
  387: ["Turtwig", 512],
  390: ["Chimchar", 512],
  393: ["Piplup", 512],
  403: ["Shinx", 64],
  406: ["Budew", 64],
  412: ["Burmy", 512],
  425: ["Drifloon", 512],
  427: ["Buneary", 512],
  431: ["Glameow", 512],
  436: ["Bronzor", 64],
  438: ["Bonsly", 64],
  439: ["Mime Jr.", 64],
  440: ["Happiny", 64],
  443: ["Gible", 128],
  447: ["Riolu", 16],
  449: ["Hippopotas", 512],
  451: ["Skorupi", 512],
  453: ["Croagunk", 512],
  459: ["Snover", 512],
  485: ["Heatran", 16],
  487: ["Giratina", 16],
  488: ["Cresselia", 16],
  491: ["Darkrai", 16],
  504: ["Patrat", 512],
  506: ["Lillipup", 512],
  532: ["Timburr", 64],
  572: ["Mincino", 512],
  599: ["Klink", 64],
  638: ["Cobalion", 16],
  639: ["Terrakium", 16],
  640: ["Virizion", 16],
};

for (var p in pokemons){
  var option = document.createElement("option");
  var number = p;
  if (number < 10) number = "00" + number;
  else if (number < 100) number = "0" + number;
  option.textContent = number + " " + pokemons[p][0];
  option.value = p;
  pokemon_selector.appendChild(option);
}

var current, odds, encounters, shinies, streak, worst_streak, best_streak;
var autochecking = false;
var autostarter = null;
var autochecker = null;
var sparkling = false;
var noflash = false;

pokemon.onmousedown = pokemon.ontouchstart = shiny.onmousedown = shiny.ontouchstart = function(e){
  e.preventDefault();
  if (autostarter == null) autostarter = setTimeout(autocheck, 500);
}

pokemon.onmouseup = pokemon.ontouchend = shiny.onmouseup = shiny.ontouchend = function(){
  if (!autochecking && !sparkling){
    flash.style.transition = "none";
    if (!noflash) flash.style.opacity = 0.4;
    setTimeout(reveal, 5);
  }
  autochecking = false;
  clearTimeout(autostarter);
  clearInterval(autochecker);
  autostarter = null;
}

pokemon_selector.onchange = function(){
  current = this.value;
  odds = pokemons[current][1];
  if (current < 10) current = "00" + current;
  else if (current < 100) current = "0" + current;
  pokemon.onload = function(){ pokemon.onmouseup(); };
  if (current != "412"){
    pokemon.src = "https://github.com/ZeChrales/PogoAssets/blob/master/pokemon_icons/pokemon_icon_" + current + "_00.png?raw=true";
    shiny.src = "https://github.com/ZeChrales/PogoAssets/blob/master/pokemon_icons/pokemon_icon_" + current + "_00_shiny.png?raw=true";
  } else { // Burmy
    pokemon.src = "https://github.com/ZeChrales/PogoAssets/blob/master/pokemon_icons/pokemon_icon_" + current + "_11.png?raw=true";
    shiny.src = "https://github.com/ZeChrales/PogoAssets/blob/master/pokemon_icons/pokemon_icon_" + current + "_11_shiny.png?raw=true"; 
  }
  encounters = shinies = streak = worst_streak = 0;
  best_streak = "-";
}
pokemon_selector.onchange();

function autocheck(){
  autochecking = true;
  autochecker = setInterval(reveal, 5);
}

function reveal(){
	encounters++;
	
	if (shiny.style.display == "block") streak = 0;
	streak++;
  if (streak > worst_streak) worst_streak = streak;

	if (Math.ceil(Math.random() * odds) == odds){
    shinies++;
    sparkling = true;
    clearInterval(autochecker);
		if (best_streak > streak || best_streak == "-") best_streak = streak;
		pokemon.style.display = "none";
    shiny.style.display = "block";
    setTimeout(shine, 400);
	} else {
		pokemon.style.display = "block";
    shiny.style.display = "none";
  }
	
	encounters_stat.textContent = encounters;
  shinies_stat.textContent = shinies;
	streak_stat.textContent = streak;
	worst_streak_stat.textContent = worst_streak;
	best_streak_stat.textContent = best_streak;

	flash.style.transition = "opacity 0.4s";
	flash.style.opacity = 0;
}

var sparkle = document.getElementById("sparkle");
var sparkles = document.getElementById("sparkles");
var ctx = sparkles.getContext("2d");
var particles = [];
var drawer;

function addSparkles(){
	for (var i = 0; i < 8; i++) particles.push({ "scale": 1, "radius": 60, "angle": 45 * i });
}

function drawSparkles(){
	ctx.clearRect(0, 0, 256, 256);
	for (p of particles){
      var x = 128 + p.radius * Math.cos(p.angle * Math.PI / 180);
      var y = 128 + p.radius * Math.sin(p.angle * Math.PI / 180);
      var scaled = Math.max(32 * p.scale, 0);
      ctx.drawImage(sparkle, x - scaled / 2, y - scaled / 2, scaled, scaled);
      if (p.scale > 0.6) p.scale -= 0.2;
      else p.scale -= 0.05;
      p.angle -= 5;
      p.radius += 5;
    }
}

function stopDrawing(){
	clearInterval(drawer);
	particles = [];
  sparkling = false;
}

function shine(){
  if (!particles.length){
    for (var i = 0; i < 5; i++) setTimeout(addSparkles, i * 100);
    drawer = setInterval(drawSparkles, 50);
    setTimeout(stopDrawing, 1000);
  }
}

document.getElementById("noflash").onchange = function(){
  noflash = this.checked;
}

document.body.onkeydown = function(e){
    e.preventDefault();
    if (e.keyCode == 32 && !sparkling) reveal();
}

pokemon.oncontextmenu = shiny.oncontextmenu = function(e){
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}
