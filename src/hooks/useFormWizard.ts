import { useCallback, useState } from 'react';
import type { AnalysisFormData } from '../types/form';

// State multi-step do formulário de análise (Fase 6). Cada passo funciona
// como um mini-formulário próprio (react-hook-form) que só chama `avancar`
// depois de validar — o merge aqui garante que os dados de passos
// anteriores nunca se percam ao navegar de volta e para frente.
export function useFormWizard() {
  const [passo, setPasso] = useState(0);
  const [dados, setDados] = useState<Partial<AnalysisFormData>>({});

  const avancar = useCallback((dadosDoPasso: Partial<AnalysisFormData>) => {
    setDados(atual => ({ ...atual, ...dadosDoPasso }));
    setPasso(atual => atual + 1);
  }, []);

  // Aceita os valores atuais (possivelmente incompletos/inválidos) do passo
  // que está sendo abandonado — sem isso, dados digitados mas ainda não
  // submetidos via "Próximo" se perderiam ao clicar "Voltar".
  const voltar = useCallback((dadosParciais?: Partial<AnalysisFormData>) => {
    if (dadosParciais) {
      setDados(atual => ({ ...atual, ...dadosParciais }));
    }
    setPasso(atual => Math.max(atual - 1, 0));
  }, []);

  return { passo, dados, avancar, voltar };
}
