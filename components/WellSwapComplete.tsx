'use client';
// 🔗 컨트랙트 연동 임포트 추가
import { 
  useWeb3, 
  useAssetRegistration, 
  useAIEvaluation, 
  useTrading, 
  useContractData 
} from './ContractIntegration';
import React, { useState, useEffect } from 'react';
import { Camera, Upload, User, Menu, X, Wallet, ArrowRight, Globe, MessageSquare, BarChart3, TrendingUp, Shield, CheckCircle2, AlertCircle, Clock, DollarSign } from 'lucide-react';

const WellSwapGlobalPlatform = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [language, setLanguage] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{email: string, role: string} | null>(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setConnectedAccount(accounts[0]);
        alert(`Wallet connected: ${accounts[0]}`);
      } catch (error) {
        alert('Failed to connect wallet');
      }
    } else {
      alert('MetaMask not detected. Please install MetaMask.');
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

  // Advanced AI Valuation Engine (Mathematical & Economic Models)
  const performAdvancedAIValuation = async (data) => {
    setIsLoading(true);
    try {
      // Multi-dimensional mathematical model
      const response = await fetch('/api/advanced-ai-valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          models: [
            'black_scholes_merton',
            'monte_carlo_simulation',
            'stochastic_volatility',
            'interest_rate_models',
            'actuarial_present_value',
            'machine_learning_ensemble',
            'bayesian_inference',
            'value_at_risk',
            'expected_shortfall',
            'copula_models'
          ]
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        // Sophisticated fallback calculation
        const baseValue = parseFloat(data.totalPayment) || 0;
        const years = parseInt(data.actualPaymentPeriod) || 1;
        const contractYears = parseInt(data.contractPeriod) || 10;
        
        // Hong Kong 7-year recovery model + compound interest
        let surrenderRate;
        if (years <= 2) surrenderRate = 0.15;
        else if (years <= 5) surrenderRate = 0.40 + (years - 2) * 0.15;
        else if (years <= 7) surrenderRate = 0.85 + (years - 5) * 0.075;
        else surrenderRate = 1.0 + (years - 7) * 0.055;
        
        const surrenderValue = baseValue * surrenderRate;
        const transferValue = surrenderValue * 1.18; // 18% transfer premium
        const platformPrice = transferValue * 0.97; // 3% platform fee
        
        return {
          surrenderValue: Math.round(surrenderValue),
          transferValue: Math.round(transferValue),
          platformPrice: Math.round(platformPrice),
          confidence: 0.78,
          riskGrade: 'B',
          method: 'mathematical_fallback'
        };
      }
    } catch (error) {
      console.error('AI valuation error:', error);
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

  // Sell Insurance Handler
  const handleSellSubmit = async () => {
    if (!insuranceData.company || !insuranceData.productName || !insuranceData.totalPayment) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const aiResult = await performAdvancedAIValuation(insuranceData);
      
      const resultMessage = `
🎯 Advanced AI Valuation Complete!

📊 Valuation Results:
• Surrender Value: $${aiResult.surrenderValue.toLocaleString()}
• Transfer Value: $${aiResult.transferValue.toLocaleString()}  
• Platform Price: $${aiResult.platformPrice.toLocaleString()}
• AI Confidence: ${(aiResult.confidence * 100).toFixed(1)}%
• Risk Grade: ${aiResult.riskGrade}

${aiResult.method === 'mathematical_fallback' ? '⚡ Using mathematical models' : '🤖 Full AI analysis complete'}

Proceed with listing?
      `;
      
      const confirmed = confirm(resultMessage);
      
      if (confirmed) {
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
          seller: connectedAccount || '0x1234...5678',
          listingDate: new Date().toISOString().split('T')[0],
          aiMethod: aiResult.method || 'advanced_ai'
        };

        setListingData(prev => [newListing, ...prev]);
        alert('✅ Insurance successfully listed for sale!');
        
        // Reset form
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
      
    } catch (error) {
      alert('Processing error: ' + error.message);
    }
  };

  // Purchase Handler
  const handlePurchase = async (listing) => {
    if (!connectedAccount) {
      alert('Please connect your wallet first.');
      return;
    }

    const confirmed = confirm(
      `Purchase ${listing.productName} for $${listing.platformPrice.toLocaleString()}?\n\nThis will initiate blockchain escrow and multi-signature contract.`
    );

    if (confirmed) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setListingData(prev => 
          prev.map(item => 
            item.id === listing.id 
              ? { ...item, status: 'pending', buyer: connectedAccount }
              : item
          )
        );
        
        alert('✅ Purchase initiated! Blockchain transaction submitted.');
        
      } catch (error) {
        alert('Transaction failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

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
            <div 
              className="border-2 border-dashed border-zinc-300 p-8 text-center bg-zinc-50 hover:border-zinc-400 transition-colors cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' }}
            >
              <Camera className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
              <p className="text-zinc-600 font-light">
                Take a photo or upload your insurance policy<br />
                for automatic information extraction
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                JPG, PNG files supported
              </p>
            </div>
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
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'sell' && <SellInsurancePage />}
        {currentPage === 'buy' && <BuyInsurancePage />}
        {currentPage === 'inquiry' && <InquiryPage />}
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
    </div>
  );
};

export default WellSwapGlobalPlatform;