import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const Role = { OWNER: 'OWNER', CASHIER: 'CASHIER' };
const BillType = { GST: 'GST', NON_GST: 'NON_GST' };
const ExpenseCategory = { CURRENT: 'CURRENT', EB: 'EB', SALARY: 'SALARY', OTHER: 'OTHER' };

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ShopMaster database seeding...');

  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('✅ Database already initialized with users. Skipping seed.');
    return;
  }

  // 1. Clean existing records (optional for fresh seed)
  await prisma.billItem.deleteMany({});
  await prisma.bill.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.shopSettings.deleteMany({});

  // 2. Create Users
  const ownerPasswordHash = await bcrypt.hash('owner123', 10);
  const cashierPasswordHash = await bcrypt.hash('cashier123', 10);

  const owner = await prisma.user.create({
    data: {
      name: 'Ramesh Kumar (Owner)',
      email: 'owner@shopmaster.in',
      phone: '9876543210',
      passwordHash: ownerPasswordHash,
      role: Role.OWNER,
    },
  });

  const cashier1 = await prisma.user.create({
    data: {
      name: 'Suresh V (Cashier 1)',
      email: 'cashier1@shopmaster.in',
      phone: '9876543211',
      passwordHash: cashierPasswordHash,
      role: Role.CASHIER,
    },
  });

  const cashier2 = await prisma.user.create({
    data: {
      name: 'Anita Sharma (Cashier 2)',
      email: 'cashier2@shopmaster.in',
      phone: '9876543212',
      passwordHash: cashierPasswordHash,
      role: Role.CASHIER,
    },
  });

  console.log('✅ Users seeded (Owner & 2 Cashiers)');

  // 3. Create Shop Settings
  const shopSettings = await prisma.shopSettings.create({
    data: {
      shopName: 'ShopMaster General & Electronics Store',
      ownerName: 'Ramesh Kumar',
      ownerPhone: '9876543210',
      address: '#45, MG Road, Commercial Complex, Bengaluru, Karnataka 560001',
      gstNumber: '29ABCDE1234F1Z5',
    },
  });

  console.log('✅ Shop Settings seeded');

  // 4. Create Sample Products (10 Realistic Indian Retail Products)
  const productsData = [
    {
      name: 'Fast Charging Mobile Charger 20W',
      category: 'Electronics',
      purchasePrice: 250.0,
      sellingPrice: 499.0,
      gstRate: 18.0,
      stockQuantity: 25,
      lowStockLimit: 5,
    },
    {
      name: 'Type-C Braided USB Cable (1.5m)',
      category: 'Electronics',
      purchasePrice: 80.0,
      sellingPrice: 199.0,
      gstRate: 18.0,
      stockQuantity: 40,
      lowStockLimit: 10,
    },
    {
      name: 'Wired In-Ear Headphones with Mic',
      category: 'Electronics',
      purchasePrice: 120.0,
      sellingPrice: 299.0,
      gstRate: 18.0,
      stockQuantity: 3, // Low stock demo
      lowStockLimit: 5,
    },
    {
      name: 'Tempered Glass Screen Protector',
      category: 'Mobile Accessories',
      purchasePrice: 30.0,
      sellingPrice: 149.0,
      gstRate: 18.0,
      stockQuantity: 50,
      lowStockLimit: 15,
    },
    {
      name: 'Silicone Matte Phone Cover (Universal)',
      category: 'Mobile Accessories',
      purchasePrice: 60.0,
      sellingPrice: 249.0,
      gstRate: 18.0,
      stockQuantity: 4, // Low stock demo
      lowStockLimit: 8,
    },
    {
      name: 'Classmate Hardcover Spiral Notebook 200 Pages',
      category: 'Stationery',
      purchasePrice: 65.0,
      sellingPrice: 95.0,
      gstRate: 12.0,
      stockQuantity: 60,
      lowStockLimit: 10,
    },
    {
      name: 'Smooth Gel Pen Blue (Pack of 5)',
      category: 'Stationery',
      purchasePrice: 25.0,
      sellingPrice: 50.0,
      gstRate: 12.0,
      stockQuantity: 100,
      lowStockLimit: 20,
    },
    {
      name: 'Anti-Dandruff Herbal Shampoo 180ml',
      category: 'Personal Care',
      purchasePrice: 110.0,
      sellingPrice: 160.0,
      gstRate: 18.0,
      stockQuantity: 18,
      lowStockLimit: 5,
    },
    {
      name: 'Deep Clean Charcoal Face Wash 100g',
      category: 'Personal Care',
      purchasePrice: 95.0,
      sellingPrice: 150.0,
      gstRate: 18.0,
      stockQuantity: 2, // Low stock demo
      lowStockLimit: 5,
    },
    {
      name: 'Stainless Steel Insulated Water Bottle 750ml',
      category: 'Household',
      purchasePrice: 280.0,
      sellingPrice: 450.0,
      gstRate: 18.0,
      stockQuantity: 12,
      lowStockLimit: 4,
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }

  console.log('✅ 10 Sample Products seeded');

  // 5. Create Customers
  const customersData = [
    { name: 'Vikram Singh', phone: '9123456780', email: 'vikram@example.com' },
    { name: 'Priya Sundaram', phone: '9876501234', email: 'priya@example.com' },
    { name: 'Amit Patel', phone: '9988776655', email: 'amit@example.com' },
    { name: 'Kavita Menon', phone: '9443322110', email: null },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }

  console.log('✅ 4 Customers seeded');

  // 6. Create Expenses
  const expensesData = [
    {
      category: ExpenseCategory.EB,
      description: 'Shop Electricity Bill - September',
      amount: 2450.0,
      expenseDate: new Date(),
    },
    {
      category: ExpenseCategory.SALARY,
      description: 'Assistant Staff Advance Salary',
      amount: 5000.0,
      expenseDate: new Date(),
    },
    {
      category: ExpenseCategory.CURRENT,
      description: 'Daily Tea & Refreshments for Customers',
      amount: 180.0,
      expenseDate: new Date(),
    },
    {
      category: ExpenseCategory.OTHER,
      description: 'Cleaning Supplies & Sanitizers',
      amount: 320.0,
      expenseDate: new Date(),
    },
  ];

  for (const e of expensesData) {
    await prisma.expense.create({ data: e });
  }

  console.log('✅ Sample Expenses seeded');

  // 7. Create Bills & Bill Items (Historical price preservation test)
  // Bill 1: GST Bill for Customer Vikram Singh
  const p1 = createdProducts[0]; // Charger: cost 250, sell 499, gst 18%
  const p2 = createdProducts[1]; // USB Cable: cost 80, sell 199, gst 18%

  // Items calc for Bill 1:
  // Item 1: 1 x 499 = 499 subtotal, GST = 89.82, Total = 588.82, Profit = (499 - 250) * 1 = 249
  // Item 2: 2 x 199 = 398 subtotal, GST = 71.64, Total = 469.64, Profit = (199 - 80) * 2 = 238
  // Bill 1 subtotal: 897, gst: 161.46, total: 1058.46, profit: 487

  const bill1 = await prisma.bill.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      customerId: createdCustomers[0].id,
      billType: BillType.GST,
      subtotal: 897.0,
      gstAmount: 161.46,
      totalAmount: 1058.46,
      profitAmount: 487.0,
      createdAt: new Date(),
      billItems: {
        create: [
          {
            productId: p1.id,
            quantity: 1,
            purchasePrice: 250.0,
            sellingPrice: 499.0,
            gstRate: 18.0,
            total: 588.82,
            profit: 249.0,
          },
          {
            productId: p2.id,
            quantity: 2,
            purchasePrice: 80.0,
            sellingPrice: 199.0,
            gstRate: 18.0,
            total: 469.64,
            profit: 238.0,
          },
        ],
      },
    },
  });

  // Bill 2: Non-GST Bill for Walk-in Customer
  const p6 = createdProducts[5]; // Notebook: cost 65, sell 95
  const p7 = createdProducts[6]; // Pen: cost 25, sell 50

  // Item 1: 3 x 95 = 285, profit = (95 - 65) * 3 = 90
  // Item 2: 4 x 50 = 200, profit = (50 - 25) * 4 = 100
  // Bill 2 subtotal: 485, gst: 0, total: 485, profit: 190

  const bill2 = await prisma.bill.create({
    data: {
      invoiceNumber: 'INV-2026-0002',
      customerId: createdCustomers[1].id,
      billType: BillType.NON_GST,
      subtotal: 485.0,
      gstAmount: 0.0,
      totalAmount: 485.0,
      profitAmount: 190.0,
      createdAt: new Date(),
      billItems: {
        create: [
          {
            productId: p6.id,
            quantity: 3,
            purchasePrice: 65.0,
            sellingPrice: 95.0,
            gstRate: 0.0,
            total: 285.0,
            profit: 90.0,
          },
          {
            productId: p7.id,
            quantity: 4,
            purchasePrice: 25.0,
            sellingPrice: 50.0,
            gstRate: 0.0,
            total: 200.0,
            profit: 100.0,
          },
        ],
      },
    },
  });

  console.log('✅ Sample Bills & Bill Items seeded');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
