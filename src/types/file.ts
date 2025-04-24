export interface ImageFile {
  fileKey?: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

export interface ImageItem {
  id: string;
  title: string;
  imageData: Blob | File | ArrayBuffer | null;
  imageType: string;
  tumbnail?: Blob;
  uploadedAt: number;
}
