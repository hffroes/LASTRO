import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const RAIZ_SRC = path.resolve(__dirname, '..');
const PROPRIEDADES_TOKENIZADAS = [
  'font-size',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'gap',
  'row-gap',
  'column-gap',
  'border-radius',
  'box-shadow',
];

function listarModulosCss(diretorio: string): string[] {
  return readdirSync(diretorio).flatMap((entrada) => {
    const caminho = path.join(diretorio, entrada);
    const info = statSync(caminho);
    if (info.isDirectory()) {
      return listarModulosCss(caminho);
    }
    return caminho.endsWith('.module.css') ? [caminho] : [];
  });
}

function encontrarViolacoes(conteudo: string, arquivo: string): string[] {
  const violacoes: string[] = [];

  conteudo.split('\n').forEach((linha, indice) => {
    const numeroLinha = indice + 1;

    if (/#[0-9a-fA-F]{3,8}\b/.test(linha) || /\b(rgb|rgba|hsl|hsla)\(/.test(linha)) {
      violacoes.push(`${arquivo}:${numeroLinha} — cor hardcoded fora de var(--lastro-*): "${linha.trim()}"`);
    }

    for (const propriedade of PROPRIEDADES_TOKENIZADAS) {
      const regex = new RegExp(`(?<![-\\w])${propriedade}\\s*:\\s*([^;]+);`);
      const correspondencia = linha.match(regex);
      // "0"/"auto" não são números mágicos (resets legítimos); só interessa px literal fora de var().
      if (correspondencia && /\d+(\.\d+)?px/.test(correspondencia[1]) && !correspondencia[1].includes('var(')) {
        violacoes.push(
          `${arquivo}:${numeroLinha} — "${propriedade}" com valor hardcoded fora de var(--lastro-*): "${linha.trim()}"`,
        );
      }
    }
  });

  return violacoes;
}

describe('tokens do design system', () => {
  it('nenhum módulo CSS usa cor ou tamanho hardcoded fora de var(--lastro-*)', () => {
    const arquivos = listarModulosCss(RAIZ_SRC);
    const violacoes = arquivos.flatMap((arquivo) => encontrarViolacoes(readFileSync(arquivo, 'utf-8'), arquivo));

    expect(violacoes).toEqual([]);
  });
});
