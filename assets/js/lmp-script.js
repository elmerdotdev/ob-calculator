document.addEventListener('DOMContentLoaded', () => {
  const lmpInput = document.getElementById('lmp-date');
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

  const mTri1 = document.getElementById('m-tri1');
  const mTri2 = document.getElementById('m-tri2');
  const mTerm = document.getElementById('m-term');
  const mEdd = document.getElementById('m-edd');

  // Default "As of Date" to today
  const today = new Date();
  asOfInput.value = formatDateForInput(today);

  lmpInput.addEventListener('change', calculate);
  lmpInput.addEventListener('input', calculate);

  asOfInput.addEventListener('change', calculate);
  asOfInput.addEventListener('input', calculate);

  function calculate() {
    // No LMP entered
    if (!lmpInput.value) {
      resultsContainer.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    const lmpDate = parseInputDate(lmpInput.value);

    const asOfDate = asOfInput.value
      ? parseInputDate(asOfInput.value)
      : startOfDay(new Date());

    /*
     * Estimated Due Date
     *
     * Standard pregnancy dating:
     * LMP + 280 days (40 weeks)
     *
     * This is preferable to manipulating months directly because
     * JavaScript can overflow dates such as February 31.
     */
    const edd = addDays(lmpDate, 280);

    // Normalize both dates to midnight
    const lmpStart = startOfDay(lmpDate);
    const asOfStart = startOfDay(asOfDate);

    // Calculate gestational age in days
    const totalDays = differenceInDays(asOfStart, lmpStart);

    /*
     * Handle an LMP date that is in the future.
     */
    if (totalDays < 0) {
      eddDisplay.textContent = formatDate(edd);

      gaDisplay.textContent = 'LMP is in the future';

      gaDaysTotal.textContent = `LMP is ${Math.abs(totalDays)} days ahead`;

      trimesterDisplay.textContent = '--';
      trimesterSub.textContent = '--';

      progressBarFill.style.width = '0%';
      progressPercent.textContent = '0%';

      updateMilestones(lmpStart, edd);

      resultsContainer.classList.remove('hidden');
      emptyState.classList.add('hidden');

      return;
    }

    /*
     * Convert total days into weeks + remaining days.
     *
     * Example:
     * 187 days = 26 weeks + 5 days
     */
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    /*
     * Trimester calculation
     *
     * 1st trimester: before 14w0d
     * 2nd trimester: 14w0d through 27w6d
     * 3rd trimester: 28w0d onward
     */
    let trimesterText = '';
    let trimesterDetail = '';

    if (weeks < 14) {
      trimesterText = '1st Trimester';
      trimesterDetail = 'Weeks 1 – 13';
    } else if (weeks < 28) {
      trimesterText = '2nd Trimester';
      trimesterDetail = 'Weeks 14 – 27';
    } else {
      trimesterText = '3rd Trimester';
      trimesterDetail = 'Weeks 28 – 40+';
    }

    /*
     * Display results
     */
    eddDisplay.textContent = formatDate(edd);

    gaDisplay.textContent = `${weeks}w ${days}d`;

    gaDaysTotal.textContent = `${totalDays} days since LMP`;

    trimesterDisplay.textContent = trimesterText;
    trimesterSub.textContent = trimesterDetail;

    /*
     * Pregnancy progress
     *
     * 280 days = 100%
     *
     * Clamp between 0% and 100%.
     */
    const progress = Math.min(Math.max((totalDays / 280) * 100, 0), 100);

    progressBarFill.style.width = `${progress.toFixed(1)}%`;
    progressPercent.textContent = `${progress.toFixed(1)}%`;

    /*
     * Milestones
     */
    updateMilestones(lmpStart, edd);

    resultsContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }

  /*
   * Update pregnancy milestones.
   */
  function updateMilestones(lmp, edd) {
    /*
     * End of 1st trimester:
     * 13w6d = 97 days after LMP
     */
    const tri1End = addDays(lmp, 97);

    /*
     * End of 2nd trimester:
     * 27w6d = 195 days after LMP
     */
    const tri2End = addDays(lmp, 195);

    /*
     * Term begins at:
     * 37w0d = 259 days after LMP
     */
    const termStart = addDays(lmp, 259);

    mTri1.textContent = formatDateShort(tri1End);
    mTri2.textContent = formatDateShort(tri2End);
    mTerm.textContent = formatDateShort(termStart);
    mEdd.textContent = formatDateShort(edd);
  }

  /*
   * Parse an HTML date input (YYYY-MM-DD)
   *
   * We intentionally construct the Date manually rather than using
   * new Date("YYYY-MM-DD") to avoid UTC/timezone-related date shifts.
   */
  function parseInputDate(dateStr) {
    const parts = dateStr.split('-');

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    return new Date(year, month, day);
  }

  /*
   * Return a date at local midnight.
   */
  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /*
   * Add a number of calendar days to a date.
   */
  function addDays(date, days) {
    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return startOfDay(result);
  }

  /*
   * Calculate difference between two local calendar dates.
   *
   * Using UTC midnight prevents daylight-saving-time changes
   * from causing a one-day calculation error.
   */
  function differenceInDays(date1, date2) {
    const utc1 = Date.UTC(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate(),
    );

    const utc2 = Date.UTC(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate(),
    );

    return Math.round((utc1 - utc2) / 86400000);
  }

  /*
   * Format date as YYYY-MM-DD for HTML date inputs.
   */
  function formatDateForInput(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /*
   * Full date format.
   *
   * Example:
   * Tuesday, December 8, 2026
   */
  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /*
   * Short date format.
   *
   * Example:
   * Dec 8, 2026
   */
  function formatDateShort(date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
});
