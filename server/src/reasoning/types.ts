/**
 * Engram Reasoning provider contract.
 *
 * The application depends on normalized requests and events, not a vendor SDK.
 * Provider adapters translate this contract into vendor-specific APIs.
 */
export interface ReasoningMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ReasoningRequest {
  model: string;
  maxTokens: number;
  systemPrompt: string;
  context?: string;
  messages: ReasoningMessage[];
}

export interface ReasoningUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
}

export interface ReasoningResponse {
  content: string;
  stopReason: string | null;
  usage: ReasoningUsage;
}

export type ReasoningStreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "usage"; usage: Partial<ReasoningUsage> }
  | { type: "completed"; stopReason: string | null };

export interface ReasoningProvider {
  complete(request: ReasoningRequest): Promise<ReasoningResponse>;
  stream(request: ReasoningRequest): AsyncIterable<ReasoningStreamEvent>;
}
