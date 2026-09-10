import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignupRequestSchema, type SignupRequest } from '../../shared/schemas';
import { apiFetch } from '../utils/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupRequest>({ resolver: zodResolver(SignupRequestSchema) });

  // Não autentica direto: cria a conta e manda para o login, conforme o
  // fluxo definido no plan.md (Fase 5) — evita misturar a responsabilidade
  // de "criar conta" com a de "iniciar sessão".
  const aoEnviar = async (dados: SignupRequest) => {
    setErroServidor(null);

    const res = await apiFetch('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(dados),
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      setErroServidor(erro.error ?? 'Não foi possível criar a conta');
      return;
    }

    navigate('/login', { state: { contaCriada: true } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
        <p className="mt-1 text-sm text-gray-600">
          Comece a analisar a viabilidade dos seus terrenos
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(aoEnviar)}
          noValidate
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-danger">
                {errors.password.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mínimo de 8 caracteres.
            </p>
          </div>

          {erroServidor && (
            <p className="text-sm text-danger">{erroServidor}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-gray-900 underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
