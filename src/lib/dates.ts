import { PollDate } from '../types';

/**
 * Returns the default year for the poll.
 * If currently past Christmas in the current year, defaults to next year.
 * Otherwise defaults to the current year.
 */
export function getDefaultYear(): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const christmas = new Date(currentYear, 11, 25);
  
  if (now > christmas) {
    return currentYear + 1;
  }
  return currentYear;
}

/**
 * Formats a Date object to YYYY-MM-DD in local time
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates all Friday and Saturday dates from November 1st until Christmas (Dec 25)
 * for the specified year.
 */
export function generatePollDates(year: number): PollDate[] {
  const dates: PollDate[] = [];
  
  // Month is 0-indexed: 10 = November, 11 = December
  // Start from November 1st
  const current = new Date(year, 10, 1);
  // End on December 24 (day before Christmas) or Dec 25
  const end = new Date(year, 11, 24);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      const id = formatDateToISO(current);
      const monthName = current.getMonth() === 10 ? 'November' : 'December';
      const weekday = dayOfWeek === 5 ? 'Fri' : 'Sat';
      const dayNumber = current.getDate();
      const displayLabel = `${weekday}, ${monthName.slice(0, 3)} ${dayNumber}`;

      dates.push({
        id,
        date: new Date(current),
        monthName,
        weekday,
        dayNumber,
        displayLabel,
      });
    }
    // Next day
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
