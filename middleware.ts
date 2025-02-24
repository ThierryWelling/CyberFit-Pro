import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Atualizar a sessão de autenticação se existir
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não houver sessão e a rota requer autenticação, redirecionar para login
  if (!session && (
    request.nextUrl.pathname.startsWith('/instrutor') ||
    request.nextUrl.pathname.startsWith('/academia') ||
    request.nextUrl.pathname.startsWith('/aluno')
  )) {
    // Verificar se é uma requisição de API
    if (request.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Redirecionar para a página inicial
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
} 