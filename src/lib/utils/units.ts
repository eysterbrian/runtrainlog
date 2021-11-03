import { format, addSeconds, getWeek, parseISO } from 'date-fns';

/**
 * Converts mph to a pace in min:sec
 * @param mph
 * @returns hh:mm string
 */
export function getPaceStr(paceSeconds: number) {
  const paceMinutes = addSeconds(new Date(0), paceSeconds);
  return format(paceMinutes, 'm:ss');
}

/**
 * Converts mph to a pace in min:sec
 * @param mph
 * @returns hh:mm string
 */
export function getMphToMinutes(mph: number) {
  return (60 / mph) * 60;
}

/**
 * Returns seconds value as m:ss
 * @param seconds
 * @returns mm:ss where mm can exceed 59 minutes
 */
export function formatMinSecDurationFromSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Returns seconds value as 'H hrs M min'
 * @param seconds
 * @returns mm:ss where mm can exceed 59 minutes
 */
export function formatHourMinDurationFromSeconds(totalSeconds: number) {
  const roundedMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = Math.round(roundedMinutes % 60);
  return `${hours} hrs ${minutes} min`;
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
