import React, { useRef } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';

interface ImageUploaderProps {
  onImageUploaded: (base64Str: string) => void;
  children: (props: { onClick: () => void; isUploading: boolean }) => React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, children }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleUpload, isUploading } = useImageUpload();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {children({ onClick: handleClick, isUploading })}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleUpload(e, onImageUploaded)}
        className="hidden"
        accept="image/*"
      />
    </>
  );
};
