declare module "pptx-browser" {
  export default class PptxRenderer {
    slideCount: number;
    load(
      source: File | Blob | ArrayBuffer | Uint8Array,
      onProgress?: (progress: number, message: string) => void,
    ): Promise<void>;
    renderSlide(slideIndex: number, canvas: HTMLCanvasElement, width?: number): Promise<void>;
    destroy(): void;
  }
}

declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const src: string;
  export default src;
}
