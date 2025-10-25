export async function prepareRugImage(file: File): Promise<{ blob: Blob; name: string }> {
  return { blob: file, name: file.name };
}
