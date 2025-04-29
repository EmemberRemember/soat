import { ImageFile } from "@/types/file";
import { EnrollState } from "./../redux/slices/enrollSlice";
import { DailyPerformances } from "@/types/enrollment";

interface useValidationEnrollmentProps {
  enroll: EnrollState;
}
export function useValidationEnrollment({
  enroll,
}: useValidationEnrollmentProps) {
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
  } = enroll;

  let invalidFieldName = "";
  let isValid = true;

  const isValidPoster = (poster: ImageFile) => {
    const { fileName, fileSize, fileType, url } = poster;
    return (
      !!fileName &&
      !!fileSize &&
      !!fileType &&
      !!url &&
      fileSize > 0 &&
      /^data:image\/[a-z]+;base64/
    );
  };

  const isValidPerformances = (
    performances: DailyPerformances,
    bookingStartDate: string
  ) => {
    const bookingStart = new Date(bookingStartDate);

    if (Object.keys(performances).length <= 0) {
      return false;
    }

    for (const dateKey of Object.keys(performances)) {
      const date = new Date(dateKey);
      if (bookingStart > date) {
        return false;
      }
    }
    return true;
  };

  if (title.trim() === "") {
    invalidFieldName = "enrollTitle"; // 변경된 필드명
    isValid = false;
  } else if (category.trim() === "") {
    invalidFieldName = "category";
    isValid = false;
  } else if (!bookingStartDate || !bookingEndDate) {
    invalidFieldName = "bookingStartDate"; // 시작 또는 종료 날짜 없음
    isValid = false;
  } else if (new Date(bookingStartDate) > new Date(bookingEndDate)) {
    invalidFieldName = "enrollBookingEndDate";
    isValid = false;
  } else if (
    address.trim() === "" ||
    detailAddress.trim() === "" ||
    postCode.trim() === ""
  ) {
    invalidFieldName = "enrollDetailAddress";
    isValid = false;
  } else if (poster === null || !isValidPoster(poster)) {
    invalidFieldName = "poster";
    isValid = false;
  } else if (!isValidPerformances(performances, bookingStartDate)) {
    invalidFieldName = "performances";
    isValid = false;
  }

  return { isValid, invalidFieldName };
}
