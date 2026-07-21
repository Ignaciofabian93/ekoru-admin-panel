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
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

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
};

export type UpdateCommunityEventInput = Partial<CreateCommunityEventInput>;
