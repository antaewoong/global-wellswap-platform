// WellSwap Global Platform - 실제 거래 시스템 연동 완료
'use client';

// 🔗 실제 블록체인 연동
import { ethers } from 'ethers';

// 🗄️ 실제 데이터베이스 연동  
import { createClient } from '@supabase/supabase-js';

// 🎨 UI 컴포넌트
import { Camera, Upload, User, Menu, X, Wallet, ArrowRight, Globe, MessageSquare, BarChart3, TrendingUp, Shield, CheckCircle2, AlertCircle, Clock, DollarSign } from 'lucide-react';

import React, { useState, useEffect, useRef } from 'react';

// 🔧 Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wellswaphk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const WellSwapGlobalPlatform = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [language, setLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{email: string, role: string} | null>(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // 🔐 관리자 지갑 주소 설정 (귀하의 실제 지갑 주소로 변경하세요)
  const ADMIN_WALLETS = [
    '0x02756b93394d0bD27aE81C1E5a6e1d55D0B608FE', // 메인 관리자 지갑
    // 추가 관리자가 있다면 여기에 추가
  ];

  // 🎯 권한 확인 함수
  const isAdmin = (walletAddress) => {
    if (!walletAddress) return false;
    return ADMIN_WALLETS.includes(walletAddress.toLowerCase());
  };

  // Language Pack
  const translations = {
    en: {
      // Navigation
      platform: 'Global Insurance Transfer Platform',
      sell: 'Sell Insurance',
      buy: 'Buy Insurance',
      inquiry: 'Concierge',
      login: 'Sign In',
      signup: 'Sign Up',
      logout: 'Sign Out',
      wallet: 'Connect Wallet',
      
      // Main Content
      mainTitle: 'WELLSWAP',
      mainSubtitle: 'Transfer Insurance Assets Globally',
      description: 'AI-powered insurance asset trading platform for Hong Kong, Singapore, and international markets',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      
      // Statistics
      statVolume: 'Trading Volume',
      statUsers: 'Active Users',
      statSuccess: 'Success Rate',
      
      // Features
      aiValuation: 'AI Valuation',
      aiValuationDesc: 'Advanced mathematical models with actuarial science',
      globalMarket: 'Global Market',
      globalMarketDesc: 'Hong Kong, Singapore, UK, US markets',
      secureTrading: 'Secure Trading',
      secureTradingDesc: 'Blockchain-based multi-signature contracts',
      
      // Forms
      insuranceCompany: 'Insurance Company',
      productCategory: 'Product Category',
      productName: 'Product Name',
      contractDate: 'Contract Date',
      contractPeriod: 'Contract Period',
      paidPeriod: 'Paid Period',
      annualPremium: 'Annual Premium (USD)',
      totalPaid: 'Total Paid (USD)',
      customPeriod: 'Custom Period (Years)',
      
      // Buttons
      submitSell: 'Submit for Sale',
      submitBuy: 'Purchase',
      inquireNow: '1:1 Inquiry',
      
      // Messages
      aiEvaluating: 'AI Evaluating...',
      processing: 'Processing...',
      successListed: 'Successfully Listed!',
      
      // Placeholders
      selectCompany: 'Select Insurance Company',
      selectCategory: 'Select Product Category',
      enterProductName: 'Enter exact product name',
      selectPeriod: 'Select contract period',
      selectPaidPeriod: 'Select paid period',
      
      // Product Categories
      savingsPlan: 'Savings Plan',
      pensionPlan: 'Pension Plan',
      investmentLinked: 'Investment Linked',
      wholeLife: 'Whole Life',
      endowmentPlan: 'Endowment Plan',
      annuity: 'Annuity',
      medicalInsurance: 'Medical Insurance',
      termLife: 'Term Life',
      
      // Contract Periods
      period2: '2 Years',
      period3: '3 Years',
      period5: '5 Years',
      period10: '10 Years',
      period15: '15 Years',
      period20: '20 Years',
      period25: '25 Years',
      period30: '30 Years',
      customInput: 'Custom Input',
      
      // Status
      available: 'Available',
      pending: 'Processing',
      sold: 'Sold',
      
      // Valuation Results
      surrenderValue: 'Surrender Value',
      transferValue: 'Transfer Value',
      platformPrice: 'Platform Price',
      confidence: 'AI Confidence',
      riskGrade: 'Risk Grade'
    },
    ko: {
      // Navigation
      platform: '글로벌 보험 양도 플랫폼',
      sell: '보험 판매',
      buy: '보험 구매',
      inquiry: '컨시어지',
      login: '로그인',
      signup: '회원가입',
      logout: '로그아웃',
      wallet: '지갑 연결',
      
      // Main Content
      mainTitle: '웰스왑',
      mainSubtitle: '글로벌 보험 자산 거래',
      description: '홍콩, 싱가포르 및 국제 시장을 위한 AI 기반 보험 자산 거래 플랫폼',
      getStarted: '시작하기',
      learnMore: '자세히 보기',
      
      // Statistics
      statVolume: '거래량',
      statUsers: '활성 사용자',
      statSuccess: '성공률',
      
      // Features
      aiValuation: 'AI 가치평가',
      aiValuationDesc: '보험계리학 기반 고급 수학 모델',
      globalMarket: '글로벌 마켓',
      globalMarketDesc: '홍콩, 싱가포르, 영국, 미국 시장',
      secureTrading: '안전한 거래',
      secureTradingDesc: '블록체인 기반 다중서명 계약',
      
      // Forms
      insuranceCompany: '보험사',
      productCategory: '상품 카테고리',
      productName: '상품명',
      contractDate: '계약일',
      contractPeriod: '계약 기간',
      paidPeriod: '납입 기간',
      annualPremium: '연간 보험료 (USD)',
      totalPaid: '총 납입액 (USD)',
      customPeriod: '직접 입력 (년)',
      
      // Buttons
      submitSell: '판매 신청',
      submitBuy: '구매하기',
      inquireNow: '1:1 문의',
      
      // Messages
      aiEvaluating: 'AI 평가 중...',
      processing: '처리 중...',
      successListed: '등록 완료!',
      
      // Placeholders
      selectCompany: '보험사를 선택하세요',
      selectCategory: '상품 카테고리를 선택하세요',
      enterProductName: '정확한 상품명을 입력하세요',
      selectPeriod: '계약 기간을 선택하세요',
      selectPaidPeriod: '납입 기간을 선택하세요',
      
      // Product Categories
      savingsPlan: '저축형 보험',
      pensionPlan: '연금보험',
      investmentLinked: '투자연계보험',
      wholeLife: '종신보험',
      endowmentPlan: '양로보험',
      annuity: '연금',
      medicalInsurance: '의료보험',
      termLife: '정기보험',
      
      // Contract Periods
      period2: '2년',
      period3: '3년',
      period5: '5년',
      period10: '10년',
      period15: '15년',
      period20: '20년',
      period25: '25년',
      period30: '30년',
      customInput: '직접 입력',
      
      // Status
      available: '판매중',
      pending: '거래진행중',
      sold: '판매완료',
      
      // Valuation Results
      surrenderValue: '해지환급금',
      transferValue: '양도 예상가',
      platformPrice: '플랫폼 판매가',
      confidence: 'AI 신뢰도',
      riskGrade: '위험등급'
    },
    zh: {
      // Navigation
      platform: '全球保险转让平台',
      sell: '出售保险',
      buy: '购买保险',
      inquiry: '管家服务',
      login: '登录',
      signup: '注册',
      logout: '登出',
      wallet: '连接钱包',
      
      // Main Content
      mainTitle: '韦尔斯云换',
      mainSubtitle: '全球保险资产交易',
      description: '面向香港、新加坡和国际市场的AI驱动保险资产交易平台',
      getStarted: '开始使用',
      learnMore: '了解更多',
      
      // Statistics
      statVolume: '交易量',
      statUsers: '活跃用户',
      statSuccess: '成功率',
      
      // Features
      aiValuation: 'AI估值',
      aiValuationDesc: '基于精算科学的高级数学模型',
      globalMarket: '全球市场',
      globalMarketDesc: '香港、新加坡、英国、美国市场',
      secureTrading: '安全交易',
      secureTradingDesc: '基于区块链的多重签名合约',
      
      // Forms
      insuranceCompany: '保险公司',
      productCategory: '产品类别',
      productName: '产品名称',
      contractDate: '合同日期',
      contractPeriod: '合同期限',
      paidPeriod: '缴费期限',
      annualPremium: '年保费 (USD)',
      totalPaid: '总缴费 (USD)',
      customPeriod: '自定义期限 (年)',
      
      // Buttons
      submitSell: '提交出售',
      submitBuy: '购买',
      inquireNow: '一对一咨询',
      
      // Messages
      aiEvaluating: 'AI评估中...',
      processing: '处理中...',
      successListed: '成功上架!',
      
      // Placeholders
      selectCompany: '选择保险公司',
      selectCategory: '选择产品类别',
      enterProductName: '输入确切的产品名称',
      selectPeriod: '选择合同期限',
      selectPaidPeriod: '选择缴费期限',
      
      // Product Categories
      savingsPlan: '储蓄计划',
      pensionPlan: '养老金计划',
      investmentLinked: '投资连结',
      wholeLife: '终身寿险',
      endowmentPlan: '养老保险',
      annuity: '年金',
      medicalInsurance: '医疗保险',
      termLife: '定期寿险',
      
      // Contract Periods
      period2: '2年',
      period3: '3年',
      period5: '5年',
      period10: '10年',
      period15: '15年',
      period20: '20年',
      period25: '25年',
      period30: '30年',
      customInput: '自定义输入',
      
      // Status
      available: '可售',
      pending: '交易中',
      sold: '已售',
      
      // Valuation Results
      surrenderValue: '退保价值',
      transferValue: '转让价值',
      platformPrice: '平台价格',
      confidence: 'AI置信度',
      riskGrade: '风险等级'
    },
    ja: {
      // Navigation
      platform: 'グローバル保険譲渡プラットフォーム',
      sell: '保険販売',
      buy: '保険購入',
      inquiry: 'コンシェルジュ',
      login: 'ログイン',
      signup: '新規登録',
      logout: 'ログアウト',
      wallet: 'ウォレット接続',
      
      // Main Content
      mainTitle: 'ウェルスワップ',
      mainSubtitle: 'グローバル保険資産取引',
      description: '香港、シンガポール、国際市場向けのAI駆動保険資産取引プラットフォーム',
      getStarted: '始める',
      learnMore: '詳細を見る',
      
      // Statistics
      statVolume: '取引量',
      statUsers: 'アクティブユーザー',
      statSuccess: '成功率',
      
      // Features
      aiValuation: 'AI評価',
      aiValuationDesc: '保険数理学ベースの高度数学モデル',
      globalMarket: 'グローバルマーケット',
      globalMarketDesc: '香港、シンガポール、英国、米国市場',
      secureTrading: '安全な取引',
      secureTradingDesc: 'ブロックチェーンベースのマルチシグ契約',
      
      // Forms
      insuranceCompany: '保険会社',
      productCategory: '商品カテゴリー',
      productName: '商品名',
      contractDate: '契約日',
      contractPeriod: '契約期間',
      paidPeriod: '払込期間',
      annualPremium: '年間保険料 (USD)',
      totalPaid: '総払込額 (USD)',
      customPeriod: 'カスタム期間 (年)',
      
      // Buttons
      submitSell: '売却申請',
      submitBuy: '購入',
      inquireNow: '1対1お問い合わせ',
      
      // Messages
      aiEvaluating: 'AI評価中...',
      processing: '処理中...',
      successListed: '登録完了！',
      
      // Placeholders
      selectCompany: '保険会社を選択',
      selectCategory: '商品カテゴリーを選択',
      enterProductName: '正確な商品名を入力',
      selectPeriod: '契約期間を選択',
      selectPaidPeriod: '払込期間を選択',
      
      // Product Categories
      savingsPlan: '貯蓄プラン',
      pensionPlan: '年金プラン',
      investmentLinked: '投資連動型',
      wholeLife: '終身保険',
      endowmentPlan: '養老保険',
      annuity: '年金',
      medicalInsurance: '医療保険',
      termLife: '定期保険',
      
      // Contract Periods
      period2: '2年',
      period3: '3年',
      period5: '5年',
      period10: '10年',
      period15: '15年',
      period20: '20年',
      period25: '25年',
      period30: '30年',
      customInput: 'カスタム入力',
      
      // Status
      available: '販売中',
      pending: '取引中',
      sold: '売却済',
      
      // Valuation Results
      surrenderValue: '解約返戻金',
      transferValue: '譲渡価値',
      platformPrice: 'プラットフォーム価格',
      confidence: 'AI信頼度',
      riskGrade: 'リスク等級'
    }
  };

  // 현재 언어에 맞는 번역 객체 가져오기
  const t = translations[language];

  // Global Insurance Companies (Top 30 in Hong Kong market)
  const globalInsurers = [
    'AIA Group Limited', 'Prudential plc', 'Manulife Financial', 'Sun Life Financial',
    'Great Eastern Holdings', 'FWD Group', 'Zurich Insurance Group', 'AXA',
    'Generali', 'Allianz', 'MetLife', 'New York Life', 'Pacific Century Group',
    'BOC Life', 'China Life Insurance', 'CNOOC', 'CMB Wing Lung Bank',
    'Standard Chartered', 'HSBC Life', 'Hang Seng Bank', 'Bank of East Asia',
    'DBS Bank', 'OCBC Bank', 'UOB', 'Citibank', 'BNP Paribas',
    'Societe Generale', 'Credit Suisse', 'UBS', 'Morgan Stanley'
  ];

  const productCategories = [
    'Savings Plan', 'Pension Plan', 'Investment Linked', 'Whole Life',
    'Endowment Plan', 'Annuity', 'Medical Insurance', 'Term Life'
  ];

  const contractPeriods = [
    t.period2, t.period3, t.period5, t.period10, t.period15, 
    t.period20, t.period25, t.period30, t.customInput
  ];

  // State Management
  const [insuranceData, setInsuranceData] = useState({
    company: '',
    productCategory: '',
    productName: '',
    startDate: '',
    contractPeriod: '',
    actualPaymentPeriod: '',
    annualPayment: '',
    totalPayment: '',
    customContractPeriod: ''
  });

  const [listingData, setListingData] = useState([
    {
      id: 1,
      company: 'AIA Group Limited',
      productName: 'Premier Flexi Plan',
      category: t.savingsPlan,
      surrenderValue: 45000,
      transferValue: 52000,
      platformPrice: 50400,
      confidence: 0.89,
      riskGrade: 'A',
      contractPeriod: '10 Years',
      paidPeriod: '5 Years',
      annualPayment: 8000,
      status: 'available',
      seller: '0x1234...5678',
      listingDate: '2025-08-10'
    },
    {
      id: 2,
      company: 'Prudential plc',
      productName: 'PruLink Global Fund',
      category: t.investmentLinked,
      surrenderValue: 62000,
      transferValue: 71000,
      platformPrice: 68870,
      confidence: 0.92,
      riskGrade: 'A',
      contractPeriod: '15 Years',
      paidPeriod: '7 Years',
      annualPayment: 9500,
      status: 'available',
      seller: '0x9876...4321',
      listingDate: '2025-08-12'
    }
  ]);

  // Wallet Connection
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        setConnectedAccount(walletAddress);
        
        // 🔐 권한에 따른 화면 라우팅
        if (isAdmin(walletAddress)) {
          alert(`관리자로 로그인되었습니다: ${walletAddress}`);
          setCurrentPage('admin'); // 관리자는 admin 페이지로
        } else {
          alert(`일반 사용자로 로그인되었습니다: ${walletAddress}`);
          setCurrentPage('sell'); // 일반 사용자는 매도/매수 페이지로
        }
      } catch (error) {
        alert('지갑 연결에 실패했습니다.');
      }
    } else {
      alert('MetaMask가 설치되어 있지 않습니다.');
    }
  };

  // Authentication
  const handleLogin = () => {
    const email = prompt('Email:');
    const password = prompt('Password:');
    
    if (email === 'admin@wellswap.com' && password === 'password') {
      setUser({ email, role: 'admin' });
      alert('Admin logged in successfully');
    } else if (email && password) {
      setUser({ email, role: 'user' });
      alert('User logged in successfully');
    }
  };

  const handleSignup = () => {
    const email = prompt('Email:');
    const password = prompt('Password:');
    
    if (email && password) {
      setUser({ email, role: 'user' });
      alert('Account created successfully');
    }
  };

  // 📊 실제 AI 가치평가 + 이행률 조정 함수
  const performAdvancedAIValuation = async (data) => {
    setIsLoading(true);
    
    try {
      console.log('🤖 AI 가치평가 시작...');
      
      // 1. 📡 실제 이행률 데이터 조회 (Render 서버)
      console.log('📊 이행률 데이터 조회 중...');
      let fulfillmentWeights;
      try {
        const fulfillmentResponse = await fetch(`https://wellswaphk.onrender.com/api/fulfillment-ratio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: data.company || '알 수 없음',
            productCategory: data.productCategory || 'Life Insurance',
            paidPeriod: parseInt(data.actualPaymentPeriod) || 5
          })
        });

        if (fulfillmentResponse.ok) {
          fulfillmentWeights = await fulfillmentResponse.json();
          console.log('✅ 이행률 데이터 조회 성공:', fulfillmentWeights);
        } else {
          throw new Error('이행률 API 호출 실패');
        }
      } catch (fulfillmentError) {
        console.log('⚠️ 이행률 데이터 조회 실패, 기본값 사용');
        fulfillmentWeights = {
          adjustmentFactor: 1.0,
          reliabilityScore: 0.75,
          recommendation: 'standard',
          details: { source: 'default', dataAvailable: false }
        };
      }

      // 2. 🤖 실제 AI 가치평가 (Render AI 서버)
      let aiResult;
      try {
        const aiResponse = await fetch(`https://wellswaphk.onrender.com/api/insurance/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            insurance_type: data.productCategory?.toLowerCase() || 'savings',
            premium: parseFloat(data.annualPayment) || 0,
            duration: parseInt(data.contractPeriod) || 10,
            current_value: parseFloat(data.totalPayment) || 0,
            company: data.company || '',
            paid_years: parseInt(data.actualPaymentPeriod) || 0
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiResult = {
            surrenderValue: Math.round(aiData.surrender_value || 0),
            transferValue: Math.round(aiData.market_value || 0),
            platformPrice: Math.round(aiData.recommended_price || 0),
            confidence: aiData.confidence_score || 0.85,
            riskGrade: aiData.risk_grade || 'B',
            method: 'ai_server'
          };
          console.log('✅ AI 서버 평가 성공:', aiResult);
        } else {
          throw new Error('AI API 호출 실패');
        }
      } catch (aiError) {
        console.log('⚠️ AI 서버 연결 실패, 수학적 모델 사용');
        
        // 3. 📈 Fallback 수학적 모델
        const baseValue = parseFloat(data.totalPayment) || 0;
        const years = parseInt(data.actualPaymentPeriod) || 1;
        const contractYears = parseInt(data.contractPeriod) || 10;
        
        // 홍콩 7년 회수 모델 + 복리 계산
        let surrenderRate;
        if (years <= 2) surrenderRate = 0.15;
        else if (years <= 5) surrenderRate = 0.40 + (years - 2) * 0.15;
        else if (years <= 7) surrenderRate = 0.85 + (years - 5) * 0.075;
        else surrenderRate = 1.0 + (years - 7) * 0.055;
        
        aiResult = {
          surrenderValue: Math.round(baseValue * surrenderRate),
          transferValue: Math.round(baseValue * surrenderRate * 1.18),
          platformPrice: Math.round(baseValue * surrenderRate * 1.18 * 0.97),
          confidence: 0.78,
          riskGrade: 'B',
          method: 'mathematical_fallback'
        };
      }

      // 4. 📊 이행률 기반 최종 조정
      const finalResult = {
        ...aiResult,
        originalSurrenderValue: aiResult.surrenderValue,
        originalTransferValue: aiResult.transferValue,
        originalPlatformPrice: aiResult.platformPrice,
        
        surrenderValue: Math.round(aiResult.surrenderValue * fulfillmentWeights.adjustmentFactor),
        transferValue: Math.round(aiResult.transferValue * fulfillmentWeights.adjustmentFactor),
        platformPrice: Math.round(aiResult.platformPrice * fulfillmentWeights.adjustmentFactor),
        
        confidence: Math.min(0.99, aiResult.confidence + (fulfillmentWeights.reliabilityScore * 0.1)),
        
        // 📈 이행률 조정 정보
        fulfillmentAdjustment: {
          factor: fulfillmentWeights.adjustmentFactor,
          adjustment: Math.round((aiResult.platformPrice * fulfillmentWeights.adjustmentFactor) - aiResult.platformPrice),
          adjustmentPercent: ((fulfillmentWeights.adjustmentFactor - 1) * 100).toFixed(1),
          recommendation: fulfillmentWeights.recommendation,
          reliabilityScore: fulfillmentWeights.reliabilityScore,
          dataSource: fulfillmentWeights.details?.source || 'default',
          lastUpdate: fulfillmentWeights.details?.lastUpdate || new Date().toISOString(),
          dataAvailable: fulfillmentWeights.details?.dataAvailable || false
        },
        
        // 📋 상세 분석 정보
        analysis: {
          marketPosition: fulfillmentWeights.recommendation === 'premium' ? '프리미엄' :
                         fulfillmentWeights.recommendation === 'recommended' ? '추천' :
                         fulfillmentWeights.recommendation === 'standard' ? '표준' :
                         fulfillmentWeights.recommendation === 'caution' ? '주의' : '비추천',
          
          riskLevel: fulfillmentWeights.adjustmentFactor >= 1.1 ? '낮음' :
                     fulfillmentWeights.adjustmentFactor >= 1.0 ? '보통' :
                     fulfillmentWeights.adjustmentFactor >= 0.9 ? '높음' : '매우 높음',
                     
          recommendedAction: fulfillmentWeights.recommendation === 'premium' ? '즉시 구매 권장' :
                            fulfillmentWeights.recommendation === 'recommended' ? '구매 고려' :
                            fulfillmentWeights.recommendation === 'standard' ? '신중한 검토 필요' :
                            fulfillmentWeights.recommendation === 'caution' ? '추가 조사 권장' : '구매 비추천'
        }
      };

      console.log('✅ AI 가치평가 완료 (이행률 포함):', finalResult);
      return finalResult;

    } catch (error) {
      console.error('❌ AI 가치평가 오류:', error);
      throw new Error('Valuation system temporarily unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate payment period options
  const calculatePaymentOptions = (contractPeriod) => {
    if (!contractPeriod || contractPeriod === t.customInput) return [];
    const period = parseInt(contractPeriod);
    const options = [];
    for (let i = 1; i <= period; i++) {
      options.push(`${i} ${i === 1 ? 'Year' : 'Years'}`);
    }
    return options;
  };

  // Sell Insurance Handler - 실제 블록체인 연동
  const handleSellSubmit = async () => {
    // 1. 필수 입력값 검증
    if (!insuranceData.company || !insuranceData.productName || !insuranceData.totalPayment) {
      alert('Please fill in all required fields.');
      return;
    }

    // 2. 지갑 연결 확인
    if (!connectedAccount) {
      alert('Please connect your wallet first to list insurance on blockchain.');
      return;
    }

    try {
      setIsLoading(true);

      // 3. AI 평가 수행 (신뢰도 포함)
      console.log('🤖 AI 평가 시작...');
      const aiResult = await performAdvancedAIValuation(insuranceData);
      
      // 4. 블록체인 거래 준비
      console.log('🔗 블록체인 거래 준비 중...');
      
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // 5. 컨트랙트 연결
        const contract = new ethers.Contract(
          "0x58228104D72Aa48F1761804a090be24c01523972", // WellSwap 컨트랙트 주소
          [
            "function payRegistrationFee(uint8 userType) external payable",
            "function registerInsuranceAsset(string memory assetDetails, uint256 evaluationScore) external",
            "function updateAIEvaluation(uint256 assetId, uint256 newScore, string memory details) external"
          ],
          signer
        );

        // 6. BNB/USD 변환 (300 USD)
        const bnbPrice = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT')
          .then(res => res.json())
          .then(data => parseFloat(data.price))
          .catch(() => 300); // fallback BNB price

        const registrationFeeUSD = 300;
        const registrationFeeBNB = registrationFeeUSD / bnbPrice;
        const registrationFeeWei = ethers.utils.parseEther(registrationFeeBNB.toFixed(6));

        // 7. 사용자 확인
        const resultMessage = `
Advanced AI Valuation Complete!

Valuation Results:
- Original Value: $${aiResult.originalPlatformPrice?.toLocaleString() || aiResult.platformPrice.toLocaleString()}
- Reliability Adjustment: ${aiResult.fulfillmentAdjustment?.adjustmentPercent || '0.0'}%
- Final Platform Price: $${aiResult.platformPrice.toLocaleString()}
- AI Confidence: ${(aiResult.confidence * 100).toFixed(1)}%
- Risk Grade: ${aiResult.riskGrade}

${aiResult.fulfillmentAdjustment ? 
  `Reliability Analysis:
- Insurance Company: ${Math.round(aiResult.fulfillmentAdjustment.reliabilityScore * 100)}/100
- Data Source: ${aiResult.fulfillmentAdjustment.dataAvailable ? 'HK Regulator Crawling' : 'Default Rating'}
- Recommendation: ${aiResult.fulfillmentAdjustment.recommendation.toUpperCase()}` : 
  'Using standard evaluation'}

Blockchain Transaction:
- Registration Fee: ${registrationFeeUSD} USD (${registrationFeeBNB.toFixed(4)} BNB)
- Network: BSC Testnet
- Contract: 0x5822...3972

Proceed with blockchain listing?
        `;
        
        const confirmed = confirm(resultMessage);
        
        if (confirmed) {
          console.log('🔗 블록체인 트랜잭션 실행 중...');
          
          // 8. 블록체인 등록 수수료 지불
          const registrationTx = await contract.payRegistrationFee(1, { // 1 = seller
            value: registrationFeeWei,
            gasLimit: 300000
          });
          
          console.log('⏳ 등록 수수료 트랜잭션 대기 중...', registrationTx.hash);
          await registrationTx.wait();
          
          // 9. 보험 자산 정보를 블록체인에 등록
          const assetDetails = JSON.stringify({
            company: insuranceData.company,
            productName: insuranceData.productName,
            category: insuranceData.productCategory,
            contractPeriod: insuranceData.contractPeriod,
            paidPeriod: insuranceData.actualPaymentPeriod,
            totalPayment: insuranceData.totalPayment,
            aiEvaluation: aiResult,
            timestamp: new Date().toISOString(),
            seller: connectedAccount
          });

          const assetTx = await contract.registerInsuranceAsset(
            assetDetails,
            Math.round(aiResult.confidence * 100) // 점수를 정수로 변환
          );
          
          console.log('⏳ 자산 등록 트랜잭션 대기 중...', assetTx.hash);
          await assetTx.wait();

          // 10. 성공 시 로컬 리스트에 추가
          const newListing = {
            id: Date.now(),
            company: insuranceData.company,
            productName: insuranceData.productName,
            category: insuranceData.productCategory,
            surrenderValue: aiResult.surrenderValue,
            transferValue: aiResult.transferValue,
            platformPrice: aiResult.platformPrice,
            confidence: aiResult.confidence,
            riskGrade: aiResult.riskGrade,
            contractPeriod: insuranceData.contractPeriod === t.customInput 
              ? `${insuranceData.customContractPeriod} Years`
              : insuranceData.contractPeriod,
            paidPeriod: insuranceData.actualPaymentPeriod,
            annualPayment: parseFloat(insuranceData.annualPayment),
            status: 'available',
            seller: connectedAccount,
            listingDate: new Date().toISOString().split('T')[0],
            aiMethod: aiResult.method || 'advanced_ai',
            blockchainTxHash: assetTx.hash,
            fulfillmentAdjustment: aiResult.fulfillmentAdjustment
          };

          setListingData(prev => [newListing, ...prev]);
          
          alert(`✅ Insurance successfully listed on blockchain!
          
🔗 Transaction Hash: ${assetTx.hash}
📊 Platform Price: $${aiResult.platformPrice.toLocaleString()}
🛡️ Reliability Grade: ${aiResult.fulfillmentAdjustment?.reliabilityScore ? Math.round(aiResult.fulfillmentAdjustment.reliabilityScore * 100) : 'N/A'}

Your insurance is now available for global trading!`);
          
          // 11. 폼 리셋
          setInsuranceData({
            company: '',
            productCategory: '',
            productName: '',
            startDate: '',
            contractPeriod: '',
            actualPaymentPeriod: '',
            annualPayment: '',
            totalPayment: '',
            customContractPeriod: ''
          });
        }
      } else {
        alert('MetaMask not detected. Please install MetaMask to proceed with blockchain transactions.');
      }
      
    } catch (error) {
      console.error('블록체인 거래 오류:', error);
      
      if (error.code === 4001) {
        alert('Transaction cancelled by user.');
      } else if (error.code === -32603) {
        alert('Insufficient BNB balance for transaction. Please add BNB to your wallet.');
      } else {
        alert(`Blockchain transaction failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 📄 실제 구매 처리 함수
  const handlePurchase = async (listing) => {
    if (!connectedAccount) {
      alert('지갑을 먼저 연결해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. 실제 BNB/USD 환율 조회
      console.log('💰 BNB 가격 조회 중...');
      const bnbPrice = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT')
        .then(res => res.json())
        .then(data => parseFloat(data.price))
        .catch(() => 300); // fallback 가격

      // 2. 구매 금액을 BNB로 변환
      const purchasePriceUSD = listing.platformPrice;
      const purchasePriceBNB = purchasePriceUSD / bnbPrice;
      const purchasePriceWei = ethers.utils.parseEther(purchasePriceBNB.toFixed(6));

      console.log(`💡 구매 정보:
      - USD 가격: $${purchasePriceUSD.toLocaleString()}
      - BNB 가격: ${purchasePriceBNB.toFixed(4)} BNB
      - 현재 BNB/USD: $${bnbPrice}`);

      // 3. 사용자 확인
      const confirmed = confirm(`
🔥 보험 자산 구매 확인

상품: ${listing.productName}
회사: ${listing.company}
구매가: $${purchasePriceUSD.toLocaleString()}
지불액: ${purchasePriceBNB.toFixed(4)} BNB

블록체인 거래를 진행하시겠습니까?
      `);

      if (!confirmed) {
        setIsLoading(false);
        return;
      }

      // 4. 실제 블록체인 거래 실행
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // 5. 스마트 컨트랙트 연결
        const contract = new ethers.Contract(
          "0x58228104D72Aa48F1761804a090be24c01523972", // 실제 배포된 컨트랙트 주소
          [
            "function purchaseInsuranceAsset(uint256 assetId) external payable",
            "function getAssetDetails(uint256 assetId) external view returns (string memory)",
            "function escrowFunds(uint256 assetId) external payable"
          ],
          signer
        );

        console.log('🔗 컨트랙트 연결 성공:', contract.address);

        // 6. 에스크로 거래 실행
        const transaction = await contract.escrowFunds(listing.id, {
          value: purchasePriceWei,
          gasLimit: 300000
        });

        console.log('⏳ 거래 실행 중...', transaction.hash);
        
        // 7. 거래 완료 대기
        const receipt = await transaction.wait();
        console.log('✅ 거래 완료!', receipt);

        // 8. Supabase에 거래 기록 저장
        try {
          const { data, error } = await supabase
            .from('transactions')
            .insert([
              {
                buyer_address: connectedAccount,
                seller_address: listing.seller,
                asset_id: listing.id,
                purchase_price_usd: purchasePriceUSD,
                purchase_price_bnb: purchasePriceBNB,
                transaction_hash: receipt.transactionHash,
                status: 'completed',
                blockchain_network: 'BSC Testnet'
              }
            ]);

          if (error) throw error;
          console.log('📊 거래 기록 저장 완료:', data);
        } catch (dbError) {
          console.error('⚠️ 데이터베이스 저장 실패:', dbError);
        }

        // 9. 리스팅 상태 업데이트
        setListingData(prev => 
          prev.map(item => 
            item.id === listing.id 
              ? { ...item, status: 'sold', buyer: connectedAccount }
              : item
          )
        );

        // 10. 성공 알림
        alert(`🎉 구매 완료!

✅ 블록체인 거래 성공
📄 거래 해시: ${receipt.transactionHash}
🔍 확인: https://testnet.bscscan.com/tx/${receipt.transactionHash}

보험 자산이 성공적으로 양도되었습니다!`);

      } else {
        alert('MetaMask가 설치되지 않았습니다.');
      }

    } catch (error) {
      console.error('❌ 구매 실패:', error);
      
      if (error.code === 4001) {
        alert('사용자가 거래를 취소했습니다.');
      } else if (error.code === -32603) {
        alert('잔액이 부족합니다. BNB를 추가해주세요.');
      } else {
        alert(`거래 실패: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===== OCR 관련 함수들 =====
  
  // Notification System
  const addNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Camera Functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsUsingCamera(true);
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      addNotification('Camera access denied or not available', 'error');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsUsingCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // OCR Processing
  const processImage = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    addNotification('Starting OCR text extraction...', 'info');

    try {
      const Tesseract = (await import('tesseract.js')).default;
      
      const { data: { text } } = await Tesseract.recognize(
        selectedFile,
        'eng+kor+chi_sim',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      console.log('Extracted text:', text);
      
      if (text.trim()) {
        await analyzeExtractedText(text);
      } else {
        addNotification('No text found in image. Please try another image.', 'warning');
      }
      
    } catch (error) {
      console.error('OCR processing failed:', error);
      addNotification('OCR processing failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // AI Text Analysis
  const analyzeExtractedText = async (text: string) => {
    try {
      addNotification('Analyzing extracted text...', 'info');

      const extractedData = parseTextWithRegex(text);

      if (extractedData) {
        autoFillForm(extractedData);
        addNotification('Insurance information extracted successfully!', 'success');
      } else {
        addNotification('Could not extract insurance information. Please fill manually.', 'warning');
      }

    } catch (error) {
      console.error('Text analysis failed:', error);
      addNotification('Text analysis failed. Please fill form manually.', 'error');
    }
  };

  // Regex Parser
  const parseTextWithRegex = (text: string) => {
    const patterns = {
      company: /(?:company|insurer|provider)[:\s]*([A-Za-z\s]+)/i,
      policy: /(?:policy|contract)[:\s#]*([A-Za-z0-9\-]+)/i,
      premium: /(?:premium|amount)[:\s]*([0-9,]+)/i,
      currency: /(USD|HKD|CNY|SGD|EUR|GBP)/i,
      date: /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g
    };

    const extracted: any = {};
    
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        extracted[key === 'company' ? 'company_name' : 
                 key === 'policy' ? 'policy_number' :
                 key === 'premium' ? 'premium_amount' : key] = match[1]?.trim();
      }
    });

    const dates = text.match(patterns.date);
    if (dates?.length >= 2) {
      extracted.purchase_date = dates[0];
      extracted.maturity_date = dates[1];
    }

    return Object.keys(extracted).length > 0 ? extracted : null;
  };

  // Auto-fill Form
  const autoFillForm = (data: any) => {
    const updates: any = {};
    
    if (data.company_name) {
      const matchedCompany = globalInsurers.find(company => 
        company.toLowerCase().includes(data.company_name.toLowerCase()) ||
        data.company_name.toLowerCase().includes(company.toLowerCase())
      );
      updates.company = matchedCompany || data.company_name;
    }
    
    if (data.product_name) updates.productName = data.product_name;
    if (data.premium_amount) updates.annualPayment = data.premium_amount.replace(/[^0-9]/g, '');
    if (data.purchase_date) {
      try {
        const date = new Date(data.purchase_date);
        updates.startDate = date.toISOString().split('T')[0];
      } catch {}
    }

    setInsuranceData(prev => ({ ...prev, ...updates }));
  };

  // 🔐 Admin Dashboard - 관리자 전용 페이지
  const AdminDashboard = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          ADMIN
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
          관리자 대시보드 - 플랫폼 관리 및 통계
        </p>
      </div>

      {/* 관리자 권한 확인 표시 */}
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200"
           style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="font-light text-green-700">
            ✅ 관리자 권한으로 로그인됨: {connectedAccount}
          </span>
        </div>
      </div>

      {/* 통계 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4"
             style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
          <DollarSign className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
          <h3 className="text-lg md:text-xl font-light text-zinc-900">총 거래량</h3>
          <p className="text-2xl md:text-3xl font-light text-zinc-700">$2.4M</p>
        </div>
        
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4"
             style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
          <User className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
          <h3 className="text-lg md:text-xl font-light text-zinc-900">등록 사용자</h3>
          <p className="text-2xl md:text-3xl font-light text-zinc-700">847</p>
        </div>
        
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4"
             style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
          <TrendingUp className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
          <h3 className="text-lg md:text-xl font-light text-zinc-900">성공률</h3>
          <p className="text-2xl md:text-3xl font-light text-zinc-700">98.5%</p>
        </div>
      </div>

      {/* 관리 기능 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extralight text-zinc-900">관리 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors text-left"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}>
            <h3 className="font-medium mb-2">사용자 관리</h3>
            <p className="text-sm text-zinc-600">등록된 사용자 및 권한 관리</p>
          </button>
          
          <button className="p-4 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors text-left"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}>
            <h3 className="font-medium mb-2">거래 모니터링</h3>
            <p className="text-sm text-zinc-600">실시간 거래 현황 및 승인</p>
          </button>
          
          <button className="p-4 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors text-left"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}>
            <h3 className="font-medium mb-2">수수료 관리</h3>
            <p className="text-sm text-zinc-600">플랫폼 수수료 설정 및 정산</p>
          </button>
          
          <button className="p-4 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors text-left"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}>
            <h3 className="font-medium mb-2">시스템 설정</h3>
            <p className="text-sm text-zinc-600">AI 모델 및 플랫폼 설정</p>
          </button>
        </div>
      </div>
    </div>
  );

  // Page Components
  const HomePage = () => (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          {t.mainTitle}
        </h1>
        <div className="w-32 h-px bg-zinc-900 mx-auto mb-8"></div>
        <p className="text-lg sm:text-xl md:text-2xl text-zinc-600 font-light tracking-wide max-w-4xl mx-auto">
          {t.mainSubtitle}
        </p>
        <p className="text-sm sm:text-base md:text-lg text-zinc-500 font-light max-w-3xl mx-auto">
          {t.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={() => setCurrentPage('sell')}
            className="px-8 py-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transform hover:translate-x-2 hover:translate-y-2 transition-all duration-300"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
          >
            {t.getStarted}
          </button>
          <button
            onClick={() => setCurrentPage('buy')}
            className="px-8 py-4 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
          >
            {t.learnMore}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl md:text-6xl font-extralight text-zinc-900">$250M+</div>
          <div className="text-xs sm:text-sm text-zinc-600 font-light tracking-wide">{t.statVolume}</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl md:text-6xl font-extralight text-zinc-900">25K+</div>
          <div className="text-xs sm:text-sm text-zinc-600 font-light tracking-wide">{t.statUsers}</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl sm:text-5xl md:text-6xl font-extralight text-zinc-900">99.8%</div>
          <div className="text-xs sm:text-sm text-zinc-600 font-light tracking-wide">{t.statSuccess}</div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4"
             style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
          <BarChart3 className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
          <h3 className="text-lg md:text-xl font-light text-zinc-900">{t.aiValuation}</h3>
          <p className="text-sm md:text-base text-zinc-600 font-light">{t.aiValuationDesc}</p>
        </div>
        
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4"
             style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
          <Globe className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
          <h3 className="text-lg md:text-xl font-light text-zinc-900">{t.globalMarket}</h3>
          <p className="text-sm md:text-base text-zinc-600 font-light">{t.globalMarketDesc}</p>
        </div>
        
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50 text-center space-y-4"
             style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
          <Shield className="h-10 w-10 md:h-12 md:w-12 text-zinc-700 mx-auto" />
          <h3 className="text-lg md:text-xl font-light text-zinc-900">{t.secureTrading}</h3>
          <p className="text-sm md:text-base text-zinc-600 font-light">{t.secureTradingDesc}</p>
        </div>
      </div>
    </div>
  );

  const SellInsurancePage = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          SELL
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
      </div>

      {/* 🔗 지갑 연결 상태 추가 */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200"
           style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${connectedAccount ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="font-light text-zinc-700">
            {connectedAccount ? `Wallet Connected: ${connectedAccount}` : 'Wallet Not Connected - Required for Insurance Listing'}
          </span>
        </div>
        {!connectedAccount && (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-zinc-900 text-zinc-50 font-light text-sm hover:bg-zinc-800 transition-colors"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)' }}
          >
            {t.wallet}
          </button>
        )}
      </div>

      <div className="max-w-6xl">
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
          List your insurance for global transfer
        </p>
      </div>

      <div className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Insurance Information Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">Insurance Information</h2>
            
            {/* Insurance Company */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.insuranceCompany}</label>
              <select
                value={insuranceData.company}
                onChange={(e) => setInsuranceData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              >
                <option value="">{t.selectCompany}</option>
                {globalInsurers.map(insurer => (
                  <option key={insurer} value={insurer}>{insurer}</option>
                ))}
              </select>
            </div>

            {/* Product Category */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.productCategory}</label>
              <select
                value={insuranceData.productCategory}
                onChange={(e) => setInsuranceData(prev => ({ ...prev, productCategory: e.target.value }))}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              >
                <option value="">{t.selectCategory}</option>
                {productCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.productName}</label>
              <input
                type="text"
                value={insuranceData.productName}
                onChange={(e) => setInsuranceData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder={t.enterProductName}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* Contract Date */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.contractDate}</label>
              <input
                type="date"
                value={insuranceData.startDate}
                onChange={(e) => setInsuranceData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* Contract Period */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.contractPeriod}</label>
              <select
                value={insuranceData.contractPeriod}
                onChange={(e) => setInsuranceData(prev => ({ ...prev, contractPeriod: e.target.value }))}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              >
                <option value="">{t.selectPeriod}</option>
                {contractPeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            {/* Custom Period Input */}
            {insuranceData.contractPeriod === t.customInput && (
              <div>
                <label className="block text-sm font-light text-zinc-600 mb-2">{t.customPeriod}</label>
                <input
                  type="number"
                  value={insuranceData.customContractPeriod}
                  onChange={(e) => setInsuranceData(prev => ({ ...prev, customContractPeriod: e.target.value }))}
                  placeholder="e.g., 12"
                  className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                />
              </div>
            )}

            {/* Paid Period */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.paidPeriod}</label>
              <select
                value={insuranceData.actualPaymentPeriod}
                onChange={(e) => setInsuranceData(prev => ({ ...prev, actualPaymentPeriod: e.target.value }))}
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                disabled={!insuranceData.contractPeriod}
              >
                <option value="">{t.selectPaidPeriod}</option>
                {calculatePaymentOptions(insuranceData.contractPeriod).map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Annual Premium */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.annualPremium}</label>
              <input
                type="number"
                value={insuranceData.annualPayment}
                onChange={(e) => setInsuranceData(prev => ({ ...prev, annualPayment: e.target.value }))}
                placeholder="e.g., 10000"
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* Total Paid */}
            <div>
              <label className="block text-sm font-light text-zinc-600 mb-2">{t.totalPaid}</label>
              <input
                type="number"
                value={insuranceData.totalPayment}
                onChange={(e) => setInsuranceData(prev => ({ ...prev, totalPayment: e.target.value }))}
                placeholder="e.g., 50000"
                className="w-full p-4 border border-zinc-200 bg-zinc-50 text-zinc-900 font-light focus:outline-none focus:border-zinc-400 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSellSubmit}
              disabled={isLoading}
              className="w-full p-4 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transform hover:translate-x-2 hover:translate-y-2 transition-all duration-300 disabled:opacity-50"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
            >
              {isLoading ? t.aiEvaluating : t.submitSell}
            </button>
          </div>

          {/* OCR Upload */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extralight text-zinc-900">Document Scan</h2>
            
            {/* Camera/Upload Interface */}
            <div className="space-y-4">
              {isUsingCamera ? (
                <div className="space-y-4">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    className="w-full border border-zinc-200 bg-black"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                  />
                  <div className="flex space-x-4">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 p-3 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transition-colors"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex-1 p-3 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : selectedFile ? (
                <div className="space-y-4">
                  <div className="p-4 border border-zinc-200 bg-zinc-50"
                       style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}>
                    <p className="text-zinc-700 font-light">Selected: {selectedFile.name}</p>
                    <p className="text-sm text-zinc-500">Ready for OCR processing</p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={processImage}
                      disabled={isLoading}
                      className="flex-1 p-3 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transition-colors disabled:opacity-50"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                    >
                      {isLoading ? 'Processing...' : 'Process Image'}
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="flex-1 p-3 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-zinc-300 p-8 text-center bg-zinc-50 hover:border-zinc-400 transition-colors cursor-pointer"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
                    <p className="text-zinc-600 font-light">
                      Upload your insurance policy<br />
                      for automatic information extraction
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                      JPG, PNG, PDF files supported
                    </p>
                  </div>
                  
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <button
                    onClick={startCamera}
                    className="w-full p-3 border border-zinc-300 text-zinc-700 font-light hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
                  >
                    <Camera className="inline mr-2 h-4 w-4" />
                    Use Camera
                  </button>
                </div>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );

  const BuyInsurancePage = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          BUY
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
          Browse available insurance transfers globally
        </p>
      </div>

      {/* Wallet Status */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200"
           style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${connectedAccount ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="font-light text-zinc-700">
            {connectedAccount ? `Wallet Connected: ${connectedAccount}` : 'Wallet Not Connected'}
          </span>
        </div>
        {!connectedAccount && (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-zinc-900 text-zinc-50 font-light text-sm hover:bg-zinc-800 transition-colors"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)' }}
          >
            {t.wallet}
          </button>
        )}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {listingData.map(listing => (
          <div 
            key={listing.id}
            className="p-4 md:p-6 border border-zinc-200 bg-zinc-50 hover:border-zinc-400 transition-colors"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
              <div className="flex-1">
                <h3 className="font-light text-base md:text-lg text-zinc-900">{listing.productName}</h3>
                <p className="text-xs md:text-sm text-zinc-600">{listing.company}</p>
                <span className="inline-block px-2 py-1 text-xs bg-zinc-200 text-zinc-700 mt-1">
                  {listing.category}
                </span>
              </div>
              <div className={`px-2 py-1 text-xs rounded shrink-0 ${
                listing.status === 'available' ? 'bg-green-100 text-green-700' :
                listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {listing.status === 'available' ? t.available :
                 listing.status === 'pending' ? t.pending : t.sold}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1 md:space-y-2 mb-4 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Contract Period:</span>
                <span className="text-zinc-900">{listing.contractPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Paid Period:</span>
                <span className="text-zinc-900">{listing.paidPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Annual Premium:</span>
                <span className="text-zinc-900">${listing.annualPayment.toLocaleString()}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-zinc-300 pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600">{t.surrenderValue}:</span>
                <span className="text-lg font-light text-zinc-700">
                  ${listing.surrenderValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600">{t.transferValue}:</span>
                <span className="text-lg font-light text-zinc-900">
                  ${listing.transferValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-600">{t.platformPrice}:</span>
                <span className="text-xl font-light text-zinc-900">
                  ${listing.platformPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600">{t.confidence}:</span>
                <span className={`text-sm font-medium ${
                  listing.confidence > 0.8 ? 'text-green-600' : 
                  listing.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(listing.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-zinc-600">{t.riskGrade}:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  listing.riskGrade === 'A' ? 'bg-green-100 text-green-700' :
                  listing.riskGrade === 'B' ? 'bg-blue-100 text-blue-700' :
                  listing.riskGrade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {listing.riskGrade}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {listing.status === 'available' ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handlePurchase(listing)}
                    disabled={!connectedAccount || isLoading}
                    className="w-full p-2 md:p-3 bg-zinc-900 text-zinc-50 text-sm md:text-base font-light hover:bg-zinc-800 transform hover:translate-x-1 hover:translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)' }}
                  >
                    {isLoading ? t.processing : t.submitBuy}
                  </button>
                  <button
                    onClick={() => setCurrentPage('inquiry')}
                    className="w-full p-2 md:p-3 border border-zinc-300 text-zinc-700 text-sm md:text-base font-light hover:border-zinc-400 hover:bg-zinc-100 transition-colors"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)' }}
                  >
                    {t.inquireNow}
                  </button>
                </div>
              ) : listing.status === 'pending' ? (
                <div className="p-2 md:p-3 bg-yellow-50 border border-yellow-200 text-center">
                  <p className="text-xs md:text-sm text-yellow-700">Transaction in progress</p>
                </div>
              ) : (
                <div className="p-2 md:p-3 bg-red-50 border border-red-200 text-center">
                  <p className="text-xs md:text-sm text-red-700">This item has been sold</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-zinc-200 text-xs text-zinc-500">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="truncate">Seller: {listing.seller}</span>
                <span>Listed: {listing.listingDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {listingData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 font-light">No listings available at the moment.</p>
        </div>
      )}
    </div>
  );

  const InquiryPage = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem] 2xl:text-[28rem] font-extralight tracking-tighter leading-[0.85] text-zinc-900 select-none">
          CONCIERGE
        </h1>
        <div className="w-24 h-px bg-zinc-900 mb-6"></div>
        <p className="text-lg sm:text-xl text-zinc-600 font-light tracking-wide">
          Expert guidance for your insurance transfers
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="p-6 md:p-8 border border-zinc-200 bg-zinc-50"
             style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }}>
          <h2 className="text-xl md:text-2xl font-extralight text-zinc-900 mb-4 md:mb-6">Professional Concierge Service</h2>
          <div className="space-y-3 md:space-y-4 text-sm md:text-base text-zinc-600 font-light">
            <p>WellSwap team's lawyers and financial accounting specialists provide professional concierge services.</p>
            <ul className="space-y-1 md:space-y-2 pl-4">
              <li>• Legal documentation and compliance</li>
              <li>• Transfer process management</li>
              <li>• Cross-border regulatory support</li>
              <li>• Due diligence and verification</li>
            </ul>
          </div>
          
          <div className="mt-6 md:mt-8">
            <h3 className="text-base md:text-lg font-light text-zinc-900 mb-3 md:mb-4">Contact Information</h3>
            <div className="space-y-1 md:space-y-2 text-sm md:text-base text-zinc-600 font-light">
              <p>Email: concierge@wellswap.com</p>
              <p>Phone: +852 1234 5678</p>
              <p>Available: Monday - Friday, 9:00 AM - 6:00 PM (HKT)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => setCurrentPage('home')}
            className="text-2xl font-extralight tracking-wider text-zinc-900"
          >
            WELLSWAP
          </button>
          
          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => setCurrentPage('sell')}
              className={`font-light transition-colors ${currentPage === 'sell' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              {t.sell}
            </button>
            <button
              onClick={() => setCurrentPage('buy')}
              className={`font-light transition-colors ${currentPage === 'buy' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              {t.buy}
            </button>
            <button
              onClick={() => setCurrentPage('inquiry')}
              className={`font-light transition-colors ${currentPage === 'inquiry' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
            >
              {t.inquiry}
            </button>
            
            {/* 🔐 관리자만 Admin 메뉴 표시 */}
            {isAdmin(connectedAccount) && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={`font-light transition-colors ${currentPage === 'admin' ? 'text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
              >
                Admin
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border border-zinc-300 px-3 py-1 text-sm font-light focus:outline-none focus:border-zinc-500"
          >
            <option value="en">🇺🇸 English</option>
            <option value="ko">🇰🇷 한국어</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ja">🇯🇵 日本語</option>
          </select>

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-light text-zinc-600">
                {user.email} {user.role === 'admin' && '(Admin)'}
              </span>
              <button
                onClick={() => setUser(null)}
                className="text-sm font-light text-zinc-600 hover:text-zinc-900"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogin}
                className="text-sm font-light text-zinc-600 hover:text-zinc-900"
              >
                {t.login}
              </button>
              <button
                onClick={handleSignup}
                className="px-4 py-2 bg-zinc-900 text-zinc-50 text-sm font-light hover:bg-zinc-800 transition-colors"
                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)' }}
              >
                {t.signup}
              </button>
            </div>
          )}

          {/* Wallet Connect Button */}
          {!connectedAccount && (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-zinc-900 text-zinc-50 text-sm font-light hover:bg-zinc-800 transition-colors"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)' }}
            >
              <Wallet className="inline mr-2 h-4 w-4" />
              {t.wallet}
            </button>
          )}

          {/* Mobile Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 p-4 space-y-4">
          <button
            onClick={() => { setCurrentPage('sell'); setIsMenuOpen(false); }}
            className="block w-full text-left font-light text-zinc-600"
          >
            {t.sell}
          </button>
          <button
            onClick={() => { setCurrentPage('buy'); setIsMenuOpen(false); }}
            className="block w-full text-left font-light text-zinc-600"
          >
            {t.buy}
          </button>
          <button
            onClick={() => { setCurrentPage('inquiry'); setIsMenuOpen(false); }}
            className="block w-full text-left font-light text-zinc-600"
          >
            {t.inquiry}
          </button>
          
          {/* 🔐 관리자만 Admin 메뉴 표시 (모바일) */}
          {isAdmin(connectedAccount) && (
            <button
              onClick={() => { setCurrentPage('admin'); setIsMenuOpen(false); }}
              className="block w-full text-left font-light text-zinc-600"
            >
              Admin
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'sell' && <SellInsurancePage />}
        {currentPage === 'buy' && <BuyInsurancePage />}
        {currentPage === 'inquiry' && <InquiryPage />}
        {currentPage === 'admin' && isAdmin(connectedAccount) && <AdminDashboard />}
        
        {/* 권한 없는 사용자가 admin 페이지 접근 시 */}
        {currentPage === 'admin' && !isAdmin(connectedAccount) && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-light text-zinc-700 mb-4">접근 권한이 없습니다</h2>
            <p className="text-zinc-600 mb-6">관리자 권한이 필요한 페이지입니다.</p>
            <button
              onClick={() => setCurrentPage('home')}
              className="px-6 py-3 bg-zinc-900 text-zinc-50 font-light hover:bg-zinc-800 transition-colors"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
            >
              홈으로 돌아가기
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-sm md:text-base text-zinc-500 font-light">
            © 2025 WellSwap. Global Insurance Transfer Platform.
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-3 md:mt-4">
            <span className="text-xs md:text-sm text-zinc-400">🇭🇰 Hong Kong</span>
            <span className="text-xs md:text-sm text-zinc-400">🇸🇬 Singapore</span>
            <span className="text-xs md:text-sm text-zinc-400">🇬🇧 United Kingdom</span>
            <span className="text-xs md:text-sm text-zinc-400">🇺🇸 United States</span>
          </div>
        </div>
      </footer>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded shadow-lg max-w-sm ${
              notification.type === 'success' ? 'bg-green-100 text-green-800' :
              notification.type === 'error' ? 'bg-red-100 text-red-800' :
              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}
          >
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WellSwapGlobalPlatform;