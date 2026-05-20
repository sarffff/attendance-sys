export function base64ToFile(dataUrl, filename = 'signature.png') {
    const src = dataUrl.startsWith('data:')
      ? dataUrl
      : `data:image/png;base64,${dataUrl}`;
    const [header, base64] = src.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], filename, { type: mime });
  }