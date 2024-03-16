/** Random Color Generador hwd */
export function randomColor() {
  let random = [];

  while (random.length < 3) {
    random.push(Math.floor(Math.random() * 100) + 1);
  }

  return `hwb(${random[0]}deg ${random[1]}% ${random[2]}%)`;
}
