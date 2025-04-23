"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setPoster } from "@/redux/slices/enrollSlice";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function EnrollPoster() {
  const [fileName, setFileName] = useState<string>("");
  const poster = useSelector((state: RootState) => state.enroll.poster);
  const previewPoster = poster?.base64Data;
  const dispatch = useDispatch();

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

  const handleFileOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      const base64File = await imageToBase64(file);
      setFileName(file.name);
      dispatch(
        setPoster({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          base64Data: base64File,
        })
      ); // 파일을 Redux에 저장
    }
  };

  return (
    <>
      <div className="relative lg:h-full w-full flex">
        <div className="w-full h-full border-2 hidden lg:block">
          {previewPoster && (
            <img
              className="w-[380px] h-[520px] object-cover aspec-[270/210]"
              src={previewPoster}
              alt="포스터 미리보기"
            />
          )}
        </div>

        <div className="border-2 rounded-lg px-4 py-2 flex-1 w-full bg-background lg:hidden">
          {fileName ? fileName : "파일을 선택하세요"}
        </div>
        <label
          className="flex justify-center items-center  rounded-md lg:w-[36px] lg:aspect-[1/1] lg:rounded-full lg:absolute lg:bottom-5 lg:right-5 lg:bg-flesh-500 lg:z-100  cursor-pointer lg:hover:bg-flesh-700 transition"
          htmlFor="poster"
        >
          <Plus className="lg:stroke-white" strokeWidth={3} />
        </label>

        <input
          className="sr-only"
          id="poster"
          name="poster"
          type="file"
          onChange={handleFileOnChange}
        />
      </div>
    </>
  );
}
