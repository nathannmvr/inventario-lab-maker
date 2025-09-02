'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddComponentPage() {
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentAvailable, setNewComponentAvailable] = useState('0');
  const [newComponentDefective, setNewComponentDefective] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponentName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const res = await fetch('/api/components', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newComponentName,
        available: newComponentAvailable,
        defective: newComponentDefective,
      }),
    });

    if (res.ok) {
      router.push('/admin'); // Redireciona de volta para o inventário
    } else {
      alert("Falha ao adicionar componente. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Adicionar Novo Componente</h2>
      <form onSubmit={handleAddComponent} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Componente</label>
          <input
            id="name"
            type="text"
            value={newComponentName}
            onChange={(e) => setNewComponentName(e.target.value)}
            placeholder="Ex: Arduino Uno R3"
            required
            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="quantityAvailable" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qtd. Disponível</label>
          <input
            id="quantityAvailable"
            type="number"
            min="0"
            value={newComponentAvailable}
            onChange={(e) => setNewComponentAvailable(e.target.value)}
            required
            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="quantityDefective" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qtd. Defeituosa</label>
          <input
            id="quantityDefective"
            type="number"
            min="0"
            value={newComponentDefective}
            onChange={(e) => setNewComponentDefective(e.target.value)}
            required
            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="sm:col-span-4 w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adicionando...' : 'Adicionar ao Inventário'}
        </button>
      </form>
    </section>
  );
}