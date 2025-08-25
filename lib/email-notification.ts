// Simple Email Notification System
// 단순한 이메일 알림 시스템

interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

interface AssetRegistrationData {
  assetId: string;
  sellerAddress: string;
  companyName: string;
  productName: string;
  premiumPaid: number;
  currentValue: number;
  registrationTime: string;
}

interface PurchaseData {
  tradeId: string;
  assetId: string;
  sellerAddress: string;
  buyerAddress: string;
  purchaseAmount: number;
  transactionHash: string;
  purchaseTime: string;
}

export class SimpleEmailNotification {
  private adminEmail = 'info@nuklabs.com';
  private fromEmail = 'your-email@gmail.com'; // 실제 Gmail 주소로 변경

  // 판매자 매도 등록 시 관리자에게 알림
  async sendAssetRegistrationNotification(data: AssetRegistrationData): Promise<boolean> {
    try {
      const subject = `[WellSwap] 새로운 보험 자산 등록 - ${data.companyName}`;
      const body = this.generateAssetRegistrationEmail(data);

      const emailData: EmailData = {
        to: this.adminEmail,
        subject,
        body,
        from: this.fromEmail
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('매도 등록 알림 이메일 발송 실패:', error);
      return false;
    }
  }

  // 매수 완료 시 판매자와 관리자에게 알림
  async sendPurchaseNotification(data: PurchaseData): Promise<boolean> {
    try {
      const subject = `[WellSwap] 보험 자산 매수 완료 - 거래 #${data.tradeId}`;
      
      // 판매자에게 알림
      const sellerBody = this.generateSellerPurchaseEmail(data);
      const sellerEmailData: EmailData = {
        to: `${data.sellerAddress}@wellswap.com`, // 실제로는 판매자 이메일 주소 필요
        subject,
        body: sellerBody,
        from: this.fromEmail
      };

      // 관리자에게 알림
      const adminBody = this.generateAdminPurchaseEmail(data);
      const adminEmailData: EmailData = {
        to: this.adminEmail,
        subject,
        body: adminBody,
        from: this.fromEmail
      };

      // 두 이메일 모두 발송
      const sellerResult = await this.sendEmail(sellerEmailData);
      const adminResult = await this.sendEmail(adminEmailData);

      return sellerResult && adminResult;
    } catch (error) {
      console.error('매수 완료 알림 이메일 발송 실패:', error);
      return false;
    }
  }

  // 매도 등록 이메일 템플릿 생성
  private generateAssetRegistrationEmail(data: AssetRegistrationData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>새로운 보험 자산 등록</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c5aa0;">🏢 WellSwap - 새로운 보험 자산 등록</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c5aa0;">📋 등록 정보</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>자산 ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.assetId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>보험사:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.companyName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>상품명:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.productName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>납입 보험료:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">$${data.premiumPaid.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>현재 가치:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">$${data.currentValue.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>판매자 지갑:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.sellerAddress}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>등록 시간:</strong></td>
                    <td style="padding: 8px 0;">${new Date(data.registrationTime).toLocaleString()}</td>
                </tr>
            </table>
        </div>

        <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2c5aa0;">
                <strong>관리자 확인 필요:</strong><br>
                이 보험 자산이 등록되었습니다. 관리자 대시보드에서 자세한 정보를 확인하고 필요한 조치를 취하세요.
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
                WellSwap - 글로벌 보험 자산 거래 플랫폼<br>
                이 이메일은 자동으로 발송되었습니다.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // 판매자용 매수 완료 이메일 템플릿
  private generateSellerPurchaseEmail(data: PurchaseData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>보험 자산 매수 완료</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745;">🎉 WellSwap - 보험 자산 매수 완료!</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #28a745;">💰 거래 정보</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>거래 ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.tradeId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>자산 ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.assetId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>매수 금액:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">$${data.purchaseAmount.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>매수자 지갑:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.buyerAddress}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>트랜잭션 해시:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.transactionHash}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>매수 시간:</strong></td>
                    <td style="padding: 8px 0;">${new Date(data.purchaseTime).toLocaleString()}</td>
                </tr>
            </table>
        </div>

        <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #155724;">
                <strong>축하합니다!</strong><br>
                귀하의 보험 자산이 성공적으로 매수되었습니다. 정산은 자동으로 처리되며, 곧 지갑으로 수령하실 수 있습니다.
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
                WellSwap - 글로벌 보험 자산 거래 플랫폼<br>
                이 이메일은 자동으로 발송되었습니다.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // 관리자용 매수 완료 이메일 템플릿
  private generateAdminPurchaseEmail(data: PurchaseData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>보험 자산 매수 완료 - 관리자 알림</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c5aa0;">📊 WellSwap - 보험 자산 매수 완료 (관리자 알림)</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c5aa0;">💰 거래 정보</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>거래 ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.tradeId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>자산 ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.assetId}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>매수 금액:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">$${data.purchaseAmount.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>판매자 지갑:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.sellerAddress}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>매수자 지갑:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.buyerAddress}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>트랜잭션 해시:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${data.transactionHash}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>매수 시간:</strong></td>
                    <td style="padding: 8px 0;">${new Date(data.purchaseTime).toLocaleString()}</td>
                </tr>
            </table>
        </div>

        <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2c5aa0;">
                <strong>관리자 확인:</strong><br>
                새로운 거래가 완료되었습니다. 관리자 대시보드에서 거래 현황을 확인하고 필요한 조치를 취하세요.
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
                WellSwap - 글로벌 보험 자산 거래 플랫폼<br>
                이 이메일은 자동으로 발송되었습니다.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // 실제 이메일 발송 함수
  private async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Supabase Edge Function을 사용한 이메일 발송
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('✅ 이메일 발송 성공:', emailData.to);
        return true;
      } else {
        console.error('❌ 이메일 발송 실패:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ 이메일 발송 중 오류:', error);
      return false;
    }
  }
}

// 전역 인스턴스
let emailNotification: SimpleEmailNotification | null = null;

export const initializeEmailNotification = (): SimpleEmailNotification => {
  if (!emailNotification) {
    emailNotification = new SimpleEmailNotification();
  }
  return emailNotification;
};

export const getEmailNotification = (): SimpleEmailNotification | null => {
  return emailNotification;
};

export default SimpleEmailNotification;
