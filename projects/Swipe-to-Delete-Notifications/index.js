import React, {
	StrictMode,
	useState,
	useRef,
	useEffect
} from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
import clsx from "https://esm.sh/clsx";
import {
	LucideIcon,
	Clock,
	Trash2,
	Bell,
	BookOpen,
	ChartColumn,
	HeartPulse,
	KeyRound,
	Lectern,
	PencilLine,
	Podcast
} from "https://esm.sh/lucide-react";
import { faker } from "https://esm.sh/@faker-js/faker";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<NotificationCenter/>
	</StrictMode>
);

function createMockNotification(): NotificationData {
	const apps: Record<string, AppIcon> = {
		books: {
			title: "Books",
			icon: BookOpen,
			iconColor: "hsl(30 90% 50%)"
		},
		health: {
			title: "Health",
			icon: HeartPulse,
			iconColor: "hsl(0 90% 50%)"
		},
		keynote: {
			title: "Keynote",
			icon: Lectern,
			iconColor: "hsl(210 90% 50%)"
		},
		numbers: {
			title: "Numbers",
			icon: ChartColumn,
			iconColor: "hsl(120 90% 30%)"
		},
		pages: {
			title: "Pages",
			icon: PencilLine,
			iconColor: "hsl(25 90% 40%)"
		},
		passwords: {
			title: "Passwords",
			icon: KeyRound,
			iconColor: "hsl(40 90% 50%)"
		},
		podcasts: {
			title: "Podcasts",
			icon: Podcast,
			iconColor: "hsl(270 90% 50%)"
		}
	} as const;
	const appNames = Object.keys(apps);
	const app = faker.helpers.arrayElement(appNames);
	const { title, icon, iconColor } = apps[app];

	return {
		id: faker.string.uuid(),
		title,
		icon,
		iconColor,
		message: Utils.toSentenceCase(faker.hacker.phrase()),
		timestamp: faker.date.recent({ days: 3 })
	};
}

function createMockNotifications(count: number = 2): NotificationData[] {
	return faker.helpers.multiple(createMockNotification, { count });
}

function NotificationCenter() {
	// get notification data
	const [notifications, setNotifications] = useState(createMockNotifications(5));
	const notificationsSorted = [...notifications].sort((a, b) =>
		b.timestamp.getTime() - a.timestamp.getTime()
	);
	const delayInc: number = 50;

	const handleDelete = (id: string) => {
		// in a real app, you might call an API here
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	return (
		<div className="notification-center">
			{notifications.length === 0 ? (
				<div className="notification-center__empty">
					<Bell />
					<p>All caught up!</p>
				</div>
			) : (
				notificationsSorted.map((n, i) => (
					<NotificationItem
						key={n.id}
						data={n}
						onDelete={handleDelete}
						delay={delayInc * i}
					/>
				))
			)}
		</div>
	);
}

interface NotificationItemProps {
	data: NotificationData;
	onDelete: (id: string) => void;
	isRTL?: boolean;
	delay?: number;
}

function NotificationItem({
	data,
	onDelete,
	isRTL = false,
	delay = 0
}: Readonly<NotificationItemProps>) {
	const deleteRef = useRef<number>(0);
	const swipeAwayRef = useRef<number>(0);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [offset, setOffset] = useState<number>(0); // visual X displacement
	const startXRef = useRef<number>(0);
	const currentOffsetRef = useRef<number>(0);
	const deleteThreshold: number = 0.3; // drag a percentage of the width to auto-delete
	const Icon: LucideIcon = data.icon;
	const delayStyle: React.CSSProperties | undefined =
		delay > 0 ? { animationDelay: `${delay}ms` } : undefined;
	const revealWidth: number = 92; // width of the delete button in px
	const deleteBtnStyle: React.CSSProperties = { width: `${revealWidth}px` };
	const contentStyle = { transform: `translateX(${offset}px)` };
	const noteTitleId = `item-title-${data.id}`;
	const noteMessageId = `item-message-${data.id}`;
	const noteTimestampId = `item-timestamp-${data.id}`;
	const noteDeleteId = `item-delete-${data.id}`;
	const noteDescribedBy = `${noteMessageId} ${noteTimestampId} ${noteDeleteId}`;

	const handlePointerDown = (e: React.PointerEvent) => {
		// enable dragging
		setIsDragging(true);

		startXRef.current = e.clientX;
		// capture pointer ensures events keep firing even if cursor leaves element bounds
		(e.target as Element).setPointerCapture(e.pointerId);
	};
	const handlePointerMove = (e: React.PointerEvent) => {
		if (!isDragging) return;

		const currentX = e.clientX;
		const diff = currentX - startXRef.current;
		// RTL: dragging Right (+) reveals content
		// LTR: dragging Left (-) reveals content
		let newOffset = diff;
		// don’t allow dragging in the “wrong” direction (closing direction) if already closed
		if ((!isRTL && newOffset > 0) || (isRTL && newOffset < 0)) {
			newOffset = 0;
		}

		currentOffsetRef.current = newOffset;

		setOffset(newOffset);
	};
	const handlePointerUp = (e: React.PointerEvent) => {
		setIsDragging(false);

		const elementWidth = (e.currentTarget as HTMLElement).offsetWidth;
		const rawOffset = currentOffsetRef.current;
		// get absolute distance dragged
		const distance = Math.abs(rawOffset);
		const isSwipingAway = isRTL ? rawOffset > 0 : rawOffset < 0;

		if (isSwipingAway) {
			// check full delete threshold
			if (distance > elementWidth * deleteThreshold) {
				// Animate off screen completely, then delete
				const offScreenDir = isRTL ? 1 : -1;

				setOffset(elementWidth * offScreenDir);
				// wait for delete animation
				swipeAwayRef.current = setTimeout(triggerDelete, 100);
				return;
			}

			// check reveal threshold (partially open)
			if (distance > revealWidth / 2) {
				const revealDir = isRTL ? 1 : -1;

				setOffset(revealWidth * revealDir);

				currentOffsetRef.current = revealWidth * revealDir;
			} else {
				// snap back to closed
				setOffset(0);

				currentOffsetRef.current = 0;
			}
		} else {
			setOffset(0);

			currentOffsetRef.current = 0;
		}

		(e.target as Element).releasePointerCapture(e.pointerId);
	};
	const handleKeydown = (e: React.KeyboardEvent) => {
		if (e.key === "Delete" || e.key === "Backspace") {
			triggerDelete();
		}
	}
	const triggerDelete = () => {
		setIsDeleting(true);
		// wait for the CSS transition before removing from DOM
		deleteRef.current = setTimeout(() => {
			onDelete(data.id);
		}, 300);
	};

	useEffect(() => {
		return () => {
			clearTimeout(deleteRef.current);
			clearTimeout(swipeAwayRef.current);
		};
	}, []);

	return (
		<div
			className={clsx(
				"notification-item",
				isDeleting && "notification-item--deleting"
			)}
			style={delayStyle}
		>
			<div className="notification-item__wrapper">
				<div className="notification-item__actions">
					<button
						className="notification-item__delete-btn"
						onClick={() => onDelete(data.id)}
						tabIndex={offset === 0 ? -1 : 0} // only tab-able if open
						aria-hidden={offset === 0}
						aria-label="Delete"
						style={deleteBtnStyle}
					>
						<Trash2 />
					</button>
				</div>
				<button
					className={clsx(
						"notification-item__content",
						isDragging && "notification-item__content--dragging"
					)}
					style={contentStyle}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerUp}
					onKeyDown={handleKeydown}
					type="button"
					aria-labelledby={noteTitleId}
					aria-describedby={noteDescribedBy}
				>
					<span
						className="notification-item__icon-bg"
						style={{ backgroundColor: data.iconColor }}
					>
						<Icon className="notification-item__icon" />
					</span>
					<span>
						<span
							id={noteTitleId}
							className="notification-item__title"
						>
							{data.title}
						</span>
						<span
							id={noteMessageId}
							className="notification-item__message"
						>
							{data.message}
						</span>
						<span
							id={noteTimestampId}
							className="notification-item__timestamp"
						>
							<Clock />
							{Utils.getRelativeTimeString(data.timestamp)}
						</span>
						<span
							id={noteDeleteId}
							className="notification-item__sr"
						>
							Press Backspace or Delete to dismiss.
						</span>
					</span>
				</button>
			</div>
		</div>
	);
}

class Utils {
	static getRelativeTimeString(date: Date, lang = "en-US") {
		const timeMs = typeof date === "number" ? date : date.getTime();
		const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
		const cutoffs = [
			{ type: "year", value: 31536000 },
			{ type: "month", value: 2592000 },
			{ type: "week", value: 604800 },
			{ type: "day", value: 86400 },
			{ type: "hour", value: 3600 },
			{ type: "minute", value: 60 },
			{ type: "second", value: 1 }
		];

		const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });

		for (const unit of cutoffs) {
			if (Math.abs(deltaSeconds) >= unit.value) {
				return rtf.format(
					Math.round(deltaSeconds / unit.value),
					unit.type as Intl.RelativeTimeFormatUnit
				);
			}
		}

		return "just now";
	}
	static toSentenceCase(str: string) {
		if (!str) return "";
		// replace separators with spaces
		const spaced = str.replaceAll(/[-_]/g, " ");
		// capitalize first letter, lowercase the rest
		return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
	}
}

type AppIcon = {
	title: string;
	icon: LucideIcon,
	iconColor: string;
}
interface NotificationData extends AppIcon {
	id: string;
	message: string;
	timestamp: Date;
}