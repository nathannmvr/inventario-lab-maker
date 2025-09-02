'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '../../../components/ConfirmModal';
import { FaUserShield, FaUserPlus, FaTrash } from 'react-icons/fa';

export default function ManageAdminsPage() {
    const [admins, setAdmins] = useState<string[]>([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        onConfirm: () => {} 
    });

    const fetchAdmins = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admins');
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error("Failed to fetch admins:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) return;
        
        await fetch('/api/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newAdminEmail }),
        });
        setNewAdminEmail('');
        fetchAdmins();
    };

    const handleRemoveAdmin = async (email: string) => {
        const res = await fetch('/api/admins', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            fetchAdmins();
        } else {
            const { error } = await res.json();
            alert(`Erro: ${error}`);
        }
    };

    const openRemoveAdminModal = (email: string) => {
        setModalState({
            isOpen: true,
            title: 'Remover Administrador',
            message: `Tem certeza que deseja remover as permissões de "${email}"?`,
            onConfirm: () => {
                handleRemoveAdmin(email);
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
            <section className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <FaUserShield /> Gerenciar Administradores
                </h2>
                <div className="space-y-6">
                    {/* Formulário para adicionar admin */}
                    <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row items-center gap-2">
                        <input 
                            type="email" 
                            value={newAdminEmail} 
                            onChange={(e) => setNewAdminEmail(e.target.value)} 
                            placeholder="email.novo.admin@gmail.com" 
                            required 
                            className="flex-grow w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                        />
                        <button 
                            type="submit" 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            <FaUserPlus /> Adicionar
                        </button>
                    </form>
                    
                    {/* Lista de admins atuais */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Admins Atuais:</h3>
                        {isLoading ? (
                            <p className="text-gray-500 dark:text-gray-400">Carregando administradores...</p>
                        ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                                {admins.map(email => (
                                    <li key={email} className="flex justify-between items-center py-3">
                                        <span className="text-gray-700 dark:text-gray-300 break-all pr-4">{email}</span>
                                        <button 
                                            onClick={() => openRemoveAdminModal(email)} 
                                            title={`Remover ${email}`} 
                                            className="text-secondary-500 hover:text-secondary-600 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                                        >
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}