export function validarCPF(cpf: string) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto > 9 ? 0 : resto;
  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto > 9 ? 0 : resto;
  if (digitoVerificador2 !== parseInt(cpf.charAt(10))) return false;

  return true;
}

export function validarCNPJ(cnpj: string) {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  let peso = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let digitoVerificador1 = 11 - (soma % 11);
  if (digitoVerificador1 > 9) digitoVerificador1 = 0;
  if (digitoVerificador1 !== parseInt(cnpj.charAt(12))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  peso = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let digitoVerificador2 = 11 - (soma % 11);
  if (digitoVerificador2 > 9) digitoVerificador2 = 0;
  if (digitoVerificador2 !== parseInt(cnpj.charAt(13))) return false;

  return true;
}

export function validarTelefone(telefone: string, ddi: string = '55') {
  // Remove caracteres não numéricos
  telefone = telefone.replace(/[^\d]/g, '');
  
  // Validação específica para Brasil (DDI 55)
  if (ddi === '55') {
    return /^([1-9]{2})(9?\d{8})$/.test(telefone);
  }
  
  // Validação genérica para outros países (mínimo 8 dígitos, máximo 15)
  return telefone.length >= 8 && telefone.length <= 15;
}

export function validarEmail(email: string) {
  // Regex mais completa para validação de email
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

export function formatarCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatarCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]/g, '');
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatarTelefone(telefone: string) {
  telefone = telefone.replace(/[^\d]/g, '');
  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

export function formatarTelefoneInternacional(telefone: string, ddi: string = '55') {
  telefone = telefone.replace(/[^\d]/g, '');
  
  // Formatação específica para Brasil
  if (ddi === '55') {
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Formatação genérica para outros países
  return `+${ddi} ${telefone}`;
}

// Lista de países com DDI
export const paisesDDI = [
  { nome: 'Brasil', ddi: '55', bandeira: '🇧🇷' },
  { nome: 'Estados Unidos', ddi: '1', bandeira: '🇺🇸' },
  { nome: 'Portugal', ddi: '351', bandeira: '🇵🇹' },
  { nome: 'Espanha', ddi: '34', bandeira: '🇪🇸' },
  { nome: 'França', ddi: '33', bandeira: '🇫🇷' },
  { nome: 'Alemanha', ddi: '49', bandeira: '🇩🇪' },
  { nome: 'Itália', ddi: '39', bandeira: '🇮🇹' },
  { nome: 'Reino Unido', ddi: '44', bandeira: '🇬🇧' },
  { nome: 'Japão', ddi: '81', bandeira: '🇯🇵' },
  { nome: 'China', ddi: '86', bandeira: '🇨🇳' },
  { nome: 'Austrália', ddi: '61', bandeira: '🇦🇺' },
  { nome: 'Canadá', ddi: '1', bandeira: '🇨🇦' },
  { nome: 'México', ddi: '52', bandeira: '🇲🇽' },
  { nome: 'Argentina', ddi: '54', bandeira: '🇦🇷' },
  { nome: 'Chile', ddi: '56', bandeira: '🇨🇱' },
]; 