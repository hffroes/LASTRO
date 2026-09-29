import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { MUNICIPIOS_MG, buscarMunicipioPorCodigo } from './municipios-mg';

// Hash das linhas "código;nome" da API do IBGE, conferido em 29/09/2026 (ver cabeçalho do arquivo).
const HASH_IBGE = '80d1e91cdb2ddf4be7e652e8db537e9dfa5cf7c4f0203781b46675640157ddc2';

describe('municípios de MG', () => {
  it('são os 853 da API do IBGE, na grafia oficial, sem edição à mão', () => {
    const linhas = [...MUNICIPIOS_MG]
      .sort((a, b) => a.codigoIbge - b.codigoIbge)
      .map((municipio) => `${municipio.codigoIbge};${municipio.nome}`)
      .join('\n');

    expect(MUNICIPIOS_MG).toHaveLength(853);
    expect(createHash('sha256').update(`${linhas}\n`, 'utf8').digest('hex')).toBe(HASH_IBGE);
  });

  it('só tem códigos de MG (prefixo 31) e sem repetição', () => {
    const codigos = MUNICIPIOS_MG.map((municipio) => municipio.codigoIbge);
    expect(codigos.every((codigo) => String(codigo).startsWith('31'))).toBe(true);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  it('encontra pelo código IBGE', () => {
    expect(buscarMunicipioPorCodigo(3106200)?.nome).toBe('Belo Horizonte');
    expect(buscarMunicipioPorCodigo(null)).toBeUndefined();
  });
});
