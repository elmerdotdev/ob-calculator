document.addEventListener('DOMContentLoaded', () => {
  const metricBtn = document.getElementById('unit-metric-btn');
  const imperialBtn = document.getElementById('unit-imperial-btn');

  const metricInputs = document.getElementById('metric-inputs');
  const imperialInputs = document.getElementById('imperial-inputs');

  const heightCmInput = document.getElementById('height-cm');
  const weightKgInput = document.getElementById('weight-kg');

  const heightFtInput = document.getElementById('height-ft');
  const heightInInput = document.getElementById('height-in');
  const weightLbsInput = document.getElementById('weight-lbs');

  const resultsContainer = document.getElementById('results');
  const emptyState = document.getElementById('empty-state');

  const bmiValDisplay = document.getElementById('bmi-val-display');
  const bmiCatDisplay = document.getElementById('bmi-cat-display');
  const gainRangeDisplay = document.getElementById('gain-range-display');
  const gainRateDisplay = document.getElementById('gain-rate-display');

  let currentUnit = 'metric'; // 'metric' or 'imperial'

  metricBtn.addEventListener('click', () => {
    currentUnit = 'metric';
    metricBtn.classList.add('active');
    imperialBtn.classList.remove('active');
    metricInputs.classList.remove('hidden');
    imperialInputs.classList.add('hidden');
    calculate();
  });

  imperialBtn.addEventListener('click', () => {
    currentUnit = 'imperial';
    imperialBtn.classList.add('active');
    metricBtn.classList.remove('active');
    imperialInputs.classList.remove('hidden');
    metricInputs.classList.add('hidden');
    calculate();
  });

  [heightCmInput, weightKgInput, heightFtInput, heightInInput, weightLbsInput].forEach(input => {
    input.addEventListener('input', calculate);
    input.addEventListener('change', calculate);
  });

  function calculate() {
    let bmi = null;

    if (currentUnit === 'metric') {
      const heightCm = parseFloat(heightCmInput.value);
      const weightKg = parseFloat(weightKgInput.value);

      if (heightCm > 0 && weightKg > 0) {
        const heightM = heightCm / 100;
        bmi = weightKg / (heightM * heightM);
      }
    } else {
      const heightFt = parseFloat(heightFtInput.value || 0);
      const heightIn = parseFloat(heightInInput.value || 0);
      const weightLbs = parseFloat(weightLbsInput.value);

      const totalInches = (heightFt * 12) + heightIn;

      if (totalInches > 0 && weightLbs > 0) {
        bmi = (weightLbs / (totalInches * totalInches)) * 703;
      }
    }

    if (!bmi || isNaN(bmi) || bmi <= 0 || bmi > 100) {
      resultsContainer.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    const roundedBmi = bmi.toFixed(1);
    let category = "";
    let gainKg = "";
    let gainLbs = "";
    let weeklyRate = "";

    if (bmi < 18.5) {
      category = "Underweight (< 18.5 kg/m²)";
      gainKg = "12.5 – 18.0 kg";
      gainLbs = "28 – 40 lbs";
      weeklyRate = "0.44 – 0.58 kg/wk (1.0 – 1.3 lbs/wk)";
    } else if (bmi <= 24.9) {
      category = "Normal Weight (18.5 – 24.9 kg/m²)";
      gainKg = "11.5 – 16.0 kg";
      gainLbs = "25 – 35 lbs";
      weeklyRate = "0.35 – 0.50 kg/wk (0.8 – 1.0 lbs/wk)";
    } else if (bmi <= 29.9) {
      category = "Overweight (25.0 – 29.9 kg/m²)";
      gainKg = "7.0 – 11.5 kg";
      gainLbs = "15 – 25 lbs";
      weeklyRate = "0.23 – 0.33 kg/wk (0.5 – 0.7 lbs/wk)";
    } else {
      category = "Obesity (≥ 30.0 kg/m²)";
      gainKg = "5.0 – 9.0 kg";
      gainLbs = "11 – 20 lbs";
      weeklyRate = "0.17 – 0.27 kg/wk (0.4 – 0.6 lbs/wk)";
    }

    bmiValDisplay.textContent = `${roundedBmi} kg/m²`;
    bmiCatDisplay.textContent = category;

    if (currentUnit === 'metric') {
      gainRangeDisplay.textContent = gainKg;
    } else {
      gainRangeDisplay.textContent = gainLbs;
    }

    gainRateDisplay.textContent = weeklyRate;

    resultsContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }
});
