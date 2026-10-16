import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ProjetoCub, RepositorioCub, VersaoCub } from '../../../types/parametros';
import { criarProdutoVazio, PADROES_ACABAMENTO, TIPOLOGIAS, type PadraoAcabamento, type Tipologia } from '../../../types/produto';
import {
  calcularAditivos,
  calcularCub,
  calcularCubAjustadoCentavos,
  calcularCubDaAnalise,
  classificarFaixaFundacao,
  classificarProjetoCub,
  type EntradaCub,
  type ResultadoCub,
} from '../cub';
import { CUB_2026_08 } from '../dados/cub-2026-08';
import { repositorioCubEmMemoria } from '../dados';

// Caso de referência do PRD 3.2: prédio, padrão Normal, 4 pavimentos, topografia Regular, formato Regular.
const REFERENCIA: EntradaCub = {
  tipologia: 'predio',
  pavimentos: 4,
  padrao: 'normal',
  topografia: 'regular',
  formatoLote: 'regular',
};

function calculado(resultado: ResultadoCub) {
  if (resultado.situacao !== 'calculado') throw new Error(`esperava calculado, veio ${resultado.situacao}`);
  return resultado;
}

describe('caso de referência do PRD 3.2', () => {
  const r = calculado(calcularCub(REFERENCIA));

  it('soma dos aditivos = 7% + 15% + 1,5% + 0% = 23,5%', () => {
    expect(r.aditivos.fundacao.pontosBase).toBe(700);
    expect(r.aditivos.padrao.pontosBase).toBe(1_500);
    expect(r.aditivos.topografia.pontosBase).toBe(150);
    expect(r.aditivos.formato.pontosBase).toBe(0);
    expect(r.aditivos.somaPontosBase).toBe(2_350);
  });

  it('CUB base R-8 Normal = R$ 2.554,58', () => {
    expect(r.projeto).toBe('R-8');
    expect(r.cubBaseCentavos).toBe(255_458);
  });

  it('CUB Ajustado = 2.554,58 × 1,235 = R$ 3.154,91/m², com precisão de centavos', () => {
    expect(r.cubAjustadoCentavos).toBe(315_491);
  });

  it('é uma única multiplicação, não em cadeia: a cadeia daria outro valor', () => {
    const emCadeia = Math.round(255_458 * 1.07 * 1.15 * 1.015 * 1.0);
    expect(emCadeia).not.toBe(315_491);
    expect(r.cubAjustadoCentavos).toBe(Math.round(255_458 * (1 + 0.07 + 0.15 + 0.015 + 0)));
  });

  it('informa a competência e a versão da base usada (snapshot, PRD 3.4)', () => {
    expect(r.versao.id).toBe('cub-2026-08');
    expect(r.versao.competencia).toEqual({ ano: 2026, mes: 8 });
    expect(r.versao).not.toHaveProperty('valores');
  });
});

describe('calcularCubAjustadoCentavos', () => {
  it('arredonda ao centavo, meio para cima, em inteiros', () => {
    expect(calcularCubAjustadoCentavos(255_458, 2_350)).toBe(315_491); // 315.490,63
    expect(calcularCubAjustadoCentavos(100_000, 5)).toBe(100_050); // 1.000,5 → 1.000,50
    expect(calcularCubAjustadoCentavos(1, 5_000)).toBe(2); // 1,5 → 2
  });

  it('sem aditivos, o ajustado é o próprio CUB base', () => {
    expect(calcularCubAjustadoCentavos(255_458, 0)).toBe(255_458);
  });
});

describe('classificação do projeto CUB (PRD 3.1: tipologia + faixa de pavimentos)', () => {
  it.each<[Tipologia, number, ProjetoCub]>([
    ['casa', 1, 'R-1'],
    ['casa', 2, 'R-1'],
    ['casa', 6, 'R-1'],
    ['predio', 1, 'R-8'],
    ['predio', 4, 'R-8'],
    ['predio', 5, 'R-8'],
    ['predio', 8, 'R-8'],
    ['predio', 9, 'R-16'],
    ['predio', 16, 'R-16'],
    ['predio', 17, 'R-16'],
    ['predio', 40, 'R-16'],
    ['salasLojas', 4, 'CSL-8'],
    ['salasLojas', 8, 'CSL-8'],
    ['salasLojas', 9, 'CSL-16'],
    ['salasLojas', 16, 'CSL-16'],
    ['salasLojas', 30, 'CSL-16'],
    ['andaresLivres', 4, 'CAL-8'],
    ['andaresLivres', 8, 'CAL-8'],
    ['andaresLivres', 9, 'CAL-16'],
    ['andaresLivres', 20, 'CAL-16'],
    ['galpao', 1, 'GI'],
  ])('%s com %i pavimento(s) → %s', (tipologia, pavimentos, projeto) => {
    expect(classificarProjetoCub(tipologia, pavimentos)).toBe(projeto);
  });
});

describe('faixas do aditivo de fundação — D-R21: "até N" inclui N (1–4 / 5–8 / 9–16 / 17+)', () => {
  it.each<[number, string, number]>([
    [1, 'ate4', 700],
    [4, 'ate4', 700],
    [5, 'de5a8', 1_000],
    [8, 'de5a8', 1_000],
    [9, 'de9a16', 1_500],
    [16, 'de9a16', 1_500],
    [17, 'acima16', 2_000],
    [60, 'acima16', 2_000],
  ])('prédio com %i pavimentos → %s (%i pontos-base)', (pavimentos, faixa, pontosBase) => {
    expect(classificarFaixaFundacao('predio', pavimentos)).toBe(faixa);
    const aditivos = calcularAditivos('predio', pavimentos, 'normal', 'plana', 'regular');
    expect(aditivos?.fundacao).toEqual({ faixa, pontosBase });
  });

  it('casa e galpão usam as linhas "1" e "2+": 4% e 5%', () => {
    expect(calcularAditivos('casa', 1, 'normal', 'plana', 'regular')?.fundacao.pontosBase).toBe(400);
    expect(calcularAditivos('casa', 2, 'normal', 'plana', 'regular')?.fundacao.pontosBase).toBe(500);
    expect(calcularAditivos('casa', 4, 'normal', 'plana', 'regular')?.fundacao.pontosBase).toBe(500);
    expect(calcularAditivos('galpao', 1, 'normal', 'plana', 'regular')?.fundacao.pontosBase).toBe(400);
  });

  it('salas e andares livres seguem a faixa dos edifícios', () => {
    expect(classificarFaixaFundacao('salasLojas', 12)).toBe('de9a16');
    expect(classificarFaixaFundacao('andaresLivres', 3)).toBe('ate4');
  });
});

describe('os quatro aditivos, isolados e somados (PRD 3.2)', () => {
  const soma = (padrao: PadraoAcabamento, topografia: 'plana' | 'regular' | 'irregular' | 'acidentada', formato: 'regular' | 'irregular') =>
    calcularAditivos('predio', 4, padrao, topografia, formato)?.somaPontosBase;

  it('padrão: 10% / 15% / 20%', () => {
    expect(soma('baixo', 'plana', 'regular')).toBe(700 + 1_000);
    expect(soma('normal', 'plana', 'regular')).toBe(700 + 1_500);
    expect(soma('alto', 'plana', 'regular')).toBe(700 + 2_000);
  });

  it('topografia: 0% / 1,5% / 3% / 5%', () => {
    expect(soma('normal', 'plana', 'regular')).toBe(2_200);
    expect(soma('normal', 'regular', 'regular')).toBe(2_350);
    expect(soma('normal', 'irregular', 'regular')).toBe(2_500);
    expect(soma('normal', 'acidentada', 'regular')).toBe(2_700);
  });

  it('formato: 0% / 0,5%', () => {
    expect(soma('normal', 'plana', 'regular')).toBe(2_200);
    expect(soma('normal', 'plana', 'irregular')).toBe(2_250);
  });

  it('todos os aditivos máximos somam, sem multiplicar entre si', () => {
    // prédio 17+ (20%) + alto (20%) + acidentada (5%) + irregular (0,5%) = 45,5%
    expect(calcularAditivos('predio', 20, 'alto', 'acidentada', 'irregular')?.somaPontosBase).toBe(4_550);
  });

  it('cada aditivo informa a chave da tabela que o originou, para a tela discriminá-lo', () => {
    const a = calcularAditivos('predio', 4, 'normal', 'regular', 'irregular');
    expect(a?.padrao.padrao).toBe('normal');
    expect(a?.topografia.topografia).toBe('regular');
    expect(a?.formato.formato).toBe('irregular');
  });
});

describe('valores base por projeto e padrão (PRD 3.1, competência Ago/2026)', () => {
  function base(tipologia: Tipologia, pavimentos: number, padrao: PadraoAcabamento) {
    const r = calcularCub({ ...REFERENCIA, tipologia, pavimentos, padrao });
    return r.situacao === 'calculado' ? r.cubBaseCentavos : r.situacao;
  }

  it('R-1: Baixo, Normal e Alto', () => {
    expect(base('casa', 1, 'baixo')).toBe(256_262);
    expect(base('casa', 1, 'normal')).toBe(310_216);
    expect(base('casa', 2, 'alto')).toBe(385_238);
  });

  it('R-8, R-16 (Normal e Alto), CSL-8, CSL-16 e CAL-8 (Normal e Alto)', () => {
    expect(base('predio', 4, 'baixo')).toBe(228_568);
    expect(base('predio', 8, 'alto')).toBe(312_021);
    expect(base('predio', 10, 'normal')).toBe(248_039);
    expect(base('predio', 10, 'alto')).toBe(322_352);
    expect(base('salasLojas', 6, 'normal')).toBe(249_095);
    expect(base('salasLojas', 6, 'alto')).toBe(274_980);
    expect(base('salasLojas', 12, 'normal')).toBe(333_525);
    expect(base('salasLojas', 12, 'alto')).toBe(368_045);
    expect(base('andaresLivres', 8, 'normal')).toBe(295_474);
    expect(base('andaresLivres', 8, 'alto')).toBe(321_383);
  });

  it('GI tem padrão único: o mesmo CUB base nos três padrões, e o aditivo de padrão segue o escolhido', () => {
    for (const padrao of PADROES_ACABAMENTO) {
      const r = calculado(calcularCub({ ...REFERENCIA, tipologia: 'galpao', pavimentos: 1, padrao }));
      expect(r.cubBaseCentavos).toBe(133_376);
      expect(r.aditivos.padrao.padrao).toBe(padrao);
    }
  });
});

describe('lacunas da tabela: pendência explícita, nunca um valor inventado', () => {
  const combinacoesBaixoSemValor: [Tipologia, number, ProjetoCub][] = [
    ['predio', 10, 'R-16'],
    ['salasLojas', 4, 'CSL-8'],
    ['salasLojas', 12, 'CSL-16'],
    ['andaresLivres', 4, 'CAL-8'],
  ];

  it.each(combinacoesBaixoSemValor)('D-B4: %s com %i pavimentos (%s), padrão Baixo → pendente', (tipologia, pavimentos, projeto) => {
    const r = calcularCub({ ...REFERENCIA, tipologia, pavimentos, padrao: 'baixo' });
    expect(r.situacao).toBe('pendente');
    expect(r).toMatchObject({ motivo: 'padraoSemValorPublicado', projeto });
    expect(r).not.toHaveProperty('cubBaseCentavos');
    expect(r).not.toHaveProperty('cubAjustadoCentavos');
  });

  it('D-B4: o mesmo projeto com padrão Normal ou Alto calcula normalmente', () => {
    for (const [tipologia, pavimentos] of combinacoesBaixoSemValor) {
      expect(calcularCub({ ...REFERENCIA, tipologia, pavimentos, padrao: 'normal' }).situacao).toBe('calculado');
      expect(calcularCub({ ...REFERENCIA, tipologia, pavimentos, padrao: 'alto' }).situacao).toBe('calculado');
    }
  });

  it.each(PADROES_ACABAMENTO)('D-B5: andares livres com 9+ pavimentos (CAL-16), padrão %s → pendente por projeto sem tabela', (padrao) => {
    const r = calcularCub({ ...REFERENCIA, tipologia: 'andaresLivres', pavimentos: 12, padrao });
    expect(r).toMatchObject({ situacao: 'pendente', motivo: 'projetoSemTabela', projeto: 'CAL-16' });
    expect(r).not.toHaveProperty('cubAjustadoCentavos');
  });

  it('a pendência ainda discrimina os aditivos, que não dependem do CUB base faltante', () => {
    const r = calcularCub({ ...REFERENCIA, tipologia: 'predio', pavimentos: 10, padrao: 'baixo' });
    expect(r.situacao === 'pendente' && r.aditivos.somaPontosBase).toBe(1_500 + 1_000 + 150);
  });

  it('não há nenhuma combinação com valor zero ou negativo na base', () => {
    for (const projeto of Object.values(CUB_2026_08.valores)) {
      const valores = projeto.tipo === 'unico' ? [projeto.valorCentavos] : [projeto.baixoCentavos, projeto.normalCentavos, projeto.altoCentavos];
      for (const valor of valores) expect(valor === null || valor > 0).toBe(true);
    }
  });
});

describe('insumos insuficientes', () => {
  it('sem tipologia, pavimentos, padrão, topografia ou formato, não há classificação', () => {
    for (const parcial of [
      { tipologia: null },
      { pavimentos: null },
      { pavimentos: 0 },
      { pavimentos: 2.5 },
      { padrao: null },
      { topografia: null },
      { formatoLote: null },
    ]) {
      expect(calcularCub({ ...REFERENCIA, ...parcial }).situacao).toBe('insuficiente');
    }
  });

  it('chave fora das tabelas (entrada da API) não vira aditivo zero', () => {
    const r = calcularCub({ ...REFERENCIA, topografia: 'montanhosa' as never });
    expect(r.situacao).toBe('insuficiente');
  });
});

describe('base versionada atrás de um repositório (F24 troca a implementação)', () => {
  const outraVersao: VersaoCub = {
    id: 'cub-teste',
    competencia: { ano: 2030, mes: 1 },
    dataEmissao: '2030-01-10',
    origem: 'teste',
    valores: { 'R-8': { tipo: 'porPadrao', baixoCentavos: null, normalCentavos: 400_000, altoCentavos: null } },
  };
  const repositorioDeTeste: RepositorioCub = { obterVersaoVigente: () => outraVersao };

  it('a lógica usa o valor e a competência do repositório, não um valor embutido', () => {
    const r = calculado(calcularCub(REFERENCIA, repositorioDeTeste));
    expect(r.cubBaseCentavos).toBe(400_000);
    expect(r.cubAjustadoCentavos).toBe(494_000); // 4.000,00 × 1,235
    expect(r.versao).toMatchObject({ id: 'cub-teste', competencia: { ano: 2030, mes: 1 }, dataEmissao: '2030-01-10' });
  });

  it('a versão padrão é a de Ago/2026, sem data de emissão informada (TBD)', () => {
    const versao = repositorioCubEmMemoria.obterVersaoVigente();
    expect(versao.id).toBe('cub-2026-08');
    expect(versao.dataEmissao).toBeNull();
  });

  it('projeto que a nova versão não traz vira pendência, não erro', () => {
    const r = calcularCub({ ...REFERENCIA, tipologia: 'casa', pavimentos: 1 }, repositorioDeTeste);
    expect(r).toMatchObject({ situacao: 'pendente', motivo: 'projetoSemTabela', projeto: 'R-1' });
  });
});

describe('nenhum valor de CUB embutido na lógica (CLAUDE.md)', () => {
  const pastaMotor = path.resolve(__dirname, '..');
  const arquivosDeLogica = readdirSync(pastaMotor).filter((nome) => nome.endsWith('.ts'));
  const valoresCub = Object.values(CUB_2026_08.valores).flatMap((projeto) =>
    projeto.tipo === 'unico'
      ? [projeto.valorCentavos]
      : [projeto.baixoCentavos, projeto.normalCentavos, projeto.altoCentavos].filter((v): v is number => v !== null),
  );

  it('os módulos de lógica não contêm nenhum dos valores da tabela (só dados/ os tem)', () => {
    expect(arquivosDeLogica).toContain('cub.ts');
    for (const arquivo of arquivosDeLogica) {
      const codigo = readFileSync(path.join(pastaMotor, arquivo), 'utf8');
      for (const valor of valoresCub) {
        const formatos = [String(valor), (valor / 100).toFixed(2), (valor / 100).toFixed(2).replace('.', ',')];
        for (const formato of formatos) expect(codigo, `${arquivo} contém ${formato}`).not.toContain(formato);
      }
    }
  });
});

describe('calcularCubDaAnalise', () => {
  const terreno = { topografia: 'regular', formatoLote: 'regular' } as const;
  const predio = { ...criarProdutoVazio(), tipologia: 'predio', padrao: 'normal', pavimentos: 4 } as const;

  it('une Etapa 1 e Etapa 2 e reproduz o caso de referência', () => {
    expect(calculado(calcularCubDaAnalise(terreno, predio)).cubAjustadoCentavos).toBe(315_491);
  });

  it('mudar padrão, pavimentos, topografia ou formato reclassifica e recalcula', () => {
    expect(calculado(calcularCubDaAnalise(terreno, { ...predio, padrao: 'alto' })).cubBaseCentavos).toBe(312_021);
    expect(calculado(calcularCubDaAnalise(terreno, { ...predio, pavimentos: 10 })).projeto).toBe('R-16');
    expect(calculado(calcularCubDaAnalise({ ...terreno, topografia: 'acidentada' }, predio)).aditivos.somaPontosBase).toBe(2_700);
    expect(calculado(calcularCubDaAnalise({ ...terreno, formatoLote: 'irregular' }, predio)).aditivos.formato.pontosBase).toBe(50);
  });

  it('galpão usa o único pavimento da trava, mesmo que haja outro valor guardado (D-R19)', () => {
    const r = calculado(calcularCubDaAnalise(terreno, { ...predio, tipologia: 'galpao', pavimentos: 6 }));
    expect(r.projeto).toBe('GI');
    expect(r.aditivos.fundacao.faixa).toBe('umPavimento');
  });

  it('toda tipologia, em toda faixa, devolve um resultado definido', () => {
    for (const tipologia of TIPOLOGIAS) {
      for (const pavimentos of [1, 4, 5, 8, 9, 16, 17]) {
        const r = calcularCubDaAnalise(terreno, { ...predio, tipologia, pavimentos });
        expect(['calculado', 'pendente']).toContain(r.situacao);
      }
    }
  });
});
