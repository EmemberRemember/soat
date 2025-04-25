"use client";
import React from "react";
import { Plus } from "lucide-react";
import { usePosterHandler } from "@/hooks/usePosterHandler";

interface EnrollPosterProps {
  isEdit?: boolean;
  }
  export default function EnrollPoster({isEdit = false}:EnrollPosterProps) {
    const { fileName, previewPoster, handleFileChange } = usePosterHandler({
    isEditMode: isEdit,
  });

    const handleOnFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      await handleFileChange(file)
    }
 
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
            onChange={handleOnFileChange}
          />
        </div>
      </>
    );
  }
