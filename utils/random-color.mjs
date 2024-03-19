/** Random Color Generador hwd */
export function randomColor() {
  let random = [];

  while (random.length < 3) {
    // Rango de valores más acotado
    random.push(Math.floor(Math.random() * 60) + 180); // Tono entre 180° y 240°
    random.push(Math.floor(Math.random() * 40) + 30); // Blancura entre 30% y 70%
    random.push(Math.floor(Math.random() * 40) + 30); // Negro entre 30% y 70%
  }

  // Distribución normal para la saturación
  random[1] = Math.floor(random[1] + (Math.random() - 0.5) * 20);

  return `hwb(${random[0]}deg ${random[1]}% ${random[2]}%)`;
}
