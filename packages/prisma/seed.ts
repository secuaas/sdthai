import { PrismaClient, PartnerType, UserRole, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean database
  console.log('🧹 Cleaning database...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.partner.deleteMany();

  // Seed Partners
  console.log('🏢 Creating partners...');
  const partners = await Promise.all([
    // WITH_DELIVERY - 5 partners who pay cash to delivery drivers
    prisma.partner.create({
      data: {
        type: PartnerType.WITH_DELIVERY,
        name: 'Restaurant Asiatique Genève',
        email: 'contact@asiatique-geneve.ch',
        phone: '+41 22 345 67 89',
        address: 'Rue du Rhône 50, 1204 Genève',
        paymentMethod: 'CASH',
        fixedDeliveryDays: [1, 4], // Monday, Thursday
        canOrderViaAdmin: true,
        isActive: true,
      },
    }),
    prisma.partner.create({
      data: {
        type: PartnerType.WITH_DELIVERY,
        name: 'Epicerie Fine Vevey',
        email: 'info@epicerie-vevey.ch',
        phone: '+41 21 923 45 67',
        address: 'Avenue Nestlé 12, 1800 Vevey',
        paymentMethod: 'CASH',
        fixedDeliveryDays: [2, 5], // Tuesday, Friday
        canOrderViaAdmin: true,
        isActive: true,
      },
    }),
    prisma.partner.create({
      data: {
        type: PartnerType.WITH_DELIVERY,
        name: 'Traiteur Lausanne',
        email: 'commandes@traiteur-ls.ch',
        phone: '+41 21 312 45 78',
        address: 'Rue de Bourg 23, 1003 Lausanne',
        paymentMethod: 'CASH',
        fixedDeliveryDays: [1, 3, 5], // Monday, Wednesday, Friday
        canOrderViaAdmin: true,
        isActive: true,
      },
    }),
    prisma.partner.create({
      data: {
        type: PartnerType.WITH_DELIVERY,
        name: 'Supermarché Bio Nyon',
        email: 'bio@nyon.ch',
        phone: '+41 22 361 98 76',
        address: 'Place du Marché 8, 1260 Nyon',
        paymentMethod: 'CASH',
        fixedDeliveryDays: [3], // Wednesday
        canOrderViaAdmin: true,
        isActive: true,
      },
    }),
    prisma.partner.create({
      data: {
        type: PartnerType.WITH_DELIVERY,
        name: 'Cantine Scolaire Morges',
        email: 'cantine@morges.ch',
        phone: '+41 21 804 56 32',
        address: 'Chemin de Couvaloup 10, 1110 Morges',
        paymentMethod: 'CASH',
        fixedDeliveryDays: [2, 4], // Tuesday, Thursday
        canOrderViaAdmin: false, // Cannot order via admin (special workflow)
        isActive: true,
      },
    }),
    // DEPOT_AUTOMATE - Point of sale locations
    prisma.partner.create({
      data: {
        type: PartnerType.DEPOT_AUTOMATE,
        name: 'Automate EPFL',
        email: 'epfl@sdthai.ch',
        phone: '+41 21 693 11 11',
        address: 'Route Cantonale, 1015 Lausanne EPFL',
        paymentMethod: 'CARD',
        canOrderViaAdmin: false,
        isActive: true,
      },
    }),
    prisma.partner.create({
      data: {
        type: PartnerType.DEPOT_AUTOMATE,
        name: 'Dépôt-Vente Gare Lausanne',
        email: 'gare@sdthai.ch',
        phone: '+41 21 539 17 16',
        address: 'Place de la Gare 9, 1003 Lausanne',
        paymentMethod: 'CARD',
        canOrderViaAdmin: false,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${partners.length} partners (5 WITH_DELIVERY, 2 DEPOT_AUTOMATE)`);

  // Seed Products (no categorization in MVP)
  console.log('🍛 Creating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'TH-CUR-001',
        barcode: '7640123450001',
        nameFr: 'Curry Rouge Poulet',
        description: 'Curry rouge thaïlandais authentique avec poulet, lait de coco et basilic',
        priceB2b: 12.50,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-CUR-002',
        barcode: '7640123450002',
        nameFr: 'Curry Vert Légumes',
        description: 'Curry vert végétarien avec légumes frais et tofu',
        priceB2b: 11.50,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-CUR-003',
        barcode: '7640123450003',
        nameFr: 'Massaman Boeuf',
        description: 'Curry Massaman doux avec boeuf tendre et cacahuètes',
        priceB2b: 13.50,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-SOU-001',
        barcode: '7640123450004',
        nameFr: 'Tom Yum Crevettes',
        description: 'Soupe aigre-piquante aux crevettes et citronnelle',
        priceB2b: 10.50,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-SOU-002',
        barcode: '7640123450005',
        nameFr: 'Tom Kha Gai',
        description: 'Soupe de poulet au lait de coco et galanga',
        priceB2b: 11.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-WOK-001',
        barcode: '7640123450006',
        nameFr: 'Pad Thai Crevettes',
        description: 'Nouilles de riz sautées avec crevettes et cacahuètes',
        priceB2b: 12.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-WOK-002',
        barcode: '7640123450007',
        nameFr: 'Pad Krapao Poulet',
        description: 'Poulet sauté au basilic thaï et piment',
        priceB2b: 11.50,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-SAL-001',
        barcode: '7640123450008',
        nameFr: 'Salade Papaye Verte',
        description: 'Som Tam - salade épicée de papaye verte',
        priceB2b: 9.50,
        isActive: true,
      },
    }),
    // Demo/Staff products
    prisma.product.create({
      data: {
        sku: 'TH-DEMO-001',
        barcode: '7640123459999',
        nameFr: 'Échantillon Découverte',
        description: 'Produit de démonstration (ne pas facturer)',
        priceB2b: 0.00,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-STAFF-001',
        barcode: '7640123459998',
        nameFr: 'Repas Personnel',
        description: 'Produit réservé au personnel',
        priceB2b: 0.00,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products (8 regular + 2 demo/staff)`);

  // Seed Users
  console.log('👤 Creating users...');
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const users = await Promise.all([
    // Super Admin
    prisma.user.create({
      data: {
        email: 'admin@sdthai.ch',
        passwordHash,
        firstName: 'Dumrong',
        lastName: 'Kongsunton',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    }),
    // Regular Admin
    prisma.user.create({
      data: {
        email: 'manager@sdthai.ch',
        passwordHash,
        firstName: 'Sophie',
        lastName: 'Bernard',
        role: UserRole.ADMIN,
        isActive: true,
      },
    }),
    // Partner users
    prisma.user.create({
      data: {
        email: 'marie@asiatique-geneve.ch',
        passwordHash,
        firstName: 'Marie',
        lastName: 'Dupont',
        role: UserRole.PARTNER,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jean@epicerie-vevey.ch',
        passwordHash,
        firstName: 'Jean',
        lastName: 'Martin',
        role: UserRole.PARTNER,
        isActive: true,
      },
    }),
    // Driver
    prisma.user.create({
      data: {
        email: 'driver@sdthai.ch',
        passwordHash,
        firstName: 'Luc',
        lastName: 'Berger',
        role: UserRole.DRIVER,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users (1 super admin, 1 admin, 2 partners, 1 driver)`);
  console.log('\n📋 Default credentials:');
  console.log('   Email: admin@sdthai.ch');
  console.log('   Password: Admin123!');
  console.log('   (Same password for all test users)\n');

  // Seed sample orders
  console.log('📦 Creating sample orders...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2); // J+2 for delivery deadline (8pm for J+2)

  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0001`,
      partnerId: partners[0].id,
      userId: users[2].id,
      status: OrderStatus.CONFIRMED,
      requestedDate: tomorrow,
      isUrgent: false,
      subtotal: 36.50,
      vatAmount: 2.96,
      total: 39.46,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
            unitPrice: 12.50,
            subtotal: 25.00,
          },
          {
            productId: products[3].id,
            quantity: 1,
            unitPrice: 10.50,
            subtotal: 10.50,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0002`,
      partnerId: partners[1].id,
      userId: users[3].id,
      status: OrderStatus.PENDING,
      requestedDate: tomorrow,
      isUrgent: true,
      urgentReason: 'Événement spécial ce weekend - besoin urgent',
      urgentApproved: false, // Needs admin approval
      subtotal: 45.50,
      vatAmount: 3.69,
      total: 49.19,
      notes: 'Prévoir emballage soigné pour événement VIP',
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 2,
            unitPrice: 11.50,
            subtotal: 23.00,
          },
          {
            productId: products[5].id,
            quantity: 1,
            unitPrice: 12.00,
            subtotal: 12.00,
          },
          {
            productId: products[2].id,
            quantity: 1,
            unitPrice: 13.50,
            subtotal: 13.50,
          },
        ],
      },
    },
  });

  console.log(`✅ Created 2 sample orders (1 confirmed, 1 pending urgent approval)`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - ${products.length} products (8 regular + 2 demo/staff)`);
  console.log(`   - ${partners.length} partners (5 WITH_DELIVERY cash payment, 2 DEPOT_AUTOMATE)`);
  console.log(`   - ${users.length} users (1 super admin, 1 admin, 2 partners, 1 driver)`);
  console.log(`   - 2 sample orders (order deadline: 8pm for J+2 delivery)\n`);
  console.log('💡 Features ready to implement:');
  console.log('   - Partner session codes');
  console.log('   - POS system for DEPOT_AUTOMATE');
  console.log('   - Returns management via mobile');
  console.log('   - On-site delivery option\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
