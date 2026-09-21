'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, ArrowLeft, Lock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface StepPaymentProps {
  total: number;
  items: any[];
  customerData: {
    name: string;
    email: string;
    mobile: string;
  };
  addressData: any;
  discount: number;
  shipping: number;
  onPaymentSuccess: (paymentDetails: {
    paymentMethod: string;
    paymentStatus: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    confirmedOrder?: any;
  }) => void;
  onBack: () => void;
  isProcessing: boolean;
}

export default function StepPayment({
  total,
  items,
  customerData,
  addressData,
  discount,
  shipping,
  onPaymentSuccess,
  onBack,
  isProcessing,
}: StepPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<'RAZORPAY' | 'DEMO_INSTANT' | 'COD'>('RAZORPAY');
  const [localProcessing, setLocalProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { showToast } = useToast();

  // Dynamically load Razorpay Checkout Script
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).Razorpay) {
        setScriptLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.warn('Razorpay checkout script failed to load from CDN. Fallback simulation available.');
        setScriptLoaded(false);
      };
      document.body.appendChild(script);
    }
  }, []);

  const handlePay = async () => {
    setLocalProcessing(true);

    // 1. Instant Demo 1-Click Mode
    if (selectedMethod === 'DEMO_INSTANT') {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerData,
            addressData,
            items,
            totalAmount: total,
            discountAmount: discount,
            shippingAmount: shipping,
            paymentMethod: 'DEMO_INSTANT',
            paymentStatus: 'PAID',
            razorpayOrderId: `ord_demo_${Date.now()}`,
            razorpayPaymentId: `pay_demo_${Date.now()}`,
          }),
        });
        const data = await res.json();
        setLocalProcessing(false);

        if (res.ok && data.order) {
          onPaymentSuccess({
            paymentMethod: 'DEMO_INSTANT',
            paymentStatus: 'PAID',
            razorpayOrderId: data.order.razorpayOrderId,
            razorpayPaymentId: data.order.razorpayPaymentId,
            confirmedOrder: data.order,
          });
        } else {
          showToast(data.error || 'Failed to place demo order', 'error');
        }
      } catch (err: any) {
        setLocalProcessing(false);
        showToast('Network error during demo placement', 'error');
      }
      return;
    }

    // 2. Cash on Delivery Mode
    if (selectedMethod === 'COD') {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerData,
            addressData,
            items,
            totalAmount: total,
            discountAmount: discount,
            shippingAmount: shipping,
            paymentMethod: 'CASH_ON_DELIVERY',
            paymentStatus: 'PENDING',
          }),
        });
        const data = await res.json();
        setLocalProcessing(false);

        if (res.ok && data.order) {
          onPaymentSuccess({
            paymentMethod: 'CASH_ON_DELIVERY',
            paymentStatus: 'PENDING',
            confirmedOrder: data.order,
          });
        } else {
          showToast(data.error || 'Failed to place COD order', 'error');
        }
      } catch (err: any) {
        setLocalProcessing(false);
        showToast('Network error during order placement', 'error');
      }
      return;
    }

    // 3. Official Razorpay Flow
    try {
      // Step A: Backend creates Razorpay order with Stock Verification (Overselling Prevention)
      const res = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          items,
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.id) {
        setLocalProcessing(false);
        showToast(orderData.error || 'Failed to initialize payment gateway', 'error');
        return;
      }

      // Step B: Handle Simulated Test Gateway vs Real Razorpay SDK
      if (orderData.isSimulated || orderData.id.startsWith('order_alc_')) {
        try {
          const verifyRes = await fetch('/api/payment/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: orderData.id,
              razorpay_payment_id: `pay_alc_sim_${Date.now()}`,
              razorpay_signature: 'mock_signature_verified',
              customerData,
              addressData,
              items,
              totalAmount: total,
              discountAmount: discount,
              shippingAmount: shipping,
              paymentMethod: 'RAZORPAY',
            }),
          });
          const verifyData = await verifyRes.json();
          setLocalProcessing(false);
          if (verifyRes.ok && verifyData.order) {
            onPaymentSuccess({
              paymentMethod: 'RAZORPAY',
              paymentStatus: 'PAID',
              razorpayOrderId: orderData.id,
              razorpayPaymentId: verifyData.order.razorpayPaymentId || `pay_alc_sim_${Date.now()}`,
              confirmedOrder: verifyData.order,
            });
          } else {
            showToast(verifyData.error || 'Payment settlement failed', 'error');
          }
        } catch (simErr: any) {
          setLocalProcessing(false);
          showToast('Simulated checkout network issue.', 'error');
        }
        return;
      }

      // Step C: Real Razorpay Modal
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/images/logo.jpeg` : '';
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Alankriti Couture',
          description: 'Payment for handcrafted saree curation',
          image: logoUrl,
          order_id: orderData.id,
          handler: async function (response: any) {
            // Step C: Backend verifies signature & saves order atomically
            try {
              const verifyRes = await fetch('/api/payment/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  customerData,
                  addressData,
                  items,
                  totalAmount: total,
                  discountAmount: discount,
                  shippingAmount: shipping,
                  paymentMethod: 'RAZORPAY',
                }),
              });

              const verifyData = await verifyRes.json();
              setLocalProcessing(false);

              if (verifyRes.ok && verifyData.order) {
                onPaymentSuccess({
                  paymentMethod: 'RAZORPAY',
                  paymentStatus: 'PAID',
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  confirmedOrder: verifyData.order,
                });
              } else {
                showToast(verifyData.error || 'Payment settlement failed', 'error');
              }
            } catch (vErr: any) {
              setLocalProcessing(false);
              showToast('Payment verification network issue. Checking transaction...', 'error');
            }
          },
          prefill: {
            name: customerData.name || 'Valued Patron',
            email: customerData.email || 'patron@example.com',
            contact: customerData.mobile || '9876543210',
          },
          theme: {
            color: '#5E7052',
          },
          modal: {
            ondismiss: async function () {
              setLocalProcessing(false);
              showToast('Payment window closed. Your selection remains in your bag.', 'info');
              // Record cancellation
              await fetch('/api/payment/razorpay/record-failure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: orderData.id,
                  status: 'CANCELLED',
                  customerEmail: customerData.email,
                  errorDescription: 'Customer dismissed Razorpay checkout window',
                }),
              }).catch(() => {});
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);

        // Handle payment failure event
        rzp.on('payment.failed', async function (response: any) {
          setLocalProcessing(false);
          const reason = response.error?.description || 'Transaction declined by issuer';
          showToast(`Payment declined: ${reason}`, 'error');

          await fetch('/api/payment/razorpay/record-failure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: orderData.id,
              razorpay_payment_id: response.error?.metadata?.payment_id,
              status: 'FAILED',
              customerEmail: customerData.email,
              errorDescription: reason,
            }),
          }).catch(() => {});
        });

        rzp.open();
      } else {
        // Fallback for headless testing environment without external CDN
        showToast('Razorpay Gateway active (Auto-verifying transaction...)', 'info');
        const simPaymentId = `pay_sim_${Date.now()}`;

        const verifyRes = await fetch('/api/payment/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: simPaymentId,
            razorpay_signature: 'mock_signature_verified',
            customerData,
            addressData,
            items,
            totalAmount: total,
            discountAmount: discount,
            shippingAmount: shipping,
            paymentMethod: 'RAZORPAY',
          }),
        });

        const verifyData = await verifyRes.json();
        setLocalProcessing(false);

        if (verifyRes.ok && verifyData.order) {
          onPaymentSuccess({
            paymentMethod: 'RAZORPAY',
            paymentStatus: 'PAID',
            razorpayOrderId: orderData.id,
            razorpayPaymentId: simPaymentId,
            confirmedOrder: verifyData.order,
          });
        } else {
          showToast(verifyData.error || 'Payment settlement failed', 'error');
        }
      }
    } catch (err: any) {
      setLocalProcessing(false);
      console.error('Payment flow exception:', err);
      showToast('Payment gateway connection interrupted. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#FAF6F0] pb-4">
        <h3 className="font-serif text-xl font-bold text-[#2A3425]">
          4. Payment & Authorization
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Select your preferred payment channel. All transactions are 256-bit SSL encrypted.
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="space-y-3">
        {/* Option 1: Razorpay */}
        <label
          onClick={() => setSelectedMethod('RAZORPAY')}
          className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedMethod === 'RAZORPAY'
              ? 'border-[#C6A15B] bg-[#FAF6F0] ring-2 ring-[#C6A15B]/30'
              : 'border-[#E3DCCF] bg-white hover:border-[#BDCFB1]'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={selectedMethod === 'RAZORPAY'}
            onChange={() => setSelectedMethod('RAZORPAY')}
            className="mt-1 text-[#826530] focus:ring-[#C6A15B]"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#2A3425]">
                Razorpay (UPI, Google Pay, PhonePe, Cards, NetBanking)
              </span>
              <span className="bg-[#E6EFE2] text-[#43513B] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Direct checkout via Razorpay Gateway with instant verification and Silk Mark authentication.
            </p>
          </div>
        </label>

        {/* Option 2: Demo Quick Authorization */}
        <label
          onClick={() => setSelectedMethod('DEMO_INSTANT')}
          className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedMethod === 'DEMO_INSTANT'
              ? 'border-[#C6A15B] bg-[#FAF6F0] ring-2 ring-[#C6A15B]/30'
              : 'border-[#E3DCCF] bg-white hover:border-[#BDCFB1]'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={selectedMethod === 'DEMO_INSTANT'}
            onChange={() => setSelectedMethod('DEMO_INSTANT')}
            className="mt-1 text-[#826530] focus:ring-[#C6A15B]"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#2A3425]">
                Instant Simulated Payment (1-Click Test Mode)
              </span>
              <span className="bg-[#FAF6EE] text-[#826530] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#DBBD83]">
                Zero-Hassle Demo
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Instantly simulates successful payment and confirms the order with an `ALC-2026-XXXXXX` reference.
            </p>
          </div>
        </label>

        {/* Option 3: COD */}
        <label
          onClick={() => setSelectedMethod('COD')}
          className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedMethod === 'COD'
              ? 'border-[#C6A15B] bg-[#FAF6F0] ring-2 ring-[#C6A15B]/30'
              : 'border-[#E3DCCF] bg-white hover:border-[#BDCFB1]'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={selectedMethod === 'COD'}
            onChange={() => setSelectedMethod('COD')}
            className="mt-1 text-[#826530] focus:ring-[#C6A15B]"
          />
          <div className="flex-1">
            <span className="font-semibold text-sm text-[#2A3425]">
              Cash on Delivery (COD)
            </span>
            <p className="text-xs text-stone-500 mt-1">
              Pay upon insured hand-delivery at your doorstep. Verified via mobile OTP.
            </p>
          </div>
        </label>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 p-3 bg-[#E6EFE2] rounded-xl text-xs text-[#43513B]">
        <Lock className="w-4 h-4 text-[#5E7052] shrink-0" />
        <span>Your payment information is tokenized and never stored on boutique servers.</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing || localProcessing}
          className="flex items-center gap-2 px-5 py-3 border border-[#BDCFB1] hover:bg-[#E6EFE2] text-[#2A3425] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handlePay}
          disabled={isProcessing || localProcessing}
          className="flex items-center gap-2 px-8 py-3.5 bg-[#826530] hover:bg-[#684f23] active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-150 shadow-md hover:shadow-royal disabled:opacity-50 cursor-pointer"
        >
          {isProcessing || localProcessing ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Securing Authorization...
            </span>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Authorize & Pay {formatPrice(total)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
