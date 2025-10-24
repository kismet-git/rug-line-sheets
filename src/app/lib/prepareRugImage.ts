type Rgb = {
  r: number;
  g: number;
  b: number;
};

type BackgroundProfile = {
  reference: Rgb;
  toleranceSq: number;
  brightnessThreshold: number;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = url;
  });
}

function isLikelyJpeg(file: File): boolean {
  if (file.type) {
    return /image\/jpeg|image\/jpg/i.test(file.type);
  }
  return /\.jpe?g$/i.test(file.name);
}

function colorDistanceSq(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

function sampleEdgeColors(
  imageData: ImageData,
  width: number,
  height: number,
): Rgb[] {
  const { data } = imageData;
  const samples: Rgb[] = [];
  const stepX = Math.max(1, Math.floor(width / 120));
  const stepY = Math.max(1, Math.floor(height / 120));

  for (let x = 0; x < width; x += stepX) {
    const topIndex = (x * 4);
    const bottomIndex = ((height - 1) * width + x) * 4;
    samples.push({ r: data[topIndex], g: data[topIndex + 1], b: data[topIndex + 2] });
    samples.push({
      r: data[bottomIndex],
      g: data[bottomIndex + 1],
      b: data[bottomIndex + 2],
    });
  }

  for (let y = 0; y < height; y += stepY) {
    const leftIndex = (y * width) * 4;
    const rightIndex = (y * width + (width - 1)) * 4;
    samples.push({ r: data[leftIndex], g: data[leftIndex + 1], b: data[leftIndex + 2] });
    samples.push({
      r: data[rightIndex],
      g: data[rightIndex + 1],
      b: data[rightIndex + 2],
    });
  }

  return samples;
}

function determineBackgroundProfile(
  imageData: ImageData,
  width: number,
  height: number,
): BackgroundProfile | null {
  const samples = sampleEdgeColors(imageData, width, height);
  if (samples.length === 0) {
    return null;
  }

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  samples.forEach(({ r, g, b }) => {
    totalR += r;
    totalG += g;
    totalB += b;
  });

  const reference: Rgb = {
    r: totalR / samples.length,
    g: totalG / samples.length,
    b: totalB / samples.length,
  };

  let maxDistanceSq = 0;
  let minBrightness = 255;
  samples.forEach((sample) => {
    const distanceSq = colorDistanceSq(sample, reference);
    if (distanceSq > maxDistanceSq) {
      maxDistanceSq = distanceSq;
    }
    const brightness = Math.max(sample.r, sample.g, sample.b);
    if (brightness < minBrightness) {
      minBrightness = brightness;
    }
  });

  const tolerance = Math.max(18, Math.sqrt(maxDistanceSq) + 10);
  const brightnessThreshold = Math.max(180, minBrightness - 5);

  return { reference, toleranceSq: tolerance * tolerance, brightnessThreshold };
}

function backgroundFloodFill(
  imageData: ImageData,
  width: number,
  height: number,
  background: BackgroundProfile,
) {
  const { data } = imageData;
  const totalPixels = width * height;
  const queue = new Uint32Array(totalPixels);
  const visited = new Uint8Array(totalPixels);
  let head = 0;
  let tail = 0;

  const isBackground = (index: number) => {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const brightness = Math.max(r, g, b);
    if (brightness < background.brightnessThreshold) {
      return false;
    }
    const distanceSq = colorDistanceSq({ r, g, b }, background.reference);
    return distanceSq <= background.toleranceSq;
  };

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const position = y * width + x;
    if (visited[position]) return;
    const pixelIndex = position * 4;
    if (!isBackground(pixelIndex)) return;
    visited[position] = 1;
    queue[tail++] = position;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < tail) {
    const position = queue[head++];
    const pixelIndex = position * 4;
    data[pixelIndex + 3] = 0;
    const x = position % width;
    const y = (position - x) / width;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }
}

function calculateBoundingBox(imageData: ImageData, width: number, height: number) {
  const { data } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index + 3] !== 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1 || maxY === -1) {
    return null;
  }

  const padding = 2;
  const paddedMinX = Math.max(0, minX - padding);
  const paddedMinY = Math.max(0, minY - padding);
  const paddedMaxX = Math.min(width - 1, maxX + padding);
  const paddedMaxY = Math.min(height - 1, maxY + padding);

  return {
    minX: paddedMinX,
    minY: paddedMinY,
    maxX: paddedMaxX,
    maxY: paddedMaxY,
    width: paddedMaxX - paddedMinX + 1,
    height: paddedMaxY - paddedMinY + 1,
  };
}

export async function prepareRugImage(file: File): Promise<{ blob: Blob; name: string }> {
  if (typeof window === "undefined" || !isLikelyJpeg(file)) {
    return { blob: file, name: file.name };
  }

  const tempUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(tempUrl);
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    if (!width || !height) {
      return { blob: file, name: file.name };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return { blob: file, name: file.name };
    }

    context.drawImage(image, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);

    const background = determineBackgroundProfile(imageData, width, height);
    if (!background) {
      return { blob: file, name: file.name };
    }

    backgroundFloodFill(imageData, width, height, background);

    const bounds = calculateBoundingBox(imageData, width, height);
    if (!bounds) {
      return { blob: file, name: file.name };
    }

    const minDimension = Math.min(bounds.width, bounds.height);
    const minSourceDimension = Math.min(width, height);
    if (minDimension < minSourceDimension * 0.1) {
      return { blob: file, name: file.name };
    }

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = bounds.width;
    croppedCanvas.height = bounds.height;
    const croppedContext = croppedCanvas.getContext("2d");

    if (!croppedContext) {
      return { blob: file, name: file.name };
    }

    croppedContext.putImageData(imageData, -bounds.minX, -bounds.minY);

    // Run a light cleanup pass on any nearly transparent edge pixels to avoid halos.
    const croppedData = croppedContext.getImageData(0, 0, bounds.width, bounds.height);
    const { data: croppedPixels } = croppedData;
    for (let i = 0; i < croppedPixels.length; i += 4) {
      if (croppedPixels[i + 3] === 0) {
        continue;
      }
      const brightness = Math.max(croppedPixels[i], croppedPixels[i + 1], croppedPixels[i + 2]);
      if (brightness >= background.brightnessThreshold && brightness >= 240) {
        const distanceSq = colorDistanceSq(
          { r: croppedPixels[i], g: croppedPixels[i + 1], b: croppedPixels[i + 2] },
          background.reference,
        );
        if (distanceSq <= background.toleranceSq + 150) {
          croppedPixels[i + 3] = 0;
        }
      }
    }
    croppedContext.putImageData(croppedData, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      croppedCanvas.toBlob((result) => resolve(result), "image/png");
    });

    if (!blob) {
      return { blob: file, name: file.name };
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "rug";
    const outputName = `${baseName}-transparent.png`;

    return { blob, name: outputName };
  } catch (error) {
    console.error("Failed to prepare rug image", error);
    return { blob: file, name: file.name };
  } finally {
    URL.revokeObjectURL(tempUrl);
  }
}
