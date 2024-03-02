// @ts-check
/** Console log helper
 * @param {'success 🎉'|'info ✨'|'error ☠'|'warn ☣'} type - Type of log
 * @param {any} [mjs] - Log message
 */
export function logHelper(type, mjs) {
  console.log(`${type}, ${mjs}`);
}
