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
  // Дополнительно для предпросмотра уже сохранённых изображений (URL)
  previewUrls?: string[]; // для случаев, когда уже есть загруженные фото (кабинет)
  onRemoveUrl?: (url: string) => void;
  // Удаление файлов из текущего выбора (регистрация/новая загрузка)
  onRemoveFile?: (index: number) => void;
  maxFiles?: number;
  // DnD reorder support
  onReorderUrl?: (fromIndex: number, toIndex: number) => void;
  onReorderFile?: (fromIndex: number, toIndex: number) => void;
  // Подпись под кнопкой загрузки
  uploadHint?: string;
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
  required = false,
  previewUrls = [],
  onRemoveUrl,
  onRemoveFile,
  maxFiles,
  onReorderUrl,
  onReorderFile,
  uploadHint
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItemRef = useRef<{ type: 'url' | 'file'; index: number } | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && maxFiles && multiple) {
      if (files.length > maxFiles) {
        const dataTransfer = new DataTransfer();
        for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
          dataTransfer.items.add(files[i]);
        }
        onChange(dataTransfer.files);
        return;
      }
    }
    onChange(files);
  };

  const getFileStatusText = () => {
    // Если есть выбранные файлы
    if (selectedFiles && selectedFiles.length > 0) {
      if (multiple) {
        return `${selectedFiles.length} ${selectedFiles.length === 1 ? fileSelectedText : filesSelectedText}`;
      } else {
        return selectedFiles[0].name;
      }
    }
    
    // Если есть предпросмотр URL (для редактирования)
    if (previewUrls && previewUrls.length > 0) {
      if (multiple) {
        return `${previewUrls.length} ${previewUrls.length === 1 ? fileSelectedText : filesSelectedText}`;
      } else {
        return fileSelectedText;
      }
    }
    
    // Если ничего нет
    return noFileText;
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
      
      {uploadHint && (
        <div className="file-upload-hint">
          {uploadHint}
        </div>
      )}

      {(previewUrls?.length || (selectedFiles && selectedFiles.length)) ? (
        <div className="file-preview-grid">
          {/* Сначала уже сохранённые URL */}
          {previewUrls?.map((url, idx) => (
            <div
              key={url}
              className="file-preview-item"
              draggable={!!onReorderUrl}
              onDragStart={() => (dragItemRef.current = { type: 'url', index: idx })}
              onDragOver={(e) => onReorderUrl && e.preventDefault()}
              onDrop={(e) => {
                if (!onReorderUrl) return;
                e.preventDefault();
                const src = dragItemRef.current;
                if (src && src.type === 'url' && src.index !== idx) {
                  onReorderUrl(src.index, idx);
                }
                dragItemRef.current = null;
              }}
            >
              <img src={url} alt="preview" className="file-preview-img" />
              {onRemoveUrl && (
                <button type="button" className="file-remove-btn" onClick={(e) => { e.stopPropagation(); onRemoveUrl(url); }}>
                  ×
                </button>
              )}
            </div>
          ))}
          {/* Затем выбранные файлы текущей сессии */}
          {selectedFiles && Array.from(selectedFiles).map((f, idx) => {
            const url = URL.createObjectURL(f);
            return (
              <div
                key={`${f.name}-${idx}`}
                className="file-preview-item"
                draggable={!!onReorderFile}
                onDragStart={() => (dragItemRef.current = { type: 'file', index: idx })}
                onDragOver={(e) => onReorderFile && e.preventDefault()}
                onDrop={(e) => {
                  if (!onReorderFile) return;
                  e.preventDefault();
                  const src = dragItemRef.current;
                  if (src && src.type === 'file' && src.index !== idx) {
                    onReorderFile(src.index, idx);
                  }
                  dragItemRef.current = null;
                }}
              >
                <img src={url} alt={f.name} className="file-preview-img" />
                {onRemoveFile && (
                  <button type="button" className="file-remove-btn" onClick={(e) => { e.stopPropagation(); onRemoveFile(idx); }}>
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default FileUpload;
