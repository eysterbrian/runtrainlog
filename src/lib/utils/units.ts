import { format, addSeconds, getWeek, parseISO, isValid } from 'date-fns';

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

// export function getDatesForWeek(week: string | number) {
//   let weekNum: number;
//   if (typeof week === 'number') {
//     weekNum = week;
//   } else {
//     weekNum = parseInt(week);
//   }
//   const date = weekNum * 7
//   return format(date, 'EEEE, M/d/y');
// }
