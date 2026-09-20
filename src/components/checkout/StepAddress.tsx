'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, ArrowLeft, ArrowRight, Plus, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface StepAddressProps {
  addressData: {
    fullName: string;
    phone: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
  };
  setAddressData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi NCR'
];

export default function StepAddress({
  addressData,
  setAddressData,
  onNext,
  onBack,
}: StepAddressProps) {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [useCustomForm, setUseCustomForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/addresses')
        .then((res) => res.json())
        .then((data) => {
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setAddressData({
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              street: defaultAddr.street,
              landmark: defaultAddr.landmark || '',
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
            });
          } else {
            setUseCustomForm(true);
          }
        })
        .catch(() => setUseCustomForm(true));
    } else {
      setUseCustomForm(true);
    }
  }, [user]);

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setUseCustomForm(false);
    setAddressData({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      addressData.fullName &&
      addressData.phone &&
      addressData.street &&
      addressData.city &&
      addressData.state &&
      addressData.pincode
    ) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border-b border-[#FAF6F0] pb-4">
        <h3 className="font-serif text-xl font-bold text-[#2A3425]">
          2. Destination & Delivery Address
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Complimentary insured courier delivery with bespoke tamper-proof boutique packaging.
        </p>
      </div>

      {/* Saved Addresses Picker */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider">
            Choose from Saved Addresses
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => handleSelectAddress(addr)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedAddressId === addr.id && !useCustomForm
                    ? 'border-[#C6A15B] bg-[#FAF6F0] ring-2 ring-[#C6A15B]/30'
                    : 'border-[#E3DCCF] bg-white hover:border-[#BDCFB1]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-xs text-[#2A3425]">{addr.fullName}</span>
                  {selectedAddressId === addr.id && !useCustomForm && (
                    <span className="w-5 h-5 rounded-full bg-[#5E7052] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setUseCustomForm(true);
                setSelectedAddressId(null);
              }}
              className={`text-xs font-semibold flex items-center gap-1.5 py-2 px-3 rounded-lg border transition-colors ${
                useCustomForm
                  ? 'bg-[#E6EFE2] text-[#43513B] border-[#A8B89A]'
                  : 'text-[#826530] border-dashed border-[#C6A15B]/60 hover:bg-[#FAF6F0]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enter a Different Shipping Address</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual / New Address Form */}
      {(useCustomForm || savedAddresses.length === 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              Recipient Name *
            </label>
            <input
              type="text"
              required
              value={addressData.fullName}
              onChange={(e) => setAddressData((prev: any) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Recipient full name"
              className="w-full px-3.5 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              Delivery Phone Number *
            </label>
            <input
              type="tel"
              required
              value={addressData.phone}
              onChange={(e) => setAddressData((prev: any) => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              House/Flat No, Building, Street Address *
            </label>
            <input
              type="text"
              required
              value={addressData.street}
              onChange={(e) => setAddressData((prev: any) => ({ ...prev, street: e.target.value }))}
              placeholder="e.g. Flat 302, Palm Grove, 12th Main Rd"
              className="w-full px-3.5 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={addressData.landmark}
              onChange={(e) => setAddressData((prev: any) => ({ ...prev, landmark: e.target.value }))}
              placeholder="Near Metro Station / Temple"
              className="w-full px-3.5 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              City *
            </label>
            <input
              type="text"
              required
              value={addressData.city}
              onChange={(e) => setAddressData((prev: any) => ({ ...prev, city: e.target.value }))}
              placeholder="City / Town"
              className="w-full px-3.5 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              State *
            </label>
            <select
              required
              value={addressData.state}
              onChange={(e) => setAddressData((prev: any) => ({ ...prev, state: e.target.value }))}
              className="w-full px-3.5 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
              Postal PIN Code *
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={addressData.pincode}
              onChange={(e) => setAddressData((prev: any) => ({ ...prev, pincode: e.target.value }))}
              placeholder="6-digit PIN code (e.g. 560038)"
              className="w-full px-3.5 py-3 bg-white border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 border border-[#BDCFB1] hover:bg-[#E6EFE2] active:scale-95 text-[#2A3425] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-[#5E7052] hover:bg-[#43513B] active:scale-95 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 shadow-sm cursor-pointer"
        >
          <span>Continue to Order Summary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
