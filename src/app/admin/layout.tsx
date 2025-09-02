'use client';

import { useSession, signIn, signOut } from 'next-auth/react'; // Adicionado signOut aqui
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBoxOpen, FaPlusCircle, FaUserShield, FaSignOutAlt } from 'react-icons/fa'; // Adicionado FaSignOutAlt aqui

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (status === 'unauthenticated') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
            <p className="mb-6">Você precisa estar logado como administrador para ver esta página.</p>
            <button onClick={() => signIn('google')} className="bg-primary-500 text-white font-bold py-2 px-4 rounded-lg">
                Fazer Login
            </button>
        </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Inventário', icon: FaBoxOpen },
    { href: '/admin/add-component', label: 'Adicionar Componente', icon: FaPlusCircle },
    { href: '/admin/manage-admins', label: 'Gerenciar Admins', icon: FaUserShield },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <nav className="flex items-center space-x-6">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className={`flex items-center gap-2 text-sm font-medium transition-colors ${pathname === link.href ? 'text-primary-500' : 'text-gray-500 hover:text-primary-500'}`}>
                            <link.icon className="h-5 w-5" />
                            <span className="hidden sm:inline">{link.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className='flex items-center gap-4'>
                    <span className='text-sm text-gray-600 dark:text-gray-400 hidden sm:block'>Olá, {session?.user?.name}</span>
                    <button onClick={() => signOut()} className="flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200">
                      <FaSignOutAlt />
                    </button>
                </div>
            </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}