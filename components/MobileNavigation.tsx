'use client';

import React from 'react';
import { 
  Home, 
  TrendingUp, 
  MessageSquare, 
  User, 
  Menu,
  X,
  Wallet,
  Settings
} from 'lucide-react';

interface MobileNavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isAuthenticated: boolean;
  isWeb3Connected: boolean;
  onConnectWallet: () => void;
  onToggleMenu: () => void;
  isMenuOpen: boolean;
}

export default function MobileNavigation({
  currentPage,
  setCurrentPage,
  isAuthenticated,
  isWeb3Connected,
  onConnectWallet,
  onToggleMenu,
  isMenuOpen
}: MobileNavigationProps) {
  const navigationItems = [
    {
      id: 'home',
      label: '홈',
      icon: Home,
      page: 'home'
    },
    {
      id: 'sell',
      label: '매도',
      icon: TrendingUp,
      page: 'sell'
    },
    {
      id: 'buy',
      label: '매수',
      icon: TrendingUp,
      page: 'buy'
    },
    {
      id: 'inquiry',
      label: '문의',
      icon: MessageSquare,
      page: 'inquiry'
    }
  ];

  return (
    <>
      {/* 모바일 하단 네비게이션 */}
      <nav className="mobile-nav safe-area-bottom">
        <div className="flex justify-around items-center">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.page)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* 지갑 연결 버튼 */}
          <button
            onClick={onConnectWallet}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
              isWeb3Connected
                ? 'text-green-600 bg-green-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Wallet className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">
              {isWeb3Connected ? '연결됨' : '지갑'}
            </span>
          </button>
        </div>
      </nav>

      {/* 모바일 상단 헤더 */}
      <header className="mobile-header safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-gray-900">WellSwap</h1>
            {isWeb3Connected && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">연결됨</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 알림 버튼 */}
            <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg">
              <div className="relative">
                <MessageSquare className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
            </button>
            
            {/* 메뉴 버튼 */}
            <button
              onClick={onToggleMenu}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-lg"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 사이드 메뉴 */}
      {isMenuOpen && (
        <div className="mobile-modal">
          <div className="mobile-modal-content">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
                <button
                  onClick={onToggleMenu}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {/* 사용자 정보 */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isAuthenticated ? '사용자' : '게스트'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isWeb3Connected ? '지갑 연결됨' : '지갑 미연결'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 메뉴 항목들 */}
                <button
                  onClick={() => {
                    setCurrentPage('home');
                    onToggleMenu();
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Home className="h-5 w-5" />
                  <span>홈</span>
                </button>
                
                <button
                  onClick={() => {
                    setCurrentPage('sell');
                    onToggleMenu();
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>매도 등록</span>
                </button>
                
                <button
                  onClick={() => {
                    setCurrentPage('buy');
                    onToggleMenu();
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>매수 구매</span>
                </button>
                
                <button
                  onClick={() => {
                    setCurrentPage('inquiry');
                    onToggleMenu();
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>컨시어지 문의</span>
                </button>
                
                <hr className="my-2" />
                
                <button
                  onClick={onConnectWallet}
                  className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Wallet className="h-5 w-5" />
                  <span>
                    {isWeb3Connected ? '지갑 연결 해제' : '지갑 연결'}
                  </span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Settings className="h-5 w-5" />
                  <span>설정</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
