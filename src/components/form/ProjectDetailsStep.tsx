import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DetalhesSchema,
  type DetalhesFormValues,
} from '../../utils/formValidation';
import type { AnalysisFormData } from '../../types/form';

interface Props {
  valoresIniciais: Partial<AnalysisFormData>;
  onAvancar: (dados: DetalhesFormValues) => void;
  onVoltar: (dadosParciais: Partial<DetalhesFormValues>) => void;
}

// PRD §2.3 prevê sugestão automática de m² construído via coeficiente de
// aproveitamento (IA) — ainda não definido (PRD §3.3, ver Fase 2), então
// por ora este passo pede a área construída diretamente, sem sugestão.
export default function ProjectDetailsStep({
  valoresIniciais,
  onAvancar,
  onVoltar,
}: Props) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<DetalhesFormValues>({
    resolver: zodResolver(DetalhesSchema),
    mode: 'onChange',
    defaultValues: { areaConstruida: valoresIniciais.areaConstruida },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onAvancar)} noValidate>
      <h2 className="text-lg font-semibold text-gray-900">
        Detalhes construtivos
      </h2>
      <p className="text-sm text-gray-600">
        A sugestão automática de área construída (a partir do coeficiente de
        aproveitamento) ainda não está disponível — informe abaixo a área
        construída estimada do projeto.
      </p>

      <div>
        <label
          htmlFor="areaConstruida"
          className="block text-sm font-medium text-gray-700"
        >
          Área construída total (m²)
        </label>
        <input
          id="areaConstruida"
          type="number"
          step="any"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register('areaConstruida')}
        />
        {errors.areaConstruida && (
          <p className="mt-1 text-sm text-danger">
            {errors.areaConstruida.message}
          </p>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => onVoltar(getValues())}
          className="text-sm font-medium text-gray-700 underline"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </form>
  );
}
