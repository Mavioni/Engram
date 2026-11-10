/**
 * Engram Intelligence principal and provider-neutral inference contracts.
 *
 * These are domain contracts, not an authorization or persistence service.
 * A model/provider is an inference dependency; it is never the canonical
 * Engram Intelligence principal. Credentials belong only in server-side
 * secret bindings and must never appear in these records.
 */

export type EngramIntelligenceId = string;
export type EngramIntelligenceStatus = "active" | "suspended" | "retired";

export const ENGRAM_INTELLIGENCE_CAPABILITIES = [
  "conversation.respond",
  "memory.read",
  "memory.propose",
  "knowledge.query",
  "reasoning.invoke",
  "tasks.propose",
  "agents.delegate",
  "integrations.invoke",
] as const;

export type EngramIntelligenceCapability =
  (typeof ENGRAM_INTELLIGENCE_CAPABILITIES)[number];

export type ReasoningProvider =
  | "openai"
  | "anthropic"
  | "sakana-fugu"
  | "openrouter"
  | "other";

export interface EngramIntelligenceModelBinding {
  provider: ReasoningProvider;
  /** Provider model identifier; not an identity or authority identifier. */
  model: string;
  /** Server-side policy profile name. Never place API keys or secrets here. */
  policyProfile: string;
}

export interface EngramIntelligenceConfiguration {
  version: number;
  /** Stable, user-approved behavioral configuration reference. */
  behaviorProfile: string;
  /** Prompt/configuration release identifier, not the prompt secret itself. */
  instructionSetVersion: string;
  /** A ceiling only; runtime authorization grants are checked separately. */
  capabilityCeiling: EngramIntelligenceCapability[];
  modelBindings: EngramIntelligenceModelBinding[];
}

export interface EngramIntelligencePrincipal {
  /** Stable opaque Engram-owned principal ID. */
  id: EngramIntelligenceId;
  tenantId: string;
  entityType: "identity.agent";
  canonicalName: "engram-intelligence";
  displayName: string;
  status: EngramIntelligenceStatus;
  configuration: EngramIntelligenceConfiguration;
  createdAt: string;
  updatedAt: string;
}

/**
 * An inference envelope. The caller must already have authenticated the
 * human, derived tenant scope, resolved this principal, and authorized context.
 */
export interface EngramIntelligenceInferenceRequest {
  requestId: string;
  principalId: EngramIntelligenceId;
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
  /** Diagnostic metadata only; never raw credentials or authority grants. */
  metadata?: Record<string, string>;
}

export interface EngramIntelligenceInferenceResult {
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

const REASONING_PROVIDERS = new Set<ReasoningProvider>([
  "openai",
  "anthropic",
  "sakana-fugu",
  "openrouter",
  "other",
]);

const INTELLIGENCE_CAPABILITIES = new Set<string>(
  ENGRAM_INTELLIGENCE_CAPABILITIES,
);

/** Runtime validator for values decoded from D1 or other untrusted sources. */
export function isEngramIntelligenceConfigurationValid(
  value: unknown,
): value is EngramIntelligenceConfiguration {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const candidate = value as Record<string, unknown>;
  if (!Number.isSafeInteger(candidate.version) || (candidate.version as number) < 1) {
    return false;
  }
  if (
    typeof candidate.behaviorProfile !== "string" ||
    candidate.behaviorProfile.trim().length === 0 ||
    typeof candidate.instructionSetVersion !== "string" ||
    candidate.instructionSetVersion.trim().length === 0
  ) {
    return false;
  }
  if (
    !Array.isArray(candidate.capabilityCeiling) ||
    candidate.capabilityCeiling.length > ENGRAM_INTELLIGENCE_CAPABILITIES.length ||
    !Array.isArray(candidate.modelBindings) ||
    candidate.modelBindings.length === 0 ||
    candidate.modelBindings.length > 8
  ) {
    return false;
  }

  for (const capability of candidate.capabilityCeiling) {
    if (typeof capability !== "string" || !INTELLIGENCE_CAPABILITIES.has(capability)) {
      return false;
    }
  }
  if (new Set(candidate.capabilityCeiling).size !== candidate.capabilityCeiling.length) {
    return false;
  }

  const seenBindings = new Set<string>();
  for (const rawBinding of candidate.modelBindings) {
    if (!rawBinding || typeof rawBinding !== "object" || Array.isArray(rawBinding)) {
      return false;
    }
    const binding = rawBinding as Record<string, unknown>;
    if (
      typeof binding.provider !== "string" ||
      !REASONING_PROVIDERS.has(binding.provider as ReasoningProvider) ||
      typeof binding.model !== "string" ||
      binding.model.trim().length === 0 ||
      binding.model.length > 160 ||
      typeof binding.policyProfile !== "string" ||
      binding.policyProfile.trim().length === 0 ||
      binding.policyProfile.length > 120
    ) {
      return false;
    }

    const key = binding.provider + ":" + binding.model;
    if (seenBindings.has(key)) return false;
    seenBindings.add(key);
  }

  return true;
}
