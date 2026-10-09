export type CommunityEvent = {
  id: number;
  title: string;
  content: string;
  coverImage: string | null;
  startDate: string | null;
  endDate: string | null;
  capacity: number | null;
  registrationCount: number;
  remainingCapacity: number | null;
  likes: number;
  /** Admin who created it in the panel; null when a business published it. */
  authorId: string | null;
  /** Seller id of the organising business; null for events EKORU runs. */
  organizerId: string | null;
  status: "SCHEDULED" | "CANCELLED";
  cancelledAt: string | null;
  cancellationReason: string | null;
  communitySubCategoryId: number | null;
  communityCategoryId: number | null;
  locationType: EventLocationType;
  address: string | null;
  countyId: number | null;
  countyName: string | null;
  cityId: number | null;
  cityName: string | null;
  regionId: number | null;
  regionName: string | null;
  onlineUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventLocationType = "IN_PERSON" | "ONLINE" | "HYBRID";

export type CommunityRegistration = {
  id: number;
  communityPostId: number;
  name: string;
  email: string;
  sellerId: string | null;
  createdAt: string;
};

export type CommunityPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type CreateCommunityEventInput = {
  title: string;
  content: string;
  coverImage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  capacity?: number | null;
  communitySubCategoryId?: number | null;
  locationType?: EventLocationType;
  address?: string | null;
  countyId?: number | null;
  onlineUrl?: string | null;
};

export type UpdateCommunityEventInput = Partial<CreateCommunityEventInput>;

export type CommunityReportStatus = "OPEN" | "DISMISSED" | "ACTIONED";
export type CommunityReportAction = "DISMISS" | "CANCEL_EVENT";
export type CommunityReportReason =
  | "SPAM"
  | "SCAM"
  | "INAPPROPRIATE"
  | "MISLEADING"
  | "OTHER";

/** A report on a community event, as the moderation queue shows it. */
export type CommunityEventReport = {
  id: number;
  communityPostId: number;
  eventTitle: string;
  eventStatus: "SCHEDULED" | "CANCELLED";
  eventOrganizerId: string | null;
  openReportsOnEvent: number;
  reason: CommunityReportReason;
  details: string | null;
  status: CommunityReportStatus;
  reporterId: string;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
};
