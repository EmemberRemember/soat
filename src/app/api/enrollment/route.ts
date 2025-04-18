export const dynamic = "force-dynamic";
import { sanitizeHTML } from "./../../../utils/sanitizer";
import { NextResponse, NextRequest } from "next/server";
import { adminDb, adminStorage } from "../firebaseAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";
import { v4 as uuidv4 } from "uuid";
import { sanitizeHTML } from "@/utils/sanitizer";

interface uploadedImages {
  id: string;
  url: string;
  title: string;
  type: string;
}

interface FilesData {
  file: File;
  id: string;
  originalName: string;
}

const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// MIME 타입 검증 함수
const validateMimeType = (mimeType: string) => {
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(`허용되지 않는 파일 형식입니다: ${mimeType}`);
  }
};

const handleImageUpload = async (files: FilesData[], userId: string) => {
  const uploadImages = [];

  for (const fileData of files) {
    validateMimeType(fileData.file.type);
    const buffer = Buffer.from(await fileData.file.arrayBuffer());
    const fileName = `${userId}/${fileData.id}_${fileData.originalName}`;
    const filePath = `performances/${fileName}`;
    //storage에 업로드
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(filePath);
    //메타데이터 설정
    const metadata = {
      contentType: fileData.file.type,
    };

    //파일 업로드
    await fileRef.save(buffer, {
      metadata: metadata,
    });

    //파일을 공개적으로 엑세스 가능하게 설정
    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    uploadImages.push({
      id: fileData.id,
      url: publicUrl,
      title: fileData.originalName,
      type: fileData.file.type,
    });
  }
  return uploadImages;
};

const contentChangeBlobUrlToPublicUrl = (
  content: string,
  uploadedImages: uploadedImages[]
): string => {
  let newContent = content;
  uploadedImages.forEach((image) => {
    const regex = new RegExp(`data-key="${image.id}"[^>]*src="[^"]*"`, "g");
    newContent = newContent.replace(
      regex,
      `data-key="${image.id}" src="${image.url}"`
    );
  });
  return newContent;
};

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userTeam = session.user.teamName;
    const userType = session.user.userType;

    if (userType !== "seller") {
      return NextResponse.json(
        { error: "공연 관리자 회원만 공연을 등록할 수 있습니다." },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const jsonData = formData.get("data");
    if (!jsonData || typeof jsonData !== "string") {
      return NextResponse.json(
        { error: "잘못된 요청 형식입니다." },
        { status: 400 }
      );
    }

    const data = JSON.parse(jsonData);

    const bucket = adminStorage.bucket();

    const files = formData.getAll("image") as File[];

    const fileData = files.map((file) => {
      const [fileId, ...fileNameParts] = file.name.split("_"); // 파일명에서 ID 추출
      const fileName = fileNameParts.join("_"); // 원래 파일명 복원

      return { file, id: fileId, originalName: fileName };
    });

    // 포스터 이미지 처리
    let posterUrl = null;
    if (data.poster && data.poster.base64Data) {
      const posterFileName = `performances/${userId}/${uuidv4()}_${
        data.poster.fileName
      }`;
      const posterFile = bucket.file(posterFileName);

      // base64 데이터에서 실제 바이너리 데이터 추출
      const base64Data = data.poster.base64Data.split(";base64,").pop();
      const posterBuffer = Buffer.from(base64Data, "base64");

      validateMimeType(data.poster.fileType);

      await posterFile.save(posterBuffer, {
        metadata: {
          contentType: data.poster.fileType,
        },
      });

      // 파일 공개 URL 설정
      await posterFile.makePublic();
      posterUrl = `https://storage.googleapis.com/${bucket.name}/${posterFileName}`;

      // 원본 base64 데이터 제거하고 URL로 대체
      data.poster = {
        fileName: data.poster.fileName,
        fileSize: data.poster.fileSize,
        fileType: data.poster.fileType,
        url: posterUrl,
      };
    }

    if (data.content && fileData.length > 0) {
      const uploadImage = await handleImageUpload(fileData, userId);
      const newContent = contentChangeBlobUrlToPublicUrl(
        data.content,
        uploadImage
      );
      data.content = newContent; //이건 html 검증
    }

    const santizeContent = sanitizeHTML(data.content);
    data.content = santizeContent;
    console.log(data.content);
    const performanceRef = await adminDb.collection("performances").add({
      ...data,
      sellerId: userId,
      sellerTeam: userTeam,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: performanceRef.id }, { status: 201 });
  } catch (error) {
    console.error("공연 등록 실패:", error);
    return NextResponse.json(
      { error: "공연 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
