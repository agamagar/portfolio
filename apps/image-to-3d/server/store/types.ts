export interface StoredFile {
  pathname: string;
  url: string;
  size: number;
  uploadedAt: string;
}

/**
 * The minimal storage surface the app needs. Two implementations:
 * Vercel Blob (production) and the local filesystem (dev + tests).
 * Writes never overwrite a path that readers may have cached: new content gets
 * a new pathname (versioned index files, random-suffixed uploads).
 */
export interface Store {
  readonly kind: "blob" | "fs";
  put(pathname: string, data: Uint8Array | string, contentType: string, opts?: { randomSuffix?: boolean }): Promise<StoredFile>;
  read(file: StoredFile): Promise<Uint8Array>;
  list(prefix: string): Promise<StoredFile[]>;
  del(files: StoredFile[]): Promise<void>;
}

export const ROOT = "i3d";
