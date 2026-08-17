/**
 * Memory-Safe P2P Chunked File Transfer Engine
 * Slices, encrypts, streams, reassembles, and converts files to download Blob URLs.
 */

export const CHUNK_SIZE = 64 * 1024; // 64 KB per chunk

export interface FileChunkEnvelope {
  type: "FILE_CHUNK";
  transferId: string;
  senderId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  totalChunks: number;
  chunkIndex: number;
  chunkDataBase64: string;
  ivBase64: string;
}

export interface FileTransferProgress {
  transferId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  totalChunks: number;
  receivedChunks: number;
  progressPercentage: number;
  status: "transferring" | "completed" | "failed" | "cancelled";
  blobUrl?: string;
}

export class IncomingFileAssembler {
  public transferId: string;
  public fileName: string;
  public fileType: string;
  public fileSize: number;
  public totalChunks: number;
  private chunks: Map<number, ArrayBuffer> = new Map();
  public status: "transferring" | "completed" | "failed" | "cancelled" = "transferring";

  constructor(
    transferId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    totalChunks: number
  ) {
    this.transferId = transferId;
    this.fileName = fileName;
    this.fileType = fileType;
    this.fileSize = fileSize;
    this.totalChunks = totalChunks;
  }

  public addChunk(index: number, buffer: ArrayBuffer): number {
    if (this.status !== "transferring") return this.chunks.size;
    this.chunks.set(index, buffer);
    if (this.chunks.size === this.totalChunks) {
      this.status = "completed";
    }
    return Math.round((this.chunks.size / this.totalChunks) * 100);
  }

  public assembleBlobUrl(): string | null {
    if (this.chunks.size !== this.totalChunks) return null;

    const orderedArray: ArrayBuffer[] = [];
    for (let i = 0; i < this.totalChunks; i++) {
      const chunk = this.chunks.get(i);
      if (!chunk) return null;
      orderedArray.push(chunk);
    }

    const blob = new Blob(orderedArray, { type: this.fileType || "application/octet-stream" });
    return URL.createObjectURL(blob);
  }

  public cancel(): void {
    this.status = "cancelled";
    this.chunks.clear();
  }
}

/**
 * Format bytes to readable size string (e.g., 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
