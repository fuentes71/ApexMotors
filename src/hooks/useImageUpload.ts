import { useState } from 'react';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64Str = await convertToBase64(file);
      onSuccess(base64Str);
    } catch (err) {
      console.error("Error converting image:", err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return { handleUpload, isUploading, convertToBase64 };
}
