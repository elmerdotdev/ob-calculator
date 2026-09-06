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

    if (bmi < 18.5) {
      category = "Underweight (< 18.5 kg/m²)";
    } else if (bmi <= 24.9) {
      category = "Normal Weight (18.5 – 24.9 kg/m²)";
    } else if (bmi <= 29.9) {
      category = "Overweight (25.0 – 29.9 kg/m²)";
    } else if (bmi <= 34.9) {
      category = "Obesity Class I (30.0 – 34.9 kg/m²)";
    } else if (bmi <= 39.9) {
      category = "Obesity Class II (35.0 – 39.9 kg/m²)";
    } else {
      category = "Obesity Class III (≥ 40.0 kg/m²)";
    }

    bmiValDisplay.textContent = `${roundedBmi} kg/m²`;
    bmiCatDisplay.textContent = category;

    resultsContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }
});
