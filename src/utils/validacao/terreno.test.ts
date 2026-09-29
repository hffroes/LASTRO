import { describe, expect, it } from 'vitest';
import { criarAnaliseVazia } from '../../types/analise';
import { criarTerrenoVazio } from '../../types/terreno';
import {
  LIMITE_ENDERECO,
  LIMITE_NOME_TERRENO,
  MENSAGENS_TERRENO,
  validarCep,
  validarCidade,
  validarTrechoEndereco,
  etapaTerrenoValida,
  validarEtapaTerreno,
  validarNomeTerreno,
  validarObjetivo,
} from './terreno';

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
  it('uma análise vazia tem pendências só nos obrigatórios: objetivo, nome e cidade', () => {
    expect(validarEtapaTerreno(criarAnaliseVazia())).toEqual({
      objetivo: MENSAGENS_TERRENO.objetivoAusente,
      nome: MENSAGENS_TERRENO.nomeVazio,
      cidade: MENSAGENS_TERRENO.cidadeAusente,
    });
    expect(etapaTerrenoValida(criarAnaliseVazia())).toBe(false);
  });

  it('fica válida com objetivo, nome e cidade, sem CEP nem endereço', () => {
    const analise = {
      objetivo: 'comprarTerreno' as const,
      terreno: { ...criarTerrenoVazio(), nome: 'Lote da Rua Alagoas', codigoMunicipioIbge: 3106200 },
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
