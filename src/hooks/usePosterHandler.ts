import { setEditPoster } from "@/redux/slices/enrollEditSlice";
import { setPoster } from "@/redux/slices/enrollSlice";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useEnrollSelector } from "./useEnrollSelector";
import { useEnrollEditSelector } from "./useEditEnrollSelector";

interface UsePosterHandlerProps {
    isEditMode: boolean;
}

interface UsePosterHandlerResult  {
    fileName: string;
    previewPoster: string | undefined;
    handleFileChange: (file: File | null) => Promise<void>;
}

const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((res) => {
        const blob = new Blob([file], { type: file.type });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64String = reader.result;
            res(base64String as string);
        };
    });
};


export const usePosterHandler = ({ isEditMode = false}: UsePosterHandlerProps): UsePosterHandlerResult => {
    const [fileName, setFileName] = useState<string>("");
    const { poster: enrollPoster } = useEnrollSelector()
    const { editPoster } = useEnrollEditSelector();  
    const dispatch = useDispatch();
    const poster = isEditMode ? editPoster : enrollPoster;
    const previewPoster = poster?.url

    const handleFileChange = useCallback(async (file: File | null) => {
    if (file) {
      const base64File = await imageToBase64(file);
      setFileName(file.name);
      const posterData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: base64File,
      };
      if (isEditMode) {
        dispatch(setEditPoster(posterData));
      } else {
        dispatch(setPoster(posterData));
      }
    } else {
      setFileName("");
      if (isEditMode) {
        dispatch(setEditPoster(null));
      } else {
        dispatch(setPoster(null));
      }
    }
  }, [dispatch, isEditMode]);
   return { fileName, previewPoster, handleFileChange };
}
