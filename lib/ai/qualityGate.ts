export type QGateReport = { pass: boolean; reasons: string[] };

export async function pixelHeuristics(_imgBuf: Buffer): Promise<QGateReport> {
  // TODO: implement histogram/edge checks with sharp/jimp
  return { pass: true, reasons: [] };
}

export async function semanticGateByVision(_url: string): Promise<QGateReport> {
  if (process.env.VISION_QGATE !== 'on') return { pass: true, reasons: [] };
  // TODO: Vision API ile anlamsal kontrol
  return { pass: true, reasons: [] };
}
