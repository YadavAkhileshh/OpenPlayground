import React, { useState, useEffect } from "https://esm.sh/react@19";
import ReactDOM from "https://esm.sh/react-dom@19/client";

const r = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const ICONS = [
	"hat-wizard",
	"ghost",
	"skull-crossbones",
	"spider",
	"toilet-paper",
	"atom",
	"biohazard",
	"fire",
	"radiation",
	"snowflake",
	"shrimp",
	"fish",
	"cloud-bolt",
	"meteor",
	"satellite",
	"horse",
	"hippo",
	"dragon"
];

const DIRECTIONS = ["l", "u", "d", "r"];
const KEYS = {
	ArrowUp: "u",
	ArrowDown: "d",
	ArrowLeft: "l",
	ArrowRight: "r",
	w: "u",
	s: "d",
	a: "l",
	d: "r"
};

const COLORS = ["yellow", "orange", "blue", "green"];

const gem = (min, max) => {
	const length = r(min, max);
	const result = [];
	for (let i = 0; i < length; i++) {
		result.push(DIRECTIONS[r(0, 3)]);
	}

	return result;
};

const GEMS = ICONS.map((icon) => {
	return {
		name: icon,
		sequence: gem(4, 8),
		color: COLORS[r(0, 3)]
	};
});

const GEMS_LENGTH = GEMS.length - 1;

const Screen = ({ children, effect }) => {
	return <div className={effect ? "screen" : ""}>{children}</div>;
};

const StartScreen = ({ onGame, onEffect }) => {
	return (
		<div className="start-screen">
			<div className="start-screen__content">
				<header>
					<ol className="game-screen__sequence">
						{["u", "d", "r", "l", "l", "d"].map((arrow, index) => (
							<li className={`game-screen__entry`} key={`${index}-${arrow}`}>
								<Arrow direction={arrow} />
							</li>
						))}
					</ol>
					<h1 className="start-screen__title">
						<span>React</span>agems
					</h1>
					<p className="start-screen__description">An ode to Hell Divers 2</p>
				</header>
				<button className="start-screen__button" onClick={onGame}>
					<span className="start-screen-button__title">Start</span>
				</button>
				<button
					className="start-screen__button start-screen__button--small"
					onClick={onEffect}
				>
					<span className="start-screen-button__title">Toggle Effect</span>
				</button>
			</div>
		</div>
	);
};

const Arrow = ({ direction }) => {
	if (direction === "u") {
		return (
			<div className="game-screen__arrow">
				<i class="fa-solid fa-arrow-up"></i>
			</div>
		);
	}
	if (direction === "d") {
		return (
			<div className="game-screen__arrow">
				<i class="fa-solid fa-arrow-down"></i>
			</div>
		);
	}
	if (direction === "r") {
		return (
			<div className="game-screen__arrow">
				<i class="fa-solid fa-arrow-right"></i>
			</div>
		);
	}
	return (
		<div className="game-screen__arrow">
			<i class="fa-solid fa-arrow-left"></i>
		</div>
	);
};

const GameScreen = ({ score, highScore, isHighScoreRun, onEnd, onScore }) => {
	const [minLength, setMinLength] = useState(4);
	const [maxLength, setMaxLength] = useState(7);

	const [timeLeft, setTimeLeft] = useState(10);
	const [maxTime, setMaxTime] = useState(10);
	const [gem, setGem] = useState(GEMS[r(0, GEMS_LENGTH)]);
	const [cursor, setCursor] = useState(0);

	useEffect(() => {
		const handleKeyDown = (event) => {
			const current = KEYS[event.key];
			const target = gem.sequence[cursor];

			if (!current || target !== current) {
				onEnd();
			}

			const next = cursor + 1;
			if (next == gem.sequence.length) {
				onScore(gem.sequence.length);
				setGem(GEMS[r(0, GEMS_LENGTH)]);
				setMaxTime((prev) => prev + 2);
				setTimeLeft((prev) => prev + 2);
				setCursor(0);
			} else {
				setCursor(next);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [gem, cursor, score]);

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					onEnd();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const progress = Math.max(0, timeLeft / maxTime) * 100;

	return (
		<div className="game-screen">
			<div className="game-screen__content">
				<div className="game-screen__top">
					<p className="game-screen__score">
						<span className="game-screen__label">Score</span>
						<span class="game-screen__value">{score}</span>
					</p>
					<p className="game-screen__highscore">
						<span className="game-screen__label">High Score</span>
						<span className="game-screen__value">{highScore}</span>
					</p>
				</div>
				<div className={`game-screen__gem game-screen__gem--${gem.color}`}>
					<i className={`fas fa-${gem.name}`}></i>
				</div>
				<ol className="game-screen__sequence">
					{gem.sequence.map((arrow, index) => (
						<li
							className={`game-screen__entry ${
								index < cursor ? "game-screen__entry--success" : ""
							}`}
							key={`${index}-${arrow}`}
						>
							<Arrow direction={arrow} />
						</li>
					))}
				</ol>
				<div className="game-screen__info">
					<p className="game-screen__label">Time Left</p>
					<div className="game-screen__timer">
						<div
							className="game-screen__progress"
							style={{ width: `calc(${progress}% - 4px)` }}
						></div>
					</div>
				</div>
			</div>
		</div>
	);
};

const EndScreen = ({ score, highScore, isHighScoreRun, onGame, onStart }) => {
	return (
		<div className="end-screen">
			<div className="end-screen__content">
				{isHighScoreRun ? (
					<p className="end-screen__description">New High Score!</p>
				) : (
					""
				)}
				<h1 className="end-screen__title">{score}</h1>
				{!isHighScoreRun ? (
					<p className="end-screen__description">
						Nice Try!
						<br /> You should've tried to beat {highScore}
					</p>
				) : (
					""
				)}
				<button className="end-screen__button" onClick={onGame}>
					<span className="end-screen-button__title">Try Again</span>
				</button>
				<button
					className="end-screen__button end-screen__button--small"
					onClick={onStart}
				>
					<span className="end-screen-button__title">Back to the Start</span>
				</button>
			</div>
		</div>
	);
};

const App = () => {
	const [effect, setEffect] = useState(true);
	const [screen, setScreen] = useState("start");
	const [score, setScore] = useState(0);

	const [isHighScoreRun, setIsHighScoreRun] = useState(false);

	const [highScore, setHighScore] = useState(() => {
		const stored = localStorage.getItem("highscore");
		return stored ? parseInt(stored) : 0;
	});

	const onScore = (length) => {
		setScore((prev) => {
			const newScore = prev + length * 25;

			setHighScore((high) => {
				if (newScore > high) {
					localStorage.setItem("highscore", String(newScore));
					setIsHighScoreRun(true);
					return newScore;
				}
				return high;
			});

			return newScore;
		});
	};

	const onStart = () => {
		setScreen("start");
	};

	const onGame = () => {
		setScore(0);
		setIsHighScoreRun(false);
		setScreen("game");
	};

	const onEnd = () => {
		setScreen("end");
	};

	const onEffect = () => {
		setEffect((prev) => !prev);
	};

	if (screen === "game") {
		return (
			<Screen effect={effect}>
				<GameScreen
					score={score}
					highScore={highScore}
					onEnd={onEnd}
					onScore={onScore}
				/>
			</Screen>
		);
	}

	if (screen === "end") {
		return (
			<Screen effect={effect}>
				<EndScreen
					isHighScoreRun={isHighScoreRun}
					score={score}
					highScore={highScore}
					onGame={onGame}
					onStart={onStart}
				/>
			</Screen>
		);
	}

	return (
		<Screen effect={effect}>
			<StartScreen onGame={onGame} onEffect={onEffect} />
		</Screen>
	);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
