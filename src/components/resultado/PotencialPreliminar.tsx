import { TEXTOS_RESULTADO } from '../../content/resultado';
import type { AreasDto, ProgramaDto } from '../../types/analise';
import { formatarArea, formatarInteiroBr } from '../../utils/motor/formatacao';
import estilos from './PotencialPreliminar.module.css';

interface PropriedadesPotencialPreliminar {
  areas: AreasDto;
  programa: ProgramaDto;
}

// PRD 2.5: o potencial do projeto em três números. A área construída e a área para vender não se
// confundem (a obra incide numa, o VGV na outra), então cada uma traz uma frase que a distingue.
export function PotencialPreliminar({ areas, programa }: PropriedadesPotencialPreliminar) {
  const { potencial } = TEXTOS_RESULTADO;
  const itens = [
    {
      id: 'area-construida',
      ...potencial.construida,
      valor: areas.areaConstruidaCentesimos === null ? '—' : formatarArea(areas.areaConstruidaCentesimos),
    },
    {
      id: 'area-comercializavel',
      ...potencial.comercializavel,
      valor: areas.areaComercializavelCentesimos === null ? '—' : formatarArea(areas.areaComercializavelCentesimos),
    },
    { id: 'unidades', ...potencial.unidades, valor: formatarInteiroBr(programa.totalUnidades) },
  ];
  return (
    <section className={estilos.secao} aria-labelledby="titulo-potencial">
      <h2 id="titulo-potencial" className={estilos.titulo}>
        {potencial.titulo}
      </h2>
      <dl className={estilos.lista}>
        {itens.map((item) => (
          <div key={item.id} className={estilos.item}>
            <dt className={estilos.rotulo}>{item.rotulo}</dt>
            <dd className={estilos.valor} data-testid={`potencial-${item.id}`}>
              {item.valor}
            </dd>
            <dd className={estilos.nota}>{item.nota}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
