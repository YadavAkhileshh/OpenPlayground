class BMICalculator {
	constructor() {
		this.isMetric = true;
		this.gender = 'male';
		this.history = this.loadHistory();
		this.chart = null;
		this.validationState = {
			weight: false,
			height: false,
			age: false
		};
		this.initializeElements();
		this.bindEvents();
		this.updatePlaceholders();
		this.updateHistoryControls();
		this.renderHistory();
	}

	initializeElements() {
		this.form = document.getElementById('bmiForm');
		this.weightInput = document.getElementById('weightInput');
		this.heightInput = document.getElementById('heightInput');
		this.ageInput = document.getElementById('ageInput');
		this.weightError = document.getElementById('weightError');
		this.heightError = document.getElementById('heightError');
		this.ageError = document.getElementById('ageError');
		this.result = document.getElementById('result');
		this.bmiDisplay = document.getElementById('bmiDisplay');
		this.bmiValue = document.getElementById('bmiValue');
		this.bmiCategory = document.getElementById('bmiCategory');
		this.bmiRange = document.getElementById('bmiRange');
		this.bmiAdvice = document.getElementById('bmiAdvice');
		this.submitBtn = document.getElementById('submitBtn');
		this.metricBtn = document.getElementById('metricBtn');
		this.imperialBtn = document.getElementById('imperialBtn');
		this.historyList = document.getElementById('historyList');
		this.clearHistoryBtn = document.getElementById('clearHistory');
		this.listViewBtn = document.getElementById('listViewBtn');
		this.chartViewBtn = document.getElementById('chartViewBtn');
		this.chartContainer = document.getElementById('chartContainer');
		this.weightUp = document.getElementById('weightUp');
		this.weightDown = document.getElementById('weightDown');
		this.heightUp = document.getElementById('heightUp');
		this.heightDown = document.getElementById('heightDown');
		this.ageUp = document.getElementById('ageUp');
		this.ageDown = document.getElementById('ageDown');
		this.maleBtn = document.getElementById('maleBtn');
		this.femaleBtn = document.getElementById('femaleBtn');
		this.weightLabel = document.getElementById('weightLabel');
		this.heightLabel = document.getElementById('heightLabel');
	}

	bindEvents() {
		this.form.addEventListener('submit', (e) => this.handleSubmit(e));
		this.metricBtn.addEventListener('click', () => this.toggleUnit(true));
		this.imperialBtn.addEventListener('click', () => this.toggleUnit(false));
		this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
		this.listViewBtn.addEventListener('click', () => this.showListView());
		this.chartViewBtn.addEventListener('click', () => this.showChartView());

		this.weightUp.addEventListener('click', () => this.incrementValue('weight', 0.1));
		this.weightDown.addEventListener('click', () => this.incrementValue('weight', -0.1));
		this.heightUp.addEventListener('click', () => this.incrementValue('height', 0.1));
		this.heightDown.addEventListener('click', () => this.incrementValue('height', -0.1));
		this.ageUp.addEventListener('click', () => this.incrementValue('age', 1));
		this.ageDown.addEventListener('click', () => this.incrementValue('age', -1));

		this.weightInput.addEventListener('input', () => this.validateField('weight'));
		this.heightInput.addEventListener('input', () => this.validateField('height'));
		this.ageInput.addEventListener('input', () => this.validateField('age'));

		this.maleBtn.addEventListener('click', () => this.toggleGender('male'));
		this.femaleBtn.addEventListener('click', () => this.toggleGender('female'));
	}

	incrementValue(fieldType, step) {
		let input;
		if (fieldType === 'weight') input = this.weightInput;
		else if (fieldType === 'height') input = this.heightInput;
		else if (fieldType === 'age') input = this.ageInput;

		const currentValue = parseFloat(input.value) || 0;
		const newValue = Math.max(0, currentValue + step);

		if (fieldType === 'age') {
			input.value = Math.round(newValue);
		} else {
			input.value = newValue.toFixed(1);
		}

		input.dispatchEvent(new Event('input'));
		this.validateField(fieldType);
	}

	toggleUnit(isMetric) {
		this.isMetric = isMetric;
		this.metricBtn.classList.toggle('active', isMetric);
		this.imperialBtn.classList.toggle('active', !isMetric);
		this.updateLabelsAndPlaceholders();
		this.clearForm();
		this.hideResult();
	}

	toggleGender(gender) {
		this.gender = gender;
		this.maleBtn.classList.toggle('active', gender === 'male');
		this.femaleBtn.classList.toggle('active', gender === 'female');
	}

	updateLabelsAndPlaceholders() {
		if (this.isMetric) {
			this.weightLabel.innerHTML = 'Weight <span class="unit-badge">(kg)</span>';
			this.heightLabel.innerHTML = 'Height <span class="unit-badge">(cm)</span>';
			this.weightInput.placeholder = 'Enter weight';
			this.heightInput.placeholder = 'Enter height';
		} else {
			this.weightLabel.innerHTML = 'Weight <span class="unit-badge">(lbs)</span>';
			this.heightLabel.innerHTML = 'Height <span class="unit-badge">(in)</span>';
			this.weightInput.placeholder = 'Enter weight';
			this.heightInput.placeholder = 'Enter height';
		}
	}

	updatePlaceholders() {
		this.updateLabelsAndPlaceholders();
	}

	clearForm() {
		this.weightInput.value = '';
		this.heightInput.value = '';
		this.ageInput.value = '';
		this.clearValidation();
		this.hideResult();
		this.updateSubmitButton();
	}

	handleSubmit(e) {
		e.preventDefault();

		const weightValid = this.validateField('weight', true);
		const heightValid = this.validateField('height', true);
		const ageValid = this.validateField('age', true);

		if (!weightValid || !heightValid || !ageValid) {
			this.focusFirstInvalid();
			return;
		}

		const weight = parseFloat(this.weightInput.value);
		const height = parseFloat(this.heightInput.value);
		const age = parseInt(this.ageInput.value);

		const bmi = this.calculateBMI(weight, height);
		const category = this.getBMICategory(bmi, age, this.gender);

		this.displayResult(bmi, category, age, this.gender);
		this.saveToHistory(weight, height, age, this.gender, bmi, category);
	}

	validateField(fieldType, forceShowError = false) {
		let input, errorElement;

		if (fieldType === 'weight') {
			input = this.weightInput;
			errorElement = this.weightError;
		} else if (fieldType === 'height') {
			input = this.heightInput;
			errorElement = this.heightError;
		} else if (fieldType === 'age') {
			input = this.ageInput;
			errorElement = this.ageError;
		}

		const value = input.value.trim();

		input.classList.remove('error', 'success');
		errorElement.classList.remove('show');
		errorElement.textContent = '';
		input.setAttribute('aria-invalid', 'false');

		if (value === '') {
			if (forceShowError) {
				let fieldName = fieldType === 'weight' ? 'weight' : fieldType === 'height' ? 'height' : 'age';
				this.setFieldError(
					input,
					errorElement,
					`Please enter your ${fieldName}.`
				);
			}
			this.validationState[fieldType] = false;
			this.updateSubmitButton();
			return false;
		}

		const numValue = parseFloat(value);

		if (isNaN(numValue)) {
			this.setFieldError(
				input,
				errorElement,
				`Please enter a valid number.`
			);
			this.validationState[fieldType] = false;
			this.updateSubmitButton();
			return false;
		}

		if (numValue <= 0) {
			let unit = '';
			if (fieldType === 'weight') {
				unit = this.isMetric ? 'kg' : 'lbs';
			} else if (fieldType === 'height') {
				unit = this.isMetric ? 'cm' : 'inches';
			} else {
				unit = 'years';
			}

			this.setFieldError(
				input,
				errorElement,
				`${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} must be greater than 0${unit ? ' ' + unit : ''}.`
			);
			this.validationState[fieldType] = false;
			this.updateSubmitButton();
			return false;
		}

		if (fieldType === 'weight') {
			return this.validateWeight(numValue, input, errorElement);
		} else if (fieldType === 'height') {
			return this.validateHeight(numValue, input, errorElement);
		} else if (fieldType === 'age') {
			return this.validateAge(numValue, input, errorElement);
		}
	}

	validateWeight(weight, input, errorElement) {
		const minWeight = this.isMetric ? 20 : 44;
		const maxWeight = this.isMetric ? 300 : 660;
		const unit = this.isMetric ? 'kg' : 'lbs';

		if (weight < minWeight) {
			this.setFieldError(
				input,
				errorElement,
				`Weight looks too low (minimum ${minWeight} ${unit}).`
			);
			this.validationState.weight = false;
			this.updateSubmitButton();
			return false;
		}

		if (weight > maxWeight) {
			this.setFieldError(
				input,
				errorElement,
				`Weight looks too high (maximum ${maxWeight} ${unit}).`
			);
			this.validationState.weight = false;
			this.updateSubmitButton();
			return false;
		}

		this.setFieldSuccess(input);
		this.validationState.weight = true;
		this.updateSubmitButton();
		return true;
	}

	validateHeight(height, input, errorElement) {
		const minHeight = this.isMetric ? 100 : 39;
		const maxHeight = this.isMetric ? 250 : 98;
		const unit = this.isMetric ? 'cm' : 'inches';

		if (height < minHeight) {
			this.setFieldError(
				input,
				errorElement,
				`Height looks too short (minimum ${minHeight} ${unit}).`
			);
			this.validationState.height = false;
			this.updateSubmitButton();
			return false;
		}

		if (height > maxHeight) {
			this.setFieldError(
				input,
				errorElement,
				`Height looks too tall (maximum ${maxHeight} ${unit}).`
			);
			this.validationState.height = false;
			this.updateSubmitButton();
			return false;
		}

		this.setFieldSuccess(input);
		this.validationState.height = true;
		this.updateSubmitButton();
		return true;
	}

	validateAge(age, input, errorElement) {
		if (!Number.isInteger(age)) {
			this.setFieldError(
				input,
				errorElement,
				'Age must be a whole number.'
			);
			this.validationState.age = false;
			this.updateSubmitButton();
			return false;
		}

		if (age < 18) {
			this.setFieldError(
				input,
				errorElement,
				'Age must be greater than 17 years.'
			);
			this.validationState.age = false;
			this.updateSubmitButton();
			return false;
		}

		if (age > 120) {
			this.setFieldError(
				input,
				errorElement,
				'Age must be less than 120 years.'
			);
			this.validationState.age = false;
			this.updateSubmitButton();
			return false;
		}

		this.setFieldSuccess(input);
		this.validationState.age = true;
		this.updateSubmitButton();
		return true;
	}

	focusFirstInvalid() {
		const first = this.form.querySelector('[aria-invalid="true"], .error');
		if (first && typeof first.focus === 'function') {
			first.focus();
		}
	}

	setFieldError(input, errorElement, message) {
		input.classList.add('error');
		input.setAttribute('aria-invalid', 'true');
		errorElement.textContent = message;
		errorElement.classList.add('show');
	}

	setFieldSuccess(input) {
		input.classList.add('success');
		input.setAttribute('aria-invalid', 'false');
	}

	clearValidation() {
		this.weightInput.classList.remove('error', 'success');
		this.heightInput.classList.remove('error', 'success');
		this.ageInput.classList.remove('error', 'success');
		this.weightError.classList.remove('show');
		this.heightError.classList.remove('show');
		this.ageError.classList.remove('show');
		this.weightError.textContent = '';
		this.heightError.textContent = '';
		this.ageError.textContent = '';
		this.weightInput.setAttribute('aria-invalid', 'false');
		this.heightInput.setAttribute('aria-invalid', 'false');
		this.ageInput.setAttribute('aria-invalid', 'false');
		this.validationState = { weight: false, height: false, age: false };
	}

	updateSubmitButton() {
		const isValid = this.validationState.weight && this.validationState.height && this.validationState.age;
		this.submitBtn.disabled = !isValid;
	}

	calculateBMI(weight, height) {
		let weightKg = weight;
		let heightM = height;

		if (!this.isMetric) {
			weightKg = weight * 0.453592;
			heightM = height * 0.0254;
		} else {
			heightM = height / 100;
		}

		return weightKg / (heightM * heightM);
	}

	getBMICategory(bmi, age, gender) {
		let adjustedBMI = bmi;

		if (age > 65) {
			adjustedBMI = bmi - 0.5;
		}

		const categories = [
			{
				name: 'Severely Underweight',
				min: -Infinity, max: 16.0,
				class: 'bmi-severe-underweight',
				historyClass: 'severe-underweight',
				range: 'BMI < 16.0',
				advice: 'This is very low. Please consult a healthcare professional.'
			},
			{
				name: 'Underweight',
				min: 16.0, max: 18.5,
				class: 'bmi-underweight',
				historyClass: 'underweight',
				range: '16.0 ≤ BMI < 18.5',
				advice: 'Consider a balanced, calorie-rich diet and speak to a clinician if concerned.'
			},
			{
				name: 'Normal Weight',
				min: 18.5, max: 25.0,
				class: 'bmi-healthy',
				historyClass: 'healthy',
				range: '18.5 ≤ BMI < 25.0',
				advice: 'Great! Maintain a balanced diet and regular activity.'
			},
			{
				name: 'Overweight',
				min: 25.0, max: 30.0,
				class: 'bmi-overweight',
				historyClass: 'overweight',
				range: '25.0 ≤ BMI < 30.0',
				advice: 'Consider lifestyle changes (diet/activity). Small changes help.'
			},
			{
				name: 'Obese',
				min: 30.0, max: 35.0,
				class: 'bmi-obese',
				historyClass: 'obese',
				range: '30.0 ≤ BMI < 35.0',
				advice: 'Higher health risk. Speak to a healthcare provider for guidance.'
			},
			{
				name: 'Extremely Obese',
				min: 35.0, max: Infinity,
				class: 'bmi-extreme',
				historyClass: 'extreme',
				range: 'BMI ≥ 35.0',
				advice: 'Significant health risk. Please consult a healthcare professional.'
			}
		];

		return categories.find(c => adjustedBMI >= c.min && adjustedBMI < c.max);
	}

	displayResult(bmi, category, age, gender) {
		this.bmiValue.textContent = bmi.toFixed(1);
		this.bmiCategory.textContent = category.name;
		this.bmiRange.textContent = category.range;

		let advice = category.advice;
		if (age < 18) {
			advice += ' (Consult a pediatrician for accurate interpretation for your age.)';
		} else if (age > 65) {
			advice += ' (BMI interpretation may vary for seniors.)';
		}

		this.bmiAdvice.textContent = advice;
		this.bmiDisplay.className = `bmi-display ${category.class}`;
		this.result.classList.add('show');
	}

	saveToHistory(weight, height, age, gender, bmi, category) {
		const entry = {
			id: Date.now(),
			date: new Date(),
			weight: weight,
			height: height,
			age: age,
			gender: gender,
			bmi: bmi.toFixed(1),
			category: category.name,
			categoryClass: category.historyClass,
			unit: this.isMetric ? 'metric' : 'imperial'
		};

		this.history.unshift(entry);

		if (this.history.length > 10) {
			this.history = this.history.slice(0, 10);
		}

		this.saveHistory();
		this.renderHistory();
		this.updateHistoryControls();

		if (this.chartViewBtn.classList.contains('active')) {
			this.renderChart();
		}
	}

	loadHistory() {
		try {
			const history = localStorage.getItem('bmiHistory');
			return history ? JSON.parse(history) : [];
		} catch (error) {
			console.error('Error loading history:', error);
			return [];
		}
	}

	saveHistory() {
		try {
			localStorage.setItem('bmiHistory', JSON.stringify(this.history));
		} catch (error) {
			if (error.name === 'QuotaExceededError') {
				console.warn('Storage quota exceeded. Clearing old history.');
				this.history = this.history.slice(0, 5);
				localStorage.setItem('bmiHistory', JSON.stringify(this.history));
			} else {
				console.error('Error saving history:', error);
			}
		}
	}

	renderHistory() {
		if (this.history.length === 0) {
			this.historyList.innerHTML = '<p class="empty-history">No calculations yet. Start by calculating your BMI above.</p>';
			return;
		}

		this.historyList.innerHTML = this.history.map(entry => {
			const date = new Date(entry.date);
			const formattedDate = date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});

			const genderLabel = entry.gender === 'male' ? 'Male' : 'Female';

			const ageText = entry.age ? ` • ${entry.age}y` : '';

			return `
			<div class="history-item ${entry.categoryClass}">
				<div class="history-content">
					<div class="history-info">
						<div class="history-main">BMI: ${entry.bmi}</div>
						<div class="history-category ${entry.categoryClass}">${entry.category}</div>
						<div class="history-details">
							${genderLabel}${ageText} • ${entry.weight}${entry.unit === 'metric' ? 'kg' : 'lbs'} • ${entry.height}${entry.unit === 'metric' ? 'cm' : 'in'}
						</div>
					</div>
					<div class="history-date">${formattedDate}</div>
				</div>
			</div>
		`;
		}).join('');
	}

	clearHistory() {
		if (this.history.length === 0) return;

		this.history = [];
		this.saveHistory();
		this.updateHistoryControls();

		if (this.chart) {
			this.chart.destroy();
			this.chart = null;
		}

		if (this.chartViewBtn.classList.contains('active')) {
			this.chartContainer.innerHTML = '<p class="empty-history">No calculations yet. Start by calculating your BMI above.</p>';
		} else {
			this.renderHistory();
		}
	}

	showListView() {
		this.listViewBtn.classList.add('active');
		this.chartViewBtn.classList.remove('active');
		this.historyList.style.display = 'flex';
		this.chartContainer.classList.remove('show');
		this.renderHistory();
	}

	showChartView() {
		this.listViewBtn.classList.remove('active');
		this.chartViewBtn.classList.add('active');
		this.historyList.style.display = 'none';
		this.chartContainer.classList.add('show');

		if (this.history.length === 0) {
			this.chartContainer.innerHTML = '<p class="empty-history">No calculations yet. Start by calculating your BMI above.</p>';
		} else {
			this.renderChart();
		}
	}

	renderChart() {
		if (this.history.length === 0) return;

		const labels = this.history.map(entry => {
			const date = new Date(entry.date);
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric'
			});
		}).reverse();

		const bmiData = this.history.map(entry => parseFloat(entry.bmi)).reverse();

		const pointBackgroundColors = this.history.map(entry => entry.color || (() => {
			const b = parseFloat(entry.bmi);
			if (b < 16) return '#1e3a8a';
			if (b < 18.5) return '#3b82f6';
			if (b < 25) return '#10b981';
			if (b < 30) return '#f59e0b';
			if (b < 35) return '#ef4444';
			return '#7f1d1d';
		})()).reverse();

		if (this.chart) {
			this.chart.destroy();
		}

		this.chartContainer.innerHTML = '<canvas id="bmiChart"></canvas>';
		const ctx = document.getElementById('bmiChart').getContext('2d');

		this.chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: 'BMI',
					data: bmiData,
					borderColor: 'rgba(16, 185, 129, 0.9)',
					backgroundColor: 'rgba(16, 185, 129, 0.1)',
					pointBackgroundColor: pointBackgroundColors,
					pointBorderColor: 'rgba(255, 255, 255, 0.9)',
					pointBorderWidth: 2,
					pointRadius: 6,
					pointHoverRadius: 8,
					fill: true,
					tension: 0.3
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						backgroundColor: 'rgba(0, 0, 0, 0.9)',
						titleColor: 'white',
						bodyColor: 'white',
						borderColor: 'rgba(255, 255, 255, 0.2)',
						borderWidth: 1,
						padding: 12,
						displayColors: false,
						callbacks: {
							label: function (context) {
								return `BMI: ${context.parsed.y}`;
							}
						}
					}
				},
				scales: {
					x: {
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)',
							font: {
								size: 12
							}
						}
					},
					y: {
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)',
							font: {
								size: 12
							}
						},
						suggestedMin: 15,
						suggestedMax: 40
					}
				}
			}
		});
	}

	updateHistoryControls() {
		const hasHistory = this.history.length > 0;
		this.clearHistoryBtn.disabled = !hasHistory;
	}

	hideResult() {
		this.result.classList.remove('show');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new BMICalculator();
});