import { MessageType } from "../Types/types";

export interface IMyMessage{
    messageType: MessageType | number; 
    content: string;
    key?: string;
    id: string;
}