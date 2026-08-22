import { apiRequest } from "@/lib/api/client";

export interface PaymentRow {
  id: string;
  amount: number;
  paidOn: string;
  forMonth: string | null;
  note: string | null;
  residentId: string;
  residentName: string;
  roomNumber: string | null;
}

export interface MonthlyEarning {
  /** YYYY-MM, kept as a plain month so no timezone can shift it. */
  month: string;
  collected: number;
}

export interface PaymentsSummary {
  /** Every payment ever recorded for this PG. */
  totalEarnings: number;
  /** Collected inside the requested period. */
  collected: number;
  /** Owed right now across active guests. */
  dueAmount: number;
  guestsInArrears: number;
  /** Rent plus services billed each month across active guests. */
  expectedMonthly: number;
  from: string;
  to: string;
  monthly: MonthlyEarning[];
  recent: PaymentRow[];
}

export async function fetchPaymentsSummary(params: {
  from?: string;
  to?: string;
}): Promise<PaymentsSummary> {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);

  const suffix = query.toString() ? `?${query}` : "";
  const response = await apiRequest<{ data: PaymentsSummary }>(
    `/v1/pg/me/payments/summary${suffix}`
  );

  return response.data;
}
