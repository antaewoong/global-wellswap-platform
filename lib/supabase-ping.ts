// lib/supabase-ping.ts - Supabase 자동 핑 시스템
import { supabase } from './supabase';

class SupabasePingService {
  private pingInterval: NodeJS.Timeout | null = null;
  private isActive = false;
  private pingCount = 0;
  private lastPingTime: Date | null = null;

  constructor() {
    this.startPing();
  }

  // 자동 핑 시작
  startPing() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔄 Supabase 자동 핑 시작...');
    
    // 30분마다 핑 실행 (Supabase 7일 제한 대비 안전)
    this.pingInterval = setInterval(async () => {
      await this.performPing();
    }, 30 * 60 * 1000); // 30분
    
    // 즉시 첫 번째 핑 실행
    this.performPing();
  }

  // 핑 실행
  private async performPing() {
    try {
      this.pingCount++;
      this.lastPingTime = new Date();
      
      console.log(`🔄 Supabase 핑 #${this.pingCount} 실행 중... (${this.lastPingTime.toISOString()})`);
      
      // 1. 간단한 쿼리로 연결 확인
      const { data, error } = await supabase
        .from('insurance_assets')
        .select('count')
        .limit(1);
      
      if (error) {
        console.warn('⚠️ Supabase 핑 쿼리 실패:', error);
        // 재연결 시도
        await this.reconnect();
      } else {
        console.log(`✅ Supabase 핑 #${this.pingCount} 성공`);
      }
      
      // 2. 연결 상태 로그 기록 (선택사항)
      await this.logPingStatus();
      
    } catch (error) {
      console.error('❌ Supabase 핑 실패:', error);
      await this.reconnect();
    }
  }

  // 재연결 시도
  private async reconnect() {
    try {
      console.log('🔄 Supabase 재연결 시도 중...');
      
      // 5초 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const { data, error } = await supabase
        .from('insurance_assets')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase 재연결 실패:', error);
      } else {
        console.log('✅ Supabase 재연결 성공');
      }
    } catch (error) {
      console.error('❌ Supabase 재연결 중 오류:', error);
    }
  }

  // 핑 상태 로그 기록
  private async logPingStatus() {
    try {
      // 핑 상태를 로그 테이블에 기록 (선택사항)
      await supabase
        .from('system_logs')
        .insert({
          type: 'ping',
          message: `Supabase 핑 #${this.pingCount} 성공`,
          timestamp: new Date().toISOString(),
          metadata: {
            pingCount: this.pingCount,
            lastPingTime: this.lastPingTime?.toISOString()
          }
        });
    } catch (error) {
      // 로그 테이블이 없어도 무시 (핑은 계속 실행)
      console.log('📝 핑 로그 기록 생략 (테이블 없음)');
    }
  }

  // 핑 중지
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.isActive = false;
    console.log('🛑 Supabase 자동 핑 중지');
  }

  // 상태 확인
  getStatus() {
    return {
      isActive: this.isActive,
      pingCount: this.pingCount,
      lastPingTime: this.lastPingTime,
      nextPingTime: this.lastPingTime ? 
        new Date(this.lastPingTime.getTime() + 30 * 60 * 1000) : null
    };
  }
}

// 싱글톤 인스턴스 생성
export const supabasePingService = new SupabasePingService();

// 브라우저 환경에서 페이지 언로드 시 핑 중지
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    supabasePingService.stopPing();
  });
}

export default supabasePingService;
