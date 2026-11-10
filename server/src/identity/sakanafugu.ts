/**
 * Sakanafugu identity contracts.
 *
 * These are domain contracts, not a persistence or authorization implementation.
 * The model/provider is an inference dependency; it is never the Sakanafugu
 * principal. Credentials must be resolved from server-side secret bindings and
 * must never appear in these records.
 */

export type SakanafuguId = string;
export type SakanafuguStatus = "active" | "suspended" | "retired";

export type SakanafuguCapability =
  | "conversation.respond"
  | "memory.read"
  | "memory.propose"
  | "knowledge.query"
  | "reasoning.invoke"
  | "tasks.propose"
  | "agents.delegate"
  | "integrations.invoke";

export type ReasoningProvider = "openai" | "anthropic" | "openrouter" | "other";

export interface SakanafuguModelBinding {
  provider: ReasoningProvider;
  /** Provider model identifier; not an identity or authority identifier. */
  model: string;
  /** Server-side policy profile name. Never place API keys or secrets here. */
  policyProfile: string;
}

export interface SakanafuguConfiguration {
  version: number;
  /** Stable, user-approved behavioral configuration reference. */
  behaviorProfile: string;
  /** Prompt/configuration release identifier, not the prompt secret itself. */
  instructionSetVersion: string;
  /** Explicit capability ceiling; grants are still checked at runtime. */
  capabilityCeiling: SakanafuguCapability[];
  modelBindings: SakanafuguModelBinding[];
}

export interface SakanafuguPrincipal {
  /** Stable opaque Engram-owned principal ID. */
  id: SakanafuguId;
  tenantId: string;
  entityType: "identity.agent";
  canonicalName: "sakanafugu";
  displayName: string;
  status: SakanafuguStatus;
  configuration: SakanafuguConfiguration;
  createdAt: string;
  updatedAt: string;
}

/**
 * A request envelope for an inference adapter. The caller must have already
 * authenticated the human and resolved the Sakanafugu principal and tenant.
 * Authorization and context minimization remain Engram service responsibilities.
 */
export interface SakanafuguInferenceRequest {
  requestId: string;
  principalId: SakanafuguId;
  tenantId: string;
  configurationVersion: number;
  provider: ReasoningProvider;
  model: string;
  instructionsVersion: string;
  input: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  maxOutputTokens: number;
  /** Explicitly excludes credentials and raw authorization grants. */
  metadata?: Record<string, string>;
}

export interface SakanafuguInferenceResult {
  requestId: string;
  provider: ReasoningProvider;
  model: string;
  output: string;
  finishReason: "completed" | "length" | "refused" | "provider_error";
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
  /** Provider trace is diagnostic metadata, never a canonical session ID. */
  providerRequestId?: string;
}

export function isSakanafuguConfigurationValid(
  value: SakanafuguConfiguration,
): boolean {
  if (!Number.isSafeInteger(value.version) || value.version < 1) return false;
  if (!value.behaviorProfile.trim() || !value.instructionSetVersion.trim()) return false;
  if (value.modelBindings.length === 0 || value.modelBindings.length > 8) return false;
  if (value.capabilityCeiling.length > 32) return false;

  const seen = new Set<string>();
  for (const binding of value.modelBindings) {
    if (!binding.model.trim() || binding.model.length > 160) return false;
    if (!binding.policyProfile.trim() || binding.policyProfile.length > 120) return false;
    const key = `${binding.provider}:${binding.model}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }

  return new Set(value.capabilityCeiling).size === value.capabilityCeiling.length;
}
