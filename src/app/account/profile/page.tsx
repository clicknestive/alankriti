'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  User as UserIcon, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  ShieldCheck, 
  Package, 
  Sparkles,
  Phone,
  Mail,
  Home
} from 'lucide-react';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const INDIAN_STATES = [
  'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Delhi NCR', 'Andhra Pradesh', 'Telangana',
  'Kerala', 'Gujarat', 'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Madhya Pradesh'
];

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
      setProfilePhoto(user.profilePhoto || '');
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      if (data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, profilePhoto }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Patron profile updated successfully!', 'success');
        refreshUser();
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Error saving profile changes', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleOpenNewAddress = () => {
    setEditingAddressId(null);
    setAddrForm({
      fullName: user?.name || '',
      phone: user?.mobile || '',
      street: '',
      landmark: '',
      city: '',
      state: 'Karnataka',
      pincode: '',
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddrForm({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Address removed from address book.', 'info');
        fetchAddresses();
      }
    } catch (e) {
      showToast('Failed to delete address.', 'error');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        const res = await fetch(`/api/addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addrForm),
        });
        if (res.ok) {
          showToast('Address updated.', 'success');
          setIsAddressModalOpen(false);
          fetchAddresses();
        }
      } else {
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addrForm),
        });
        if (res.ok) {
          showToast('New address saved.', 'success');
          setIsAddressModalOpen(false);
          fetchAddresses();
        }
      }
    } catch (e) {
      showToast('Error saving address.', 'error');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C6A15B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-[#1C241D] rounded-3xl p-8 text-[#FAF6F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#C6A15B]/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#BDCFB1] text-[#2A3425] flex items-center justify-center font-serif text-2xl font-bold border-2 border-[#C6A15B]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C6A15B] font-semibold">
              Alankriti Privé Patron
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">{user.name}</h1>
            <p className="text-xs text-[#BDCFB1]">{user.email}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/account/orders"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FAF6F0] hover:bg-white text-[#2A3425] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Package className="w-4 h-4 text-[#826530]" />
            <span>My Orders</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Profile Details Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DCCF] shadow-sm space-y-6">
            <div className="border-b border-[#FAF6F0] pb-4">
              <h2 className="font-serif text-xl font-bold text-[#2A3425] flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#826530]" /> Personal Profile
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Manage your name, contact phone, and boutique account details.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-stone-400 mt-1">Email cannot be modified.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A3425] uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full py-3 bg-[#5E7052] hover:bg-[#43513B] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 7 Cols: Saved Addresses */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DCCF] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2A3425] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#826530]" /> Saved Address Book
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Manage multiple delivery addresses for family, festive gifting, and destination celebrations.
                </p>
              </div>

              <button
                onClick={handleOpenNewAddress}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E6EFE2] hover:bg-[#5E7052] text-[#2A3425] hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.length === 0 ? (
                <div className="sm:col-span-2 py-8 text-center text-xs text-stone-500 bg-[#FAF6F0] rounded-2xl border border-dashed border-[#BDCFB1]">
                  No saved addresses found. Click "Add Address" to store your delivery details.
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E3DCCF] flex flex-col justify-between space-y-3 relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#2A3425]">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="bg-[#5E7052] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {addr.street}, {addr.landmark ? `${addr.landmark}, ` : ''}
                        {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="p-1 text-stone-500 hover:text-[#826530] text-xs flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Edit/Add Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#C6A15B]/40 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#2A3425]">
              {editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#2A3425] mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={addrForm.fullName}
                  onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2A3425] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={addrForm.phone}
                  onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2A3425] mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={addrForm.street}
                  onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2A3425] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2A3425] mb-1">State *</label>
                  <select
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2A3425] mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addrForm.pincode}
                    onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2A3425] mb-1">Landmark</label>
                  <input
                    type="text"
                    value={addrForm.landmark}
                    onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#BDCFB1] rounded-xl text-xs text-[#2A3425] focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addrForm.isDefault}
                  onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                  className="rounded text-[#5E7052] focus:ring-[#5E7052]"
                />
                <label htmlFor="isDefault" className="text-xs text-stone-700">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#5E7052] hover:bg-[#43513B] text-white font-semibold uppercase tracking-wider rounded-xl"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
