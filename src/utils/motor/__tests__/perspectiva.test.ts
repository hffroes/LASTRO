import { describe, expect, it } from 'vitest';
import { perspectivaPadrao } from '../perspectiva';

describe('perspectivaPadrao (D-R6)', () => {
  it('comprar o terreno abre na Terrenista; executar o empreendimento, na Incorporador', () => {
    expect(perspectivaPadrao('comprarTerreno')).toBe('terrenista');
    expect(perspectivaPadrao('executarEmpreendimento')).toBe('incorporador');
  });

  it('sem objetivo (não chega ao resultado, pela trava) cai na Terrenista', () => {
    expect(perspectivaPadrao(null)).toBe('terrenista');
  });
});
