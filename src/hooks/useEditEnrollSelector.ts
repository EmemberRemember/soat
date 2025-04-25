// hooks/useEnrollEditSelector.ts
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { EnrollEditState } from "@/redux/slices/enrollEditSlice"; // Import the EnrollEditState type

interface UseEnrollEditSelectorResult {
  editTitle: string;
  editCategory: string;
  editBookingStartDate: string;
  editBookingEndDate: string;
  editPostCode: string;
  editAddress: string;
  editDetailAddress: string;
  editPoster: EnrollEditState["poster"];
  editPerformances: EnrollEditState["performances"];
  editContent: string;
  editPrice: number;
  editIsDirty: boolean;
  editStep: EnrollEditState["step"];
  editInvalidField: string;
}

export const useEnrollEditSelector = (): UseEnrollEditSelectorResult => {
  const {
    title: editTitle,
    category: editCategory,
    bookingStartDate: editBookingStartDate,
    bookingEndDate: editBookingEndDate,
    postCode: editPostCode,
    address: editAddress,
    detailAddress: editDetailAddress,
    poster: editPoster,
    performances: editPerformances,
    content: editContent,
    price: editPrice,
    isDirty: editIsDirty,
    step: editStep,
    invalidField: editInvalidField,
  } = useSelector((state: RootState) => state.enrollEdit);

  return {
    editTitle,
    editCategory,
    editBookingStartDate,
    editBookingEndDate,
    editPostCode,
    editAddress,
    editDetailAddress,
    editPoster,
    editPerformances,
    editContent,
    editPrice,
    editIsDirty,
    editStep,
    editInvalidField,
  };
};