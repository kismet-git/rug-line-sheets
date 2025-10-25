const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 0.9;

const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const extensionLookup: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function replaceFileExtension(fileName: string, extension: string): string {
  const normalizedExtension = extension.startsWith(".") ? extension : `.${extension}`;
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return `${baseName}${normalizedExtension}`;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";

  const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image for processing"));
  });

  image.src = url;

  if ("decode" in image) {
    try {
      await image.decode();
      return image;
    } catch (error) {
      console.warn("Falling back to image onload handler", error);
    }
  }

  return loadPromise;
}

function getScale(width: number, height: number): number {
  const longestSide = Math.max(width, height);
  if (!longestSide || longestSide <= MAX_DIMENSION) {
    return 1;
  }
  return MAX_DIMENSION / longestSide;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
        return;
      }
      reject(new Error("Unable to encode processed rug image"));
    }, type, quality);
  });
}

function resolveTargetMimeType(originalType: string): string {
  if (originalType === "image/png" || originalType === "image/webp") {
    return originalType;
  }
  if (SUPPORTED_MIME_TYPES.has(originalType)) {
    return originalType;
  }
  return "image/jpeg";
}

export async function prepareRugImage(file: File): Promise<{ blob: Blob; name: string }> {
  if (!file.type.startsWith("image/")) {
    return { blob: file, name: file.name };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    if (!width || !height) {
      return { blob: file, name: file.name };
    }

    const scale = getScale(width, height);
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const targetMimeType = resolveTargetMimeType(file.type);

    if (scale === 1 && targetMimeType === file.type) {
      return { blob: file, name: file.name };
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d", {
      alpha: targetMimeType !== "image/jpeg",
    });

    if (!context) {
      return { blob: file, name: file.name };
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const quality = targetMimeType === "image/jpeg" ? JPEG_QUALITY : undefined;
    const blob = await canvasToBlob(canvas, targetMimeType, quality);
    const extension = extensionLookup[targetMimeType] ?? ".img";
    const name = replaceFileExtension(file.name, extension);

    return { blob, name };
  } catch (error) {
    console.error("Unable to optimise rug image", error);
    return { blob: file, name: file.name };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
