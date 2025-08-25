'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  DollarSign, 
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Settings
} from 'lucide-react';
import { supabase } from '../lib/database-wellswap';

interface AdminDashboardProps {
  isVisible: boolean;
  adminWalletAddress: string;
}

interface TradeData {
  id: string;
  asset_id: string;
  seller_address: string;
  buyer_address: string;
  status: string;
  created_at: string;
  amount: number;
}

interface AssetData {
  id: string;
  company_name: string;
  product_name: string;
  status: string;
  created_at: string;
  seller_address: string;
}

interface UserData {
  id: string;
  wallet_address: string;
  email?: string;
  created_at: string;
  last_login?: string;
}

interface InquiryData {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard({ isVisible, adminWalletAddress }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalAssets: 0,
    totalUsers: 0,
    totalInquiries: 0,
    pendingTrades: 0,
    pendingInquiries: 0
  });

  // 관리자 권한 확인
  const isAdmin = adminWalletAddress && adminWalletAddress.toLowerCase() === '0x8A627a75d04bF3c709154205DFBBB6f4ed10DCB0'.toLowerCase();

  useEffect(() => {
    if (isVisible && isAdmin) {
      loadDashboardData();
    }
  }, [isVisible, isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 거래 데이터 로드
      const { data: tradesData } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // 자산 데이터 로드
      const { data: assetsData } = await supabase
        .from('insurance_assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // 사용자 데이터 로드
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // 문의 데이터 로드
      const { data: inquiriesData } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setTrades(tradesData || []);
      setAssets(assetsData || []);
      setUsers(usersData || []);
      setInquiries(inquiriesData || []);

      // 통계 계산
      setStats({
        totalTrades: tradesData?.length || 0,
        totalAssets: assetsData?.length || 0,
        totalUsers: usersData?.length || 0,
        totalInquiries: inquiriesData?.length || 0,
        pendingTrades: tradesData?.filter(t => t.status === 'pending').length || 0,
        pendingInquiries: inquiriesData?.filter(i => i.status === 'pending').length || 0
      });

    } catch (error) {
      console.error('관리자 대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiryStatusUpdate = async (inquiryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', inquiryId);

      if (!error) {
        setInquiries(prev => 
          prev.map(inquiry => 
            inquiry.id === inquiryId 
              ? { ...inquiry, status } 
              : inquiry
          )
        );
      }
    } catch (error) {
      console.error('문의 상태 업데이트 실패:', error);
    }
  };

  if (!isVisible || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-gray-600 mt-2">WellSwap 플랫폼 관리</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">관리자 지갑</p>
                <p className="text-sm font-mono text-gray-700">
                  {adminWalletAddress.slice(0, 6)}...{adminWalletAddress.slice(-4)}
                </p>
              </div>
              <button
                onClick={loadDashboardData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 거래</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrades}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">등록 자산</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">가입자</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">문의</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                개요
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'trades'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="h-4 w-4 inline mr-2" />
                거래 현황
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                매도 등록
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                가입자
              </button>
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inquiries'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                컨시어지 문의
              </button>
            </nav>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* 개요 탭 */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">최근 거래</h4>
                        {trades.slice(0, 5).map((trade) => (
                          <div key={trade.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                거래 #{trade.id.slice(0, 8)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(trade.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              trade.status === 'completed' ? 'bg-green-100 text-green-800' :
                              trade.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {trade.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">최근 문의</h4>
                        {inquiries.slice(0, 5).map((inquiry) => (
                          <div key={inquiry.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {inquiry.subject}
                              </p>
                              <p className="text-xs text-gray-500">
                                {inquiry.email} • {new Date(inquiry.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              inquiry.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {inquiry.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 거래 현황 탭 */}
                {activeTab === 'trades' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">거래 현황</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              거래 ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              자산 ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              판매자
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              구매자
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              금액
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              상태
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              날짜
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {trades.map((trade) => (
                            <tr key={trade.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {trade.id.slice(0, 8)}...
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {trade.asset_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {trade.seller_address.slice(0, 6)}...{trade.seller_address.slice(-4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {trade.buyer_address.slice(0, 6)}...{trade.buyer_address.slice(-4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${trade.amount?.toLocaleString() || '0'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  trade.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  trade.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {trade.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(trade.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 매도 등록 탭 */}
                {activeTab === 'assets' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">매도 등록 내역</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              자산 ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              보험사
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              상품명
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              판매자
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              상태
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              등록일
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assets.map((asset) => (
                            <tr key={asset.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {asset.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {asset.company_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {asset.product_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {asset.seller_address.slice(0, 6)}...{asset.seller_address.slice(-4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  asset.status === 'available' ? 'bg-green-100 text-green-800' :
                                  asset.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                  asset.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {asset.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(asset.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 가입자 탭 */}
                {activeTab === 'users' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">가입자 목록</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              사용자 ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              지갑 주소
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              이메일
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              가입일
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              마지막 로그인
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.email || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 컨시어지 문의 탭 */}
                {activeTab === 'inquiries' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">컨시어지 문의</h3>
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {inquiry.subject}
                                </h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  inquiry.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {inquiry.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>보낸 사람:</strong> {inquiry.name} ({inquiry.email})
                              </p>
                              <p className="text-sm text-gray-600 mb-3">
                                <strong>날짜:</strong> {new Date(inquiry.created_at).toLocaleString()}
                              </p>
                              <div className="bg-white rounded p-3">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {inquiry.message}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex flex-col space-y-2">
                              {inquiry.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleInquiryStatusUpdate(inquiry.id, 'resolved')}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                  >
                                    해결됨
                                  </button>
                                  <button
                                    onClick={() => handleInquiryStatusUpdate(inquiry.id, 'in_progress')}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                  >
                                    진행중
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => window.open(`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`, '_blank')}
                                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                              >
                                이메일 답장
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
