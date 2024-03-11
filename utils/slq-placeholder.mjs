//@ts-check
/** SQL placeholder fn
 * @param {{}} args - object
 * @returns {[placeholder: string, params: string[]]}
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
