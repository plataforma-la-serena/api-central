import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SAMPLE_APARTMENTS = [
  {
    title: "Departamento 01",
    description:
      "Dos dormitorios, cocina equipada y balcón. Ideal para familias o grupos de hasta cuatro personas.",
    pricePerNight: 45000,
    capacity: 4,
    features: ["2 dormitorios", "Cocina equipada", "Balcón", "Wi-Fi"],
    images: [] as string[],
  },
  {
    title: "Departamento 02",
    description:
      "Tres dormitorios, living comedor y cocina equipada. Capacidad para seis personas.",
    pricePerNight: 52000,
    capacity: 6,
    features: ["3 dormitorios", "Living comedor", "Cocina equipada", "Wi-Fi"],
    images: [] as string[],
  },
  {
    title: "Departamento 03",
    description:
      "Un dormitorio, cocina integrada y baño completo. Para una o dos personas.",
    pricePerNight: 38000,
    capacity: 2,
    features: ["1 dormitorio", "Cocina integrada", "Baño completo", "Wi-Fi"],
    images: [] as string[],
  },
];

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL o ADMIN_PASSWORD no definidos: no se crea admin.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });
}

async function seedApartments(): Promise<void> {
  const count = await prisma.apartment.count();
  if (count > 0) {
    return;
  }
  await prisma.apartment.createMany({ data: SAMPLE_APARTMENTS });
}

async function main(): Promise<void> {
  await seedAdmin();
  await seedApartments();
}

void main()
  .catch((error: unknown) => {
    console.error("Error en el seed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
