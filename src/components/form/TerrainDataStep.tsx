import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TerrenoSchema,
  type TerrenoFormValues,
} from '../../utils/formValidation';
import type { AnalysisFormData } from '../../types/form';

interface Props {
  valoresIniciais: Partial<AnalysisFormData>;
  onAvancar: (dados: TerrenoFormValues) => void;
}

export default function TerrainDataStep({ valoresIniciais, onAvancar }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TerrenoFormValues>({
    resolver: zodResolver(TerrenoSchema),
    mode: 'onChange',
    defaultValues: {
      areaTerreno: valoresIniciais.areaTerreno,
      formatoLote: valoresIniciais.formatoLote,
      topografia: valoresIniciais.topografia,
      valorTerrenoR: valoresIniciais.valorTerrenoR,
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onAvancar)} noValidate>
      <h2 className="text-lg font-semibold text-gray-900">Dados do terreno</h2>

      <div>
        <label
          htmlFor="areaTerreno"
          className="block text-sm font-medium text-gray-700"
        >
          Área do terreno (m²)
        </label>
        <input
          id="areaTerreno"
          type="number"
          step="any"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register('areaTerreno')}
        />
        {errors.areaTerreno && (
          <p className="mt-1 text-sm text-danger">
            {errors.areaTerreno.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="formatoLote"
          className="block text-sm font-medium text-gray-700"
        >
          Formato do lote
        </label>
        <select
          id="formatoLote"
          defaultValue=""
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register('formatoLote')}
        >
          <option value="" disabled>
            Selecione
          </option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
        </select>
        {errors.formatoLote && (
          <p className="mt-1 text-sm text-danger">
            {errors.formatoLote.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="topografia"
          className="block text-sm font-medium text-gray-700"
        >
          Topografia
        </label>
        <select
          id="topografia"
          defaultValue=""
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register('topografia')}
        >
          <option value="" disabled>
            Selecione
          </option>
          <option value="plana">Plana</option>
          <option value="regular">Regular</option>
          <option value="irregular">Irregular</option>
          <option value="acidentada">Acidentada</option>
        </select>
        {errors.topografia && (
          <p className="mt-1 text-sm text-danger">
            {errors.topografia.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="valorTerrenoR"
          className="block text-sm font-medium text-gray-700"
        >
          Valor pedido pelo terreno (R$)
        </label>
        <input
          id="valorTerrenoR"
          type="number"
          step="any"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register('valorTerrenoR')}
        />
        {errors.valorTerrenoR && (
          <p className="mt-1 text-sm text-danger">
            {errors.valorTerrenoR.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
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
