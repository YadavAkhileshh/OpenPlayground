const board = document.querySelector(".board");
const cards = board.querySelectorAll(".card");
const triesValue = document.querySelector(".tries-value");
const best = document.querySelector(".interface-data-best");
const bestValue = best.querySelector(".best-value");
const marquee = document.querySelector(".marquee");
const marqueeText = document.querySelector(".marquee-text");
const faces = ["🙂", "😄", "😜", "😮", "😉", "😌"];
const cls = {
	completed: "is-complete",
	combo: "is-combo",
	loading: "is-loading",
	matched: "is-matched",
	waiting: "is-waiting"
};
let selectedCard;
let triesCount = 0;
let matchCount = 0;
let comboCount = 0;
let bestCount;
let completeCount = faces.length;

const shuffle = (arr) => {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}

	return arr;
};

const displayMarquee = (str, isCombo) => {
	marquee.classList.toggle(cls.combo, isCombo);
	marqueeText.textContent = str;
	marquee.style.setProperty("display", "grid");
};

const toggleCardSelected = (card) => {
	const isPressed = card.getAttribute("aria-pressed") === "true";
	card.setAttribute("aria-pressed", isPressed ? "false" : "true");
};

const setMatchedProps = (el) => {
	el.setAttribute("disabled", "");
	el.classList.add(cls.matched);
};

const updateTries = (value) => {
	triesCount = value;
	triesValue.textContent = value;
};

const checkMatch = (card) => {
	const cardFace = card.getAttribute("data-face");
	const selectedCardFace = selectedCard.getAttribute("data-face");

	board.classList.add(cls.waiting);

	if (cardFace === selectedCardFace) {
		setMatchedProps(card);
		setMatchedProps(selectedCard);
		matchCount++;
		comboCount++;

		if (comboCount > 1) {
			displayMarquee(`${comboCount}×!`, true);
		}

		setTimeout(() => {
			card.removeAttribute("aria-pressed");
			selectedCard.removeAttribute("aria-pressed");
			selectedCard = null;
			board.classList.remove(cls.waiting);
		}, 500);
	} else {
		comboCount = 0;

		setTimeout(() => {
			toggleCardSelected(card);
			toggleCardSelected(selectedCard);
			selectedCard = null;
			board.classList.remove(cls.waiting);
		}, 1000);
	}

	updateTries(triesCount + 1);
};

const checkBest = () => {
	if (!bestCount || triesCount < bestCount) {
		best.style.setProperty("display", "flex");
		bestCount = triesCount;
		bestValue.textContent = bestCount;
	}
};

const checkComplete = () => {
	if (matchCount !== completeCount) {
		return;
	}

	displayMarquee("Unmasked!", false);

	setTimeout(() => {
		board.classList.add(cls.completed);
	}, 1000);
};

const resetGame = () => {
	if (board.classList.contains(cls.completed)) {
		checkBest();
	}

	matchCount = 0;
	comboCount = 0;
	updateTries(0);
	selectedCard = null;

	cards.forEach((card) => {
		card.removeAttribute("disabled");
		card.removeAttribute("aria-pressed");
		card.classList.remove(cls.matched);
	});

	board.classList.remove(cls.completed);
};

const setupGame = () => {
	const fragment = document.createDocumentFragment();
	const shuffledFaces = shuffle(faces.concat(faces));
	const shuffledCards = shuffle([...cards]);

	shuffledCards.forEach((card, index) => {
		const face = shuffledFaces[index];

		card.setAttribute("data-face", face);
		card.style.setProperty("--i", index + 1);
		card.querySelector(".face").innerHTML = face;
		fragment.append(card);
	});

	board.classList.add(cls.loading);
	board.replaceChildren(fragment);
	setTimeout(() => {
		board.classList.remove(cls.loading);
	}, 1000);
};

cards.forEach((card) =>
	card.addEventListener("click", () => {
		toggleCardSelected(card);

		if (!selectedCard) {
			selectedCard = card;
			return;
		}

		if (card === selectedCard) {
			selectedCard = null;
			return;
		}

		checkMatch(card);
		checkComplete();
	})
);

marquee.addEventListener("animationend", (e) => {
	if (e.animationName !== "marquee-reveal") {
		return;
	}
	marquee.style.setProperty("display", "none");
});

document.querySelector("#reset-game").addEventListener("click", () => {
	resetGame();
	setupGame();
});

setupGame();
