import React, { useRef } from 'react';

interface FileUploadProps {
  id: string;
  multiple?: boolean;
  accept?: string;
  onChange: (files: FileList | null) => void;
  selectedFiles: FileList | null;
  selectButtonText: string;
  noFileText: string;
  filesSelectedText: string;
  fileSelectedText: string;
  className?: string;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  multiple = false,
  accept = "image/*",
  onChange,
  selectedFiles,
  selectButtonText,
  noFileText,
  filesSelectedText,
  fileSelectedText,
  className = "",
  required = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files);
  };

  const getFileStatusText = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      return noFileText;
    }
    
    if (multiple) {
      return `${selectedFiles.length} ${selectedFiles.length === 1 ? fileSelectedText : filesSelectedText}`;
    } else {
      return selectedFiles[0].name;
    }
  };

  return (
    <div className={`file-upload-container ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        required={required}
        style={{ display: 'none' }}
      />
      <div className="file-upload-area" onClick={handleButtonClick}>
        <button type="button" className="file-select-button">
          {selectButtonText}
        </button>
        <span className="file-status">
          {getFileStatusText()}
        </span>
      </div>
    </div>
  );
};

export default FileUpload;
