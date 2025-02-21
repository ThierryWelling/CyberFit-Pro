import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = 're_LpSCGqT1_Bp536n1izBKCNYrZfFMtc4pt';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, resetLink } = await req.json();

    // Validar dados
    if (!email || !resetLink) {
      throw new Error('Dados inválidos');
    }

    // Template do email em português
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7C3AFF;">Bem-vindo à CyberFit Pro!</h2>
        <p>Olá!</p>
        <p>Você foi convidado para se tornar instrutor na plataforma CyberFit Pro.</p>
        <p>Para completar seu cadastro, clique no botão abaixo:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetLink}" 
             style="background-color: #7C3AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Completar Cadastro
          </a>
        </div>

        <p><strong>Importante:</strong> Este link é válido por 24 horas.</p>
        
        <p style="margin-top: 20px;">Após completar seu cadastro, você terá acesso a:</p>
        <ul style="margin-top: 10px; padding-left: 20px;">
          <li>Gerenciamento de alunos</li>
          <li>Criação de treinos</li>
          <li>Acompanhamento de progresso</li>
          <li>E muito mais!</li>
        </ul>

        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px; text-align: center;">
          Se você não solicitou este convite, por favor ignore este email.
        </p>
      </div>
    `;

    // Enviar email usando Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CyberFit Pro <contato@cyberfit-pro.com.br>',
        to: email,
        subject: 'Complete seu cadastro - CyberFit Pro',
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Erro ao enviar email: ${errorData.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso' 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error: any) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}); 