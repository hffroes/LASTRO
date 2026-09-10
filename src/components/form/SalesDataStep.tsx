import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendaSchema, type VendaFormValues } from '../../utils/formValidation';
import type { AnalysisFormData } from '../../types/form';

interface Props {
  valoresIniciais: Partial<AnalysisFormData>;
  onVoltar: (dadosParciais: Partial<VendaFormValues>) => void;
  onFinalizar: (dados: AnalysisFormData) => void;
  enviando: boolean;
}

export default function SalesDataStep({
  valoresIniciais,
  onVoltar,
  onFinalizar,
  enviando,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isValid },
  } = useForm<VendaFormValues>({
    resolver: zodResolver(VendaSchema),
    mode: 'onChange',
    defaultValues: {
      unidades: valoresIniciais.unidades,
      precoVendaUnitario: valoresIniciais.precoVendaUnitario,
    },
  });

  // PRD §2.2: usuário informa o valor total de venda da unidade; o app
  // calcula e mostra automaticamente o preço por m².
  const unidades = watch('unidades');
  const precoVendaUnitario = watch('precoVendaUnitario');
  const areaConstruida = valoresIniciais.areaConstruida ?? 0;
  const areaUnidade = unidades ? areaConstruida / Number(unidades) : 0;
  const precoM2 =
    areaUnidade > 0 && precoVendaUnitario
      ? Number(precoVendaUnitario) / areaUnidade
      : null;

  const aoEnviar = (dados: VendaFormValues) => {
    onFinalizar({ ...(valoresIniciais as AnalysisFormData), ...dados });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(aoEnviar)} noValidate>
      <h2 className="text-lg font-semibold text-gray-900">Dados de venda</h2>

      <div>
        <label
          htmlFor="unidades"
          className="block text-sm font-medium text-gray-700"
        >
          Número de unidades
        </label>
        <input
          id="unidades"
          type="number"
          step="1"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register('unidades')}
        />
        {errors.unidades && (
          <p className="mt-1 text-sm text-danger">{errors.unidades.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="precoVendaUnitario"
          className="block text-sm font-medium text-gray-700"
        >
          Valor de venda da unidade (R$)
        </label>
        <input
          id="precoVendaUnitario"
          type="number"
          step="any"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register('precoVendaUnitario')}
        />
        {errors.precoVendaUnitario && (
          <p className="mt-1 text-sm text-danger">
            {errors.precoVendaUnitario.message}
          </p>
        )}
      </div>

      {precoM2 !== null && (
        <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Preço por m²:{' '}
          {precoM2.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </p>
      )}

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
          disabled={!isValid || enviando}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {enviando ? 'Calculando...' : 'Calcular'}
        </button>
      </div>
    </form>
  );
}
