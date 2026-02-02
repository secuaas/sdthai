import { PrismaClient, PartnerType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean database
  console.log('🧹 Cleaning database...');
  await prisma.stockMovement.deleteMany();
  await prisma.stockEntry.deleteMany();
  await prisma.batchItem.deleteMany();
  await prisma.productionBatch.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.auditLog.deleteMany();

  // Seed Categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        nameFr: 'Currys',
        nameDe: 'Currys',
        nameEn: 'Curries',
        slug: 'currys',
        description: 'Currys thaïlandais authentiques',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        nameFr: 'Soupes',
        nameDe: 'Suppen',
        nameEn: 'Soups',
        slug: 'soupes',
        description: 'Soupes traditionnelles thaïlandaises',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        nameFr: 'Plats Sautés',
        nameDe: 'Gebratene Gerichte',
        nameEn: 'Stir-Fries',
        slug: 'plats-sautes',
        description: 'Plats sautés au wok',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        nameFr: 'Salades',
        nameDe: 'Salate',
        nameEn: 'Salads',
        slug: 'salades',
        description: 'Salades fraîches et épicées',
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Seed Products
  console.log('🍛 Creating products...');
  const products = await Promise.all([
    // Currys
    prisma.product.create({
      data: {
        sku: 'TH-CUR-001',
        barcode: '7640123450001',
        nameFr: 'Curry Rouge Poulet',
        nameDe: 'Rotes Curry Huhn',
        nameEn: 'Red Curry Chicken',
        descriptionFr: 'Curry rouge thaïlandais authentique avec poulet, lait de coco et basilic',
        priceB2b: 12.50,
        priceB2c: 16.90,
        shelfLifeDays: 17,
        weight: 350,
        allergens: ['lait', 'poisson'],
        spicyLevel: 2,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-CUR-002',
        barcode: '7640123450002',
        nameFr: 'Curry Vert Légumes',
        nameDe: 'Grünes Curry Gemüse',
        nameEn: 'Green Curry Vegetables',
        descriptionFr: 'Curry vert végétarien avec légumes frais et tofu',
        priceB2b: 11.50,
        priceB2c: 15.90,
        isVegetarian: true,
        isVegan: true,
        spicyLevel: 3,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-CUR-003',
        barcode: '7640123450003',
        nameFr: 'Massaman Boeuf',
        nameDe: 'Massaman Rindfleisch',
        nameEn: 'Massaman Beef',
        descriptionFr: 'Curry Massaman doux avec boeuf tendre et cacahuètes',
        priceB2b: 13.50,
        priceB2c: 17.90,
        allergens: ['cacahuètes', 'lait'],
        spicyLevel: 1,
        categoryId: categories[0].id,
      },
    }),
    // Soupes
    prisma.product.create({
      data: {
        sku: 'TH-SOU-001',
        barcode: '7640123450004',
        nameFr: 'Tom Yum Crevettes',
        nameDe: 'Tom Yum Garnelen',
        nameEn: 'Tom Yum Shrimp',
        descriptionFr: 'Soupe aigre-piquante aux crevettes et citronnelle',
        priceB2b: 10.50,
        priceB2c: 14.90,
        allergens: ['crustacés', 'poisson'],
        spicyLevel: 3,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-SOU-002',
        barcode: '7640123450005',
        nameFr: 'Tom Kha Gai',
        nameDe: 'Tom Kha Gai',
        nameEn: 'Tom Kha Gai',
        descriptionFr: 'Soupe de poulet au lait de coco et galanga',
        priceB2b: 11.00,
        priceB2c: 15.50,
        allergens: ['lait'],
        spicyLevel: 1,
        categoryId: categories[1].id,
      },
    }),
    // Plats sautés
    prisma.product.create({
      data: {
        sku: 'TH-WOK-001',
        barcode: '7640123450006',
        nameFr: 'Pad Thai Crevettes',
        nameDe: 'Pad Thai Garnelen',
        nameEn: 'Pad Thai Shrimp',
        descriptionFr: 'Nouilles de riz sautées avec crevettes et cacahuètes',
        priceB2b: 12.00,
        priceB2c: 16.50,
        allergens: ['cacahuètes', 'crustacés', 'oeuf'],
        spicyLevel: 1,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TH-WOK-002',
        barcode: '7640123450007',
        nameFr: 'Pad Krapao Poulet',
        nameDe: 'Pad Krapao Huhn',
        nameEn: 'Pad Krapao Chicken',
        descriptionFr: 'Poulet sauté au basilic thaï et piment',
        priceB2b: 11.50,
        priceB2c: 15.90,
        allergens: ['soja'],
        spicyLevel: 3,
        categoryId: categories[2].id,
      },
    }),
    // Salades
    prisma.product.create({
      data: {
        sku: 'TH-SAL-001',
        barcode: '7640123450008',
        nameFr: 'Salade Papaye Verte',
        nameDe: 'Grüner Papayasalat',
        nameEn: 'Green Papaya Salad',
        descriptionFr: 'Som Tam - salade épicée de papaye verte',
        priceB2b: 9.50,
        priceB2c: 13.90,
        isVegetarian: true,
        allergens: ['cacahuètes'],
        spicyLevel: 3,
        categoryId: categories[3].id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Seed Partners
  console.log('🏢 Creating partners...');
  const partners = await Promise.all([
    // VENTE_DIRECTE
    prisma.partner.create({
      data: {
        type: PartnerType.VENTE_DIRECTE,
        name: 'Restaurant Asiatique Genève',
        legalName: 'Asiatique Genève Sàrl',
        vatNumber: 'CHE-123.456.789',
        address: 'Rue du Rhône 50',
        postalCode: '1204',
        city: 'Genève',
        canton: 'GE',
        latitude: 46.2044,
        longitude: 6.1432,
        contactName: 'Marie Dupont',
        phone: '+41 22 345 67 89',
        email: 'contact@asiatique-geneve.ch',
        deliveryDays: ['MONDAY', 'THURSDAY'],
      },
    }),
    prisma.partner.create({
      data: {
        type: PartnerType.VENTE_DIRECTE,
        name: 'Epicerie Fine Vevey',
        address: 'Avenue Nestlé 12',
        postalCode: '1800',
        city: 'Vevey',
        canton: 'VD',
        latitude: 46.4600,
        longitude: 6.8429,
        contactName: 'Jean Martin',
        phone: '+41 21 923 45 67',
        email: 'info@epicerie-vevey.ch',
        deliveryDays: ['TUESDAY', 'FRIDAY'],
      },
    }),
    // DEPOT_VENTE
    prisma.partner.create({
      data: {
        type: PartnerType.DEPOT_VENTE,
        name: 'Coop Montreux',
        address: 'Grand-Rue 75',
        postalCode: '1820',
        city: 'Montreux',
        canton: 'VD',
        latitude: 46.4312,
        longitude: 6.9107,
        contactName: 'Sophie Blanc',
        phone: '+41 21 962 30 40',
        email: 'montreux@coop.ch',
        deliveryDays: ['WEDNESDAY'],
        billingPeriod: 'MONTHLY',
        billingDay: 5,
      },
    }),
    prisma.partner.create({
      data: {
        type: PartnerType.DEPOT_VENTE,
        name: 'Migros Lausanne Centre',
        address: 'Rue Centrale 4',
        postalCode: '1003',
        city: 'Lausanne',
        canton: 'VD',
        latitude: 46.5197,
        longitude: 6.6323,
        deliveryDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
        billingPeriod: 'MONTHLY',
        billingDay: 1,
      },
    }),
    // AUTOMATE
    prisma.partner.create({
      data: {
        type: PartnerType.AUTOMATE,
        name: 'Automate EPFL',
        address: 'Route Cantonale',
        postalCode: '1015',
        city: 'Lausanne',
        canton: 'VD',
        latitude: 46.5191,
        longitude: 6.5668,
        isPublic: true,
      },
    }),
    prisma.partner.create({
      data: {
        type: PartnerType.AUTOMATE,
        name: 'Automate Gare Lausanne',
        address: 'Place de la Gare 9',
        postalCode: '1003',
        city: 'Lausanne',
        canton: 'VD',
        latitude: 46.5167,
        longitude: 6.6290,
        isPublic: true,
      },
    }),
  ]);

  console.log(`✅ Created ${partners.length} partners`);

  // Seed Users
  console.log('👤 Creating users...');
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@sdthai.ch',
        passwordHash,
        firstName: 'Dumrong',
        lastName: 'Kongsunton',
        role: UserRole.SUPER_ADMIN,
        phone: '+41 21 539 17 16',
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'partner@asiatique-geneve.ch',
        passwordHash,
        firstName: 'Marie',
        lastName: 'Dupont',
        role: UserRole.PARTNER_ADMIN,
        partnerId: partners[0].id,
        phone: '+41 22 345 67 89',
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user@epicerie-vevey.ch',
        passwordHash,
        firstName: 'Jean',
        lastName: 'Martin',
        role: UserRole.PARTNER_USER,
        partnerId: partners[1].id,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'driver@sdthai.ch',
        passwordHash,
        firstName: 'Luc',
        lastName: 'Bernard',
        role: UserRole.DRIVER,
        phone: '+41 79 123 45 67',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);
  console.log('\n📋 Default credentials:');
  console.log('   Email: admin@sdthai.ch');
  console.log('   Password: Admin123!');
  console.log('   (Same password for all test users)\n');

  // Seed sample orders
  console.log('📦 Creating sample orders...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260202-0001',
      partnerId: partners[0].id,
      userId: users[1].id,
      status: 'CONFIRMED',
      requestedDate: tomorrow,
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
            vatRate: 0.081,
            vatAmount: 2.03,
            total: 27.03,
          },
          {
            productId: products[3].id,
            quantity: 1,
            unitPrice: 10.50,
            subtotal: 10.50,
            vatRate: 0.081,
            vatAmount: 0.85,
            total: 11.35,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260202-0002',
      partnerId: partners[1].id,
      userId: users[2].id,
      status: 'PENDING',
      requestedDate: tomorrow,
      isUrgent: true,
      urgentReason: 'Événement spécial ce weekend',
      subtotal: 45.50,
      vatAmount: 3.69,
      total: 49.19,
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 2,
            unitPrice: 11.50,
            subtotal: 23.00,
            vatRate: 0.081,
            vatAmount: 1.86,
            total: 24.86,
          },
          {
            productId: products[5].id,
            quantity: 1,
            unitPrice: 12.00,
            subtotal: 12.00,
            vatRate: 0.081,
            vatAmount: 0.97,
            total: 12.97,
          },
        ],
      },
    },
  });

  console.log(`✅ Created 2 sample orders`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${products.length} products`);
  console.log(`   - ${partners.length} partners (2 VENTE_DIRECTE, 2 DEPOT_VENTE, 2 AUTOMATE)`);
  console.log(`   - ${users.length} users (1 admin, 2 partners, 1 driver)`);
  console.log(`   - 2 sample orders\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
