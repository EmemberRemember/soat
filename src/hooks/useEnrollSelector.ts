// hooks/useEnrollSelector.ts
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { EnrollState } from "@/redux/slices/enrollSlice"; // Import the EnrollState type

interface UseEnrollSelectorResult {
  title: string;
  category: string;
  bookingStartDate: string;
  bookingEndDate: string;
  postCode: string;
  address: string;
  detailAddress: string;
  poster: EnrollState["poster"];
  performances: EnrollState["performances"];
  content: string;
  files: string[];
  price: number;
  isDirty: boolean;
  step: EnrollState["step"];
  invalidField: string;
}

export const useEnrollSelector = (): UseEnrollSelectorResult => {
  const {
    title,
    category,
    bookingStartDate,
    bookingEndDate,
    postCode,
    address,
    detailAddress,
    poster,
    performances,
    content,
    files,
    price,
    isDirty,
    step,
    invalidField,
  } = useSelector((state: RootState) => state.enroll);

  return {
    title,
    category,
    bookingStartDate,
    bookingEndDate,
    postCode,
    address,
    detailAddress,
    poster,
    performances,
    content,
    files,
    price,
    isDirty,
    step,
    invalidField,
  };
};