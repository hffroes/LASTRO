import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema, type LoginRequest } from '../../shared/schemas';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const contaCriada = Boolean(
    (location.state as { contaCriada?: boolean } | null)?.contaCriada
  );
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequestSchema) });

  const aoEnviar = async (dados: LoginRequest) => {
    setErroServidor(null);
    try {
      await login(dados.email, dados.password);
      navigate('/history');
    } catch (erro) {
      setErroServidor(erro instanceof Error ? erro.message : 'Erro ao entrar');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Entrar no LASTRO</h1>
        <p className="mt-1 text-sm text-gray-600">
          Análise econômica preliminar de terrenos
        </p>

        {contaCriada && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Conta criada com sucesso! Faça login para continuar.
          </p>
        )}

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
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-danger">
                {errors.password.message}
              </p>
            )}
          </div>

          {erroServidor && (
            <p className="text-sm text-danger">{erroServidor}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem conta?{' '}
          <Link to="/signup" className="font-medium text-gray-900 underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
