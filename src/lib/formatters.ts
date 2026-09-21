export function formatCurrency(value: number | null | undefined): string {
  const v = value ?? 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export function formatNumber(value: number | null | undefined): string {
  const v = value ?? 0;
  return new Intl.NumberFormat("pt-BR").format(Math.round(v));
}

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  const v = value ?? 0;
  return `${v.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function formatDateLong(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
}

export const MONTH_NAMES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function formatMonthYear(month: number, year: number): string {
  return `${MONTH_NAMES_PT[month - 1]} de ${year}`;
}

/** Converte uma string digitada em formulário (ex: "1.234,56") para número. */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3},)/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}
