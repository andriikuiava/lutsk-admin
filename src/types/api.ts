export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export type User = {
  id: number;
  email: string;
  fullName: string;
};

export type PaidTour = {
  id: string;
  title: string;
};

export type UserInfo = {
  id: number;
  email: string;
  fullName: string | null;
  paidTours: PaidTour[];
};

export type Place = {
  id: string;
  title: string;
  type: 'HISTORICAL' | string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  images?: string[];
  link?: string;
  price?: number;
  phone?: string;
  googleMapsLink?: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  images?: string[];
  timePublished: string;
  latitude: number;
  longitude: number;
  eventTime: string;
  link?: string;
  price?: string;
  address: string;
  phone?: string;
};

export type ArticleContent = {
  contentType: 'TEXT' | 'IMAGE' | 'AUDIO';
  title: string;
  text: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  position: number;
};

export type Article = {
  id: string;
  title: string;
  articleType: string;
  mainImage: string;
  datePublished: string;
  contents?: ArticleContent[];
};

export type TourStop = {
  id?: string;
  title: string;
  description: string;
  coverImage: string;
  latitude: number;
  longitude: number;
  position: number;
  address: string;
  contents: ArticleContent[];
};

export type Tour = {
  id: string;
  title: string;
  description: string;
  duration: string;
  coverImage: string;
  datePublished: string;
  latitude: number;
  longitude: number;
  startingAddress: string;
  stopsCount?: number;
  isPurchased?: boolean;
  productId?: string;
  stops?: TourStop[];
};

export type UploadResponse = {
  url?: string;
  urls?: string[];
  keys?: string[];
};

export type IAPVerification = {
  transactionId: string;
  purchaseToken: string;
  productId: string;
  source: 'GOOGLE_PLAY' | string;
}; 