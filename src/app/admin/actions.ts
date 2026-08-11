"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePartsChecklist } from "@/lib/part-generator";
import type { BodyType, PartStatus, Transmission } from "@/lib/constants";
import { PART_STATUS } from "@/lib/constants";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------------- Autenticação ----------------

export async function loginAction(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) return "Usuário ou senha inválidos.";
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

// ---------------- Veículos ----------------

export interface CreateVehicleInput {
  brand: string;
  model: string;
  modelYear: number;
  fuel?: string | null;
  fipeCode?: string | null;
  fipeValue?: number | null;
  doors: number;
  body: BodyType;
  transmission: Transmission;
  engine?: string | null;
  engineFamily?: string | null;
  color?: string | null;
  auctioneer?: string | null;
  auctionName?: string | null;
  lotNumber?: string | null;
  auctionDate?: string | null; // yyyy-mm-dd
  purchaseValue?: number | null;
  auctionNotes?: string | null;
}

export async function createVehicle(input: CreateVehicleInput) {
  await requireAuth();
  if (!input.brand?.trim() || !input.model?.trim() || !input.modelYear) {
    throw new Error("Marca, modelo e ano são obrigatórios.");
  }
  const vehicle = await prisma.vehicle.create({
    data: {
      brand: input.brand.trim(),
      model: input.model.trim(),
      modelYear: input.modelYear,
      fuel: input.fuel || null,
      fipeCode: input.fipeCode || null,
      fipeValue: input.fipeValue ?? null,
      doors: input.doors,
      body: input.body,
      transmission: input.transmission,
      engine: input.engine || null,
      engineFamily: input.engineFamily || null,
      color: input.color || null,
      auctioneer: input.auctioneer || null,
      auctionName: input.auctionName || null,
      lotNumber: input.lotNumber || null,
      auctionDate: input.auctionDate ? new Date(input.auctionDate) : null,
      purchaseValue: input.purchaseValue ?? null,
      auctionNotes: input.auctionNotes || null,
    },
  });
  const checklist = generatePartsChecklist({
    doors: input.doors,
    body: input.body,
    transmission: input.transmission,
  });
  await prisma.part.createMany({
    data: checklist.map((t) => ({
      vehicleId: vehicle.id,
      name: t.name,
      group: t.group,
      quantity: t.qty ?? 1,
    })),
  });
  revalidateAll();
  redirect(`/admin/veiculos/${vehicle.id}`);
}

export interface UpdateVehicleInput {
  color?: string | null;
  engine?: string | null;
  engineFamily?: string | null;
  status?: string;
  auctioneer?: string | null;
  auctionName?: string | null;
  lotNumber?: string | null;
  auctionDate?: string | null;
  purchaseValue?: number | null;
  auctionNotes?: string | null;
}

export async function updateVehicle(id: string, input: UpdateVehicleInput) {
  await requireAuth();
  await prisma.vehicle.update({
    where: { id },
    data: {
      color: input.color ?? undefined,
      engine: input.engine ?? undefined,
      engineFamily: input.engineFamily ?? undefined,
      status: input.status ?? undefined,
      auctioneer: input.auctioneer ?? undefined,
      auctionName: input.auctionName ?? undefined,
      lotNumber: input.lotNumber ?? undefined,
      auctionDate:
        input.auctionDate === undefined
          ? undefined
          : input.auctionDate
            ? new Date(input.auctionDate)
            : null,
      purchaseValue: input.purchaseValue ?? undefined,
      auctionNotes: input.auctionNotes ?? undefined,
    },
  });
  revalidateAll();
}

export async function deleteVehicle(id: string) {
  await requireAuth();
  await prisma.vehicle.delete({ where: { id } });
  revalidateAll();
  redirect("/admin/veiculos");
}

export async function setVehiclePhotos(id: string, photos: string[]) {
  await requireAuth();
  await prisma.vehicle.update({
    where: { id },
    data: { photos: JSON.stringify(photos) },
  });
  revalidateAll();
}

// ---------------- Peças ----------------

function assertStatus(status: string): asserts status is PartStatus {
  if (!(status in PART_STATUS)) throw new Error(`Status inválido: ${status}`);
}

export async function setPartStatus(
  id: string,
  status: string,
  soldPrice?: number | null,
) {
  await requireAuth();
  assertStatus(status);
  await prisma.part.update({
    where: { id },
    data: {
      status,
      soldPrice: status === "VENDIDA" ? (soldPrice ?? undefined) : null,
      soldAt: status === "VENDIDA" ? new Date() : null,
      featured: status === "DISPONIVEL" ? undefined : false,
    },
  });
  revalidateAll();
}

export interface UpdatePartInput {
  name?: string;
  price?: number | null;
  soldPrice?: number | null;
  description?: string | null;
  mlLink?: string | null;
  featured?: boolean;
  quantity?: number;
}

export async function updatePart(id: string, input: UpdatePartInput) {
  await requireAuth();
  await prisma.part.update({
    where: { id },
    data: {
      name: input.name?.trim() || undefined,
      price: input.price === undefined ? undefined : input.price,
      soldPrice: input.soldPrice === undefined ? undefined : input.soldPrice,
      description: input.description === undefined ? undefined : input.description || null,
      mlLink: input.mlLink === undefined ? undefined : input.mlLink || null,
      featured: input.featured,
      quantity: input.quantity,
    },
  });
  revalidateAll();
}

export async function setPartPhotos(id: string, photos: string[]) {
  await requireAuth();
  await prisma.part.update({
    where: { id },
    data: { photos: JSON.stringify(photos) },
  });
  revalidateAll();
}

export async function bulkGroupStatus(
  vehicleId: string,
  group: string,
  status: string,
) {
  await requireAuth();
  assertStatus(status);
  await prisma.part.updateMany({
    // Peças já vendidas não entram na ação em massa
    where: { vehicleId, group, status: { not: "VENDIDA" } },
    data: { status, featured: status === "DISPONIVEL" ? undefined : false },
  });
  revalidateAll();
}

export async function addCustomPart(
  vehicleId: string,
  name: string,
  group: string,
) {
  await requireAuth();
  if (!name.trim()) throw new Error("Nome da peça é obrigatório.");
  await prisma.part.create({
    data: { vehicleId, name: name.trim(), group },
  });
  revalidateAll();
}

export async function deletePart(id: string) {
  await requireAuth();
  await prisma.part.delete({ where: { id } });
  revalidateAll();
}

// ---------------- Configurações ----------------

export async function updateSettings(formData: FormData) {
  await requireAuth();
  const str = (k: string) => String(formData.get(k) ?? "").trim();
  await prisma.settings.update({
    where: { id: 1 },
    data: {
      storeName: str("storeName") || "Juca Carros Velhos",
      whatsapp: str("whatsapp").replace(/\D/g, ""),
      phone2: str("phone2").replace(/\D/g, ""),
      facebook: str("facebook"),
      instagram: str("instagram") || null,
      tiktok: str("tiktok") || null,
      mercadoLivre: str("mercadoLivre") || null,
      address: str("address"),
      city: str("city"),
      mapsUrl: str("mapsUrl"),
      tagline: str("tagline"),
      about: str("about"),
    },
  });
  revalidateAll();
}
