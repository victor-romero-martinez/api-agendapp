//@ts-check
/** SQL placeholder fn
 * @param {Record<string, string>} args - object
 * @param {'INSERT'|'UPDATE'} variant - variant
 * @returns {[string, string[]]}
 */
export function placeholderQuery(args, variant = "INSERT") {
  let placeholder = [];
  let params = [];

  for (const [key, value] of Object.entries(args)) {
    if (variant == "UPDATE") {
      placeholder.push(`${key} = ?`);
    } else {
      placeholder.push(key);
    }
    params.push(value);
  }
  return [placeholder.toString(), params];
}
