import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  CreditCard,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  formTitle: string;
  amount: number;
  onPaymentSuccess: (paymentDetails: {
    status: 'PAID';
    amount: number;
    txn_id: string;
    order_id: string;
    payment_mode: string;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  studentName,
  formTitle,
  amount,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi_qr' | 'upi_app' | 'card' | 'netbanking'>('upi_qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [upiId, setUpiId] = useState('student@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      setTimeout(() => {
        const txn_id = `TXN_${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
        const order_id = `ORDER_${Date.now()}`;
        onPaymentSuccess({
          status: 'PAID',
          amount,
          txn_id,
          order_id,
          payment_mode: selectedMethod === 'upi_qr' ? 'QR_SCAN' : selectedMethod === 'upi_app' ? 'UPI' : selectedMethod === 'card' ? 'DEBIT_CARD' : 'NET_BANKING',
        });
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
              ₹
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white">
                BSEDRC Pariksha Fees Payment Gateway
              </h3>
              <p className="text-[11px] text-slate-400">
                Bihar State Educational Development & Research Council
              </p>
            </div>
          </div>
          <button
            id="close-payment-modal-btn"
            onClick={onClose}
            disabled={isProcessing || isSuccess}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary banner */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-6 py-3 flex justify-between items-center text-xs">
          <div>
            <p className="font-semibold text-slate-900 truncate max-w-[260px]">{formTitle}</p>
            <p className="text-slate-600 text-[11px]">Umeedwaar (Candidate): <strong className="text-slate-900">{studentName}</strong></p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Kul Shulk (Payable)</span>
            <span className="text-lg font-black text-amber-700">₹{amount.toFixed(2)}</span>
          </div>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Payment Safal Raha!</h4>
            <p className="text-xs text-slate-600 mb-4">
              Aapka unique Registration ID aur raseed (receipt) banaya ja raha hai...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-2 rounded-lg border border-emerald-200">
              <Loader2 className="w-4 h-4 animate-spin" /> Student Admission Pura Ho Raha Hai
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Payment ka Tarika Chunein
            </p>

            {/* Payment Method Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              <button
                type="button"
                id="pay-method-qr"
                onClick={() => setSelectedMethod('upi_qr')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedMethod === 'upi_qr'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto mb-1 text-slate-800" />
                <span className="text-[11px] font-semibold block">QR Scan</span>
              </button>

              <button
                type="button"
                id="pay-method-upi"
                onClick={() => setSelectedMethod('upi_app')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedMethod === 'upi_app'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-slate-800" />
                <span className="text-[11px] font-semibold block">UPI Apps</span>
              </button>

              <button
                type="button"
                id="pay-method-card"
                onClick={() => setSelectedMethod('card')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedMethod === 'card'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-slate-800" />
                <span className="text-[11px] font-semibold block">ATM / Card</span>
              </button>

              <button
                type="button"
                id="pay-method-netbanking"
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedMethod === 'netbanking'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building className="w-5 h-5 mx-auto mb-1 text-slate-800" />
                <span className="text-[11px] font-semibold block">NetBanking</span>
              </button>
            </div>

            {/* Dynamic Method Content */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
              {selectedMethod === 'upi_qr' && (
                <div className="text-center">
                  <div className="inline-block p-3 bg-white rounded-xl border border-slate-300 shadow-xs mb-2">
                    {/* Visual QR Code Pattern */}
                    <div className="w-36 h-36 bg-slate-900 p-2 rounded-lg flex flex-col justify-between items-center relative overflow-hidden">
                      <div className="w-full flex justify-between">
                        <div className="w-8 h-8 border-4 border-amber-400 bg-white"></div>
                        <div className="w-8 h-8 border-4 border-amber-400 bg-white"></div>
                      </div>
                      <div className="w-full flex items-center justify-center my-auto">
                        <span className="text-[9px] font-mono text-white bg-slate-800 px-1 py-0.5 rounded">
                          BSEDRC-PAY-₹{amount}
                        </span>
                      </div>
                      <div className="w-full flex justify-between">
                        <div className="w-8 h-8 border-4 border-amber-400 bg-white"></div>
                        <div className="w-6 h-6 border-2 border-dashed border-amber-300"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Kisi bhi UPI App (Google Pay, PhonePe, Paytm, BHIM) se Scan Karein
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official UPI ID: <span className="font-mono font-medium text-slate-700">bsedrc.council@sbi</span>
                  </p>
                </div>
              )}

              {selectedMethod === 'upi_app' && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-700">
                    Apna UPI ID (VPA) Dalein
                  </label>
                  <input
                    type="text"
                    id="upi-id-input"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="apnaname@oksbi"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <div className="flex gap-2 text-[11px] text-slate-500">
                    <span className="px-2 py-1 bg-white border rounded">@okaxis</span>
                    <span className="px-2 py-1 bg-white border rounded">@oksbi</span>
                    <span className="px-2 py-1 bg-white border rounded">@paytm</span>
                  </div>
                </div>
              )}

              {selectedMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Debit / Credit Card Number</label>
                    <input
                      type="text"
                      id="card-number-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Mahina/Saal</label>
                      <input
                        type="text"
                        defaultValue="08/29"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">CVV Code</label>
                      <input
                        type="password"
                        defaultValue="892"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'netbanking' && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-700">Bank Chunein</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button type="button" className="p-2 bg-white border rounded-lg text-left font-medium hover:border-amber-500">
                      State Bank of India
                    </button>
                    <button type="button" className="p-2 bg-white border rounded-lg text-left font-medium hover:border-amber-500">
                      HDFC Bank
                    </button>
                    <button type="button" className="p-2 bg-white border rounded-lg text-left font-medium hover:border-amber-500">
                      ICICI Bank
                    </button>
                    <button type="button" className="p-2 bg-white border rounded-lg text-left font-medium hover:border-amber-500">
                      Punjab National Bank
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pay Action Button */}
            <button
              id="confirm-pay-btn"
              type="button"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Surakshit Payment Process Ho Raha Hai ₹{amount.toFixed(2)}...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Abhi Pay Karein ₹{amount.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Turant Registration
              </span>
              <span>•</span>
              <span>100% Surakshit Transaction</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
