import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TipologiaFormSchema,
  type TipologiaFormValues,
} from '../../utils/formValidation';
import { useParameters } from '../../hooks/useParameters';
import type { AnalysisFormData } from '../../types/form';

interface Props {
  valoresIniciais: Partial<AnalysisFormData>;
  onAvancar: (dados: TipologiaFormValues) => void;
  onVoltar: (dadosParciais: Partial<TipologiaFormValues>) => void;
}

export default function ProjectTypeStep({
  valoresIniciais,
  onAvancar,
  onVoltar,
}: Props) {
  const { tipologias, carregando, erro } = useParameters();

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    getValues,
    formState: { errors, isValid },
  } = useForm<TipologiaFormValues>({
    resolver: zodResolver(TipologiaFormSchema),
    mode: 'onChange',
    defaultValues: {
      tipologia: valoresIniciais.tipologia ?? '',
      padrao: valoresIniciais.padrao,
    },
  });

  const tipologiaEscolhida = watch('tipologia');
  const padraoEscolhido = watch('padrao');

  const nomesTipologia = useMemo(
    () => Array.from(new Set(tipologias.map(t => t.nome))),
    [tipologias]
  );

  const padroesDisponiveis = useMemo(
    () => tipologias.filter(t => t.nome === tipologiaEscolhida),
    [tipologias, tipologiaEscolhida]
  );

  // Limpa o padrão só quando a tipologia muda de fato (não no primeiro
  // render, onde ambos vêm do mesmo valoresIniciais) — preserva o padrão
  // já escolhido ao navegar "Voltar" e "Próximo" de novo.
  const tipologiaAnteriorRef = useRef(valoresIniciais.tipologia);
  useEffect(() => {
    if (tipologiaAnteriorRef.current !== tipologiaEscolhida) {
      resetField('padrao');
      tipologiaAnteriorRef.current = tipologiaEscolhida;
    }
  }, [tipologiaEscolhida, resetField]);

  const referencia = padroesDisponiveis.find(t => t.padrao === padraoEscolhido);

  if (carregando) {
    return <p className="text-gray-600">Carregando tipologias...</p>;
  }

  if (erro) {
    return <p className="text-sm text-danger">{erro}</p>;
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onAvancar)} noValidate>
      <h2 className="text-lg font-semibold text-gray-900">
        Tipologia do empreendimento
      </h2>

      <div>
        <label
          htmlFor="tipologia"
          className="block text-sm font-medium text-gray-700"
        >
          Tipologia
        </label>
        <select
          id="tipologia"
          defaultValue=""
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          {...register('tipologia')}
        >
          <option value="" disabled>
            Selecione
          </option>
          {nomesTipologia.map(nome => (
            <option key={nome} value={nome}>
              {nome}
            </option>
          ))}
        </select>
        {errors.tipologia && (
          <p className="mt-1 text-sm text-danger">{errors.tipologia.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="padrao"
          className="block text-sm font-medium text-gray-700"
        >
          Padrão
        </label>
        <select
          id="padrao"
          defaultValue=""
          disabled={!tipologiaEscolhida}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
          {...register('padrao')}
        >
          <option value="" disabled>
            Selecione
          </option>
          {padroesDisponiveis.map(t => (
            <option key={t.padrao} value={t.padrao}>
              {t.padrao}
            </option>
          ))}
        </select>
        {errors.padrao && (
          <p className="mt-1 text-sm text-danger">{errors.padrao.message}</p>
        )}
      </div>

      {referencia && (
        <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Referência para {referencia.nome} {referencia.padrao}: terreno até{' '}
          {(referencia.percentualTerreno * 100).toFixed(0)}% do VGV, lucro alvo{' '}
          {(referencia.percentualLucro * 100).toFixed(0)}% do VGV.
        </div>
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
          disabled={!isValid}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </form>
  );
}
