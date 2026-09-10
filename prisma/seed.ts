import { PrismaClient } from '@prisma/client';
import {
  AJUSTES_FORMATO,
  AJUSTES_TOPOGRAFIA,
  COEFICIENTES_IA_PLACEHOLDER,
  TIPOLOGIA_PARAMETROS,
} from '../server/utils/parameterConstants';

const prisma = new PrismaClient();

async function seedTipologias() {
  for (const parametro of TIPOLOGIA_PARAMETROS) {
    await prisma.tipologia.upsert({
      where: {
        tipologia_padrao: {
          tipologia: parametro.tipologia,
          padrao: parametro.padrao,
        },
      },
      create: parametro,
      update: parametro,
    });
  }
  console.log(`✓ ${TIPOLOGIA_PARAMETROS.length} tipologias seedadas`);
}

async function seedAjustesCub() {
  const entradas = [
    ...Object.entries(AJUSTES_TOPOGRAFIA).map(([chave, percentual]) => ({
      categoria: 'topografia',
      chave,
      percentual,
    })),
    ...Object.entries(AJUSTES_FORMATO).map(([chave, percentual]) => ({
      categoria: 'formato',
      chave,
      percentual,
    })),
  ];

  for (const entrada of entradas) {
    await prisma.ajusteCub.upsert({
      where: {
        categoria_chave: { categoria: entrada.categoria, chave: entrada.chave },
      },
      create: entrada,
      update: entrada,
    });
  }
  console.log(
    `✓ ${entradas.length} ajustes de CUB (topografia/formato) seedados`
  );
}

async function seedParametrosTbd() {
  await prisma.parametro.upsert({
    where: { chave: 'coeficientes_ia' },
    create: {
      chave: 'coeficientes_ia',
      valor: COEFICIENTES_IA_PLACEHOLDER,
      descricao:
        'PRD §3.3 — Coeficientes de Aproveitamento (IA) por zoneamento, ainda não definidos.',
    },
    update: {
      valor: COEFICIENTES_IA_PLACEHOLDER,
    },
  });
  console.log('✓ Parâmetro placeholder "coeficientes_ia" seedado');
}

async function main() {
  await seedTipologias();
  await seedAjustesCub();
  await seedParametrosTbd();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
