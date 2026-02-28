
// SkillShare Hub - Peer Learning Platform
// Author: Ayaanshaikh12243
// Description: Live sessions, tutorials, projects, forums, recommendations, ratings, feedback

// =====================
// Utility Functions
// =====================
const Utils = {
	generateId: () => '_' + Math.random().toString(36).substr(2, 9),
	formatDate: (date) => {
		const d = new Date(date);
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
	},
	debounce: (func, wait) => {
		let timeout;
		return function(...args) {
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), wait);
		};
	},
	clone: (obj) => JSON.parse(JSON.stringify(obj)),
};

// =====================
// Models
// =====================
class LiveSession {
	constructor({title, instructor, time, description}) {
		this.id = Utils.generateId();
		this.title = title || '';
		this.instructor = instructor || 'Anonymous';
		this.time = time || null;
		this.description = description || '';
		this.participants = [];
		this.feedback = [];
	}
}

class Tutorial {
	constructor({title, instructor, url, description}) {
		this.id = Utils.generateId();
		this.title = title || '';
		this.instructor = instructor || 'Anonymous';
		this.url = url || '';
		this.description = description || '';
		this.ratings = [];
		this.comments = [];
	}
}

class ProjectSpace {
	constructor({title, members, description}) {
		this.id = Utils.generateId();
		this.title = title || '';
		this.members = members || [];
		this.description = description || '';
		this.resources = [];
		this.discussions = [];
	}
}

class Forum {
	constructor({topic, createdBy}) {
		this.id = Utils.generateId();
		this.topic = topic || '';
		this.createdBy = createdBy || 'Anonymous';
		this.posts = [];
	}
}

// =====================
// Main Platform Class
// =====================
class SkillShareHub {
	constructor() {
		this.liveSessions = [];
		this.tutorials = [];
		this.projects = [];
		this.forums = [];
		this.userInterests = [];
		this.load();
	}

	// Live Sessions
	createSession(data) {
		const session = new LiveSession(data);
		this.liveSessions.push(session);
		this.save();
		return session;
	}
	joinSession(sessionId, user) {
		const session = this.liveSessions.find(s => s.id === sessionId);
		if (session && !session.participants.includes(user)) {
			session.participants.push(user);
			this.save();
		}
	}
	addSessionFeedback(sessionId, user, feedback) {
		const session = this.liveSessions.find(s => s.id === sessionId);
		if (session) {
			session.feedback.push({user, feedback, date: new Date()});
			this.save();
		}
	}

	// Tutorials
	uploadTutorial(data) {
		const tutorial = new Tutorial(data);
		this.tutorials.push(tutorial);
		this.save();
		return tutorial;
	}
	rateTutorial(tutorialId, user, rating) {
		const tutorial = this.tutorials.find(t => t.id === tutorialId);
		if (tutorial) {
			tutorial.ratings.push({user, rating});
			this.save();
		}
	}
	commentTutorial(tutorialId, user, comment) {
		const tutorial = this.tutorials.find(t => t.id === tutorialId);
		if (tutorial) {
			tutorial.comments.push({user, comment, date: new Date()});
			this.save();
		}
	}

	// Projects
	createProject(data) {
		const project = new ProjectSpace(data);
		this.projects.push(project);
		this.save();
		return project;
	}
	joinProject(projectId, user) {
		const project = this.projects.find(p => p.id === projectId);
		if (project && !project.members.includes(user)) {
			project.members.push(user);
			this.save();
		}
	}
	addProjectResource(projectId, resource) {
		const project = this.projects.find(p => p.id === projectId);
		if (project) {
			project.resources.push(resource);
			this.save();
		}
	}
	addProjectDiscussion(projectId, user, message) {
		const project = this.projects.find(p => p.id === projectId);
		if (project) {
			project.discussions.push({user, message, date: new Date()});
			this.save();
		}
	}

	// Forums
	createForum(topic, createdBy) {
		const forum = new Forum({topic, createdBy});
		this.forums.push(forum);
		this.save();
		return forum;
	}
	addForumPost(forumId, user, message) {
		const forum = this.forums.find(f => f.id === forumId);
		if (forum) {
			forum.posts.push({user, message, date: new Date()});
			this.save();
		}
	}

	// Recommendations (simple: based on userInterests)
	getRecommendations() {
		// Recommend tutorials and sessions matching userInterests
		const interests = this.userInterests;
		const recs = [];
		this.tutorials.forEach(tut => {
			if (interests.some(i => tut.title.toLowerCase().includes(i.toLowerCase()))) recs.push({type: 'Tutorial', item: tut});
		});
		this.liveSessions.forEach(sess => {
			if (interests.some(i => sess.title.toLowerCase().includes(i.toLowerCase()))) recs.push({type: 'Session', item: sess});
		});
		return recs;
	}
	setUserInterests(interests) {
		this.userInterests = interests;
		this.save();
	}

	save() {
		localStorage.setItem('skillsharehub_data', JSON.stringify({
			liveSessions: this.liveSessions,
			tutorials: this.tutorials,
			projects: this.projects,
			forums: this.forums,
			userInterests: this.userInterests
		}));
	}
	load() {
		const data = localStorage.getItem('skillsharehub_data');
		if (data) {
			const parsed = JSON.parse(data);
			this.liveSessions = parsed.liveSessions || [];
			this.tutorials = parsed.tutorials || [];
			this.projects = parsed.projects || [];
			this.forums = parsed.forums || [];
			this.userInterests = parsed.userInterests || [];
		}
	}
}

// =====================
// Notifications
// =====================
class Notifier {
	static show(message) {
		const notif = document.getElementById('notifications');
		if (!notif) return;
		notif.textContent = message;
		notif.style.display = 'block';
		setTimeout(() => { notif.style.display = 'none'; }, 2500);
	}
}

// =====================
// UI Rendering
// =====================
class UI {
	constructor(platform) {
		this.platform = platform;
		this.renderAll();
		this.bindEvents();
	}
	renderAll() {
		this.renderLiveSessions();
		this.renderTutorials();
		this.renderProjects();
		this.renderForums();
		this.renderRecommendations();
	}
	renderLiveSessions() {
		const container = document.getElementById('live-sessions');
		if (!container) return;
		container.innerHTML = '';
		this.platform.liveSessions.forEach(session => {
			const div = document.createElement('div');
			div.className = 'session-item';
			div.innerHTML = `
				<b>${session.title}</b> <span>by ${session.instructor}</span><br>
				<span>${Utils.formatDate(session.time)}</span><br>
				<span>${session.description}</span><br>
				<span>Participants: ${session.participants.length}</span>
				<button data-id="${session.id}" class="join-session-btn">Join</button>
				<button data-id="${session.id}" class="feedback-session-btn">Feedback</button>
			`;
			container.appendChild(div);
		});
	}
	renderTutorials() {
		const container = document.getElementById('tutorials-list');
		if (!container) return;
		container.innerHTML = '';
		this.platform.tutorials.forEach(tut => {
			const div = document.createElement('div');
			div.className = 'tutorial-item';
			div.innerHTML = `
				<b>${tut.title}</b> <span>by ${tut.instructor}</span><br>
				<a href="${tut.url}" target="_blank">Watch</a><br>
				<span>${tut.description}</span><br>
				<span>Ratings: ${tut.ratings.length}</span>
				<button data-id="${tut.id}" class="rate-tutorial-btn">Rate</button>
				<button data-id="${tut.id}" class="comment-tutorial-btn">Comment</button>
			`;
			container.appendChild(div);
		});
	}
	renderProjects() {
		const container = document.getElementById('projects-list');
		if (!container) return;
		container.innerHTML = '';
		this.platform.projects.forEach(proj => {
			const div = document.createElement('div');
			div.className = 'project-item';
			div.innerHTML = `
				<b>${proj.title}</b> <span>Members: ${proj.members.length}</span><br>
				<span>${proj.description}</span><br>
				<button data-id="${proj.id}" class="join-project-btn">Join</button>
				<button data-id="${proj.id}" class="add-resource-btn">Add Resource</button>
				<button data-id="${proj.id}" class="add-discussion-btn">Discuss</button>
			`;
			container.appendChild(div);
		});
	}
	renderForums() {
		const container = document.getElementById('forums-list');
		if (!container) return;
		container.innerHTML = '';
		this.platform.forums.forEach(forum => {
			const div = document.createElement('div');
			div.className = 'forum-item';
			div.innerHTML = `
				<b>${forum.topic}</b> <span>by ${forum.createdBy}</span><br>
				<span>Posts: ${forum.posts.length}</span>
				<button data-id="${forum.id}" class="add-post-btn">Add Post</button>
			`;
			container.appendChild(div);
		});
	}
	renderRecommendations() {
		const container = document.getElementById('recommendations');
		if (!container) return;
		container.innerHTML = '';
		const recs = this.platform.getRecommendations();
		if (recs.length === 0) {
			container.innerHTML = '<em>No recommendations yet. Set your interests!</em>';
		} else {
			recs.forEach(rec => {
				const div = document.createElement('div');
				div.innerHTML = `<b>${rec.type}:</b> ${rec.item.title}`;
				container.appendChild(div);
			});
		}
	}
	bindEvents() {
		// Create Session
		document.getElementById('create-session-btn')?.addEventListener('click', () => {
			const title = prompt('Session Title:');
			const instructor = prompt('Instructor Name:', 'Anonymous');
			const time = prompt('Date/Time (YYYY-MM-DD HH:MM):');
			const description = prompt('Description:');
			if (title && time) {
				this.platform.createSession({title, instructor, time, description});
				this.renderLiveSessions();
				Notifier.show('Live session created!');
			}
		});
		// Join Session & Feedback
		document.getElementById('live-sessions')?.addEventListener('click', (e) => {
			if (e.target.classList.contains('join-session-btn')) {
				const id = e.target.getAttribute('data-id');
				const user = prompt('Your name:', 'Anonymous');
				if (id && user) {
					this.platform.joinSession(id, user);
					this.renderLiveSessions();
					Notifier.show('Joined session!');
				}
			} else if (e.target.classList.contains('feedback-session-btn')) {
				const id = e.target.getAttribute('data-id');
				const user = prompt('Your name:', 'Anonymous');
				const feedback = prompt('Your feedback:');
				if (id && user && feedback) {
					this.platform.addSessionFeedback(id, user, feedback);
					Notifier.show('Feedback submitted!');
				}
			}
		});
		// Upload Tutorial
		document.getElementById('upload-tutorial-btn')?.addEventListener('click', () => {
			const title = prompt('Tutorial Title:');
			const instructor = prompt('Instructor Name:', 'Anonymous');
			const url = prompt('Video URL:');
			const description = prompt('Description:');
			if (title && url) {
				this.platform.uploadTutorial({title, instructor, url, description});
				this.renderTutorials();
				Notifier.show('Tutorial uploaded!');
			}
		});
		// Rate & Comment Tutorial
		document.getElementById('tutorials-list')?.addEventListener('click', (e) => {
			if (e.target.classList.contains('rate-tutorial-btn')) {
				const id = e.target.getAttribute('data-id');
				const user = prompt('Your name:', 'Anonymous');
				const rating = prompt('Your rating (1-5):');
				if (id && user && rating) {
					this.platform.rateTutorial(id, user, rating);
					this.renderTutorials();
					Notifier.show('Tutorial rated!');
				}
			} else if (e.target.classList.contains('comment-tutorial-btn')) {
				const id = e.target.getAttribute('data-id');
				const user = prompt('Your name:', 'Anonymous');
				const comment = prompt('Your comment:');
				if (id && user && comment) {
					this.platform.commentTutorial(id, user, comment);
					Notifier.show('Comment added!');
				}
			}
		});
		// Create Project
		document.getElementById('create-project-btn')?.addEventListener('click', () => {
			const title = prompt('Project Title:');
			const members = prompt('Initial Members (comma separated):', 'Anonymous').split(',').map(s => s.trim());
			const description = prompt('Description:');
			if (title) {
				this.platform.createProject({title, members, description});
				this.renderProjects();
				Notifier.show('Project space created!');
			}
		});
		// Join Project, Add Resource, Discuss
		document.getElementById('projects-list')?.addEventListener('click', (e) => {
			const id = e.target.getAttribute('data-id');
			if (e.target.classList.contains('join-project-btn')) {
				const user = prompt('Your name:', 'Anonymous');
				if (id && user) {
					this.platform.joinProject(id, user);
					this.renderProjects();
					Notifier.show('Joined project!');
				}
			} else if (e.target.classList.contains('add-resource-btn')) {
				const resource = prompt('Resource URL or description:');
				if (id && resource) {
					this.platform.addProjectResource(id, resource);
					Notifier.show('Resource added!');
				}
			} else if (e.target.classList.contains('add-discussion-btn')) {
				const user = prompt('Your name:', 'Anonymous');
				const message = prompt('Discussion message:');
				if (id && user && message) {
					this.platform.addProjectDiscussion(id, user, message);
					Notifier.show('Discussion added!');
				}
			}
		});
		// Create Forum, Add Post
		document.getElementById('forums-list')?.addEventListener('click', (e) => {
			if (e.target.classList.contains('add-post-btn')) {
				const id = e.target.getAttribute('data-id');
				const user = prompt('Your name:', 'Anonymous');
				const message = prompt('Forum post:');
				if (id && user && message) {
					this.platform.addForumPost(id, user, message);
					Notifier.show('Forum post added!');
				}
			}
		});
		// Browse Tutorials
		document.getElementById('browse-tutorials-btn')?.addEventListener('click', () => {
			alert('Scroll to Tutorials section to browse all tutorials.');
		});
		// Set Interests for Recommendations
		document.getElementById('recommendations')?.addEventListener('click', () => {
			const interests = prompt('Enter your interests (comma separated):', '').split(',').map(s => s.trim());
			this.platform.setUserInterests(interests);
			this.renderRecommendations();
			Notifier.show('Interests updated!');
		});
	}
}

// =====================
// Main App Initialization
// =====================
window.addEventListener('DOMContentLoaded', () => {
	const platform = new SkillShareHub();
	const ui = new UI(platform);
});
