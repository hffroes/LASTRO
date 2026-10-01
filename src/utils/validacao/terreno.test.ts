import { describe, expect, it } from 'vitest';
import { criarAnaliseVazia } from '../../types/analise';
import { criarTerrenoVazio } from '../../types/terreno';
import {
  LIMITE_AREA_TERRENO_M2,
  LIMITE_ENDERECO,
  LIMITE_PRECO_TERRENO_CENTAVOS,
  LIMITE_NOME_TERRENO,
  MENSAGENS_TERRENO,
  validarCep,
  validarCidade,
  validarTrechoEndereco,
  etapaTerrenoValida,
  validarEtapaTerreno,
  validarNomeTerreno,
  validarAreaTerreno,
  validarFormatoLote,
  validarObjetivo,
  validarPrecoTerreno,
  validarTopografia,
} from './terreno';
import { FORMATOS_LOTE, TOPOGRAFIAS } from '../../types/terreno';

describe('validarNomeTerreno', () => {
  it('recusa vazio', () => {
    expect(validarNomeTerreno('')).toBe(MENSAGENS_TERRENO.nomeVazio);
  });

  it('recusa só espaços, tabulações e quebras de linha', () => {
    expect(validarNomeTerreno('   \t\n ')).toBe(MENSAGENS_TERRENO.nomeVazio);
  });

  it('recusa o que não é texto (entrada vinda da API)', () => {
    expect(validarNomeTerreno(undefined)).toBe(MENSAGENS_TERRENO.nomeVazio);
    expect(validarNomeTerreno(42)).toBe(MENSAGENS_TERRENO.nomeVazio);
  });

  it('aceita exatamente o limite e recusa um caractere acima', () => {
    expect(validarNomeTerreno('a'.repeat(LIMITE_NOME_TERRENO))).toBeUndefined();
    expect(validarNomeTerreno('a'.repeat(LIMITE_NOME_TERRENO + 1))).toBe(
      MENSAGENS_TERRENO.nomeLongo(LIMITE_NOME_TERRENO + 1),
    );
  });

  it('não conta os espaços das pontas no limite', () => {
    expect(validarNomeTerreno(`  ${'a'.repeat(LIMITE_NOME_TERRENO)}  `)).toBeUndefined();
  });

  it('aceita acentos e pontuação', () => {
    expect(validarNomeTerreno('Lote 12, Qd. 4 — Rua Alagoas, Funcionários')).toBeUndefined();
  });
});

describe('validarObjetivo', () => {
  it('aceita os dois objetivos do PRD 2.6', () => {
    expect(validarObjetivo('comprarTerreno')).toBeUndefined();
    expect(validarObjetivo('executarEmpreendimento')).toBeUndefined();
  });

  it('recusa ausente ou desconhecido: não existe objetivo padrão', () => {
    expect(validarObjetivo(null)).toBe(MENSAGENS_TERRENO.objetivoAusente);
    expect(validarObjetivo('investir')).toBe(MENSAGENS_TERRENO.objetivoAusente);
  });
});

describe('validarEtapaTerreno', () => {
  it('uma análise vazia tem pendências só nos obrigatórios: objetivo, nome, cidade, área, preço, formato e topografia', () => {
    expect(validarEtapaTerreno(criarAnaliseVazia())).toEqual({
      objetivo: MENSAGENS_TERRENO.objetivoAusente,
      nome: MENSAGENS_TERRENO.nomeVazio,
      cidade: MENSAGENS_TERRENO.cidadeAusente,
      area: MENSAGENS_TERRENO.areaAusente,
      preco: MENSAGENS_TERRENO.precoAusente,
      formato: MENSAGENS_TERRENO.formatoAusente,
      topografia: MENSAGENS_TERRENO.topografiaAusente,
    });
    expect(etapaTerrenoValida(criarAnaliseVazia())).toBe(false);
  });

  it('fica válida com todos os obrigatórios, sem CEP nem endereço', () => {
    const analise = {
      objetivo: 'comprarTerreno' as const,
      terreno: {
        ...criarTerrenoVazio(),
        nome: 'Lote da Rua Alagoas',
        codigoMunicipioIbge: 3106200,
        areaTotalM2: 1000,
        precoPedidoCentavos: 120_000_000,
        formatoLote: 'regular' as const,
        topografia: 'plana' as const,
      },
    };
    expect(validarEtapaTerreno(analise)).toEqual({});
    expect(etapaTerrenoValida(analise)).toBe(true);
  });
});

describe('validarCidade', () => {
  it('aceita código de município de MG da lista', () => {
    expect(validarCidade(3106200)).toBeUndefined(); // Belo Horizonte
  });

  it('recusa vazio, texto livre e código de outro estado', () => {
    expect(validarCidade(null)).toBe(MENSAGENS_TERRENO.cidadeAusente);
    expect(validarCidade('Belo Horizonte')).toBe(MENSAGENS_TERRENO.cidadeAusente);
    expect(validarCidade(3550308)).toBe(MENSAGENS_TERRENO.cidadeAusente); // São Paulo/SP
  });
});

describe('validarCep', () => {
  it('é opcional: vazio passa', () => {
    expect(validarCep('', null)).toBeUndefined();
  });

  it('exige 8 dígitos quando preenchido, aceitando a máscara', () => {
    expect(validarCep('30130-010', null)).toBeUndefined();
    expect(validarCep('3013001', null)).toBe(MENSAGENS_TERRENO.cepIncompleto);
    expect(validarCep('301300100', null)).toBe(MENSAGENS_TERRENO.cepIncompleto);
  });

  it('bloqueia CEP que a consulta disse ser de outro estado', () => {
    expect(validarCep('01001000', 'SP')).toBe(MENSAGENS_TERRENO.cepForaDaCobertura('SP'));
    expect(validarCep('30130010', 'MG')).toBeUndefined();
  });

  it('sem resposta da consulta (API fora), não bloqueia', () => {
    expect(validarCep('01001000', null)).toBeUndefined();
  });
});

describe('validarTrechoEndereco', () => {
  it('é opcional e limita o tamanho', () => {
    expect(validarTrechoEndereco('', 'Bairro')).toBeUndefined();
    expect(validarTrechoEndereco('a'.repeat(LIMITE_ENDERECO), 'Bairro')).toBeUndefined();
    expect(validarTrechoEndereco('a'.repeat(LIMITE_ENDERECO + 1), 'Bairro')).toBe(
      MENSAGENS_TERRENO.enderecoLongo('Bairro', LIMITE_ENDERECO + 1),
    );
  });
});

describe('validarAreaTerreno', () => {
  it('exige número informado', () => {
    expect(validarAreaTerreno(null)).toBe(MENSAGENS_TERRENO.areaAusente);
    expect(validarAreaTerreno('1000')).toBe(MENSAGENS_TERRENO.areaAusente); // texto vindo da API
    expect(validarAreaTerreno(Number.NaN)).toBe(MENSAGENS_TERRENO.areaAusente);
    expect(validarAreaTerreno(Number.POSITIVE_INFINITY)).toBe(MENSAGENS_TERRENO.areaAusente);
  });

  it('recusa zero e negativo', () => {
    expect(validarAreaTerreno(0)).toBe(MENSAGENS_TERRENO.areaNaoPositiva);
    expect(validarAreaTerreno(-10)).toBe(MENSAGENS_TERRENO.areaNaoPositiva);
  });

  it('aceita até duas casas decimais e recusa mais', () => {
    expect(validarAreaTerreno(1250.55)).toBeUndefined();
    expect(validarAreaTerreno(0.01)).toBeUndefined();
    expect(validarAreaTerreno(1250.555)).toBe(MENSAGENS_TERRENO.areaIlegivel);
  });

  it('aceita exatamente o limite técnico e recusa acima', () => {
    expect(validarAreaTerreno(LIMITE_AREA_TERRENO_M2)).toBeUndefined();
    expect(validarAreaTerreno(LIMITE_AREA_TERRENO_M2 + 0.01)).toBe(MENSAGENS_TERRENO.areaAcimaDoLimite);
  });
});

describe('validarPrecoTerreno', () => {
  it('exige número informado, em centavos inteiros', () => {
    expect(validarPrecoTerreno(null)).toBe(MENSAGENS_TERRENO.precoAusente);
    expect(validarPrecoTerreno('120000000')).toBe(MENSAGENS_TERRENO.precoAusente);
    expect(validarPrecoTerreno(1200.5)).toBe(MENSAGENS_TERRENO.precoIlegivel);
  });

  it('recusa zero e negativo', () => {
    expect(validarPrecoTerreno(0)).toBe(MENSAGENS_TERRENO.precoNaoPositivo);
    expect(validarPrecoTerreno(-1)).toBe(MENSAGENS_TERRENO.precoNaoPositivo);
  });

  it('aceita de um centavo até o limite técnico', () => {
    expect(validarPrecoTerreno(1)).toBeUndefined();
    expect(validarPrecoTerreno(LIMITE_PRECO_TERRENO_CENTAVOS)).toBeUndefined();
    expect(validarPrecoTerreno(LIMITE_PRECO_TERRENO_CENTAVOS + 1)).toBe(MENSAGENS_TERRENO.precoAcimaDoLimite);
  });

  it('a mensagem do limite mostra o valor formatado', () => {
    expect(MENSAGENS_TERRENO.precoAcimaDoLimite).toContain('R$ 10.000.000.000,00');
    expect(MENSAGENS_TERRENO.areaAcimaDoLimite).toContain('10.000.000,00 m²');
  });
});

describe('formato do lote e topografia', () => {
  it('as opções são exatamente as linhas das tabelas D e C do PRD 3.2, nenhuma a mais', () => {
    expect(FORMATOS_LOTE).toEqual(['regular', 'irregular']);
    expect(TOPOGRAFIAS).toEqual(['plana', 'regular', 'irregular', 'acidentada']);
  });

  it('aceitam só valores da tabela; ausente ou desconhecido é pendência, sem valor padrão', () => {
    for (const formato of FORMATOS_LOTE) expect(validarFormatoLote(formato)).toBeUndefined();
    for (const topografia of TOPOGRAFIAS) expect(validarTopografia(topografia)).toBeUndefined();
    expect(validarFormatoLote(null)).toBe(MENSAGENS_TERRENO.formatoAusente);
    expect(validarFormatoLote('triangular')).toBe(MENSAGENS_TERRENO.formatoAusente);
    expect(validarTopografia(undefined)).toBe(MENSAGENS_TERRENO.topografiaAusente);
    expect(validarTopografia('ondulada')).toBe(MENSAGENS_TERRENO.topografiaAusente);
  });
});
