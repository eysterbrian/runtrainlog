/**
 * Converts the given string to 'Title Case' without underscores
 * @param str
 * @returns title-cased string with '_' replaced by spaces
 */
export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .replace(/[_]+/g, ' ')
    .replace(/(\b[a-z])+/g, (_, chr) => chr.toUpperCase());
}
