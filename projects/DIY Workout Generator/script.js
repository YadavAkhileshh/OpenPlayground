const generateBtn = document.getElementById('generateBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const workoutPlanDiv = document.getElementById('workoutPlan');
const favoritesDiv = document.getElementById('favorites');

let currentWorkout = [];

// Hardcoded exercise database with more exercises
const exercises = {
    none: {
        strength: [
            { name: "Push-ups", sets: 3, reps: "12-15", rest: "60s", icon: "💪" },
            { name: "Bodyweight Squats", sets: 3, reps: "15-20", rest: "60s", icon: "🦵" },
            { name: "Plank", sets: 3, reps: "30-60s", rest: "45s", icon: "🧘" },
            { name: "Lunges", sets: 3, reps: "12 per leg", rest: "60s", icon: "🦿" },
            { name: "Tricep Dips", sets: 3, reps: "12-15", rest: "45s", icon: "🤸" }
        ],
        endurance: [
            { name: "Jumping Jacks", sets: 3, reps: "50", rest: "30s", icon: "🤸" },
            { name: "High Knees", sets: 3, reps: "45s", rest: "30s", icon: "🏃" },
            { name: "Mountain Climbers", sets: 3, reps: "40", rest: "30s", icon: "⛰️" },
            { name: "Burpees", sets: 3, reps: "15", rest: "45s", icon: "💥" },
            { name: "Butt Kicks", sets: 3, reps: "50", rest: "30s", icon: "🏃‍♂️" }
        ],
        fatloss: [
            { name: "Burpees", sets: 3, reps: "12", rest: "45s", icon: "💥" },
            { name: "Jump Squats", sets: 3, reps: "15", rest: "45s", icon: "🦵" },
            { name: "Plank Jacks", sets: 3, reps: "30s", rest: "30s", icon: "🧘" },
            { name: "Mountain Climbers", sets: 3, reps: "40", rest: "30s", icon: "⛰️" },
            { name: "High Knees", sets: 3, reps: "45s", rest: "30s", icon: "🏃" }
        ]
    },
    dumbbell: {
        strength: [
            { name: "Dumbbell Bench Press", sets: 3, reps: "10-12", rest: "60s", icon: "🏋️" },
            { name: "Dumbbell Rows", sets: 3, reps: "12", rest: "60s", icon: "🏋️" },
            { name: "Dumbbell Lunges", sets: 3, reps: "12 per leg", rest: "60s", icon: "🦵" },
            { name: "Bicep Curls", sets: 3, reps: "12-15", rest: "45s", icon: "💪" },
            { name: "Shoulder Press", sets: 3, reps: "10-12", rest: "60s", icon: "🤸" }
        ],
        endurance: [
            { name: "Dumbbell Thrusters", sets: 3, reps: "15", rest: "45s", icon: "🏋️" },
            { name: "Dumbbell Snatches", sets: 3, reps: "12", rest: "45s", icon: "💥" },
            { name: "Dumbbell Swings", sets: 3, reps: "20", rest: "30s", icon: "🏋️" },
            { name: "Burpees with Dumbbells", sets: 3, reps: "12", rest: "45s", icon: "💥" },
            { name: "Dumbbell Jumping Jacks", sets: 3, reps: "30", rest: "30s", icon: "🤸" }
        ],
        fatloss: [
            { name: "Dumbbell Burpees", sets: 3, reps: "12", rest: "45s", icon: "💥" },
            { name: "Dumbbell Jump Squats", sets: 3, reps: "15", rest: "45s", icon: "🦵" },
            { name: "Dumbbell Russian Twist", sets: 3, reps: "20", rest: "30s", icon: "🌀" },
            { name: "Dumbbell Lunges", sets: 3, reps: "12 per leg", rest: "60s", icon: "🦵" },
            { name: "Dumbbell Mountain Climbers", sets: 3, reps: "40", rest: "30s", icon: "⛰️" }
        ]
    }
};

// Generate workout
function generateWorkout() {
    const equipment = document.getElementById('equipment').value;
    const goal = document.getElementById('goal').value;

    currentWorkout = exercises[equipment] ? exercises[equipment][goal] : exercises['none'][goal];

    renderWorkout();
}

// Render workout
function renderWorkout() {
    workoutPlanDiv.innerHTML = '';
    currentWorkout.forEach((ex, index) => {
        const card = document.createElement('div');
        card.classList.add('exercise-card');
        card.innerHTML = `
            <div class="exercise-header">
                <span>${ex.icon}</span>
                <strong>${ex.name}</strong>
            </div>
            <div>${ex.sets} sets x ${ex.reps} (Rest: ${ex.rest})</div>
            <div>
                <button class="favorite-btn" onclick="saveFavorite(${index})">⭐ Save</button>
                <button onclick="toggleComplete(this)">✔️ Done</button>
            </div>
        `;
        workoutPlanDiv.appendChild(card);
    });
}

// Shuffle
function shuffleWorkout() {
    for (let i = currentWorkout.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentWorkout[i], currentWorkout[j]] = [currentWorkout[j], currentWorkout[i]];
    }
    renderWorkout();
}

// Mark complete
function toggleComplete(btn) {
    btn.parentElement.parentElement.classList.toggle('completed');
}

// Save favorite
function saveFavorite(index) {
    const fav = currentWorkout[index];
    const div = document.createElement('div');
    div.classList.add('fav-item');
    div.innerText = `${fav.icon} ${fav.name} - ${fav.sets}x${fav.reps} (Rest: ${fav.rest})`;
    favoritesDiv.appendChild(div);
}

generateBtn.addEventListener('click', generateWorkout);
shuffleBtn.addEventListener('click', shuffleWorkout);
