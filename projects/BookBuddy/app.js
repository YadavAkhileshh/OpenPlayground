// BookBuddy Main JavaScript

const recommendForm = document.getElementById('recommendForm');
const resultDiv = document.getElementById('result');
const logSection = document.getElementById('logSection');
const logForm = document.getElementById('logForm');
const logList = document.getElementById('logList');
const clearLogBtn = document.getElementById('clearLog');

const recommendations = {
  fiction: [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee' },
    { title: '1984', author: 'George Orwell' }
  ],
  nonfiction: [
    { title: 'Sapiens', author: 'Yuval Noah Harari' },
    { title: 'Educated', author: 'Tara Westover' },
    { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot' }
  ],
  fantasy: [
    { title: 'Harry Potter and the Sorcerer’s Stone', author: 'J.K. Rowling' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien' },
    { title: 'Mistborn', author: 'Brandon Sanderson' }
  ],
  science: [
    { title: 'A Brief History of Time', author: 'Stephen Hawking' },
    { title: 'The Selfish Gene', author: 'Richard Dawkins' },
    { title: 'Astrophysics for People in a Hurry', author: 'Neil deGrasse Tyson' }
  ],
  history: [
    { title: 'Guns, Germs, and Steel', author: 'Jared Diamond' },
    { title: '1776', author: 'David McCullough' },
    { title: 'The Wright Brothers', author: 'David McCullough' }
  ],
  biography: [
    { title: 'Steve Jobs', author: 'Walter Isaacson' },
    { title: 'Becoming', author: 'Michelle Obama' },
    { title: 'Long Walk to Freedom', author: 'Nelson Mandela' }
  ],
  mystery: [
    { title: 'Gone Girl', author: 'Gillian Flynn' },
    { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson' },
    { title: 'Sherlock Holmes: The Complete Novels', author: 'Arthur Conan Doyle' }
  ]
};

let readingLog = JSON.parse(localStorage.getItem('bookBuddyLog') || '[]');

function saveLog() {
  localStorage.setItem('bookBuddyLog', JSON.stringify(readingLog));
}

function renderLog() {
  logList.innerHTML = '';
  if (readingLog.length === 0) {
    logList.innerHTML = '<li>No books logged yet.</li>';
    return;
  }
  readingLog.slice(-20).reverse().forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.book}</strong> by ${item.author} | Finished: ${item.date}`;
    logList.appendChild(li);
  });
}

function addToLog(book, author, date) {
  readingLog.push({
    book,
    author,
    date
  });
  if (readingLog.length > 100) readingLog = readingLog.slice(-100);
  saveLog();
  renderLog();
}

recommendForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const genre = document.getElementById('genre').value;
  if (!genre || !recommendations[genre]) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<span style="color:red">Please select a valid genre.</span>';
    return;
  }
  const books = recommendations[genre];
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `<strong>Recommendations for ${genre.charAt(0).toUpperCase() + genre.slice(1)}:</strong><ul>${books.map(book => `<li>${book.title} by ${book.author}</li>`).join('')}</ul>`;
});

logForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const book = document.getElementById('book').value.trim();
  const author = document.getElementById('author').value.trim();
  const date = document.getElementById('date').value;
  if (!book || !author || !date) {
    return;
  }
  addToLog(book, author, date);
  logForm.reset();
});

clearLogBtn.addEventListener('click', function() {
  readingLog = [];
  saveLog();
  renderLog();
});

// Initial render
renderLog();
