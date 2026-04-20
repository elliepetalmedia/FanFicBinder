import { useEffect, useState, type ChangeEvent } from "react";

const MAX_COVER_BYTES = 8 * 1024 * 1024;

interface CoverImageError {
  title: string;
  description: string;
}

interface CoverImageState {
  coverImage: ArrayBuffer | null;
  coverPreview: string | null;
  handleCoverUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCover: () => void;
}

export function useCoverImage(onError: (error: CoverImageError) => void): CoverImageState {
  const [coverImage, setCoverImage] = useState<ArrayBuffer | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleCoverUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError({
        title: "Invalid File",
        description: "Please upload an image file.",
      });
      event.currentTarget.value = "";
      return;
    }

    if (file.size > MAX_COVER_BYTES) {
      onError({
        title: "Cover Too Large",
        description: "Please upload an image under 8 MB.",
      });
      event.currentTarget.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(previewUrl);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      if (loadEvent.target?.result) {
        setCoverImage(loadEvent.target.result as ArrayBuffer);
      }
    };
    reader.readAsArrayBuffer(file);
    event.currentTarget.value = "";
  };

  const handleRemoveCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setCoverImage(null);
  };

  return {
    coverImage,
    coverPreview,
    handleCoverUpload,
    handleRemoveCover,
  };
}
