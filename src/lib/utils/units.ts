import { format, addSeconds, getWeek, parseISO } from 'date-fns';

/**
 * Converts mph to a pace in min:sec
 * @param mph
 * @returns hh:mm string
 */
export function getMphToMinutes(mph: number) {
  const paceMinutes = addSeconds(new Date(0), (60 / mph) * 60);
  return format(paceMinutes, 'm:ss');
}

/**
 * Displays milliseconds value as m:ss
 * @param milliseconds
 * @returns mm:ss where mm can exceed 59 minutes
 */
export function formatDurationFromMs(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 1000 / 60);
  const seconds = Math.round((milliseconds / 1000) % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Computes the week of the year for the given date
 * @param dateArg
 * @returns string
 */
export function getWeekOfYearStr(dateArg: string | Date | null) {
  if (!dateArg) return '??';
  let date: Date;
  if (dateArg instanceof Date) {
    date = dateArg;
  } else {
    date = parseISO(dateArg);
  }
  return getWeek(date, {
    weekStartsOn: 1,
  }).toString();
}
