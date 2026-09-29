// Etapa 1 do PRD (2.2). Área, preço, formato e topografia entram aqui nas fases F07–F08.
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
  };
}
