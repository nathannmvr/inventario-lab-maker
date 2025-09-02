'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { FaPlus, FaMinus, FaExclamationTriangle, FaWrench, FaTrash } from 'react-icons/fa';
import type { Component } from '../lib/db'; // Importando nosso tipo

export default function Home() {
  const { data: session, status } = useSession();
  const [components, setComponents] = useState<Component[]>([]);
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentAvailable, setNewComponentAvailable] = useState('0');

  const fetchComponents = async () => {
    try {
      const res = await fetch('/api/components');
      if (res.ok) {
        const data = await res.json();
        setComponents(data);
      }
    } catch (error) {
      console.error("Failed to fetch components:", error);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleAction = async (componentId: string, action: string) => {
    const method = action === 'DELETE' ? 'DELETE' : 'PUT';
    await fetch('/api/components', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentId, action }),
    });
    fetchComponents();
  };
  
  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/components', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newComponentName, available: newComponentAvailable }),
    });
    setNewComponentName('');
    setNewComponentAvailable('0');
    fetchComponents();
  };
  
  const isAdmin = status === 'authenticated';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-900">Inventário Maker Lab</h1>
        {status === 'loading' ? (
          <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
        ) : isAdmin ? (
          <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-600 hidden sm:block'>Bem-vindo, {session.user?.name}</span>
            <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">
              Sair
            </button>
          </div>
        ) : (
          <button onClick={() => signIn('google')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
            Login de Administrador
          </button>
        )}
      </header>

      <main>
        {isAdmin && (
          <section className="mb-10 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Adicionar Novo Componente</h2>
            <form onSubmit={handleAddComponent} className="flex flex-col sm:flex-row items-end gap-4">
              <div className="w-full sm:w-1/2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Componente</label>
                <input
                  id="name"
                  type="text"
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  placeholder="Ex: Arduino Uno R3"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="w-full sm:w-1/4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Qtd. Inicial</label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  value={newComponentAvailable}
                  onChange={(e) => setNewComponentAvailable(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button type="submit" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors">
                Adicionar
              </button>
            </form>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold mb-4">Estoque de Componentes</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full min-w-max text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4 font-semibold">Componente</th>
                  <th className="p-4 font-semibold text-center">Disponível</th>
                  <th className="p-4 font-semibold text-center">Com Defeito</th>
                  <th className="p-4 font-semibold text-center">Total</th>
                  {isAdmin && <th className="p-4 font-semibold text-center">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {components.map(comp => (
                  <tr key={comp.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{comp.name}</td>
                    <td className="p-4 text-center text-green-600 font-semibold">{comp.stock.available}</td>
                    <td className="p-4 text-center text-yellow-600 font-semibold">{comp.stock.defective}</td>
                    <td className="p-4 text-center font-bold">{comp.stock.available + comp.stock.defective}</td>
                    {isAdmin && (
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2 flex-wrap">
                          <button title="Adicionar ao estoque" onClick={() => handleAction(comp.id, 'INCREMENT_AVAILABLE')} className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-gray-200"><FaPlus /></button>
                          <button title="Remover do estoque (uso)" onClick={() => handleAction(comp.id, 'DECREMENT_AVAILABLE')} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"><FaMinus /></button>
                          <button title="Marcar como defeituoso" onClick={() => handleAction(comp.id, 'MARK_DEFECTIVE')} className="text-yellow-500 hover:text-yellow-700 p-2 rounded-full hover:bg-gray-200"><FaExclamationTriangle /></button>
                          <button title="Marcar como reparado" onClick={() => handleAction(comp.id, 'MARK_REPAIRED')} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-gray-200"><FaWrench /></button>
                          <button title="Descartar defeituoso" onClick={() => handleAction(comp.id, 'DISCARD_DEFECTIVE')} className="text-orange-500 hover:text-orange-700 p-2 rounded-full hover:bg-gray-200"><FaTrash /></button>
                          <button title="Apagar componente" onClick={() => handleAction(comp.id, 'DELETE')} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-200"><FaTrash /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}