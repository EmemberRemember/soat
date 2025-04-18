import { SellerUserData } from "./users";

export interface GeneralUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  phoneNumber: string;
  password?: undefined;
}

export interface TheaterAdminUser {
  email: string;
  username: string;
  createdAt: string;
  joinType: string;
}

export interface NewTheaterAdmin extends SellerUserData {}

export interface Performance {
  title: string;
  category: string;
  team: string;
  reportedStatus: string;
}

export interface Review {
  title: string;
  reviewer: string;
  reviewDate: string;
  reportedStatus: string;
}

export interface Banner {
  id: number;
  bannerTitle: string;
  registrationDate: string;
  bannerStatus: string;
}

export interface NewBanner extends Banner {
  bannerImage: File | null;
  alternativeText: string;
  bannerLink: string;
}

export interface SiteAdmin {
  email: string;
  siteAdmin: string;
  permissions: string;
}
