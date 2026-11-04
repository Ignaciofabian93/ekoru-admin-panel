import type {
  BookingStatus,
  PageInfo,
  QuotationStatus,
} from "@/features/operations/types";
import type { BusinessOrderBuyer } from "@/features/businessOrders/types";

export { BOOKING_STATUSES } from "@/features/operations/types";
export { buyerName as clientName } from "@/features/businessOrders/types";

export type DeskClient = BusinessOrderBuyer;

export type DeskBooking = {
  id: string;
  scheduledDate: string;
  scheduledTimeSlot: string | null;
  agreedPrice: number | null;
  status: BookingStatus;
  clientNotes: string | null;
  providerNotes: string | null;
  cancellationReason: string | null;
  completedAt: string | null;
  createdAt: string;
  service: { id: string; name: string } | null;
  client: DeskClient;
};

export type DeskQuotation = {
  id: string;
  title: string;
  description: string | null;
  estimatedPrice: number | null;
  finalPrice: number | null;
  estimatedDuration: number | null;
  status: QuotationStatus;
  clientNotes: string | null;
  providerNotes: string | null;
  declineReason: string | null;
  paidAt: string | null;
  createdAt: string;
  service: { id: string; name: string } | null;
  client: DeskClient;
};

export type Page<T> = { nodes: T[]; pageInfo: PageInfo };

/**
 * What the provider does from each booking state (ekoru-services
 * `booking-rules.ts`): confirm, start, complete, mark a no-show, cancel.
 * Completing has its own mutation, which also awards the points.
 */
export type BookingMove = "CONFIRMED" | "IN_PROGRESS" | "NO_SHOW" | "complete" | "cancel";

export const BOOKING_MOVES: Partial<Record<BookingStatus, BookingMove[]>> = {
  PENDING: ["CONFIRMED", "cancel"],
  CONFIRMED: ["IN_PROGRESS", "complete", "NO_SHOW", "cancel"],
  IN_PROGRESS: ["complete", "NO_SHOW", "cancel"],
};
