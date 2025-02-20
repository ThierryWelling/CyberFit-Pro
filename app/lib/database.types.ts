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
          user_id: string
          full_name: string
          email: string
          cpf: string
          telefone: string
          birth_date: string
          instrutor_token: string
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
          birth_date: string
          instrutor_token: string
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
          birth_date?: string
          instrutor_token?: string
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
          academia_token: string
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
          academia_token: string
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
          academia_token?: string
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
      tokens: {
        Row: {
          id: string
          token: string
          type: 'instrutor_token' | 'academia_token'
          created_by: string
          created_at: string
          expires_at: string | null
          used: boolean
        }
        Insert: {
          id?: string
          token: string
          type: 'instrutor_token' | 'academia_token'
          created_by: string
          created_at?: string
          expires_at?: string | null
          used?: boolean
        }
        Update: {
          id?: string
          token?: string
          type?: 'instrutor_token' | 'academia_token'
          created_by?: string
          created_at?: string
          expires_at?: string | null
          used?: boolean
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