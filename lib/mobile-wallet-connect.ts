// Mobile Wallet Connection System
// 모바일 전용 지갑 연결 시스템

interface MobileWalletConfig {
  enableMobileDeepLinking: boolean;
  enableWalletConnect: boolean;
  enableMetaMaskMobile: boolean;
  fallbackToBrowser: boolean;
}

interface WalletConnectionResult {
  success: boolean;
  walletType: 'metamask' | 'walletconnect' | 'browser' | 'none';
  address?: string;
  error?: string;
}

export class MobileWalletConnect {
  private config: MobileWalletConfig;

  constructor(config?: Partial<MobileWalletConfig>) {
    this.config = {
      enableMobileDeepLinking: true,
      enableWalletConnect: true,
      enableMetaMaskMobile: true,
      fallbackToBrowser: true,
      ...config
    };
  }

  // 모바일 환경 감지
  private isMobile(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // iOS 환경 감지
  private isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  // Android 환경 감지
  private isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  // MetaMask 모바일 앱 설치 여부 확인
  private async checkMetaMaskMobile(): Promise<boolean> {
    try {
      // MetaMask 모바일 앱 설치 확인
      const response = await fetch('metamask://', { method: 'HEAD' });
      return response.status !== 404;
    } catch {
      return false;
    }
  }

  // 모바일 MetaMask 연결
  async connectMetaMaskMobile(): Promise<WalletConnectionResult> {
    try {
      console.log('📱 모바일 MetaMask 연결 시도...');

      // 1. MetaMask 모바일 앱 설치 확인
      const isInstalled = await this.checkMetaMaskMobile();
      
      if (!isInstalled) {
        // MetaMask 모바일 앱 설치 안내
        this.redirectToMetaMaskDownload();
        return {
          success: false,
          walletType: 'none',
          error: 'MetaMask 모바일 앱이 설치되지 않았습니다.'
        };
      }

      // 2. 모바일 전용 연결 시도
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts && accounts.length > 0) {
          console.log('✅ 모바일 MetaMask 연결 성공:', accounts[0]);
          return {
            success: true,
            walletType: 'metamask',
            address: accounts[0]
          };
        }
      }

      // 3. Deep Link를 통한 연결 시도
      if (this.config.enableMobileDeepLinking) {
        return await this.connectViaDeepLink();
      }

      return {
        success: false,
        walletType: 'none',
        error: '모바일 MetaMask 연결에 실패했습니다.'
      };

    } catch (error) {
      console.error('❌ 모바일 MetaMask 연결 오류:', error);
      return {
        success: false,
        walletType: 'none',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Deep Link를 통한 연결
  private async connectViaDeepLink(): Promise<WalletConnectionResult> {
    try {
      const deepLinkUrl = this.buildMetaMaskDeepLink();
      
      // Deep Link 열기
      window.location.href = deepLinkUrl;
      
      // 연결 대기
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            walletType: 'none',
            error: 'Deep Link 연결 시간 초과'
          });
        }, 10000); // 10초 타임아웃

        // 연결 성공 감지
        window.addEventListener('message', (event) => {
          if (event.data.type === 'METAMASK_CONNECTED') {
            clearTimeout(timeout);
            resolve({
              success: true,
              walletType: 'metamask',
              address: event.data.address
            });
          }
        });
      });

    } catch (error) {
      return {
        success: false,
        walletType: 'none',
        error: 'Deep Link 연결 실패'
      };
    }
  }

  // MetaMask Deep Link URL 생성
  private buildMetaMaskDeepLink(): string {
    const currentUrl = window.location.href;
    const returnUrl = encodeURIComponent(currentUrl);
    
    if (this.isIOS()) {
      return `metamask://dapp/${returnUrl}`;
    } else if (this.isAndroid()) {
      return `intent://dapp/${returnUrl}#Intent;scheme=metamask;package=io.metamask;end`;
    } else {
      return `metamask://dapp/${returnUrl}`;
    }
  }

  // MetaMask 다운로드 페이지로 리다이렉트
  private redirectToMetaMaskDownload(): void {
    const downloadUrl = this.isIOS() 
      ? 'https://apps.apple.com/app/metamask/id1438144202'
      : 'https://play.google.com/store/apps/details?id=io.metamask';
    
    window.open(downloadUrl, '_blank');
  }

  // WalletConnect를 통한 연결 (대안)
  async connectViaWalletConnect(): Promise<WalletConnectionResult> {
    try {
      console.log('🔗 WalletConnect 연결 시도...');
      
      // WalletConnect 라이브러리 동적 로드
      const { WalletConnectModal } = await import('@walletconnect/modal');
      
      const modal = new WalletConnectModal({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
        chains: ['bsc'],
        enableExplorer: true,
        explorerRecommendedWalletIds: 'ALL',
        explorerExcludedWalletIds: 'ALL',
        mobileWallets: [
          {
            id: 'metamask',
            name: 'MetaMask',
            links: {
              native: 'metamask://',
              universal: 'https://metamask.app.link'
            }
          }
        ]
      });

      const session = await modal.connect();
      
      if (session) {
        const address = session.accounts[0];
        console.log('✅ WalletConnect 연결 성공:', address);
        return {
          success: true,
          walletType: 'walletconnect',
          address
        };
      }

      return {
        success: false,
        walletType: 'none',
        error: 'WalletConnect 연결 실패'
      };

    } catch (error) {
      console.error('❌ WalletConnect 연결 오류:', error);
      return {
        success: false,
        walletType: 'none',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 브라우저 폴백 연결
  async connectViaBrowser(): Promise<WalletConnectionResult> {
    try {
      console.log('🌐 브라우저 연결 시도...');
      
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts && accounts.length > 0) {
          console.log('✅ 브라우저 연결 성공:', accounts[0]);
          return {
            success: true,
            walletType: 'browser',
            address: accounts[0]
          };
        }
      }

      return {
        success: false,
        walletType: 'none',
        error: '브라우저 지갑 연결 실패'
      };

    } catch (error) {
      console.error('❌ 브라우저 연결 오류:', error);
      return {
        success: false,
        walletType: 'none',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 통합 연결 함수
  async connectWallet(): Promise<WalletConnectionResult> {
    console.log('🔗 모바일 지갑 연결 시작...');

    // 모바일 환경이 아닌 경우 일반 연결
    if (!this.isMobile()) {
      return await this.connectViaBrowser();
    }

    // 1. MetaMask 모바일 시도
    if (this.config.enableMetaMaskMobile) {
      const result = await this.connectMetaMaskMobile();
      if (result.success) {
        return result;
      }
    }

    // 2. WalletConnect 시도
    if (this.config.enableWalletConnect) {
      const result = await this.connectViaWalletConnect();
      if (result.success) {
        return result;
      }
    }

    // 3. 브라우저 폴백
    if (this.config.fallbackToBrowser) {
      return await this.connectViaBrowser();
    }

    return {
      success: false,
      walletType: 'none',
      error: '모든 연결 방법이 실패했습니다.'
    };
  }

  // 연결 상태 확인
  async checkConnectionStatus(): Promise<{
    isConnected: boolean;
    walletType?: string;
    address?: string;
  }> {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts && accounts.length > 0) {
          return {
            isConnected: true,
            walletType: 'metamask',
            address: accounts[0]
          };
        }
      }

      return { isConnected: false };
    } catch (error) {
      console.error('연결 상태 확인 오류:', error);
      return { isConnected: false };
    }
  }

  // 연결 해제
  async disconnectWallet(): Promise<void> {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // MetaMask 연결 해제
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
      }
      
      console.log('✅ 지갑 연결 해제 완료');
    } catch (error) {
      console.error('❌ 지갑 연결 해제 오류:', error);
    }
  }
}

// 전역 인스턴스
let mobileWalletConnect: MobileWalletConnect | null = null;

export const initializeMobileWalletConnect = (config?: Partial<MobileWalletConfig>): MobileWalletConnect => {
  if (!mobileWalletConnect) {
    mobileWalletConnect = new MobileWalletConnect(config);
  }
  return mobileWalletConnect;
};

export const getMobileWalletConnect = (): MobileWalletConnect | null => {
  return mobileWalletConnect;
};

export default MobileWalletConnect;
