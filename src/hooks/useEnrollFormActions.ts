// hooks/useEnrollFormActions.ts
import { useDispatch } from "react-redux";
import {
  setAddress,
  setBookingEndDate,
  setBookingStartDate,
  setCategory,
  setDetailAddress,
  setPostCode,
  setPrice,
  setTitle,
} from "@/redux/slices/enrollSlice";
import {
  setEditAddress,
  setEditBookingEndDate,
  setEditBookingStartDate,
  setEditCategory,
  setEditDetailAddress,
  setEditPostCode,
  setEditPrice,
  setEditTitle,
} from "@/redux/slices/enrollEditSlice";
import { useCallback } from "react";

interface UseEnrollFormActionsProps {
  isEdit: boolean;
}

interface UseEnrollFormActionsResult {
  onChangeTitle: (newTitle: string) => void;
  onChangeCategory: (newCategory: string) => void;
  onChangePrice: (newPrice: string) => void;
  onChangeBookingStartDate: (newDate: string) => void;
  onChangeBookingEndDate: (newDate: string) => void;
  onSetAddress: (address: string) => void;
  onSetPostCode: (postCode: string) => void;
  onChangeDetailAddress: (newDetailAddress: string) => void;
}

export const useEnrollFormActions = ({
  isEdit,
}: UseEnrollFormActionsProps): UseEnrollFormActionsResult => {
  const dispatch = useDispatch();

  return {
    onChangeTitle: useCallback(
      (newTitle: string) => dispatch(isEdit ? setEditTitle(newTitle) : setTitle(newTitle)),
      [dispatch, isEdit]
    ),
    onChangeCategory: useCallback(
      (newCategory: string) =>
        dispatch(isEdit ? setEditCategory(newCategory) : setCategory(newCategory)),
      [dispatch, isEdit]
    ),
    onChangePrice: useCallback(
      (newPrice: string) => {
        const priceValue = Number(newPrice);
        if (!isNaN(priceValue)) {
          dispatch(isEdit ? setEditPrice(priceValue) : setPrice(priceValue));
        }
      },
      [dispatch, isEdit]
    ),
    onChangeBookingStartDate: useCallback(
      (newDate: string) =>
        dispatch(
          isEdit ? setEditBookingStartDate(newDate) : setBookingStartDate(newDate)
        ),
      [dispatch, isEdit]
    ),
    onChangeBookingEndDate: useCallback(
      (newDate: string) =>
        dispatch(
          isEdit ? setEditBookingEndDate(newDate) : setBookingEndDate(newDate)
        ),
      [dispatch, isEdit]
    ),
    onSetAddress: useCallback(
      (address: string) => dispatch(isEdit ? setEditAddress(address) : setAddress(address)),
      [dispatch, isEdit]
    ),
    onSetPostCode: useCallback(
      (postCode: string) => dispatch(isEdit ? setEditPostCode(postCode) : setPostCode(postCode)),
      [dispatch, isEdit]
    ),
    onChangeDetailAddress: useCallback(
      (newDetailAddress: string) =>
        dispatch(isEdit ? setEditDetailAddress(newDetailAddress) : setDetailAddress(newDetailAddress)),
      [dispatch, isEdit]
    ),
  };
};