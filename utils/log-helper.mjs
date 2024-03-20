// @ts-check
/** Console log helper
 * @param {'success 🎉'|'info ✨'|'error ☠'|'warn ☣'} type - Type of log
 * @param {any} [mjs] - Log message
 */
export function logHelper(mjs, type = "error ☠") {
  if (type === "error ☠") {
    console.trace(type);
    console.log("-".repeat(20));
    console.log(mjs);
  } else {
    console.log(`${type}-- ${mjs}`);
  }
}
