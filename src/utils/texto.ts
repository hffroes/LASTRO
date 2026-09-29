// Comparação de texto para busca: "sao joao" precisa achar "São João del Rei". Remove acentos
// (decomposição NFD) e ignora maiúsculas e espaços repetidos.
export function normalizarParaBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

// Máscara de apresentação do CEP, aplicada também a valores parciais durante a digitação.
export function formatarCep(digitos: string): string {
  const limpos = somenteDigitos(digitos).slice(0, 8);
  return limpos.length > 5 ? `${limpos.slice(0, 5)}-${limpos.slice(5)}` : limpos;
}
