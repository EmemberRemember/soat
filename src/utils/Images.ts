import { getImage, saveImage } from "@/services/indexedDBService";
import { ImageItem } from "@/types/file";
import { v4 as uuidv4 } from "uuid";

export const saveImageIndexedDB = async (file: File): Promise<string> => {
  const newImageItem: ImageItem = {
    id: uuidv4(),
    title: file.name,
    imageData: null,
    imageType: file.type,
    uploadedAt: Date.now(),
  };

  const reader = new FileReader();
  // Promise를 반환하여 비동기적으로 작업 완료 후 id를 반환
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      newImageItem.imageData = reader.result as ArrayBuffer;
      try {
        await saveImage(newImageItem); // 이미지 저장
        resolve(newImageItem.id); // id를 반환
      } catch (error) {
        console.error("이미지 저장 에러", error);
        reject(error); // 에러 발생 시 reject
      }
    };

    reader.onerror = (error) => {
      console.log("이미지 파일 읽기 에러", error);
      reject(error); // 에러 발생 시 reject
    };

    reader.readAsArrayBuffer(file); // 파일을 ArrayBuffer로 읽기 시작
  });
};

export const getImageURLIndexedDB = async (id: string) => {
  try {
    const image = await getImage(id);
    if (image && image.imageData) {
      const blob = new Blob([image.imageData], { type: image.imageType });
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    } else {
      throw new Error("이미지를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("이미지 미리보기 에러", error);
    throw error;
  }
};
