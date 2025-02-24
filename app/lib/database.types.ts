export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      alunos: {
        Row: {
          id: string
          full_name: string
          email: string
          cpf: string
          telefone: string
          birth_date: string
          instrutor_id: string
          status: 'ativo' | 'inativo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          cpf: string
          telefone: string
          birth_date: string
          instrutor_id: string
          status?: 'ativo' | 'inativo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          cpf?: string
          telefone?: string
          birth_date?: string
          instrutor_id?: string
          status?: 'ativo' | 'inativo'
          created_at?: string
          updated_at?: string
        }
      }
      instrutores: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          cpf: string
          telefone: string
          cref: string
          academia_email: string
          status: 'pendente' | 'ativo' | 'inativo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          cpf: string
          telefone: string
          cref: string
          academia_email: string
          status?: 'pendente' | 'ativo' | 'inativo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          cpf?: string
          telefone?: string
          cref?: string
          academia_email?: string
          status?: 'pendente' | 'ativo' | 'inativo'
          created_at?: string
          updated_at?: string
        }
      }
      academias: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          cnpj: string
          telefone: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          cnpj: string
          telefone: string
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          cnpj?: string
          telefone?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
      }
      treinos: {
        Row: {
          id: string
          aluno_id: string
          instrutor_id: string
          data_treino: string
          status: 'agendado' | 'concluido' | 'cancelado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          instrutor_id: string
          data_treino: string
          status?: 'agendado' | 'concluido' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          instrutor_id?: string
          data_treino?: string
          status?: 'agendado' | 'concluido' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
      }
      avaliacoes: {
        Row: {
          id: string
          aluno_id: string
          instrutor_id: string
          data_avaliacao: string
          status: 'agendada' | 'concluida' | 'cancelada'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          instrutor_id: string
          data_avaliacao: string
          status?: 'agendada' | 'concluida' | 'cancelada'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          instrutor_id?: string
          data_avaliacao?: string
          status?: 'agendada' | 'concluida' | 'cancelada'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 