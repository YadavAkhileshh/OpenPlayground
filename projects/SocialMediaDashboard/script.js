let data = {
  followers: 1200,
  likes: 350,
  comments: 90,
  posts: 45
};

const activities = [
  "📸 New photo uploaded",
  "❤️ Someone liked a post",
  "💬 New comment received",
  "➕ New follower joined",
  "🎥 Video posted",
  "🔥 Post is trending",
  "🔁 Post shared"
];

const followersEl = document.getElementById("followers");
const likesEl = document.getElementById("likes");
const commentsEl = document.getElementById("comments");
const postsEl = document.getElementById("posts");
const feed = document.getElementById("activityFeed");

// Initialize dashboard
function updateStats() {
  followersEl.textContent = data.followers;
  likesEl.textContent = data.likes;
  commentsEl.textContent = data.comments;
  postsEl.textContent = data.posts;
}

updateStats();

// Simulate real-time updates
setInterval(() => {
  const randomAction = Math.floor(Math.random() * 4);

  switch (randomAction) {
    case 0:
      data.followers += Math.floor(Math.random() * 3);
      addFeed("➕ New follower joined");
      break;
    case 1:
      data.likes += Math.floor(Math.random() * 5);
      addFeed("❤️ A post received new likes");
      break;
    case 2:
      data.comments += Math.floor(Math.random() * 2);
      addFeed("💬 New comment added");
      break;
    case 3:
      data.posts += 1;
      addFeed("📸 New post published");
      break;
  }

  updateStats();
}, 2000);

// Add activity to feed
function addFeed(text) {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} — ${text}`;
  feed.prepend(li);

  if (feed.children.length > 10) {
    feed.removeChild(feed.lastChild);
  }
}
