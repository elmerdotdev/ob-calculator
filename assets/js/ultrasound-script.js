document.addEventListener('DOMContentLoaded', () => {
  const scanInput = document.getElementById('scan-date');
  const usWeeksInput = document.getElementById('us-weeks');
  const usDaysInput = document.getElementById('us-days');
  const asOfInput = document.getElementById('as-of-date');

  const resultsContainer = document.getElementById('results');
  const emptyState = document.getElementById('empty-state');

  const eddDisplay = document.getElementById('edd-display');
  const gaDisplay = document.getElementById('ga-display');
  const gaDaysTotal = document.getElementById('ga-days-total');
  const trimesterDisplay = document.getElementById('trimester-display');
  const trimesterSub = document.getElementById('trimester-sub');
  
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressPercent = document.getElementById('progress-percent');

  const mLmp = document.getElementById('m-lmp');
  const mTri1 = document.getElementById('m-tri1');
  const mTri2 = document.getElementById('m-tri2');
  const mTerm = document.getElementById('m-term');
  const mEdd = document.getElementById('m-edd');

  // Default "As of Date" to today
  const today = new Date();
  asOfInput.value = formatDateForInput(today);

  // Default scan date to today
  scanInput.value = formatDateForInput(today);

  [scanInput, usWeeksInput, usDaysInput, asOfInput].forEach(el => {
    el.addEventListener('change', calculate);
    el.addEventListener('input', calculate);
  });

  function calculate() {
    const scanStr = scanInput.value;
    const weeksVal = parseInt(usWeeksInput.value, 10);
    const daysVal = parseInt(usDaysInput.value || 0, 10);

    if (!scanStr || isNaN(weeksVal) || weeksVal < 0) {
      resultsContainer.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    const scanDate = parseInputDate(scanStr);
    const asOfDate = asOfInput.value ? parseInputDate(asOfInput.value) : new Date();

    // 1. Ultrasound GA in days on scan date
    const usTotalDaysAtScan = (weeksVal * 7) + Math.min(Math.max(daysVal, 0), 6);

    // 2. EDD = Scan Date + (280 - usTotalDaysAtScan)
    const remainingDays = 280 - usTotalDaysAtScan;
    const edd = addDays(scanDate, remainingDays);

    // 3. Derived Equivalent LMP = Scan Date - usTotalDaysAtScan
    const derivedLmp = addDays(scanDate, -usTotalDaysAtScan);

    // 4. GA today = usTotalDaysAtScan + (asOfDate - scanDate)
    const scanStart = new Date(scanDate.getFullYear(), scanDate.getMonth(), scanDate.getDate());
    const asOfStart = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), asOfDate.getDate());

    const elapsedDays = Math.floor((asOfStart - scanStart) / (1000 * 60 * 60 * 24));
    const currentGATotalDays = usTotalDaysAtScan + elapsedDays;

    if (currentGATotalDays < 0) {
      eddDisplay.textContent = formatDate(edd);
      gaDisplay.textContent = "Pre-conception / Early";
      gaDaysTotal.textContent = `Scan date is in the future relative to GA`;
      trimesterDisplay.textContent = "--";
      trimesterSub.textContent = "--";
      progressBarFill.style.width = "0%";
      progressPercent.textContent = "0%";
      updateMilestones(derivedLmp, edd);
      resultsContainer.classList.remove('hidden');
      emptyState.classList.add('hidden');
      return;
    }

    const currentWeeks = Math.floor(currentGATotalDays / 7);
    const currentDays = currentGATotalDays % 7;

    // Trimester
    let trimesterText = "";
    let trimesterDetail = "";
    if (currentWeeks < 14) {
      trimesterText = "1st Trimester";
      trimesterDetail = "Weeks 1 – 13";
    } else if (currentWeeks < 28) {
      trimesterText = "2nd Trimester";
      trimesterDetail = "Weeks 14 – 27";
    } else {
      trimesterText = "3rd Trimester";
      trimesterDetail = "Weeks 28 – 40+";
    }

    eddDisplay.textContent = formatDate(edd);
    gaDisplay.textContent = `${currentWeeks}w ${currentDays}d`;
    gaDaysTotal.textContent = `${currentGATotalDays} total days calculated GA`;

    trimesterDisplay.textContent = trimesterText;
    trimesterSub.textContent = trimesterDetail;

    const progress = Math.min(Math.max((currentGATotalDays / 280) * 100, 0), 100);
    progressBarFill.style.width = `${progress.toFixed(1)}%`;
    progressPercent.textContent = `${progress.toFixed(1)}%`;

    updateMilestones(derivedLmp, edd);

    resultsContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }

  function updateMilestones(lmp, edd) {
    const tri1End = addDays(lmp, 97);
    const tri2End = addDays(lmp, 195);
    const termStart = addDays(lmp, 259);

    mLmp.textContent = formatDateShort(lmp);
    mTri1.textContent = formatDateShort(tri1End);
    mTri2.textContent = formatDateShort(tri2End);
    mTerm.textContent = formatDateShort(termStart);
    mEdd.textContent = formatDateShort(edd);
  }

  function parseInputDate(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatDateShort(date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
});
