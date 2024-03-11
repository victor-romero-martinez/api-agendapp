export function dateFormatter() {
  let updateDate = new Date().toISOString();
  return updateDate.replace("T", " ").slice(0, -5);
}
