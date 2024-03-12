//@ts-check
/** SQL placeholder fn
 * @param {Record<string, string>} args - object
 * @returns {[string, string[]]}
 */
export function placeholderQuery(args) {
  let placeholder = [];
  let params = [];

  for (const [key, value] of Object.entries(args)) {
    placeholder.push(key);
    params.push(value);
  }
  return [placeholder.toString(), params];
}
