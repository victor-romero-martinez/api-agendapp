/** @param {string[]} arr */
export function getHost(arr) {
  const regex = /localhost:3000/;
  const res = arr.find((e) => e.match(regex));
  return res;
}
