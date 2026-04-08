import { PrismaClient, UserRole, VendorStatus, ProductStatus, CommissionType } from './generated/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Admin user ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mercadoproductor.com' },
    update: {},
    create: {
      email: 'admin@mercadoproductor.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Principal',
      role: UserRole.SUPERADMIN,
      emailVerified: true,
    },
  })
  console.log('✓ Admin:', admin.email)

  // ─── Test customer ────────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash('cliente1234', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      email: 'cliente@test.com',
      passwordHash: customerPassword,
      firstName: 'María',
      lastName: 'García',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  })
  console.log('✓ Customer:', customer.email)

  // ─── Categories ───────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'frutas-verduras' },
      update: {},
      create: { slug: 'frutas-verduras', name: 'Frutas y Verduras', position: 1, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'lacteos-huevos' },
      update: {},
      create: { slug: 'lacteos-huevos', name: 'Lácteos y Huevos', position: 2, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'aceites-conservas' },
      update: {},
      create: { slug: 'aceites-conservas', name: 'Aceites y Conservas', position: 3, isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'panaderia-cereales' },
      update: {},
      create: { slug: 'panaderia-cereales', name: 'Panadería y Cereales', position: 4, isActive: true },
    }),
  ])
  console.log('✓ Categories:', categories.length)

  // ─── Vendor + products ────────────────────────────────────────────────────
  const vendorUser = await prisma.user.upsert({
    where: { email: 'productor@test.com' },
    update: {},
    create: {
      email: 'productor@test.com',
      passwordHash: await bcrypt.hash('productor1234', 12),
      firstName: 'Carlos',
      lastName: 'Ruiz',
      role: UserRole.VENDOR,
      emailVerified: true,
    },
  })

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      slug: 'huerta-los-olivos',
      displayName: 'Huerta Los Olivos',
      description: 'Productores ecológicos desde 1985 en el corazón de Andalucía. Cultivamos con respeto a la tierra y las tradiciones.',
      location: 'Sevilla, Andalucía',
      originRegion: 'Andalucía',
      status: VendorStatus.ACTIVE,
      taxId: 'B12345678',
      iban: 'ES9121000418450200051332',
      bankAccountName: 'Carlos Ruiz Jiménez',
      commissionRate: 0.12,
      orderCutoffDays: ['MON', 'WED', 'FRI'],
      orderCutoffTime: '12:00',
      preparationDays: 1,
      activatedAt: new Date(),
    },
  })
  console.log('✓ Vendor:', vendor.displayName)

  // Products
  const product1 = await prisma.product.upsert({
    where: { slug: 'tomates-rama-ecologicos' },
    update: {},
    create: {
      vendorId: vendor.id,
      categoryId: categories[0].id,
      slug: 'tomates-rama-ecologicos',
      name: 'Tomates de rama ecológicos',
      description: 'Tomates cultivados sin pesticidas en nuestras huertas de Sevilla. Recogidos en el punto óptimo de maduración.',
      images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800'],
      status: ProductStatus.ACTIVE,
      basePrice: 3.50,
      taxRate: 0.04,
      unit: 'kg',
      minOrderQuantity: 1,
      stock: 200,
      tags: ['ecologico', 'km0', 'verano'],
      certifications: ['ECO-ES'],
      originRegion: 'Sevilla',
      publishedAt: new Date(),
    },
  })

  const product2 = await prisma.product.upsert({
    where: { slug: 'aceite-oliva-virgen-extra' },
    update: {},
    create: {
      vendorId: vendor.id,
      categoryId: categories[2].id,
      slug: 'aceite-oliva-virgen-extra',
      name: 'Aceite de Oliva Virgen Extra',
      description: 'AOVE de primera prensada en frío. Variedad Picual con notas afrutadas y ligero picante. Botella 500ml.',
      images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800'],
      status: ProductStatus.ACTIVE,
      basePrice: 8.90,
      taxRate: 0.10,
      unit: 'botella',
      minOrderQuantity: 1,
      stock: 150,
      tags: ['ecologico', 'aove', 'picual'],
      certifications: ['ECO-ES', 'DOP'],
      originRegion: 'Sevilla',
      publishedAt: new Date(),
    },
  })

  console.log('✓ Products:', product1.name, '|', product2.name)

  // ─── Global commission rule ───────────────────────────────────────────────
  const existingRule = await prisma.commissionRule.findFirst({ where: { vendorId: null } })
  if (!existingRule) {
    await prisma.commissionRule.create({
      data: {
        name: 'Comisión estándar marketplace',
        type: CommissionType.PERCENTAGE,
        priority: 0,
        rate: 0.12,
        includesTax: false,
        includesShipping: false,
        validFrom: new Date(),
      },
    })
    console.log('✓ Commission rule: 12%')
  }

  console.log('\n✅ Seed completado')
  console.log('\nCredenciales de prueba:')
  console.log('  Admin:     admin@mercadoproductor.com / admin1234')
  console.log('  Cliente:   cliente@test.com / cliente1234')
  console.log('  Productor: productor@test.com / productor1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
