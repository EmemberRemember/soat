"use client";
import React, {  useRef, useState } from "react";
import TextArea from "../controls/TextArea";
import { useDispatch } from "react-redux";
import { setContent } from "@/redux/slices/enrollSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { useEnrollmentData } from "@/hooks/useEnrollmentData";

interface HtmlEditorProps {
  isParentEdit: boolean;
}

export default function HtmlEditor({isParentEdit} : HtmlEditorProps) {
  const { content } = useEnrollmentData({ isEdit: isParentEdit })
  const [htmlContent, setHtmlContent] = useState<string>(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dispatch = useDispatch();

  const debounceSetContent = useDebounce((htmlContent: string) => {
    dispatch(setContent(htmlContent));
  }, 500);

  const handleContent = (newString: string) => {
    setHtmlContent(newString);
    debounceSetContent(newString);
  };

  const handleInput = () => {
    if (textareaRef.current === null) {
      //여기서 null체크
      return;
    }

    requestAnimationFrame(() => {
      textareaRef.current!.style.height = "auto"; // 높이 초기화
      textareaRef.current!.style.height = `${
        textareaRef.current!.scrollHeight
      }px`; // 내용에 맞게 조절
    });
  };

  return (
    <TextArea
      resize={false}
      ref={textareaRef}
      className="rounded-none min-h-[600px] overflow-hidden"
      value={htmlContent}
      onChange={handleContent}
      onInput={handleInput}
    />
  );
}
