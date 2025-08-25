import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
  throw new Error('Supabase configuration is missing');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, from } = await request.json();

    // 필수 필드 검증
    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이메일 발송 로그 저장
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        to_email: to,
        from_email: from || 'noreply@wellswap.com',
        subject: subject,
        body: body,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('이메일 로그 저장 실패:', logError);
    }

    // 실제 이메일 발송 (Resend 또는 다른 이메일 서비스 사용)
    const emailResult = await sendEmailViaService(to, subject, body, from);

    if (emailResult.success) {
      // 로그 상태 업데이트
      await supabase
        .from('email_logs')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('to_email', to)
        .eq('subject', subject);

      return NextResponse.json({ 
        success: true, 
        message: '이메일이 성공적으로 발송되었습니다.' 
      });
    } else {
      // 로그 상태 업데이트
      await supabase
        .from('email_logs')
        .update({ 
          status: 'failed',
          error_message: emailResult.error
        })
        .eq('to_email', to)
        .eq('subject', subject);

      return NextResponse.json(
        { error: '이메일 발송에 실패했습니다.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('이메일 발송 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 실제 이메일 서비스 연동 (Resend 예시)
async function sendEmailViaService(
  to: string, 
  subject: string, 
  body: string, 
  from?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Resend API 사용 (무료 플랜: 월 3,000건)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || 'WellSwap <your-email@gmail.com>', // 실제 Gmail 주소로 변경
        to: [to],
        subject: subject,
        html: body,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 이메일 발송 성공:', result);
      return { success: true };
    } else {
      const error = await response.text();
      console.error('❌ 이메일 발송 실패:', error);
      return { success: false, error };
    }

  } catch (error) {
    console.error('❌ 이메일 서비스 오류:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// 개발 환경에서는 콘솔에만 출력
async function sendEmailViaConsole(
  to: string, 
  subject: string, 
  body: string, 
  from?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📧 이메일 발송 (개발 모드):');
    console.log('From:', from || 'your-email@gmail.com'); // 실제 Gmail 주소로 변경
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
