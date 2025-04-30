import { KakaoAddressData } from "./kakao";

export interface Performance {
  time: string;
  casting: string[];
}

export interface DailyPerformances {
  [date: string]: Performance[];
}

export interface EnrollFormFields {
  title: string;
  category: string;
  bookingStartDate: string;
  address: string;
  detailAddress: string;
  postCode: string;
  price: number;
}

export interface EnrollFormData extends EnrollFormFields {
  poster: File | null;
  performances: DailyPerformances;
}

export interface EnrollPosterProps {
  onPosterChange: (value: File | null) => void;
}

export interface EnrollFormItemsProps extends EnrollFormFields {
  onChange: (field: keyof EnrollFormFields, value: string) => void;
  handleSearchAddress: (data: KakaoAddressData) => void;
}
export type EnrollModalMode = "add" | "edit";

export interface EnrollModalProps {
  onClose: () => void;
  onConfirm: (dates: string[], time: string, casting: string[]) => void;
  selectedDates: CalendarValue;
  initTime?: string;
  initCasting?: string[];
  mode: EnrollModalMode;
  isParentEdit: boolean;
}

export interface PerformanceInfoProps {
  date: Date;
  performances: Performance[];
  onEdit: (time: string, casting: string[], index: number) => void;
  isParentEdit: boolean;
}

export type CalendarValuePiece = Date | null;
export type CalendarValue =
  | CalendarValuePiece
  | [CalendarValuePiece, CalendarValuePiece];

export enum EnrollStep {
  EnrollPerformance = 0,
  EnrollSeats = 1,
}
