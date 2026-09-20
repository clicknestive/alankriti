import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Alankriti Couture database...');

  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  const adminEmail = (process.env.ADMIN_USERNAME || 'admin@alankriticouture.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AlankritiAdmin@2026';
  const adminUser = await prisma.user.create({
    data: {
      name: 'Alankriti Administrator',
      email: adminEmail,
      mobile: '+91 80 4567 8900',
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      role: 'ADMIN',
    },
  });

  const cpHash = bcrypt.hashSync('Alankriti@123', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Priyanka Sharma', email: 'priyanka@example.com', mobile: '+91 98765 43210',
      passwordHash: cpHash, role: 'CUSTOMER',
      addresses: { create: [{ fullName: 'Priyanka Sharma', phone: '+91 98765 43210', street: 'Flat 402, Royal Palms Apartments, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', isDefault: true }] },
    },
  });
  await prisma.user.create({ data: { name: 'Ananya Deshmukh', email: 'ananya@example.com', mobile: '+91 98220 12345', passwordHash: cpHash, role: 'CUSTOMER' } });
  await prisma.user.create({ data: { name: 'Meera Iyer', email: 'meera@example.com', mobile: '+91 94440 98765', passwordHash: cpHash, role: 'CUSTOMER' } });

  const cats = await Promise.all([
    prisma.category.create({ data: { name: 'Pure Silk', slug: 'pure-silk', description: 'Lustrous pure silk sarees with rich zari borders.', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', sortOrder: 1, isActive: true } }),
    prisma.category.create({ data: { name: 'Semi Crepe', slug: 'semi-crepe', description: 'Lightweight semi-crepe drapes blending grace with modern comfort.', imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', sortOrder: 2, isActive: true } }),
    prisma.category.create({ data: { name: 'Organza', slug: 'organza', description: 'Sheer dreamy organza sarees with delicate embroidery.', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', sortOrder: 3, isActive: true } }),
    prisma.category.create({ data: { name: 'Cotton Handloom', slug: 'cotton-handloom', description: 'Breathable handwoven cotton sarees for everyday luxury.', imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', sortOrder: 4, isActive: true } }),
    prisma.category.create({ data: { name: 'Georgette', slug: 'georgette', description: 'Richly textured georgette sarees for festive occasions.', imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', sortOrder: 5, isActive: true } }),
  ]);

  const IMG = [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  ];

  const products = [
    { name: 'Royal Ivory Pure Silk Saree', slug: 'royal-ivory-pure-silk-saree', sku: 'ALC-PS-001', catIdx: 0, price: 2999, colour: 'Ivory & Gold', featured: true, img: 0 },
    { name: 'Crimson Zari Pure Silk Saree', slug: 'crimson-zari-pure-silk-saree', sku: 'ALC-PS-002', catIdx: 0, price: 3499, colour: 'Crimson Red & Gold', featured: true, img: 1 },
    { name: 'Sage Green Pure Silk Saree', slug: 'sage-green-pure-silk-saree', sku: 'ALC-PS-003', catIdx: 0, price: 2799, colour: 'Sage Green & Silver', featured: false, img: 2 },
    { name: 'Peacock Blue Pure Silk Saree', slug: 'peacock-blue-pure-silk-saree', sku: 'ALC-PS-004', catIdx: 0, price: 3200, colour: 'Peacock Blue & Gold', featured: false, img: 3 },
    { name: 'Rose Pink Pure Silk Saree', slug: 'rose-pink-pure-silk-saree', sku: 'ALC-PS-005', catIdx: 0, price: 1999, colour: 'Rose Pink & Antique Gold', featured: true, img: 4 },
    { name: 'Blush Floral Semi Crepe Saree', slug: 'blush-floral-semi-crepe-saree', sku: 'ALC-SC-001', catIdx: 1, price: 1599, colour: 'Blush Pink & White', featured: true, img: 1 },
    { name: 'Navy Blue Semi Crepe Saree', slug: 'navy-blue-semi-crepe-saree', sku: 'ALC-SC-002', catIdx: 1, price: 1799, colour: 'Navy Blue & Silver', featured: false, img: 2 },
    { name: 'Lavender Semi Crepe Saree', slug: 'lavender-semi-crepe-saree', sku: 'ALC-SC-003', catIdx: 1, price: 1500, colour: 'Lavender & Gold', featured: true, img: 3 },
    { name: 'Mint Green Semi Crepe Saree', slug: 'mint-green-semi-crepe-saree', sku: 'ALC-SC-004', catIdx: 1, price: 2199, colour: 'Mint Green & Coral', featured: false, img: 0 },
    { name: 'Mustard Semi Crepe Saree', slug: 'mustard-semi-crepe-saree', sku: 'ALC-SC-005', catIdx: 1, price: 1899, colour: 'Mustard Yellow & Brown', featured: false, img: 1 },
    { name: 'Pearl White Organza Saree', slug: 'pearl-white-organza-saree', sku: 'ALC-OG-001', catIdx: 2, price: 2499, colour: 'Pearl White & Gold', featured: true, img: 2 },
    { name: 'Sky Blue Organza Saree', slug: 'sky-blue-organza-saree', sku: 'ALC-OG-002', catIdx: 2, price: 2799, colour: 'Sky Blue & Silver', featured: false, img: 3 },
    { name: 'Peach Organza Saree', slug: 'peach-organza-saree', sku: 'ALC-OG-003', catIdx: 2, price: 3199, colour: 'Peach & Rose Gold', featured: true, img: 0 },
    { name: 'Emerald Green Organza Saree', slug: 'emerald-green-organza-saree', sku: 'ALC-OG-004', catIdx: 2, price: 2199, colour: 'Emerald Green & Gold', featured: false, img: 1 },
    { name: 'Lilac Organza Saree', slug: 'lilac-organza-saree', sku: 'ALC-OG-005', catIdx: 2, price: 1799, colour: 'Lilac & Silver', featured: false, img: 2 },
    { name: 'Indigo Block Print Cotton Saree', slug: 'indigo-block-print-cotton-saree', sku: 'ALC-CH-001', catIdx: 3, price: 1599, colour: 'Indigo Blue & White', featured: false, img: 3 },
    { name: 'Terracotta Jamdani Cotton Saree', slug: 'terracotta-jamdani-cotton-saree', sku: 'ALC-CH-002', catIdx: 3, price: 2299, colour: 'Terracotta & Cream', featured: true, img: 0 },
    { name: 'Cream Chanderi Cotton Saree', slug: 'cream-chanderi-cotton-saree', sku: 'ALC-CH-003', catIdx: 3, price: 1799, colour: 'Cream & Silver', featured: false, img: 1 },
    { name: 'Olive Green Ikat Cotton Saree', slug: 'olive-green-ikat-cotton-saree', sku: 'ALC-CH-004', catIdx: 3, price: 2099, colour: 'Olive Green & Brown', featured: false, img: 2 },
    { name: 'Rust Khadi Cotton Saree', slug: 'rust-khadi-cotton-saree', sku: 'ALC-CH-005', catIdx: 3, price: 1500, colour: 'Rust Orange & Cream', featured: false, img: 3 },
    { name: 'Wine Red Embroidered Georgette Saree', slug: 'wine-red-embroidered-georgette-saree', sku: 'ALC-GG-001', catIdx: 4, price: 3499, colour: 'Wine Red & Gold', featured: true, img: 0 },
    { name: 'Black Sequin Georgette Saree', slug: 'black-sequin-georgette-saree', sku: 'ALC-GG-002', catIdx: 4, price: 2999, colour: 'Jet Black & Silver', featured: true, img: 1 },
    { name: 'Royal Blue Chikankari Georgette Saree', slug: 'royal-blue-chikankari-georgette-saree', sku: 'ALC-GG-003', catIdx: 4, price: 2499, colour: 'Royal Blue & White', featured: false, img: 2 },
    { name: 'Coral Pink Georgette Saree', slug: 'coral-pink-georgette-saree', sku: 'ALC-GG-004', catIdx: 4, price: 1899, colour: 'Coral Pink & Teal', featured: false, img: 3 },
    { name: 'Turquoise Printed Georgette Saree', slug: 'turquoise-printed-georgette-saree', sku: 'ALC-GG-005', catIdx: 4, price: 2099, colour: 'Turquoise & Gold', featured: false, img: 0 },
  ];

  const createdProds: any[] = [];
  for (const p of products) {
    const prod = await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, sku: p.sku,
        description: p.name + ' - Handcrafted with love and premium materials.',
        price: p.price, stock: 20, fabric: cats[p.catIdx].name,
        colour: p.colour, occasion: 'Wedding, Festival',
        sareeLength: '5.5 metres', blouseDetails: '0.8m matching blouse piece included',
        careInstructions: 'Dry clean recommended.',
        isFeatured: p.featured, isActive: true,
        categoryId: cats[p.catIdx].id,
        images: { create: [{ url: IMG[p.img], alt: p.name, sortOrder: 0 }] },
      },
    });
    createdProds.push(prod);
  }

  await prisma.review.createMany({
    data: [
      { userId: demoUser.id, productId: createdProds[0].id, rating: 5, comment: 'Absolutely stunning saree! The quality is beyond expectations. Will definitely order again.', isApproved: true },
      { userId: demoUser.id, productId: createdProds[5].id, rating: 5, comment: 'The semi crepe drapes beautifully and the color is exactly as shown. Very happy!', isApproved: true },
      { userId: demoUser.id, productId: createdProds[10].id, rating: 4, comment: 'Gorgeous organza saree. Lightweight and elegant. Perfect for daytime events.', isApproved: true },
    ],
  });

  await prisma.order.create({
    data: {
      id: 'ALC-2026-000001', userId: demoUser.id, totalAmount: createdProds[0].price,
      discountAmount: 0, shippingAmount: 0, paymentStatus: 'PAID', orderStatus: 'DELIVERED',
      paymentMethod: 'RAZORPAY', razorpayOrderId: 'order_alc_demo_001', razorpayPaymentId: 'pay_alc_demo_001',
      shippingCarrier: 'Blue Dart', trackingNumber: 'BD123456789IN',
      shippingAddressSnapshot: JSON.stringify({ fullName: 'Priyanka Sharma', phone: '+91 98765 43210', street: 'Flat 402, Royal Palms, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' }),
      items: { create: [{ productId: createdProds[0].id, productName: createdProds[0].name, productSlug: createdProds[0].slug, productImage: IMG[0], fabric: createdProds[0].fabric, colour: createdProds[0].colour, price: createdProds[0].price, quantity: 1, total: createdProds[0].price }] },
    },
  });

  await prisma.auditLog.create({ data: { action: 'ADMIN_LOGIN', entityType: 'Auth', entityId: adminUser.id, details: 'Admin logged in', adminEmail: adminUser.email } });

  console.log('Done! 5 categories, 25 products seeded.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
