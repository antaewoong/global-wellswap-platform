// components/ContractIntegration.js
// 🔗 WellSwap 스마트 컨트랙트 연동 설정

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

// 🏗️ 컨트랙트 설정 정보
const CONTRACT_CONFIG = {
  // BSC 테스트넷 설정
  NETWORK: {
    chainId: '0x61', // 97 in hex
    chainName: 'BSC Testnet',
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18
    }
  },
  
  // 🎯 실제 배포된 WellSwap 컨트랙트 주소
  CONTRACT_ADDRESS: "0x58228104D72Aa48F1761804a090be24c01523972",
  
  // WellSwap 컨트랙트 ABI (핵심 함수들만)
  CONTRACT_ABI: [
    // 사용자 관리
    "function payRegistrationFee(uint8 userType) external payable",
    "function payPurchaseFee() external payable", 
    "function refundRegistrationFee() external",
    
    // 자산 관리
    "function registerInsuranceAsset(string memory companyName, string memory productName, string memory category, uint256 surrenderValueUSD, uint256 premiumPaidUSD, uint256 contractPeriodMonths, string memory additionalData) external returns (uint256)",
    "function updateAIEvaluation(uint256 assetId, uint256 aiValueUSD, uint8 riskGrade, uint8 confidenceScore, string memory analysisData) external",
    
    // 거래 관리
    "function createMultisigTrade(uint256 assetId, address buyer, uint256 agreedPriceUSD) external returns (uint256)",
    "function signTrade(uint256 tradeId) external payable",
    "function completeTrade(uint256 tradeId) external",
    
    // 조회 함수
    "function getAsset(uint256 assetId) external view returns (tuple(string companyName, string productName, string category, uint256 surrenderValueUSD, uint256 aiValueUSD, uint8 riskGrade, uint8 status, address owner))",
    "function getTrade(uint256 tradeId) external view returns (tuple(uint256 assetId, address seller, address buyer, uint256 agreedPriceUSD, uint8 status, uint256 createdAt))",
    "function userEscrowBalance(address user) external view returns (uint256)",
    "function bnbUsdPrice() external view returns (uint256)",
    
    // 상수 조회
    "function REGISTRATION_FEE_USD() external view returns (uint256)",
    "function PLATFORM_FEE_USD() external view returns (uint256)",
    "function REFUND_AMOUNT_USD() external view returns (uint256)",
    
    // 이벤트들
    "event AssetRegistered(uint256 indexed assetId, address indexed owner, string companyName)",
    "event AIEvaluationUpdated(uint256 indexed assetId, uint256 aiValueUSD, uint8 riskGrade)",
    "event MultisigTradeCreated(uint256 indexed tradeId, uint256 indexed assetId, address seller, address buyer)",
    "event TradeCompleted(uint256 indexed tradeId, uint256 finalPriceUSD)"
  ]
};

// 🌐 Web3 연결 훅
export const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  // 지갑 연결 함수
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask가 설치되지 않았습니다. MetaMask를 설치해주세요.');
      }

      console.log('🔗 지갑 연결 시작...');

      // 계정 연결 요청
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('지갑 계정을 찾을 수 없습니다.');
      }

      // Provider 및 Signer 설정
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const userAccount = await web3Signer.getAddress();
      
      console.log('✅ 계정 연결됨:', userAccount);

      // 네트워크 확인 및 변경
      await switchToBSCTestnet();
      
      // 컨트랙트 인스턴스 생성
      if (CONTRACT_CONFIG.CONTRACT_ADDRESS === "0x당신의_실제_컨트랙트_주소_여기에_입력") {
        console.warn('⚠️ 컨트랙트 주소가 설정되지 않았습니다. CONTRACT_CONFIG.CONTRACT_ADDRESS를 실제 주소로 업데이트하세요.');
      }

      const wellSwapContract = new ethers.Contract(
        CONTRACT_CONFIG.CONTRACT_ADDRESS,
        CONTRACT_CONFIG.CONTRACT_ABI,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(wellSwapContract);
      setAccount(userAccount);
      setIsConnected(true);
      setNetworkError(null);

      console.log('🎉 Web3 연결 완료!');
      return { success: true, account: userAccount };

    } catch (error) {
      console.error('❌ 지갑 연결 실패:', error);
      setNetworkError(error.message);
      setIsConnected(false);
      return { success: false, error: error.message };
    }
  };

  // BSC 테스트넷으로 네트워크 변경
  const switchToBSCTestnet = async () => {
    try {
      console.log('🔄 BSC 테스트넷으로 변경 중...');
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONTRACT_CONFIG.NETWORK.chainId }],
      });
      
      console.log('✅ BSC 테스트넷 연결됨');
    } catch (switchError) {
      console.log('🔧 BSC 테스트넷 추가 중...');
      
      // 네트워크가 추가되지 않은 경우 추가
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CONTRACT_CONFIG.NETWORK],
        });
        console.log('✅ BSC 테스트넷 추가 완료');
      } else {
        throw switchError;
      }
    }
  };

  // BNB를 USD로 변환 (간단한 고정 가격 사용)
  const usdToBnb = async (usdAmount) => {
    try {
      // 실제로는 컨트랙트에서 가격을 가져와야 하지만, 
      // 테스트를 위해 고정 가격 사용 (1 BNB = $650)
      const bnbPriceUsd = 650;
      const bnbAmount = parseFloat(usdAmount) / bnbPriceUsd;
      
      console.log(`💱 $${usdAmount} USD = ${bnbAmount} BNB (가격: $${bnbPriceUsd}/BNB)`);
      
      return ethers.utils.parseEther(bnbAmount.toString());
    } catch (error) {
      console.error('💱 USD to BNB 변환 실패:', error);
      throw error;
    }
  };

  // 지갑 연결 상태 모니터링
  useEffect(() => {
    if (window.ethereum) {
      // 계정 변경 감지
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAccount(null);
          console.log('🔌 지갑 연결 해제됨');
        } else {
          setAccount(accounts[0]);
          console.log('🔄 계정 변경됨:', accounts[0]);
        }
      });

      // 네트워크 변경 감지
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    networkError,
    connectWallet,
    usdToBnb
  };
};

// 🏪 보험 자산 등록 함수
export const useAssetRegistration = () => {
  const { contract, usdToBnb, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const registerAsset = async (assetData) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('🏪 자산 등록 시작...', assetData);

      // 1단계: 등록 수수료 지불 (300 USD)
      console.log('💰 등록 수수료 300 USD 지불 중...');
      const registrationFeeInBNB = await usdToBnb(300);
      
      const feeTransaction = await contract.payRegistrationFee(1, { // 1 = SELLER
        value: registrationFeeInBNB,
        gasLimit: ethers.utils.hexlify(300000)
      });
      
      console.log('⏳ 수수료 트랜잭션 대기 중:', feeTransaction.hash);
      await feeTransaction.wait();
      console.log('✅ 등록 수수료 지불 완료');

      // 2단계: 자산 정보 등록
      console.log('📝 블록체인에 자산 정보 등록 중...');
      const registerTransaction = await contract.registerInsuranceAsset(
        assetData.companyName,
        assetData.productName,
        assetData.category,
        Math.floor(assetData.surrenderValueUSD),
        Math.floor(assetData.premiumPaidUSD),
        assetData.contractPeriodMonths,
        JSON.stringify(assetData.additionalData || {}),
        { gasLimit: ethers.utils.hexlify(500000) }
      );

      console.log('⏳ 등록 트랜잭션 대기 중:', registerTransaction.hash);
      const receipt = await registerTransaction.wait();
      
      // 이벤트에서 자산 ID 추출
      const assetRegisteredEvent = receipt.events?.find(
        event => event.event === 'AssetRegistered'
      );
      
      const assetId = assetRegisteredEvent?.args?.assetId;
      console.log('🎉 자산 등록 완료! Asset ID:', assetId?.toString());

      return {
        success: true,
        assetId: assetId?.toString(),
        transactionHash: registerTransaction.hash,
        feeTransactionHash: feeTransaction.hash
      };

    } catch (error) {
      console.error('❌ 자산 등록 실패:', error);
      
      // 에러 메시지 개선
      let errorMessage = error.message;
      if (error.code === 4001) {
        errorMessage = '사용자가 트랜잭션을 취소했습니다.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'BNB 잔액이 부족합니다. 최소 0.5 BNB가 필요합니다.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { registerAsset, loading };
};

// 🤖 AI 평가 업데이트 함수 (관리자용)
export const useAIEvaluation = () => {
  const { contract, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const updateAIEvaluation = async (assetId, evaluationData) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('🤖 AI 평가 블록체인 업데이트 중...', { assetId, evaluationData });
      
      const transaction = await contract.updateAIEvaluation(
        assetId,
        Math.floor(evaluationData.aiValueUSD),
        evaluationData.riskGrade, // 1-5 (A=1, B=2, C=3, D=4, E=5)
        evaluationData.confidenceScore, // 1-100
        JSON.stringify(evaluationData.analysisData || {}),
        { gasLimit: ethers.utils.hexlify(200000) }
      );

      console.log('⏳ AI 평가 트랜잭션 대기 중:', transaction.hash);
      await transaction.wait();
      console.log('✅ AI 평가 블록체인 업데이트 완료');

      return {
        success: true,
        transactionHash: transaction.hash
      };

    } catch (error) {
      console.error('❌ AI 평가 업데이트 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateAIEvaluation, loading };
};

// 🤝 멀티시그 거래 생성 함수
export const useTrading = () => {
  const { contract, usdToBnb, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);

  const createTrade = async (assetId, buyerAddress, agreedPriceUSD) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('🤝 멀티시그 거래 생성 중...', { assetId, buyerAddress, agreedPriceUSD });
      
      const transaction = await contract.createMultisigTrade(
        assetId,
        buyerAddress,
        Math.floor(agreedPriceUSD),
        { gasLimit: ethers.utils.hexlify(300000) }
      );

      console.log('⏳ 거래 생성 트랜잭션 대기 중:', transaction.hash);
      const receipt = await transaction.wait();
      
      // 이벤트에서 거래 ID 추출
      const tradeCreatedEvent = receipt.events?.find(
        event => event.event === 'MultisigTradeCreated'
      );
      
      const tradeId = tradeCreatedEvent?.args?.tradeId;
      console.log('🎉 멀티시그 거래 생성 완료! Trade ID:', tradeId?.toString());

      return {
        success: true,
        tradeId: tradeId?.toString(),
        transactionHash: transaction.hash
      };

    } catch (error) {
      console.error('❌ 거래 생성 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signTrade = async (tradeId, agreedPriceUSD) => {
    if (!isConnected || !contract) {
      throw new Error('지갑이 연결되지 않았거나 컨트랙트를 찾을 수 없습니다.');
    }

    setLoading(true);
    try {
      console.log('✍️ 거래 서명 및 결제 중...', { tradeId, agreedPriceUSD });
      
      // 거래 금액을 BNB로 변환
      const priceInBNB = await usdToBnb(agreedPriceUSD);
      
      const transaction = await contract.signTrade(tradeId, {
        value: priceInBNB,
        gasLimit: ethers.utils.hexlify(300000)
      });

      console.log('⏳ 거래 서명 트랜잭션 대기 중:', transaction.hash);
      await transaction.wait();
      console.log('✅ 거래 서명 및 결제 완료');

      return {
        success: true,
        transactionHash: transaction.hash
      };

    } catch (error) {
      console.error('❌ 거래 서명 실패:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('insufficient funds')) {
        errorMessage = `BNB 잔액이 부족합니다. $${agreedPriceUSD} USD 결제를 위해 더 많은 BNB가 필요합니다.`;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createTrade, signTrade, loading };
};

// 📊 컨트랙트 데이터 조회 함수
export const useContractData = () => {
  const { contract, isConnected } = useWeb3();

  const getAsset = async (assetId) => {
    if (!isConnected || !contract) {
      throw new Error('컨트랙트가 연결되지 않았습니다.');
    }

    try {
      console.log('📊 자산 정보 조회 중...', assetId);
      const asset = await contract.getAsset(assetId);
      
      return {
        companyName: asset.companyName,
        productName: asset.productName,
        category: asset.category,
        surrenderValueUSD: asset.surrenderValueUSD.toString(),
        aiValueUSD: asset.aiValueUSD.toString(),
        riskGrade: asset.riskGrade,
        status: asset.status,
        owner: asset.owner
      };
    } catch (error) {
      console.error('❌ 자산 정보 조회 실패:', error);
      throw error;
    }
  };

  const getTrade = async (tradeId) => {
    if (!isConnected || !contract) {
      throw new Error('컨트랙트가 연결되지 않았습니다.');
    }

    try {
      console.log('📊 거래 정보 조회 중...', tradeId);
      const trade = await contract.getTrade(tradeId);
      
      return {
        assetId: trade.assetId.toString(),
        seller: trade.seller,
        buyer: trade.buyer,
        agreedPriceUSD: trade.agreedPriceUSD.toString(),
        status: trade.status,
        createdAt: trade.createdAt.toString()
      };
    } catch (error) {
      console.error('❌ 거래 정보 조회 실패:', error);
      throw error;
    }
  };

  const getUserEscrowBalance = async (userAddress) => {
    if (!isConnected || !contract) {
      throw new Error('컨트랙트가 연결되지 않았습니다.');
    }

    try {
      console.log('💰 에스크로 잔액 조회 중...', userAddress);
      const balance = await contract.userEscrowBalance(userAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('❌ 에스크로 잔액 조회 실패:', error);
      throw error;
    }
  };

  return { getAsset, getTrade, getUserEscrowBalance };
};

// 기본 export
export default {
  useWeb3,
  useAssetRegistration,
  useAIEvaluation,
  useTrading,
  useContractData,
  CONTRACT_CONFIG
};