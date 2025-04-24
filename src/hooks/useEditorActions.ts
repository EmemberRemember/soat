// hooks/useEditorActions.ts
import { useDispatch } from "react-redux";
import { setContent, addFile, deleteFile } from "@/redux/slices/enrollSlice";
import { setEditContent, addEditFile, deleteEditFile } from "@/redux/slices/enrollEditSlice"; // Import edit actions
import { useCallback } from "react";

interface UseEditorActionsProps {
  isEdit: boolean;
}

interface UseEditorActionsResult {
  onSetContent: (content: string) => void;
  onAddFile: (file: string) => void;
  onDeleteFile: (fileKey: string) => void;
}

export const useEditorActions = ({ isEdit }: UseEditorActionsProps): UseEditorActionsResult => {
  const dispatch = useDispatch();

  return {
    onSetContent: useCallback(
      (content: string) => dispatch(isEdit ? setEditContent(content) : setContent(content)),
      [dispatch, isEdit]
    ),
    onAddFile: useCallback(
      (file: string) => dispatch(isEdit ? addEditFile(file) : addFile(file)),
      [dispatch, isEdit]
    ),
    onDeleteFile: useCallback(
      (fileKey: string) => dispatch(isEdit ? deleteEditFile(fileKey) : deleteFile(fileKey)),
      [dispatch, isEdit]
    ),
  };
};