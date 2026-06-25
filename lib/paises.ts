import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import exemplosMobile from "libphonenumber-js/examples.mobile.json";

export type Pais = {
  codigo: string;
  nome: string;
  indicativo: string;
  digitos: number;
  bandeira: string;
};

function bandeiraEmoji(codigoIso: string) {
  return codigoIso
    .toUpperCase()
    .split("")
    .map((letra) => String.fromCodePoint(127397 + letra.charCodeAt(0)))
    .join("");
}

const nomesPaises = new Intl.DisplayNames(["pt"], { type: "region" });

export const PAISES: Pais[] = getCountries()
  .map((codigo) => {
    const exemplo = (exemplosMobile as Record<string, string>)[codigo];
    return {
      codigo,
      nome: nomesPaises.of(codigo) ?? codigo,
      indicativo: `+${getCountryCallingCode(codigo)}`,
      digitos: exemplo ? exemplo.length : 9,
      bandeira: bandeiraEmoji(codigo),
    };
  })
  .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));

export function encontrarPaisPorCodigo(codigo: string) {
  return PAISES.find((p) => p.codigo === codigo) ?? PAISES.find((p) => p.codigo === "PT")!;
}
