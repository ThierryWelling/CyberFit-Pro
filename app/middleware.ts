import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/', '/auth/callback'];
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return res;
  }

  // Se não estiver autenticado, redirecionar para a página inicial
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Obter o tipo de perfil do usuário
  const profileType = session.user?.user_metadata?.profile_type;

  // Verificar se o usuário está tentando acessar uma rota permitida para seu perfil
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/aluno') && profileType !== 'aluno') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (path.startsWith('/instrutor') && profileType !== 'instrutor') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (path.startsWith('/academia') && profileType !== 'academia') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Se estiver autenticado mas na raiz, redirecionar para a página correta
  if (path === '/') {
    switch (profileType) {
      case 'aluno':
        return NextResponse.redirect(new URL('/aluno', request.url));
      case 'instrutor':
        return NextResponse.redirect(new URL('/instrutor', request.url));
      case 'academia':
        return NextResponse.redirect(new URL('/academia', request.url));
      default:
        return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return res;
}

// Configurar em quais caminhos o middleware será executado
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 