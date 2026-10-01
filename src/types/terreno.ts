// Etapa 1 do PRD (2.2). Formato e topografia entram aqui na F08.
export interface DadosTerreno {
  nome: string;
  // Código IBGE do município escolhido na lista de MG; o nome vem da lista, nunca de texto livre.
  codigoMunicipioIbge: number | null;
  // Só dígitos; a máscara 00000-000 é apresentação.
  cep: string;
  logradouro: string;
  bairro: string;
  // UF devolvida pela última consulta do CEP. Guardada para a regra de cobertura (só MG) valer
  // também depois de um F5, sem consultar de novo. null = não consultado ou consulta sem resposta.
  ufCep: string | null;
  // O endereço veio do CEP (e não foi digitado): decide a indicação de origem na tela.
  enderecoPeloCep: boolean;
  // Em m², com no máximo duas casas. null = não informada (ou digitada num formato ilegível).
  areaTotalM2: number | null;
  // Dinheiro sempre em centavos inteiros (convenção do motor, utils/motor/formatacao.ts).
  precoPedidoCentavos: number | null;
}

export function criarTerrenoVazio(): DadosTerreno {
  return {
    nome: '',
    codigoMunicipioIbge: null,
    cep: '',
    logradouro: '',
    bairro: '',
    ufCep: null,
    enderecoPeloCep: false,
    areaTotalM2: null,
    precoPedidoCentavos: null,
  };
}
