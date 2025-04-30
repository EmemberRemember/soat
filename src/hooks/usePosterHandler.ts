import { setEditPoster } from "@/redux/slices/enrollEditSlice";
import { setPoster } from "@/redux/slices/enrollSlice";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useEnrollSelector } from "./useEnrollSelector";
import { useEnrollEditSelector } from "./useEditEnrollSelector";
import { getImageURLIndexedDB, saveImageIndexedDB } from "@/utils/Images";
import { deleteImage } from "@/services/indexedDBService";

interface UsePosterHandlerProps {
  isEditMode: boolean;
}

interface UsePosterHandlerResult {
  fileName: string;
  previewPoster: string | undefined;
  handleFileChange: (file: File | null) => Promise<void>;
}

export const usePosterHandler = ({
  isEditMode = false,
}: UsePosterHandlerProps): UsePosterHandlerResult => {
  const [fileName, setFileName] = useState<string>("");
  const { poster: enrollPoster } = useEnrollSelector();
  const { editPoster } = useEnrollEditSelector();
  const dispatch = useDispatch();
  const poster = isEditMode ? editPoster : enrollPoster;
  const previewPoster = poster?.url;

  const handleFileChange = useCallback(
    async (file: File | null) => {
      if (file) {
        try {
          if (poster && poster.fileKey) {
            await deleteImage(poster.fileKey);
          }
          const fileId = await saveImageIndexedDB(file);
          const imageUrl = await getImageURLIndexedDB(fileId);
          setFileName(file.name);
          const posterData = {
            fileKey: fileId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            url: imageUrl,
          };
          if (isEditMode) {
            dispatch(setEditPoster(posterData));
          } else {
            dispatch(setPoster(posterData));
          }
        } catch (error) {
          console.error("포스터 업로드에 실패했습니다", error);
          setFileName("");
          if (isEditMode) {
            dispatch(setEditPoster(null));
          } else {
            dispatch(setPoster(null));
          }
          alert("포스터 업로드에 실패했습니다.");
        }
      }
    },
    [dispatch, isEditMode, poster]
  );

  return { fileName, previewPoster, handleFileChange };
};
