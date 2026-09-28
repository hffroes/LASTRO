import { describe, expect, it } from 'vitest';
import { criarAnaliseVazia } from '../../types/analise';
import {
  LIMITE_NOME_TERRENO,
  MENSAGENS_TERRENO,
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
  it('uma análise vazia tem as duas pendências', () => {
    expect(validarEtapaTerreno(criarAnaliseVazia())).toEqual({
      objetivo: MENSAGENS_TERRENO.objetivoAusente,
      nome: MENSAGENS_TERRENO.nomeVazio,
    });
    expect(etapaTerrenoValida(criarAnaliseVazia())).toBe(false);
  });

  it('fica válida com objetivo e nome', () => {
    const analise = { objetivo: 'comprarTerreno' as const, terreno: { nome: 'Lote da Rua Alagoas' } };
    expect(validarEtapaTerreno(analise)).toEqual({});
    expect(etapaTerrenoValida(analise)).toBe(true);
  });
});
