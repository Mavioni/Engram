/**
 * Tenant-scoped D1 persistence for the Engram Intelligence principal.
 *
 * Callers must derive tenantId from authenticated server context. Never pass
 * an untrusted request-body tenant identifier. This repository stores
 * identity/configuration metadata only, never provider credentials or memory.
 */
import {
  isEngramIntelligenceConfigurationValid,
  type EngramIntelligenceConfiguration,
  type EngramIntelligencePrincipal,
  type EngramIntelligenceStatus,
} from "./engram-intelligence";

type PrincipalRow = {
  id: string;
  tenant_id: string;
  canonical_name: string;
  display_name: string;
  status: string;
  configuration_version: number;
  configuration_json: string;
  created_at: string;
  updated_at: string;
};

export interface CreateEngramIntelligencePrincipal {
  id: string;
  tenantId: string;
  displayName: string;
  configuration: EngramIntelligenceConfiguration;
  createdAt: string;
}

function isCanonicalIso(value: string): boolean {
  if (!Number.isFinite(Date.parse(value))) return false;
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
}

function isStatus(value: string): value is EngramIntelligenceStatus {
  return value === "active" || value === "suspended" || value === "retired";
}

function fromRow(row: PrincipalRow): EngramIntelligencePrincipal {
  let configuration: unknown;
  try {
    configuration = JSON.parse(row.configuration_json);
  } catch {
    throw new Error("stored Engram Intelligence configuration is invalid");
  }

  if (
    row.canonical_name !== "engram-intelligence" ||
    !isStatus(row.status) ||
    !isEngramIntelligenceConfigurationValid(configuration) ||
    configuration.version !== row.configuration_version
  ) {
    throw new Error("stored Engram Intelligence principal is invalid");
  }

  return {
    id: row.id,
    tenantId: row.tenant_id,
    entityType: "identity.agent",
    canonicalName: "engram-intelligence",
    displayName: row.display_name,
    status: row.status,
    configuration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateCreate(input: CreateEngramIntelligencePrincipal): void {
  if (!input.id.trim() || input.id.length > 128) {
    throw new Error("invalid Engram Intelligence principal id");
  }
  if (!input.tenantId.trim() || input.tenantId.length > 256) {
    throw new Error("invalid Engram Intelligence tenant id");
  }
  if (!input.displayName.trim() || input.displayName.length > 120) {
    throw new Error("invalid Engram Intelligence display name");
  }
  if (!isCanonicalIso(input.createdAt)) {
    throw new Error("invalid Engram Intelligence creation timestamp");
  }
  if (!isEngramIntelligenceConfigurationValid(input.configuration)) {
    throw new Error("invalid Engram Intelligence configuration");
  }

  const serialized = JSON.stringify(input.configuration);
  if (!serialized || serialized.length > 16_384) {
    throw new Error("Engram Intelligence configuration exceeds the storage limit");
  }
}

export class D1EngramIntelligencePrincipalRepository {
  constructor(private readonly db: D1Database) {}

  async create(
    input: CreateEngramIntelligencePrincipal,
  ): Promise<EngramIntelligencePrincipal> {
    validateCreate(input);
    const configurationJson = JSON.stringify(input.configuration);

    await this.db.prepare(
      `INSERT INTO engram_intelligence_principals (
        id, tenant_id, canonical_name, display_name, status,
        configuration_version, configuration_json, created_at, updated_at
      ) VALUES (?, ?, 'engram-intelligence', ?, 'active', ?, ?, ?, ?)`
    ).bind(
      input.id,
      input.tenantId,
      input.displayName.trim(),
      input.configuration.version,
      configurationJson,
      input.createdAt,
      input.createdAt,
    ).run();

    const created = await this.getById(input.tenantId, input.id);
    if (!created) throw new Error("Engram Intelligence principal was not persisted");
    return created;
  }

  /**
   * Return the tenant's principal, creating a conservative default if absent.
   * The caller must supply a tenant derived from authenticated server context.
   * INSERT OR IGNORE makes first-request initialization safe under concurrency.
   */
  async getOrCreateForTenant(
    tenantId: string,
  ): Promise<EngramIntelligencePrincipal> {
    if (!tenantId.trim() || tenantId.length > 256) {
      throw new Error("invalid Engram Intelligence tenant id");
    }

    const existing = await this.getForTenant(tenantId);
    if (existing) return existing;

    const now = new Date().toISOString();
    const configuration: EngramIntelligenceConfiguration = {
      version: 1,
      behaviorProfile: "default",
      instructionSetVersion: "engram-intelligence-v1",
      capabilityCeiling: [
        "conversation.respond",
        "memory.read",
        "reasoning.invoke",
      ],
      modelBindings: [{
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        policyProfile: "default",
      }],
    };
    validateCreate({
      id: crypto.randomUUID(),
      tenantId,
      displayName: "Engram Intelligence",
      configuration,
      createdAt: now,
    });

    await this.db.prepare(
      `INSERT OR IGNORE INTO engram_intelligence_principals (
        id, tenant_id, canonical_name, display_name, status,
        configuration_version, configuration_json, created_at, updated_at
      ) VALUES (?, ?, 'engram-intelligence', ?, 'active', ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      tenantId,
      "Engram Intelligence",
      configuration.version,
      JSON.stringify(configuration),
      now,
      now,
    ).run();

    const createdOrExisting = await this.getForTenant(tenantId);
    if (!createdOrExisting) {
      throw new Error("Engram Intelligence principal could not be initialized");
    }
    return createdOrExisting;
  }

  async getById(
    tenantId: string,
    id: string,
  ): Promise<EngramIntelligencePrincipal | null> {
    if (!tenantId.trim() || !id.trim()) return null;
    const row = await this.db.prepare(
      `SELECT * FROM engram_intelligence_principals
       WHERE tenant_id = ? AND id = ? LIMIT 1`
    ).bind(tenantId, id).first<PrincipalRow>();

    return row ? fromRow(row) : null;
  }

  async getForTenant(
    tenantId: string,
  ): Promise<EngramIntelligencePrincipal | null> {
    if (!tenantId.trim()) return null;
    const row = await this.db.prepare(
      `SELECT * FROM engram_intelligence_principals
       WHERE tenant_id = ? AND canonical_name = 'engram-intelligence' LIMIT 1`
    ).bind(tenantId).first<PrincipalRow>();

    return row ? fromRow(row) : null;
  }
}
