import { PrismaClient, PaymentMethod } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@yourbusiness.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeThisToAStrongPassword123!";

  const passwordHash = await hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { id: 1 },
    update: {
      email: adminEmail,
      passwordHash
    },
    create: {
      id: 1,
      email: adminEmail,
      passwordHash,
      name: "Business Admin"
    }
  });

  await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: {
      businessName: "NEFO GADGETS",
      motto: "your one stop gadget store",
      logoUrl: "/logo-ng.svg",
      footerText: "Thanks Please Call For Any Question",
      defaultWarranty:
        "We are not responsible for water damage, Face ID issues, or screen faults after purchase. Warranty lasts 14 days for verified faults.",
      contactEmail: null,
      contactPhone: "08147078833",
      contactPhoneAlt: "0901251325",
      socialHandle: "@NefoGadgets",
      address: "Medical Road, Ikeja, Lagos"
    },
    create: {
      id: 1,
      businessName: "NEFO GADGETS",
      motto: "your one stop gadget store",
      logoUrl: "/logo-ng.svg",
      footerText: "Thanks Please Call For Any Question",
      defaultWarranty:
        "We are not responsible for water damage, Face ID issues, or screen faults after purchase. Warranty lasts 14 days for verified faults.",
      contactEmail: null,
      contactPhone: "08147078833",
      contactPhoneAlt: "0901251325",
      socialHandle: "@NefoGadgets",
      address: "Medical Road, Ikeja, Lagos"
    }
  });

  const customer = await prisma.customer.upsert({
    where: { id: "seed-customer-1" },
    update: {},
    create: {
      id: "seed-customer-1",
      name: "Amina Yusuf",
      phone: "+234 803 111 2222",
      email: "amina@example.com"
    }
  });

  const receipt = await prisma.receipt.upsert({
    where: { receiptNumber: "RCPT-2026-0001" },
    update: {},
    create: {
      receiptNumber: "RCPT-2026-0001",
      paymentMethod: PaymentMethod.TRANSFER,
      subtotal: 450000,
      discount: 15000,
      total: 435000,
      notes: "Delivered and tested with customer.",
      warrantyNotes: "30 days limited warranty on hardware faults.",
      customerId: customer.id
    }
  });

  const existingItems = await prisma.receiptItem.count({ where: { receiptId: receipt.id } });
  if (existingItems === 0) {
    await prisma.receiptItem.createMany({
      data: [
        {
          receiptId: receipt.id,
          description: "MacBook Pro 14 M3",
          quantity: 1,
          unitPrice: 400000,
          lineTotal: 400000
        },
        {
          receiptId: receipt.id,
          description: "Premium Setup and Data Migration",
          quantity: 1,
          unitPrice: 50000,
          lineTotal: 50000
        }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
