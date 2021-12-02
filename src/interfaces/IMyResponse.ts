import { ErrorType } from "../Types/types";

export interface IMyResponse{
    content?: string;
    success: boolean;
    error?: ErrorType;
}