
export interface Attendee {
  id: string;
  name: string;
  idNumber: string;
  signature: string; // base64 data URL
  timestamp: string; // ISO string
}

export interface SignatureCanvasRef {
  clear: () => void;
  getSignature: () => string; // returns base64 data URL
  isEmpty: () => boolean;
}
