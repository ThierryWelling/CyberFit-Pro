'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlass, 
  FunnelSimple, 
  Plus, 
  User,
  Barbell,
  Calendar,
  ChartLineUp,
  DotsThree,
  Warning
} from '@phosphor-icons/react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import AddAlunoModal from '../../components/AddAlunoModal';

interface Aluno {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  telefone: string;
  birth_date: string;
  created_at: string;
  status?: 'ativo' | 'inativo';
  ultimo_treino?: string;
  proxima_avaliacao?: string;
}

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      
      // Buscar o ID do instrutor atual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');

      const { data: instrutor, error: instrutorError } = await supabase
        .from('instrutores')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (instrutorError) throw instrutorError;

      // Buscar alunos do instrutor
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select(`
          id,
          full_name,
          email,
          cpf,
          telefone,
          birth_date,
          created_at,
          status
        `)
        .eq('instrutor_id', instrutor.id)
        .order('full_name');

      if (alunosError) throw alunosError;

      // Buscar último treino de cada aluno
      const alunosComTreinos = await Promise.all((alunosData || []).map(async (aluno) => {
        const { data: ultimoTreino } = await supabase
          .from('treinos')
          .select('data_treino')
          .eq('aluno_id', aluno.id)
          .eq('status', 'concluido')
          .order('data_treino', { ascending: false })
          .limit(1)
          .single();

        const { data: proximaAvaliacao } = await supabase
          .from('avaliacoes')
          .select('data_avaliacao')
          .eq('aluno_id', aluno.id)
          .eq('status', 'agendada')
          .order('data_avaliacao', { ascending: true })
          .limit(1)
          .single();

        return {
          ...aluno,
          ultimo_treino: ultimoTreino?.data_treino,
          proxima_avaliacao: proximaAvaliacao?.data_avaliacao
        };
      }));

      setAlunos(alunosComTreinos);
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
      setError('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlunos = alunos.filter(aluno => {
    const matchesSearch = aluno.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aluno.cpf.includes(searchTerm);
                         
    const matchesFilter = filterStatus === 'todos' ||
                         (filterStatus === 'ativos' && aluno.status === 'ativo') ||
                         (filterStatus === 'inativos' && aluno.status === 'inativo');
                         
    return matchesSearch && matchesFilter;
  });

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleAddSuccess = () => {
    fetchAlunos();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Meus Alunos</h1>
          <p className="text-purple-light/70">Gerencie seus alunos e acompanhe seus progressos</p>
        </div>
        
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-purple rounded-xl text-white font-medium hover:bg-purple/90 transition-colors"
        >
          <Plus size={20} />
          <span>Adicionar Aluno</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
          <Warning size={24} />
          <span>{error}</span>
        </div>
      ) : alunos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <User size={64} className="text-purple-light/30 mb-4" weight="thin" />
          <h2 className="text-xl font-medium text-white mb-2">Nenhum Aluno Cadastrado</h2>
          <p className="text-purple-light/70 text-center mb-8">
            Você ainda não possui alunos cadastrados. Comece adicionando seu primeiro aluno!
          </p>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-purple rounded-xl text-white font-medium hover:bg-purple/90 transition-colors"
          >
            <Plus size={20} />
            <span>Adicionar Primeiro Aluno</span>
          </motion.button>
        </div>
      ) : (
        <>
          {/* Filtros e Busca */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background/50 text-white placeholder-purple-light/50 border border-purple-light/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-purple-light/30 transition-colors"
              />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'todos' | 'ativos' | 'inativos')}
                className="appearance-none bg-background/50 text-white border border-purple-light/10 rounded-xl pl-10 pr-8 py-2 focus:outline-none focus:border-purple-light/30 transition-colors"
              >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
              <FunnelSimple size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-light/70" />
            </div>
          </div>

          {/* Lista de Alunos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlunos.map((aluno) => (
              <motion.div
                key={aluno.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background-card/50 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:bg-background-card/70 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-light/10 flex items-center justify-center">
                      <User size={24} className="text-purple-light" weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{aluno.full_name}</h3>
                      <p className="text-sm text-purple-light/70">{aluno.email}</p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DotsThree size={24} className="text-purple-light/70 hover:text-purple-light" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-purple-light/70">
                    <Barbell size={16} />
                    <span>Último treino:</span>
                    <span className="text-white">{aluno.ultimo_treino ? formatarData(aluno.ultimo_treino) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-light/70">
                    <Calendar size={16} />
                    <span>Próxima avaliação:</span>
                    <span className="text-white">{aluno.proxima_avaliacao ? formatarData(aluno.proxima_avaliacao) : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    aluno.status === 'ativo' 
                      ? "bg-green-500/10 text-green-500" 
                      : "bg-red-500/10 text-red-500"
                  )}>
                    {aluno.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-purple/10 text-purple-light/70 hover:text-purple-light transition-colors">
                      <ChartLineUp size={20} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-purple/10 text-purple-light/70 hover:text-purple-light transition-colors">
                      <Barbell size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Adicionar Aluno */}
      <AddAlunoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
} 