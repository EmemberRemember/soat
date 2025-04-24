// hooks/useEnrollmentData.ts
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { EnrollState } from "@/redux/slices/enrollSlice";
import { EnrollEditState } from "@/redux/slices/enrollEditSlice";

interface UseEnrollmentDataProps {
  isEdit: boolean; 
}

interface UseEnrollmentDataResult {
  title: string;
  category: string;
  bookingStartDate: string;
  bookingEndDate: string;
  postCode: string;
  address: string;
  detailAddress: string;
  poster: EnrollState["poster"] | EnrollEditState["poster"];
  performances: EnrollState["performances"] | EnrollEditState["performances"];
  price: number;
  isDirty: boolean;
  step: EnrollState["step"] | EnrollEditState["step"];
  invalidField: string;
  files: string[];
  content: string;

}

export const useEnrollmentData = ({
  isEdit, // prop 이름 변경
}: UseEnrollmentDataProps): UseEnrollmentDataResult => {
  const enroll = useSelector((state: RootState) => state.enroll);
  const editEnroll = useSelector((state: RootState) => state.enrollEdit);

  return {
    title: isEdit ? editEnroll.title : enroll.title,
    category: isEdit ? editEnroll.category : enroll.category,
    bookingStartDate: isEdit ? editEnroll.bookingStartDate : enroll.bookingStartDate,
    bookingEndDate: isEdit ? editEnroll.bookingEndDate : enroll.bookingEndDate,
    postCode: isEdit ? editEnroll.postCode : enroll.postCode,
    address: isEdit ? editEnroll.address : enroll.address,
    detailAddress: isEdit ? editEnroll.detailAddress : enroll.detailAddress,
    poster: isEdit ? editEnroll.poster : enroll.poster,
    performances: isEdit ? editEnroll.performances : enroll.performances,
    price: isEdit ? editEnroll.price : enroll.price,
    isDirty: isEdit ? editEnroll.isDirty : enroll.isDirty,
    step: isEdit ? editEnroll.step : enroll.step,
    invalidField: isEdit ? editEnroll.invalidField : enroll.invalidField,
    files: isEdit ? editEnroll.files : enroll.files,
    content : isEdit ? editEnroll.content : enroll.content
  };
};