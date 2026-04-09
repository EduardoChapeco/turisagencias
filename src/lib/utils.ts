import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { InstallmentOption } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseInstallments(value: unknown): InstallmentOption[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];

    const record = item as Record<string, unknown>;
    const type = typeof record.type === "string" ? record.type : null;
    const installmentCount =
      typeof record.installment_count === "number"
        ? record.installment_count
        : Number(record.installment_count);
    const amount = typeof record.value === "number" ? record.value : Number(record.value);

    if (!type || !Number.isFinite(installmentCount) || !Number.isFinite(amount)) {
      return [];
    }

    return [{ type, installment_count: installmentCount, value: amount }];
  });
}

export function getClientName(
  client:
    | { name?: string | null }
    | Array<{ name?: string | null }>
    | null
    | undefined,
) {
  const relation = Array.isArray(client) ? client[0] : client;
  return relation?.name ?? null;
}
