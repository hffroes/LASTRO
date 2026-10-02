// Valores exatos das tabelas C e D do PRD 3.2: são a chave dos aditivos do CUB (F12), então nenhuma
// opção pode existir aqui sem linha correspondente lá. Os percentuais não moram aqui.
export type FormatoLote = 'regular' | 'irregular';
export const FORMATOS_LOTE: readonly FormatoLote[] = ['regular', 'irregular'];

export type Topografia = 'plana' | 'regular' | 'irregular' | 'acidentada';
export const TOPOGRAFIAS: readonly Topografia[] = ['plana', 'regular', 'irregular', 'acidentada'];

// Etapa 1 do PRD (2.2).
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
  // null até o usuário escolher: não existe formato nem topografia padrão.
  formatoLote: FormatoLote | null;
  topografia: Topografia | null;
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
    formatoLote: null,
    topografia: null,
  };
}
