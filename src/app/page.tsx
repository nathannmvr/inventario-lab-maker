'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FaGoogle, FaBoxOpen } from 'react-icons/fa';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/admin'); // Redireciona se já estiver logado
    }
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        <FaBoxOpen className="h-16 w-16 text-primary-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-primary-500 dark:text-white mb-2">Inventário Maker IF</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Acesso restrito para administradores.</p>
        <button
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-3 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <FaGoogle />
          Fazer Login com Google
        </button>
      </div>
    </div>
  );
}