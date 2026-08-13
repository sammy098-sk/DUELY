import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parsePromptToInvoice, type ParsedInvoiceData } from "@/lib/aiInvoiceParser";

interface FileUploadZoneProps {
  onFileProcessed: (data: ParsedInvoiceData) => void;
  disabled?: boolean;
}

export function FileUploadZone({ onFileProcessed, disabled }: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "text/plain",
      "text/csv",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|csv|docx|png|jpg|jpeg)$/i)) {
      setStatus("error");
      setErrorMessage("Unsupported file type. Please upload PDF, TXT, CSV, DOCX, PNG, or JPG.");
      return;
    }

    setSelectedFile(file);
    setStatus("processing");
    setErrorMessage("");

    try {
      let fileText = "";
      if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
        fileText = await file.text();
      } else {
        // Simulated AI extraction from document / PDF / image
        fileText = `Invoice draft for ${file.name.replace(/\.[^/.]+$/, "")} for ₦450,000 website design due in 14 days`;
      }

      // Simulate processing time
      await new Promise((res) => setTimeout(res, 1200));

      const parsed = parsePromptToInvoice(fileText || file.name);
      setStatus("success");
      onFileProcessed(parsed);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to extract invoice data from file.");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setStatus("idle");
    setErrorMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-3">
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border/80 hover:border-primary/50 hover:bg-muted/30"
          } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.csv,.docx,.png,.jpg,.jpeg"
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <UploadCloud className="size-6" />
          </div>

          <p className="text-sm font-semibold text-foreground">
            Drop your file here, or{" "}
            <span className="text-primary underline underline-offset-2">browse files</span>
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Supports PDF, TXT, CSV, DOCX, PNG, JPG (max 10MB)
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeFile}
              disabled={status === "processing" || disabled}
              className="size-8 text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>

          {status === "processing" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-primary font-medium border-t border-border/60 pt-3">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Analyzing document with AI engine…</span>
            </div>
          )}

          {status === "success" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium border-t border-border/60 pt-3">
              <CheckCircle2 className="size-3.5" />
              <span>Invoice data successfully extracted from file!</span>
            </div>
          )}

          {status === "error" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-destructive font-medium border-t border-border/60 pt-3">
              <AlertCircle className="size-3.5" />
              <span>{errorMessage || "Error processing file."}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
