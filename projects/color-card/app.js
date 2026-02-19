console.clear();

const COLS = 10;
const gridWrapper = document.getElementById("colors");
const cells = [...gridWrapper.querySelectorAll("button")];
const ROWS = Math.ceil(cells.length / COLS);

cells.forEach((cell, i) => {
	cell.addEventListener("mouseenter", () => {
		const row = Math.floor(i / COLS);

		// remove previous hover classes from hovered cell
		cell.classList.remove("first-row", "last-row", "first-col", "last-col");

		// edge detection
		if (row === 0) cell.classList.add("first-row");
		if (row === ROWS - 1) cell.classList.add("last-row");
		if (i % COLS === 0) cell.classList.add("first-col");
		if (i % COLS === COLS - 1) cell.classList.add("last-col");

		const relations = [
			{ idx: i - COLS, classes: ["row-before"], row: row - 1 },
			{ idx: i + COLS, classes: ["row-after"], row: row + 1 },

			{ idx: i - 1, classes: ["cell-before"], row },
			{ idx: i + 1, classes: ["cell-after"], row },

			{ idx: i - COLS - 1, classes: ["row-before", "cell-before"], row: row - 1 },
			{ idx: i - COLS + 1, classes: ["row-before", "cell-after"], row: row - 1 },
			{ idx: i + COLS - 1, classes: ["row-after", "cell-before"], row: row + 1 },
			{ idx: i + COLS + 1, classes: ["row-after", "cell-after"], row: row + 1 }
		];

		relations.forEach(({ idx, classes, row: expectedRow }) => {
			if (!cells[idx]) return;
			if (Math.floor(idx / COLS) !== expectedRow) return;
			cells[idx].classList.add(...classes);
		});
	});

	cell.addEventListener("mouseleave", () => {
		cells.forEach((el) => (el.className = ""));
	});

	// event - click - copy color name
	cell.addEventListener("click", () => {
		const color = cell.dataset.color;
		navigator.clipboard.writeText(color);
		cell.classList.add("copied");
		setTimeout(() => cell.classList.remove("copied"), 750);
	});
});
