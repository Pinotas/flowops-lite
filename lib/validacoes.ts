/**
 * Valida o formato (9 dígitos) e o dígito de controlo de um NIF português.
 * Algoritmo: https://pt.wikipedia.org/wiki/N%C3%BAmero_de_identifica%C3%A7%C3%A3o_fiscal
 */
export function validarNif(nif: string): boolean {
  if (!/^\d{9}$/.test(nif)) {
    return false;
  }

  const digitos = nif.split("").map(Number);
  const soma = digitos
    .slice(0, 8)
    .reduce((acc, digito, index) => acc + digito * (9 - index), 0);
  const resto = soma % 11;
  const digitoControlo = resto < 2 ? 0 : 11 - resto;

  return digitoControlo === digitos[8];
}
