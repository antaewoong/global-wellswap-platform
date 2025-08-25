// Enhanced Security System for Production
// 상용 서비스 수준의 보안 시스템

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  rateLimitWindow: number;
  rateLimitMax: number;
}

interface TwoFactorAuth {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  enabled: boolean;
  verified: boolean;
}

interface SessionData {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'login' | 'logout' | '2fa_enabled' | '2fa_disabled' | 'password_change' | 'failed_login' | 'suspicious_activity';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: any;
}

interface RateLimitData {
  key: string;
  count: number;
  resetTime: Date;
}

export class EnhancedSecuritySystem {
  private config: SecurityConfig;
  private sessions: Map<string, SessionData> = new Map();
  private rateLimits: Map<string, RateLimitData> = new Map();
  private loginAttempts: Map<string, { count: number; lockoutUntil: Date }> = new Map();
  private securityEvents: SecurityEvent[] = [];

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      jwtExpiresIn: '24h',
      bcryptRounds: 12,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24시간
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15분
      rateLimitWindow: 60 * 1000, // 1분
      rateLimitMax: 100,
      ...config
    };

    this.initializeSecurity();
  }

  // 보안 시스템 초기화
  private initializeSecurity(): void {
    console.log('🔐 Enhanced Security System 초기화 중...');
    
    // 세션 정리 스케줄러
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // 5분마다

    // Rate limit 정리 스케줄러
    setInterval(() => {
      this.cleanupExpiredRateLimits();
    }, 60 * 1000); // 1분마다

    console.log('✅ Enhanced Security System 초기화 완료');
  }

  // 비밀번호 해싱
  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.config.bcryptRounds);
  }

  // 비밀번호 검증
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // JWT 토큰 생성
  public generateToken(payload: any): string {
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiresIn
    });
  }

  // JWT 토큰 검증
  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // 2FA 설정 생성
  public async setupTwoFactorAuth(userId: string, userEmail: string): Promise<TwoFactorAuth> {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userEmail, 'WellSwap', secret);
    const qrCode = await QRCode.toDataURL(otpauth);
    
    // 백업 코드 생성
    const backupCodes = this.generateBackupCodes();

    const twoFactorAuth: TwoFactorAuth = {
      secret,
      qrCode,
      backupCodes,
      enabled: false,
      verified: false
    };

    this.logSecurityEvent({
      userId,
      eventType: '2fa_enabled',
      ipAddress: 'system',
      userAgent: 'system',
      details: { setup: true }
    });

    return twoFactorAuth;
  }

  // 2FA 토큰 검증
  public verifyTwoFactorToken(secret: string, token: string): boolean {
    return authenticator.verify({ token, secret });
  }

  // 백업 코드 검증
  public verifyBackupCode(backupCodes: string[], code: string): boolean {
    return backupCodes.includes(code);
  }

  // 백업 코드 생성
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // 세션 생성
  public createSession(userId: string, ipAddress: string, userAgent: string): string {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.sessionTimeout);

    const sessionData: SessionData = {
      userId,
      sessionId,
      ipAddress,
      userAgent,
      createdAt: now,
      lastActivity: now,
      expiresAt
    };

    this.sessions.set(sessionId, sessionData);

    this.logSecurityEvent({
      userId,
      eventType: 'login',
      ipAddress,
      userAgent,
      details: { sessionId }
    });

    return sessionId;
  }

  // 세션 검증
  public validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const now = new Date();
    if (now > session.expiresAt) {
      this.sessions.delete(sessionId);
      return false;
    }

    // 마지막 활동 시간 업데이트
    session.lastActivity = now;
    return true;
  }

  // 세션 정보 조회
  public getSessionData(sessionId: string): SessionData | null {
    return this.sessions.get(sessionId) || null;
  }

  // 세션 삭제
  public revokeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.logSecurityEvent({
        userId: session.userId,
        eventType: 'logout',
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        details: { sessionId }
      });
    }
    this.sessions.delete(sessionId);
  }

  // 모든 세션 삭제 (사용자별)
  public revokeAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // 로그인 시도 제한
  public checkLoginAttempts(userId: string): { allowed: boolean; remainingAttempts: number; lockoutUntil?: Date } {
    const attempts = this.loginAttempts.get(userId);
    const now = new Date();

    if (!attempts) {
      return { allowed: true, remainingAttempts: this.config.maxLoginAttempts };
    }

    if (attempts.lockoutUntil && now < attempts.lockoutUntil) {
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        lockoutUntil: attempts.lockoutUntil 
      };
    }

    if (attempts.count >= this.config.maxLoginAttempts) {
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        lockoutUntil: attempts.lockoutUntil 
      };
    }

    return { 
      allowed: true, 
      remainingAttempts: this.config.maxLoginAttempts - attempts.count 
    };
  }

  // 로그인 실패 기록
  public recordFailedLogin(userId: string, ipAddress: string, userAgent: string): void {
    const attempts = this.loginAttempts.get(userId) || { count: 0, lockoutUntil: new Date() };
    attempts.count++;

    if (attempts.count >= this.config.maxLoginAttempts) {
      attempts.lockoutUntil = new Date(Date.now() + this.config.lockoutDuration);
    }

    this.loginAttempts.set(userId, attempts);

    this.logSecurityEvent({
      userId,
      eventType: 'failed_login',
      ipAddress,
      userAgent,
      details: { attemptCount: attempts.count }
    });
  }

  // 로그인 성공 시 카운터 리셋
  public resetLoginAttempts(userId: string): void {
    this.loginAttempts.delete(userId);
  }

  // Rate Limiting
  public checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: Date } {
    const now = new Date();
    const rateLimit = this.rateLimits.get(key);

    if (!rateLimit || now > rateLimit.resetTime) {
      const resetTime = new Date(now.getTime() + this.config.rateLimitWindow);
      this.rateLimits.set(key, { key, count: 1, resetTime });
      return { allowed: true, remaining: this.config.rateLimitMax - 1, resetTime };
    }

    if (rateLimit.count >= this.config.rateLimitMax) {
      return { allowed: false, remaining: 0, resetTime: rateLimit.resetTime };
    }

    rateLimit.count++;
    return { 
      allowed: true, 
      remaining: this.config.rateLimitMax - rateLimit.count, 
      resetTime: rateLimit.resetTime 
    };
  }

  // IP 주소 검증
  public validateIPAddress(ipAddress: string): boolean {
    // 허용된 IP 범위 체크 (필요시)
    const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
    if (allowedIPs.length > 0 && !allowedIPs.includes(ipAddress)) {
      return false;
    }

    // IP 형식 검증
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ipAddress);
  }

  // User Agent 검증
  public validateUserAgent(userAgent: string): boolean {
    // 의심스러운 User Agent 패턴 체크
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // 보안 이벤트 로깅
  public logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: crypto.randomBytes(16).toString('hex'),
      ...event,
      timestamp: new Date()
    };

    this.securityEvents.push(securityEvent);

    // 이벤트가 너무 많아지면 오래된 것들 제거
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-5000);
    }

    // 의심스러운 활동 감지
    this.detectSuspiciousActivity(event);
  }

  // 의심스러운 활동 감지
  private detectSuspiciousActivity(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const recentEvents = this.securityEvents.filter(e => 
      e.userId === event.userId && 
      Date.now() - e.timestamp.getTime() < 5 * 60 * 1000 // 5분 내
    );

    // 짧은 시간 내 많은 로그인 실패
    const failedLogins = recentEvents.filter(e => e.eventType === 'failed_login');
    if (failedLogins.length >= 3) {
      this.logSecurityEvent({
        userId: event.userId,
        eventType: 'suspicious_activity',
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: { 
          type: 'multiple_failed_logins',
          count: failedLogins.length 
        }
      });
    }

    // 여러 IP에서 동시 로그인
    const uniqueIPs = new Set(recentEvents.map(e => e.ipAddress));
    if (uniqueIPs.size >= 3) {
      this.logSecurityEvent({
        userId: event.userId,
        eventType: 'suspicious_activity',
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: { 
          type: 'multiple_ip_logins',
          ips: Array.from(uniqueIPs) 
        }
      });
    }
  }

  // 보안 이벤트 조회
  public getSecurityEvents(filters?: {
    userId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let events = [...this.securityEvents];

    if (filters?.userId) {
      events = events.filter(e => e.userId === filters.userId);
    }

    if (filters?.eventType) {
      events = events.filter(e => e.eventType === filters.eventType);
    }

    if (filters?.startDate) {
      events = events.filter(e => e.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      events = events.filter(e => e.timestamp <= filters.endDate!);
    }

    if (filters?.limit) {
      events = events.slice(-filters.limit);
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // 세션 정리 (만료된 세션 제거)
  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Rate Limit 정리 (만료된 제한 제거)
  private cleanupExpiredRateLimits(): void {
    const now = new Date();
    for (const [key, rateLimit] of this.rateLimits.entries()) {
      if (now > rateLimit.resetTime) {
        this.rateLimits.delete(key);
      }
    }
  }

  // 보안 통계 생성
  public generateSecurityReport(): any {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentEvents = this.securityEvents.filter(e => e.timestamp >= last24Hours);
    const weeklyEvents = this.securityEvents.filter(e => e.timestamp >= lastWeek);

    return {
      activeSessions: this.sessions.size,
      activeRateLimits: this.rateLimits.size,
      lockedAccounts: Array.from(this.loginAttempts.values()).filter(a => 
        a.lockoutUntil && now < a.lockoutUntil
      ).length,
      eventsLast24Hours: recentEvents.length,
      eventsLastWeek: weeklyEvents.length,
      failedLogins24h: recentEvents.filter(e => e.eventType === 'failed_login').length,
      suspiciousActivities24h: recentEvents.filter(e => e.eventType === 'suspicious_activity').length,
      topEventTypes: this.getTopEventTypes(recentEvents),
      topIPs: this.getTopIPs(recentEvents)
    };
  }

  // 이벤트 타입별 통계
  private getTopEventTypes(events: SecurityEvent[]): any[] {
    const counts: { [key: string]: number } = {};
    events.forEach(e => {
      counts[e.eventType] = (counts[e.eventType] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // IP별 통계
  private getTopIPs(events: SecurityEvent[]): any[] {
    const counts: { [key: string]: number } = {};
    events.forEach(e => {
      counts[e.ipAddress] = (counts[e.ipAddress] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // 시스템 상태 확인
  public getSystemStatus(): any {
    return {
      sessions: {
        total: this.sessions.size,
        active: Array.from(this.sessions.values()).filter(s => 
          new Date() <= s.expiresAt
        ).length
      },
      rateLimits: {
        total: this.rateLimits.size,
        active: Array.from(this.rateLimits.values()).filter(r => 
          new Date() <= r.resetTime
        ).length
      },
      loginAttempts: {
        total: this.loginAttempts.size,
        locked: Array.from(this.loginAttempts.values()).filter(a => 
          a.lockoutUntil && new Date() < a.lockoutUntil
        ).length
      },
      securityEvents: {
        total: this.securityEvents.length,
        last24h: this.securityEvents.filter(e => 
          Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000
        ).length
      }
    };
  }
}

// 전역 보안 시스템 인스턴스
let enhancedSecuritySystem: EnhancedSecuritySystem | null = null;

export const initializeEnhancedSecurity = (config?: Partial<SecurityConfig>): EnhancedSecuritySystem => {
  if (!enhancedSecuritySystem) {
    enhancedSecuritySystem = new EnhancedSecuritySystem(config);
  }
  return enhancedSecuritySystem;
};

export const getEnhancedSecurity = (): EnhancedSecuritySystem | null => {
  return enhancedSecuritySystem;
};

export default EnhancedSecuritySystem;
