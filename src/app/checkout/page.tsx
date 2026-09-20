'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import StepDetails from '@/components/checkout/StepDetails';
import StepAddress from '@/components/checkout/StepAddress';
import StepSummary from '@/components/checkout/StepSummary';
import StepPayment from '@/components/checkout/StepPayment';
import StepConfirmation from '@/components/checkout/StepConfirmation';
import { Check, ShieldCheck, Lock, Sparkles } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Customer Details' },
  { id: 2, name: 'Shipping Address' },
  { id: 3, name: 'Order Review' },
  { id: 4, name: 'Payment' },
  { id: 5, name: 'Confirmation' },
];

export default function CheckoutPage() {
  const { items, subtotal, discount, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Form State
  const [customerData, setCustomerData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
  });

  const [addressData, setAddressData] = useState({
    fullName: user?.name || '',
    phone: user?.mobile || '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (user) {
      setCustomerData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        mobile: user.mobile || prev.mobile,
      }));
    }
  }, [user]);

  // Handle Payment Settlement & Order Creation
  const handlePaymentSuccess = async (paymentResult: {
    paymentMethod: string;
    paymentStatus: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    confirmedOrder?: any;
  }) => {
    setIsProcessing(true);

    // If order was already confirmed atomically via /api/payment/razorpay/verify
    if (paymentResult.confirmedOrder) {
      const order = paymentResult.confirmedOrder;
      let shippingAddress: any = addressData;
      try {
        if (typeof order.shippingAddressSnapshot === 'string') {
          shippingAddress = JSON.parse(order.shippingAddressSnapshot);
        }
      } catch (e) {}

      setConfirmedOrder({
        ...order,
        shippingAddress,
      });
      clearCart();
      setCurrentStep(5);
      setIsProcessing(false);
      showToast(`Bespoke Order ${order.id} confirmed successfully!`, 'success');
      return;
    }

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
          paymentMethod: paymentResult.paymentMethod,
          paymentStatus: paymentResult.paymentStatus,
          razorpayOrderId: paymentResult.razorpayOrderId,
          razorpayPaymentId: paymentResult.razorpayPaymentId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        setConfirmedOrder({
          ...data.order,
          shippingAddress: JSON.parse(data.order.shippingAddressSnapshot),
        });
        clearCart();
        setCurrentStep(5);
        showToast(`Bespoke Order ${data.order.id} placed successfully!`, 'success');
      } else {
        showToast(data.error || 'Failed to place order', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while creating your order. Please contact concierge.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && currentStep !== 5) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#2A3425]">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-stone-500">
          Please add a saree to your shopping bag before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 bg-[#5E7052] text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
        >
          Explore Sarees
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Title */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-[0.25em] text-[#826530] font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
          Alankriti Privé Checkout
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A3425]">
          Secure Boutique Checkout
        </h1>
      </div>

      {/* 5-Step Progress Stepper */}
      <div className="relative">
        <div className="hidden sm:flex items-center justify-between relative z-10">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#5E7052] text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#C6A15B] text-white ring-4 ring-[#C6A15B]/20 shadow-md scale-110'
                      : 'bg-white text-stone-400 border border-[#E3DCCF]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-2 uppercase tracking-wider text-center ${
                    isCurrent ? 'text-[#826530]' : 'text-stone-400'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="sm:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#E3DCCF] text-xs">
          <span className="font-semibold text-[#826530]">
            Step {currentStep} of 5: {STEPS[currentStep - 1]?.name}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            {Math.round((currentStep / 5) * 100)}% Completed
          </span>
        </div>
      </div>

      {/* Step Content Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3DCCF] shadow-sm">
        {currentStep === 1 && (
          <StepDetails
            formData={customerData}
            setFormData={setCustomerData}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepAddress
            addressData={addressData}
            setAddressData={setAddressData}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepSummary
            items={items}
            subtotal={subtotal}
            discount={discount}
            shipping={shipping}
            total={total}
            customerData={customerData}
            addressData={addressData}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <StepPayment
            total={total}
            items={items}
            customerData={customerData}
            addressData={addressData}
            discount={discount}
            shipping={shipping}
            onPaymentSuccess={handlePaymentSuccess}
            onBack={() => setCurrentStep(3)}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 5 && confirmedOrder && (
          <StepConfirmation order={confirmedOrder} />
        )}
      </div>

      {/* Security Footer */}
      {currentStep !== 5 && (
        <div className="flex items-center justify-center gap-6 text-xs text-stone-500 pt-2">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#5E7052]" />
            256-bit SSL Secure Checkout
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
            Razorpay Verified Gateway
          </span>
        </div>
      )}
    </div>
  );
}
