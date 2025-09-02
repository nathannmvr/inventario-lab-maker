'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FaPlus, FaMinus, FaExclamationTriangle, FaWrench, FaTrash, FaGoogle, FaSignOutAlt, FaBoxOpen, FaRegEdit } from 'react-icons/fa';
import type { Component } from '../lib/db';

export default function Home() {
  const { data: session, status } = useSession();
  const [components, setComponents] = useState<Component[]>([]);
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentAvailable, setNewComponentAvailable] = useState('0');
  const [newComponentDefective, setNewComponentDefective] = useState('0'); // Novo campo para itens defeituosos
  const [isLoading, setIsLoading] = useState(true);

  const fetchComponents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/components');
      if (res.ok) {
        const data = await res.json();
        setComponents(data);
      }
    } catch (error) {
      console.error("Failed to fetch components:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleAction = async (componentId: string, action: string) => {
    const originalComponents = JSON.parse(JSON.stringify(components)); // Garante uma cópia profunda
    
    // Otimização: Atualiza a UI imediatamente para uma sensação mais rápida
    const updatedComponents = components.map(c => {
        if (c.id === componentId) {
            const newComp = JSON.parse(JSON.stringify(c)); // Deep copy para evitar mutação direta
            switch (action) {
                case 'INCREMENT_AVAILABLE': newComp.stock.available++; break;
                case 'DECREMENT_AVAILABLE': if(newComp.stock.available > 0) newComp.stock.available--; break;
                case 'MARK_DEFECTIVE': if(newComp.stock.available > 0) { newComp.stock.available--; newComp.stock.defective++; } break;
                case 'MARK_REPAIRED': if(newComp.stock.defective > 0) { newComp.stock.defective--; newComp.stock.available++; } break;
                case 'DISCARD_DEFECTIVE': if(newComp.stock.defective > 0) newComp.stock.defective--; break;
            }
            return newComp;
        }
        return c;
    }).filter(c => !(action === 'DELETE' && c.id === componentId));

    setComponents(updatedComponents);

    // Envia a requisição para a API em background
    try {
        const method = action === 'DELETE' ? 'DELETE' : 'PUT';
        const res = await fetch('/api/components', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ componentId, action }),
        });
        if (!res.ok) {
            // Se a API falhar, reverte para o estado original
            setComponents(originalComponents);
            console.error(`Falha ao executar ação ${action}. Revertendo estado.`);
        }
    } catch (error) {
        // Se a API falhar, reverte para o estado original
        setComponents(originalComponents);
        console.error(`Erro de rede ao executar ação ${action}:`, error);
    }
  };
  
  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponentName.trim()) return;

    await fetch('/api/components', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: newComponentName, 
        available: newComponentAvailable,
        defective: newComponentDefective // Inclui o campo defeituoso
      }),
    });
    setNewComponentName('');
    setNewComponentAvailable('0');
    setNewComponentDefective('0'); // Reseta o campo
    fetchComponents(); // Re-busca da fonte para garantir consistência
  };
  
  const isAdmin = status === 'authenticated';

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                    <FaBoxOpen className="h-8 w-8 text-indigo-500" />
                    <span className="text-xl font-bold text-gray-800 dark:text-white">Inventário Maker</span>
                </div>
                {status === 'loading' ? (
                  <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                ) : isAdmin ? (
                  <div className='flex items-center gap-4'>
                    <span className='text-sm text-gray-600 dark:text-gray-400 hidden sm:block'>
                        {session.user?.name}
                    </span>
                    <button onClick={() => signOut()} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                      <FaSignOutAlt />
                      <span className="hidden sm:inline">Sair</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => signIn('google')} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                    <FaGoogle />
                    Login Admin
                  </button>
                )}
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {isAdmin && (
          <section className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-transparent dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Adicionar Novo Componente</h2>
            <form onSubmit={handleAddComponent} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Componente</label>
                <input
                  id="name"
                  type="text"
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  placeholder="Ex: Arduino Uno R3"
                  required
                  className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="quantityAvailable" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Qtd. Disponível Inicial</label>
                <input
                  id="quantityAvailable"
                  type="number"
                  min="0"
                  value={newComponentAvailable}
                  onChange={(e) => setNewComponentAvailable(e.target.value)}
                  required
                  className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="quantityDefective" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Qtd. Defeituosa Inicial</label>
                <input
                  id="quantityDefective"
                  type="number"
                  min="0"
                  value={newComponentDefective}
                  onChange={(e) => setNewComponentDefective(e.target.value)}
                  required
                  className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button type="submit" className="sm:col-span-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Adicionar ao Inventário
              </button>
            </form>
          </section>
        )}

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-transparent dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Estoque de Componentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Componente</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">Disponível</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">Com Defeito</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">Total</th>
                  {isAdmin && <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                    <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="text-center p-8 text-gray-500 dark:text-gray-400">Carregando componentes...</td>
                    </tr>
                ) : components.length === 0 ? (
                    <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="text-center p-8 text-gray-500 dark:text-gray-400">Nenhum componente cadastrado ainda.</td>
                    </tr>
                ) : (
                    components.map(comp => (
                    <tr key={comp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-4 font-medium whitespace-nowrap">{comp.name}</td>
                        <td className="p-4 text-center font-semibold text-green-600 dark:text-green-400">{comp.stock.available}</td>
                        <td className="p-4 text-center font-semibold text-yellow-600 dark:text-yellow-400">{comp.stock.defective}</td>
                        <td className="p-4 text-center font-bold text-gray-800 dark:text-gray-200">{comp.stock.available + comp.stock.defective}</td>
                        {isAdmin && (
                        <td className="p-4">
                            <div className="flex justify-center items-center gap-1 flex-wrap">
                                {/* Botões de Ação com Tooltips */}
                                <button title="Adicionar 1 ao estoque disponível" onClick={() => handleAction(comp.id, 'INCREMENT_AVAILABLE')} className="text-gray-500 hover:text-green-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaPlus size={12} /></button>
                                <button title="Remover 1 do estoque disponível (uso)" onClick={() => handleAction(comp.id, 'DECREMENT_AVAILABLE')} className="text-gray-500 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaMinus size={12} /></button>
                                <button title="Mover 1 para estoque defeituoso" onClick={() => handleAction(comp.id, 'MARK_DEFECTIVE')} className="text-gray-500 hover:text-yellow-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaExclamationTriangle size={12} /></button>
                                <button title="Mover 1 de defeituoso para disponível (reparado/reposto)" onClick={() => handleAction(comp.id, 'MARK_REPAIRED')} className="text-gray-500 hover:text-blue-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaWrench size={12} /></button>
                                <button title="Descartar 1 componente defeituoso (remove do inventário)" onClick={() => handleAction(comp.id, 'DISCARD_DEFECTIVE')} className="text-gray-500 hover:text-orange-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaTrash size={12} /></button>
                                <button title="Apagar componente completamente" onClick={() => handleAction(comp.id, 'DELETE')} className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaTrash size={12} /></button>
                            </div>
                        </td>
                        )}
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}