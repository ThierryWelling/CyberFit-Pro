import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Barbell, 
  House, 
  Calendar, 
  ChartLineUp, 
  Users, 
  ClockCounterClockwise,
  Gear,
  SignOut,
  Money,
  ChalkboardTeacher,
  UserCircle,
  Bell,
  Spinner,
  Buildings
} from '@phosphor-icons/react';
import { cn } from '../lib/utils';
import { signOut } from '../lib/auth';
import { useUserProfile } from '../hooks/useUserProfile';

interface UserStats {
  academia?: {
    nome: string;
    logo_url?: string;
  };
}

interface UserProfile {
  profile_type: 'aluno' | 'instrutor' | 'academia';
  full_name: string;
  stats?: UserStats;
}

interface MenuItem {
  name: string;
  icon: any;
  path: string;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading, error } = useUserProfile();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/');
    }
  };

  const menuItems: Record<string, MenuItem[]> = {
    aluno: [
      { name: 'Dashboard', icon: House, path: '/aluno' },
      { name: 'Meus Treinos', icon: Barbell, path: '/aluno/treinos' },
      { name: 'Agenda', icon: Calendar, path: '/aluno/agenda' },
      { name: 'Progresso', icon: ChartLineUp, path: '/aluno/progresso' },
      { name: 'Histórico', icon: ClockCounterClockwise, path: '/aluno/historico' },
    ],
    instrutor: [
      { name: 'Dashboard', icon: House, path: '/instrutor' },
      { name: 'Alunos', icon: Users, path: '/instrutor/alunos' },
      { name: 'Treinos', icon: Barbell, path: '/instrutor/treinos' },
      { name: 'Agenda', icon: Calendar, path: '/instrutor/agenda' },
      { name: 'Avaliações', icon: ChartLineUp, path: '/instrutor/avaliacoes' },
    ],
    academia: [
      { name: 'Dashboard', icon: House, path: '/academia' },
      { name: 'Instrutores', icon: ChalkboardTeacher, path: '/academia/instrutores' },
      { name: 'Alunos', icon: Users, path: '/academia/alunos' },
      { name: 'Financeiro', icon: Money, path: '/academia/financeiro' },
      { name: 'Relatórios', icon: ChartLineUp, path: '/academia/relatorios' },
    ],
  };

  if (loading) {
    return (
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-0 top-0 h-screen w-64 bg-background-card/80 backdrop-blur-xl border-r border-white/5 flex items-center justify-center"
      >
        <Spinner size={32} className="text-purple-light animate-spin" />
      </motion.aside>
    );
  }

  if (error || !profile) {
    return (
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-0 top-0 h-screen w-64 bg-background-card/80 backdrop-blur-xl border-r border-white/5 flex items-center justify-center"
      >
        <div className="text-red-500">Erro ao carregar perfil</div>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-64 bg-background-card/80 backdrop-blur-xl border-r border-white/5"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        {profile?.profile_type === 'instrutor' && profile?.stats?.academia ? (
          <div className="flex items-center gap-3">
            <Buildings size={32} weight="duotone" className="text-purple-light" />
            <div>
              <h1 className="text-xl font-semibold text-white">{profile.stats.academia.nome}</h1>
              <p className="text-sm text-purple-light/70">Academia</p>
            </div>
          </div>
        ) : (
          <>
            <Barbell size={32} weight="duotone" className="text-purple-light" />
            <h1 className="text-xl font-semibold text-white">CyberFit Pro</h1>
          </>
        )}
      </div>

      {/* User Profile */}
      <div className="px-4 mb-8">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-white/5">
          <div className="h-10 w-10 rounded-full bg-purple-light/10 flex items-center justify-center">
            <UserCircle size={24} className="text-purple-light" weight="fill" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name ? profile.full_name.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ') : 'Usuário'}
            </p>
            <p className="text-xs text-purple-light/70 capitalize">
              {profile?.profile_type === 'instrutor' ? 'Instrutor' : profile?.profile_type || 'Carregando...'}
            </p>
          </div>
          <button className="relative group">
            <Bell size={20} className="text-purple-light/70 group-hover:text-purple-light transition-colors" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent-blue" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-2">
        {menuItems[profile.profile_type].map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all",
              pathname === item.path
                ? "bg-purple text-white shadow-neon"
                : "text-purple-light/70 hover:bg-purple/10 hover:text-purple-light"
            )}
          >
            <item.icon size={20} weight={pathname === item.path ? "fill" : "regular"} />
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
        <button
          onClick={() => router.push(`/${profile.profile_type}/configuracoes`)}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-purple-light/70 hover:bg-purple/10 hover:text-purple-light transition-all"
        >
          <Gear size={20} />
          <span className="text-sm font-medium">Configurações</span>
        </button>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <SignOut size={20} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </motion.aside>
  );
} 