import { MessageType } from "../Types/types";

export interface IMyMessage{
    messageType: MessageType;
    content: string;
    key?: string;
    id: string;
}