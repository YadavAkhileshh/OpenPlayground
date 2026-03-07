// Fitness Analytics Dashboard Script
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const activityForm = document.getElementById('activityForm');
    const recentActivities = document.getElementById('recentActivities');
    const stepsGoalInput = document.getElementById('stepsGoal');
    const caloriesGoalInput = document.getElementById('caloriesGoal');
    const weightGoalInput = document.getElementById('weightGoal');
    const trendMetricSelect = document.getElementById('trendMetric');

    // Chart Canvases
    const weeklyStepsChartCanvas = document.getElementById('weeklyStepsChart');
    const monthlyTrendsChartCanvas = document.getElementById('monthlyTrendsChart');
    const heartRateChartCanvas = document.getElementById('heartRateChart');
    const weightChartCanvas = document.getElementById('weightChart');

    // Stats Elements
    const todayStepsEl = document.getElementById('todaySteps');
    const todayCaloriesEl = document.getElementById('todayCalories');
    const todayDistanceEl = document.getElementById('todayDistance');
    const todayActiveMinEl = document.getElementById('todayActiveMin');
    const currentWeightEl = document.getElementById('currentWeight');

    // Progress Elements
    const stepsProgressEl = document.getElementById('stepsProgress');
    const stepsProgressTextEl = document.getElementById('stepsProgressText');
    const caloriesProgressEl = document.getElementById('caloriesProgress');
    const caloriesProgressTextEl = document.getElementById('caloriesProgressText');

    // Insights Elements
    const activityInsightEl = document.getElementById('activityInsight');
    const goalInsightEl = document.getElementById('goalInsight');
    const heartInsightEl = document.getElementById('heartInsight');
    const weightInsightEl = document.getElementById('weightInsight');
    const recommendationEl = document.getElementById('recommendation');

    // Charts
    let weeklyStepsChart;
    let monthlyTrendsChart;
    let heartRateChart;
    let weightChart;

    // Initialize
    initializeApp();

    function initializeApp() {
        setDefaultDate();
        loadData();
        setupEventListeners();
        updateAllDisplays();
    }

    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entryDate').value = today;
        document.getElementById('entryTime').value = new Date().toTimeString().slice(0, 5);
    }

    function setupEventListeners() {
        activityForm.addEventListener('submit', handleActivitySubmit);
        stepsGoalInput.addEventListener('change', updateGoals);
        caloriesGoalInput.addEventListener('change', updateGoals);
        weightGoalInput.addEventListener('change', updateGoals);
        trendMetricSelect.addEventListener('change', updateMonthlyTrendsChart);
    }

    function handleActivitySubmit(e) {
        e.preventDefault();

        const activity = {
            date: document.getElementById('entryDate').value,
            time: document.getElementById('entryTime').value,
            steps: parseInt(document.getElementById('steps').value) || 0,
            calories: parseInt(document.getElementById('calories').value) || 0,
            distance: parseFloat(document.getElementById('distance').value) || 0,
            activeMinutes: parseInt(document.getElementById('activeMinutes').value) || 0,
            heartRate: parseInt(document.getElementById('heartRate').value) || 0,
            weight: parseFloat(document.getElementById('weight').value) || 0,
            notes: document.getElementById('notes').value,
            timestamp: new Date().getTime()
        };

        saveActivity(activity);
        activityForm.reset();
        setDefaultDate();
        loadData();
        updateAllDisplays();
    }

    function saveActivity(activity) {
        let activities = getStoredActivities();
        activities.push(activity);
        localStorage.setItem('fitnessActivities', JSON.stringify(activities));
    }

    function getStoredActivities() {
        return JSON.parse(localStorage.getItem('fitnessActivities')) || [];
    }

    function loadData() {
        // This function is called to refresh data, but actual loading is done in update functions
    }

    function updateAllDisplays() {
        updateTodayStats();
        updateGoals();
        updateRecentActivities();
        updateCharts();
        updateInsights();
    }

    function updateTodayStats() {
        const activities = getStoredActivities();
        const today = new Date().toISOString().split('T')[0];

        const todayActivities = activities.filter(activity => activity.date === today);

        const todayStats = todayActivities.reduce((acc, activity) => {
            acc.steps += activity.steps || 0;
            acc.calories += activity.calories || 0;
            acc.distance += activity.distance || 0;
            acc.activeMinutes += activity.activeMinutes || 0;
            return acc;
        }, { steps: 0, calories: 0, distance: 0, activeMinutes: 0 });

        // Update latest weight
        const weightEntries = activities.filter(activity => activity.weight > 0);
        if (weightEntries.length > 0) {
            const latestWeight = weightEntries.sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight;
            currentWeightEl.textContent = latestWeight.toFixed(1);
        }

        todayStepsEl.textContent = todayStats.steps.toLocaleString();
        todayCaloriesEl.textContent = todayStats.calories.toLocaleString();
        todayDistanceEl.textContent = todayStats.distance.toFixed(2);
        todayActiveMinEl.textContent = todayStats.activeMinutes;
    }

    function updateGoals() {
        const activities = getStoredActivities();
        const today = new Date().toISOString().split('T')[0];
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const todayActivities = activities.filter(activity => activity.date === today);
        const weekActivities = activities.filter(activity => new Date(activity.date) >= weekStart);

        const todayStats = todayActivities.reduce((acc, activity) => {
            acc.steps += activity.steps || 0;
            acc.calories += activity.calories || 0;
            return acc;
        }, { steps: 0, calories: 0 });

        const weekStats = weekActivities.reduce((acc, activity) => {
            acc.calories += activity.calories || 0;
            return acc;
        }, { calories: 0 });

        const stepsGoal = parseInt(stepsGoalInput.value) || 10000;
        const caloriesGoal = parseInt(caloriesGoalInput.value) || 3500;

        const stepsProgress = Math.min((todayStats.steps / stepsGoal) * 100, 100);
        const caloriesProgress = Math.min((weekStats.calories / caloriesGoal) * 100, 100);

        stepsProgressEl.style.width = stepsProgress + '%';
        caloriesProgressEl.style.width = caloriesProgress + '%';

        stepsProgressTextEl.textContent = `${todayStats.steps.toLocaleString()} / ${stepsGoal.toLocaleString()}`;
        caloriesProgressTextEl.textContent = `${weekStats.calories.toLocaleString()} / ${caloriesGoal.toLocaleString()}`;
    }

    function updateRecentActivities() {
        const activities = getStoredActivities();
        const recent = activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

        if (recent.length === 0) {
            recentActivities.innerHTML = '<p class="no-data">No activities logged yet.</p>';
            return;
        }

        recentActivities.innerHTML = recent.map(activity => `
            <div class="activity-item">
                <div class="activity-date">${formatDate(activity.date)} ${activity.time}</div>
                <div class="activity-metrics">
                    ${activity.steps ? `<div class="metric">Steps: <span>${activity.steps.toLocaleString()}</span></div>` : ''}
                    ${activity.calories ? `<div class="metric">Calories: <span>${activity.calories}</span></div>` : ''}
                    ${activity.distance ? `<div class="metric">Distance: <span>${activity.distance.toFixed(2)} km</span></div>` : ''}
                    ${activity.activeMinutes ? `<div class="metric">Active: <span>${activity.activeMinutes} min</span></div>` : ''}
                    ${activity.heartRate ? `<div class="metric">HR: <span>${activity.heartRate} bpm</span></div>` : ''}
                    ${activity.weight ? `<div class="metric">Weight: <span>${activity.weight.toFixed(1)} kg</span></div>` : ''}
                </div>
                ${activity.notes ? `<div class="metric">Notes: ${activity.notes}</div>` : ''}
            </div>
        `).join('');
    }

    function updateCharts() {
        updateWeeklyStepsChart();
        updateMonthlyTrendsChart();
        updateHeartRateChart();
        updateWeightChart();
    }

    function updateWeeklyStepsChart() {
        const activities = getStoredActivities();
        const weekData = getLast7DaysData(activities, 'steps');

        if (weeklyStepsChart) {
            weeklyStepsChart.destroy();
        }

        weeklyStepsChart = new Chart(weeklyStepsChartCanvas, {
            type: 'bar',
            data: {
                labels: weekData.labels,
                datasets: [{
                    label: 'Steps',
                    data: weekData.data,
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateMonthlyTrendsChart() {
        const activities = getStoredActivities();
        const metric = trendMetricSelect.value;
        const monthData = getLast30DaysData(activities, metric);

        if (monthlyTrendsChart) {
            monthlyTrendsChart.destroy();
        }

        monthlyTrendsChart = new Chart(monthlyTrendsChartCanvas, {
            type: 'line',
            data: {
                labels: monthData.labels,
                datasets: [{
                    label: getMetricLabel(metric),
                    data: monthData.data,
                    borderColor: 'rgba(118, 75, 162, 1)',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateHeartRateChart() {
        const activities = getStoredActivities();
        const heartRateData = activities
            .filter(activity => activity.heartRate > 0)
            .map(activity => activity.heartRate);

        const zones = {
            'Fat Burn (60-69%)': heartRateData.filter(hr => hr >= 100 && hr < 130).length,
            'Cardio (70-79%)': heartRateData.filter(hr => hr >= 130 && hr < 150).length,
            'Peak (80-89%)': heartRateData.filter(hr => hr >= 150 && hr < 170).length,
            'Maximum (90%+)': heartRateData.filter(hr => hr >= 170).length
        };

        if (heartRateChart) {
            heartRateChart.destroy();
        }

        heartRateChart = new Chart(heartRateChartCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(zones),
                datasets: [{
                    data: Object.values(zones),
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(255, 87, 34, 0.8)',
                        'rgba(244, 67, 54, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    function updateWeightChart() {
        const activities = getStoredActivities();
        const weightData = activities
            .filter(activity => activity.weight > 0)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = weightData.map(activity => activity.date);
        const data = weightData.map(activity => activity.weight);

        if (weightChart) {
            weightChart.destroy();
        }

        weightChart = new Chart(weightChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight (kg)',
                    data: data,
                    borderColor: 'rgba(233, 30, 99, 1)',
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    function updateInsights() {
        const activities = getStoredActivities();
        const insights = generateInsights(activities);

        activityInsightEl.textContent = insights.activity;
        goalInsightEl.textContent = insights.goals;
        heartInsightEl.textContent = insights.heart;
        weightInsightEl.textContent = insights.weight;
        recommendationEl.textContent = insights.recommendation;
    }

    function generateInsights(activities) {
        const insights = {
            activity: '',
            goals: '',
            heart: '',
            weight: '',
            recommendation: ''
        };

        if (activities.length === 0) {
            insights.activity = 'Start logging your activities to see insights!';
            insights.goals = 'Set your fitness goals to track progress.';
            insights.heart = 'Monitor your heart rate during activities.';
            insights.weight = 'Track your weight changes over time.';
            insights.recommendation = 'Begin with daily step counting and build from there.';
            return insights;
        }

        // Activity insights
        const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0);
        const avgSteps = totalSteps / activities.length;
        if (avgSteps < 5000) {
            insights.activity = 'Your average daily steps are low. Try to increase walking activity.';
        } else if (avgSteps < 10000) {
            insights.activity = 'Good progress! You\'re averaging moderate activity levels.';
        } else {
            insights.activity = 'Excellent! You\'re highly active with great step counts.';
        }

        // Goals insights
        const todaySteps = parseInt(todayStepsEl.textContent.replace(/,/g, ''));
        const stepsGoal = parseInt(stepsGoalInput.value);
        if (todaySteps >= stepsGoal) {
            insights.goals = 'Congratulations! You\'ve met your daily steps goal.';
        } else {
            insights.goals = `You're ${(stepsGoal - todaySteps).toLocaleString()} steps away from your daily goal.`;
        }

        // Heart rate insights
        const heartRates = activities.filter(a => a.heartRate > 0).map(a => a.heartRate);
        if (heartRates.length > 0) {
            const avgHR = heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length;
            if (avgHR < 60) {
                insights.heart = 'Your average heart rate is quite low. Consult a doctor if concerned.';
            } else if (avgHR < 100) {
                insights.heart = 'Your resting heart rate appears normal and healthy.';
            } else {
                insights.heart = 'Your heart rate is elevated. Consider cardiovascular exercise.';
            }
        } else {
            insights.heart = 'Start tracking heart rate to monitor cardiovascular health.';
        }

        // Weight insights
        const weights = activities.filter(a => a.weight > 0);
        if (weights.length > 1) {
            const sortedWeights = weights.sort((a, b) => new Date(a.date) - new Date(b.date));
            const firstWeight = sortedWeights[0].weight;
            const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
            const weightChange = lastWeight - firstWeight;
            if (Math.abs(weightChange) < 0.5) {
                insights.weight = 'Your weight has been stable. Focus on maintaining healthy habits.';
            } else if (weightChange > 0) {
                insights.weight = `You've gained ${weightChange.toFixed(1)} kg. Consider adjusting diet or exercise.`;
            } else {
                insights.weight = `You've lost ${Math.abs(weightChange).toFixed(1)} kg. Great progress!`;
            }
        } else {
            insights.weight = 'Track your weight regularly to monitor progress.';
        }

        // Recommendations
        const recommendations = [];
        if (avgSteps < 8000) recommendations.push('Increase daily steps by taking short walks');
        if (heartRates.length < 5) recommendations.push('Track heart rate during workouts');
        if (weights.length < 7) recommendations.push('Weigh yourself weekly');
        if (recommendations.length === 0) {
            insights.recommendation = 'Keep up the great work! Consider setting new challenges.';
        } else {
            insights.recommendation = recommendations.join('. ') + '.';
        }

        return insights;
    }

    // Helper functions
    function getLast7DaysData(activities, metric) {
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

            const dayActivities = activities.filter(a => a.date === dateStr);
            const value = dayActivities.reduce((sum, a) => sum + (a[metric] || 0), 0);
            data.push(value);
        }

        return { labels, data };
    }

    function getLast30DaysData(activities, metric) {
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(date);

            const dayActivities = activities.filter(a => a.date === dateStr);
            const value = dayActivities.reduce((sum, a) => sum + (a[metric] || 0), 0);
            data.push(value);
        }

        return { labels, data };
    }

    function getMetricLabel(metric) {
        const labels = {
            steps: 'Steps',
            calories: 'Calories',
            distance: 'Distance (km)',
            activeMinutes: 'Active Minutes',
            heartRate: 'Heart Rate (bpm)'
        };
        return labels[metric] || metric;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
});