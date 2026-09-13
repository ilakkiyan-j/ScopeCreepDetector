'use client';

import React, { useRef } from 'react';
import { UploadCloud, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface StagedFile {
  id: string;
  name: string;
  size: number;
  source: 'file' | 'sample';
  file?: File;
  text?: string;
}

const ACCEPTED_EXTENSIONS = '.txt,.csv,.json';

export function readStagedText(files: StagedFile[]): Promise<string> {
  const readers = files.map(async (entry): Promise<string> => {
    if (entry.text != null) return entry.text;
    const file = entry.file;
    if (!file) return '';
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error(`Could not read ${entry.name}`));
      reader.readAsText(file);
    });
  });
  return Promise.all(readers).then((parts) =>
    parts.filter((p) => p.trim()).join('\n')
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileStaging({
  files,
  onChange,
  onAddFiles,
}: {
  files: StagedFile[];
  onChange: (files: StagedFile[]) => void;
  onAddFiles?: (files: StagedFile[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const appendFiles = (list: FileList | File[]) => {
    const next = Array.from(list)
      .filter((f) => /\.(txt|csv|json)$/i.test(f.name))
      .map<StagedFile>((f) => ({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        size: f.size,
        source: 'file',
        file: f,
      }));
    if (next.length === 0) return;
    const merged = [...files, ...next];
    onChange(merged);
    onAddFiles?.(merged);
  };

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  const remaining = files.filter((f) => f.source === 'file').length;

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.length) appendFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          isDragOver
            ? 'border-ring bg-primary/5'
            : 'border-input bg-card hover:border-ring/60 hover:bg-muted/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
        )}
        aria-label="Choose conversation files to upload"
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Drop files here</span>
        <span className="text-xs text-muted-foreground">
          or <span className="font-semibold text-info">Browse files</span> (.txt, .csv, .json)
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) appendFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Staged list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Selected Files ({files.length})
          </p>
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <FileText className="h-4 w-4 shrink-0 text-info" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{f.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatSize(f.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  aria-label={`Remove ${f.name}`}
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Plus className="h-4 w-4" /> Add More
          </Button>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {remaining > 0
          ? `${remaining} file${remaining === 1 ? '' : 's'} staged and ready to upload.`
          : files.length > 0
            ? 'All staged files are sample content.'
            : 'No files staged yet.'}
      </p>
    </div>
  );
}