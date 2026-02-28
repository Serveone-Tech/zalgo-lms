export interface ChatMessage {
  id: string;
  studentId: string;
  studentName: string;
  content: string;
  isFromAdmin: boolean;
  timestamp: Date;
  isRead: boolean;
}

export interface InsertChatMessage {
  studentId: string;
  studentName: string;
  content: string;
  isFromAdmin: boolean;
}
