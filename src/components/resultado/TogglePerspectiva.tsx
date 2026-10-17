import { TEXTOS_RESULTADO } from '../../content/resultado';
import { PERSPECTIVAS, type Perspectiva } from '../../types/analise';
import estilos from './TogglePerspectiva.module.css';

interface PropriedadesTogglePerspectiva {
  valor: Perspectiva;
  aoMudar: (perspectiva: Perspectiva) => void;
}

function fraseFixoResolvido(perspectiva: Perspectiva): string {
  const { fixo, resolvido, fixoResolvido } = TEXTOS_RESULTADO.perspectiva;
  const frase = fixoResolvido[perspectiva];
  return `${fixo}: ${frase.fixo}. ${resolvido}: ${frase.resolvido}.`;
}

// As duas leituras da mesma conta (PRD 2.6), num controle segmentado sobre radios nativos: setas, Tab e
// leitor de tela funcionam como o navegador já sabe, e o estado escolhido é anunciado. O cartão de
// destaque troca inteiro ao alternar, então o anúncio do que está fixo e resolvido sai daqui, de uma
// região que continua montada.
export function TogglePerspectiva({ valor, aoMudar }: PropriedadesTogglePerspectiva) {
  const { perspectiva: texto } = TEXTOS_RESULTADO;

  return (
    <div className={estilos.bloco}>
      <div className={estilos.linha}>
        <span id="rotulo-perspectiva" className={estilos.rotulo}>
          {texto.rotulo}
        </span>
        <div role="radiogroup" aria-labelledby="rotulo-perspectiva" className={estilos.segmentos}>
          {PERSPECTIVAS.map((opcao) => (
            <label key={opcao} className={estilos.segmento}>
              <input
                type="radio"
                name="perspectiva"
                value={opcao}
                checked={valor === opcao}
                onChange={() => aoMudar(opcao)}
                className={estilos.radio}
              />
              {texto.opcoes[opcao]}
            </label>
          ))}
        </div>
      </div>
      <p className={estilos.nota}>{texto.mesmaConta}</p>
      <p className={estilos.apenasLeitor} aria-live="polite" data-testid="perspectiva-anuncio">
        {texto.anuncio(texto.opcoes[valor], fraseFixoResolvido(valor))}
      </p>
    </div>
  );
}

// A frase de cada perspectiva, no cartão de destaque, no lugar da explicação: diz o que fica parado e o
// que a leitura responde, logo acima do número que responde.
export function FraseFixoResolvido({ perspectiva, className }: { perspectiva: Perspectiva; className?: string }) {
  const { fixo, resolvido, fixoResolvido } = TEXTOS_RESULTADO.perspectiva;
  const frase = fixoResolvido[perspectiva];
  return (
    <p className={className} data-testid="perspectiva-frase">
      <strong>{fixo}:</strong> {frase.fixo}. <strong>{resolvido}:</strong> {frase.resolvido}.
    </p>
  );
}
