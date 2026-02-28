//data
const questions = [
    {
        Q: 'Q.1 What does “Open Source” mean?',
        options: [
            'Software that is free to use only',
            'Software whose source code is publicly available',
            'Software owned by one company',
            'Software that runs only online'
        ],
        correctIdx: 1
    },
    {
        Q: 'Q.2 Which license is an open-source license?',
        options: [
            'Proprietary License',
            'MIT License',
            'Commercial License',
            'Trial License'
        ],
        correctIdx: 1
    },
    {
        Q: 'Q.3 Which platform is most commonly used for open-source collaboration?',
        options: [
            'Bitbucket',
            'GitHub',
            'Google Drive',
            'Dropbox'
        ],
        correctIdx: 1
    },
    {
        Q: 'Q.4 What is a “repository” in open source?',
        options: [
            'A software bug',
            'A place where code is stored and managed',
            'A programming language',
            'A software license'
        ],
        correctIdx: 1
    },
    {
        Q: 'Q.5 What does a “pull request” do?',
        options: [
            'Deletes code from a repository',
            'Requests permission to download code',
            'Proposes changes to be merged into a project',
            'Runs automated tests'
        ],
        correctIdx: 2
    },
    {
        Q: 'Q.6 Who can contribute to an open-source project?',
        options: [
            'Only the project owner',
            'Only paid developers',
            'Only senior developers',
            'Anyone with the required skills'
        ],
        correctIdx: 3
    },
    {
        Q: 'Q.7 What file usually explains how to contribute to a project?',
        options: [
            'index.html',
            'package.json',
            'CONTRIBUTING.md',
            'style.css'
        ],
        correctIdx: 2
    },
    {
        Q: 'Q.8 What is the purpose of an open-source license?',
        options: [
            'To hide source code',
            'To restrict all usage',
            'To define how software can be used and shared',
            'To increase software size'
        ],
        correctIdx: 2
    },
    {
        Q: 'Q.9 Which of these is an example of open-source software?',
        options: [
            'Windows',
            'Adobe Photoshop',
            'Linux',
            'Microsoft Word'
        ],
        correctIdx: 2
    },
    {
        Q: 'Q.10 What is a "fork" in open source?',
        options: [
            'A bug in the code',
            'A copy of a repository for independent development',
            'A programming tool',
            'A license type'
        ],
        correctIdx: 1
    }
];
//# sourceMappingURL=questions.js.map
//logic
const question = document.querySelector('h2');
const ol = document.querySelector('ol');
const nextBtn = document.querySelector('button');
let currQuesIdx = 0;
let score = 0;
function startQuiz() {
    currQuesIdx = 0;
    score = 0;
    nextBtn.innerHTML = 'Next';
    renderQues();
}
function renderQues() {
    reset();
    //current q. obj get
    const current = questions[currQuesIdx];
    if (!current)
        return;
    //assign q. text in string
    const currentQues = current.Q;
    question.textContent = currentQues;
    current.options.forEach((option, idx) => {
        const li = document.createElement('li');
        li.textContent = option;
        li.addEventListener('click', () => {
            //disable further clicks
            ol.querySelectorAll('li').forEach(li => li.style.pointerEvents = 'none');
            if (idx === current.correctIdx) {
                li.classList.add('correct');
                score++;
            }
            else {
                li.classList.add('wrong');
                const correctLi = ol.children[current.correctIdx];
                correctLi.classList.add('correct');
            }
            nextBtn.style.display = 'block';
        });
        ol.appendChild(li);
    });
}
function reset() {
    ol.innerHTML = '';
    nextBtn.style.display = 'none';
}
nextBtn.addEventListener('click', () => {
    currQuesIdx++;
    if (currQuesIdx < questions.length) {
        renderQues();
    }
    else {
        question.textContent = `Quiz Finished 🎉 Score: ${score}/${questions.length}`;
        ol.innerHTML = '';
        nextBtn.style.display = 'none';
    }
});
startQuiz();
