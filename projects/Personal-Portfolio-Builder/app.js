const nameInput = document.getElementById('name');
const bioInput = document.getElementById('bio');
const skillsInput = document.getElementById('skills');
const githubInput = document.getElementById('github');
const linkedinInput = document.getElementById('linkedin');
const twitterInput = document.getElementById('twitter');
const profilePicInput = document.getElementById('profilePic');
const profilePicPreview = document.getElementById('profilePicPreview');
const previewPic = document.getElementById('previewPic');

const previewName = document.getElementById('previewName');
const previewBio = document.getElementById('previewBio');
const previewSkills = document.getElementById('previewSkills');
const previewProjects = document.getElementById('previewProjects');
const previewSocial = document.getElementById('previewSocial');
const projectsList = document.getElementById('projectsList');
const addProjectBtn = document.getElementById('addProject');
const themeToggle = document.getElementById('themeToggle');
const exportBtn = document.getElementById('exportBtn');
const portfolioPreview = document.getElementById('portfolioPreview');

let profilePicData = '';
let projectsData = [];

function updateProfilePicPreview() {
	if (profilePicData) {
		profilePicPreview.innerHTML = `<img src="${profilePicData}" alt="Profile picture" width="80" height="80" tabindex="0">`;
		previewPic.innerHTML = `<img src="${profilePicData}" alt="Profile picture" width="80" height="80" tabindex="0">`;
	} else {
		profilePicPreview.innerHTML = '';
		previewPic.innerHTML = '';
	}
}

profilePicInput.addEventListener('change', function(e) {
	const file = e.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function(evt) {
			profilePicData = evt.target.result;
			updateProfilePicPreview();
		};
		reader.readAsDataURL(file);
	} else {
		profilePicData = '';
		updateProfilePicPreview();
	}
});

function updatePreview() {
	previewName.textContent = nameInput.value || 'Your Name';
	previewBio.textContent = bioInput.value || 'Short bio will appear here.';
	updateProfilePicPreview();

	// Social links
	while (previewSocial.firstChild) previewSocial.removeChild(previewSocial.firstChild);
	const socials = [
		{ id: 'github', url: githubInput.value, icon: '🐙', label: 'GitHub' },
		{ id: 'linkedin', url: linkedinInput.value, icon: '🔗', label: 'LinkedIn' },
		{ id: 'twitter', url: twitterInput.value, icon: '🐦', label: 'Twitter' }
	];
	socials.forEach(s => {
		if (s.url) {
			const a = document.createElement('a');
			a.href = s.url;
			a.target = '_blank';
			a.rel = 'noopener noreferrer';
			a.textContent = s.icon;
			a.setAttribute('aria-label', s.label);
			a.setAttribute('tabindex', '0');
			previewSocial.appendChild(a);
		}
	});

	// Skills
	previewSkills.innerHTML = '';
	const skillsArr = skillsInput.value.split(',').map(s => s.trim()).filter(s => s);
	skillsArr.forEach(skill => {
		const li = document.createElement('li');
		li.textContent = skill;
		previewSkills.appendChild(li);
	});

	// Projects
	previewProjects.innerHTML = '';
	projectsData.forEach((project) => {
		if (!project.title && !project.desc && !project.link) return;
		const li = document.createElement('li');
		let html = `<strong>${project.title}</strong>`;
		if (project.desc) html += `: ${project.desc}`;
		if (project.link) html += ` <a href="${project.link}" target="_blank" aria-label="Project Link" tabindex="0">🔗</a>`;
		li.innerHTML = html;
		previewProjects.appendChild(li);
	});
}

function addProjectField(title = '', desc = '', link = '') {
	projectsData.push({ title, desc, link });
	renderProjectFields();
	updatePreview();
}

function removeProjectField(index) {
	projectsData.splice(index, 1);
	renderProjectFields();
	updatePreview();
}

function renderProjectFields() {
	projectsList.innerHTML = '';
	projectsData.forEach((project, idx) => {
		const div = document.createElement('div');
		div.className = 'project-fields';
		div.innerHTML = `
			<input type="text" placeholder="Title" value="${project.title}" data-idx="${idx}" class="project-title" aria-label="Project Title">
			<input type="text" placeholder="Description" value="${project.desc}" data-idx="${idx}" class="project-desc" aria-label="Project Description">
			<input type="url" placeholder="Link (optional)" value="${project.link}" data-idx="${idx}" class="project-link" aria-label="Project Link">
			<button type="button" class="remove-project" data-idx="${idx}" aria-label="Remove Project">Remove</button>
		`;
		projectsList.appendChild(div);
	});
}

projectsList.addEventListener('input', function(e) {
	const idx = e.target.getAttribute('data-idx');
	if (e.target.classList.contains('project-title')) {
		projectsData[idx].title = e.target.value;
	} else if (e.target.classList.contains('project-desc')) {
		projectsData[idx].desc = e.target.value;
	} else if (e.target.classList.contains('project-link')) {
		projectsData[idx].link = e.target.value;
	}
	updatePreview();
});

projectsList.addEventListener('click', function(e) {
	if (e.target.classList.contains('remove-project')) {
		const idx = e.target.getAttribute('data-idx');
		removeProjectField(idx);
	}
});

addProjectBtn.addEventListener('click', function() {
	addProjectField();
});

const inputs = [nameInput, bioInput, skillsInput, githubInput, linkedinInput, twitterInput];
inputs.forEach(input => input.addEventListener('input', updatePreview));

window.addEventListener('DOMContentLoaded', () => {
	addProjectField();
	updatePreview();
});

// Theme switcher
themeToggle.addEventListener('click', () => {
	document.body.classList.toggle('dark');
	themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
	themeToggle.setAttribute('aria-label', document.body.classList.contains('dark') ? 'Switch to light mode' : 'Switch to dark mode');
});

// Keyboard accessibility for theme toggle
themeToggle.addEventListener('keydown', (e) => {
	if (e.key === 'Enter' || e.key === ' ') {
		e.preventDefault();
		themeToggle.click();
	}
});

// Export to HTML
exportBtn.addEventListener('click', () => {
	const styleTag = document.querySelector('style');
	const styleContent = styleTag ? styleTag.textContent : '';
	const html = `<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>${nameInput.value || 'Portfolio'}</title>
<style>${styleContent}</style>
</head>
<body${document.body.classList.contains('dark') ? " class='dark'" : ''}>
<div class='container'>${portfolioPreview.innerHTML}</div>
</body>
</html>`;
	const blob = new Blob([html], { type: 'text/html' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = 'portfolio.html';
	a.click();
});
