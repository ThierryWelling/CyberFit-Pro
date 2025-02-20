# Estrutura do Banco de Dados - CyberFit Pro

Este diretório contém os arquivos relacionados ao banco de dados do CyberFit Pro.

## Esquema (`schema.sql`)

O arquivo `schema.sql` contém toda a estrutura do banco de dados, incluindo:

### Tabelas Principais

1. **Alunos**
   - Dados pessoais (nome, email, CPF)
   - Data de nascimento
   - Token de vinculação com instrutor

2. **Instrutores**
   - Dados pessoais (nome, email, CPF)
   - Número do CREF
   - Token de vinculação com academia

3. **Academias**
   - Dados da empresa (nome, email, CNPJ)
   - Endereço
   - Informações de contato

4. **Tokens**
   - Gerenciamento de tokens de vinculação
   - Controle de expiração
   - Rastreamento de uso

### Recursos de Segurança

- Row Level Security (RLS) habilitado
- Políticas de acesso específicas por tipo de usuário
- Restrições de unicidade
- Validações de dados

### Performance

- Índices otimizados
- Triggers para atualização automática
- Constraints apropriadas

## Como Usar

1. Para aplicar o esquema no Supabase:
   - Acesse o painel do Supabase
   - Vá para "SQL Editor"
   - Cole o conteúdo de `schema.sql`
   - Execute o script

2. Para atualizar o esquema:
   - Faça as alterações necessárias em `schema.sql`
   - Execute apenas os comandos novos/alterados no Supabase

## Políticas de Segurança

- Alunos só podem ver seus próprios dados
- Instrutores podem ver dados dos seus alunos vinculados
- Academias podem ver dados dos seus instrutores vinculados
- Tokens são visíveis apenas para seus criadores

## Manutenção

Ao fazer alterações no banco de dados:

1. Atualize o arquivo `schema.sql`
2. Documente as alterações neste README
3. Aplique as alterações no Supabase
4. Atualize os tipos TypeScript correspondentes 