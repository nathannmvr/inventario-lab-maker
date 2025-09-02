'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import { FaPlus, FaMinus, FaExclamationTriangle, FaWrench, FaTrash } from 'react-icons/fa';
import type { Component } from '../../lib/db';

export default function InventoryPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

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
    const originalComponents = JSON.parse(JSON.stringify(components));
    
    const updatedComponents = components.map(c => {
        if (c.id === componentId) {
            const newComp = JSON.parse(JSON.stringify(c));
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

    try {
        const method = action === 'DELETE' ? 'DELETE' : 'PUT';
        await fetch('/api/components', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ componentId, action }),
        });
    } catch (error) {
        setComponents(originalComponents);
    }
  };

  const openDeleteModal = (componentId: string, componentName: string) => {
    setModalState({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja apagar o componente "${componentName}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => {
        handleAction(componentId, 'DELETE');
        closeModal();
      },
    });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };
  
  return (
    <>
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={closeModal}
      />
      
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Estoque de Componentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold text-sm text-primary-600 dark:text-gray-300 uppercase tracking-wider">Componente</th>
                <th className="p-4 font-semibold text-sm text-primary-600 dark:text-gray-300 uppercase tracking-wider text-center">Disponível</th>
                <th className="p-4 font-semibold text-sm text-primary-600 dark:text-gray-300 uppercase tracking-wider text-center">Com Defeito</th>
                <th className="p-4 font-semibold text-sm text-primary-600 dark:text-gray-300 uppercase tracking-wider text-center">Total</th>
                <th className="p-4 font-semibold text-sm text-primary-600 dark:text-gray-300 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (<tr><td colSpan={5} className="text-center p-8 text-gray-500 dark:text-gray-400">Carregando...</td></tr>)
              : components.length === 0 ? (<tr><td colSpan={5} className="text-center p-8 text-gray-500 dark:text-gray-400">Nenhum componente cadastrado.</td></tr>)
              : (components.map(comp => (
                  <tr key={comp.id} className="hover:bg-primary-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4 font-medium whitespace-nowrap text-gray-900 dark:text-gray-200">{comp.name}</td>
                      <td className="p-4 text-center font-semibold text-green-600 dark:text-green-400">{comp.stock.available}</td>
                      <td className="p-4 text-center font-semibold text-yellow-600 dark:text-yellow-400">{comp.stock.defective}</td>
                      <td className="p-4 text-center font-bold text-gray-900 dark:text-gray-200">{comp.stock.available + comp.stock.defective}</td>
                      <td className="p-4">
                          <div className="flex justify-center items-center gap-1 flex-wrap">
                              <button title="Adicionar 1 disponível" onClick={() => handleAction(comp.id, 'INCREMENT_AVAILABLE')} className="text-primary-500 hover:text-primary-600 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaPlus size={12} /></button>
                              <button title="Remover 1 disponível (uso)" onClick={() => handleAction(comp.id, 'DECREMENT_AVAILABLE')} className="text-gray-500 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaMinus size={12} /></button>
                              <button title="Mover 1 para estoque defeituoso" onClick={() => handleAction(comp.id, 'MARK_DEFECTIVE')} className="text-yellow-500 hover:text-yellow-600 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaExclamationTriangle size={12} /></button>
                              <button title="Mover 1 de defeituoso para disponível (reparado)" onClick={() => handleAction(comp.id, 'MARK_REPAIRED')} className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaWrench size={12} /></button>
                              <button title="Descartar 1 componente defeituoso" onClick={() => handleAction(comp.id, 'DISCARD_DEFECTIVE')} className="text-orange-500 hover:text-orange-600 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaTrash size={12} /></button>
                              <button title="Apagar componente completamente" onClick={() => openDeleteModal(comp.id, comp.name)} className="text-secondary-500 hover:text-secondary-600 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><FaTrash size={12} /></button>
                          </div>
                      </td>
                  </tr>
              )))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}