/**
 * D1 persistence for the Engram-owned Sakanafugu principal.
 *
 * This repository is deliberately tenant-scoped. Callers must derive tenantId
 * from authenticated server context; never pass an untrusted request-body
 * tenant identifier. It stores identity/configuration metadata only, never
 * provider credentials or conversation memory.
 */
import {
  isSakanafuguConfigurationValid,
  type SakanafuguConfiguration,
  type SakanafuguPrincipal,
  type SakanafuguStatus,
} from "./sakanafugu";

type PrincipalRow = {
  id: string;
  tenant_id: string;
  canonical_name: string;
  display_name: string;
  status: SakanafuguStatus;
  configuration_version: number;
  configuration_json: string;
  created_at: string;
  updated_at: string;
};

export interface CreateSakanafuguPrincipal {
  id: string;
  tenantId: string;
  displayName: string;
  configuration: SakanafuguConfiguration;
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

function fromRow(row: PrincipalRow): SakanafuguPrincipal {
  const configuration: unknown = JSON.parse(row.configuration_json);
  if (
    row.canonical_name !== "sakanafugu" ||
    !configuration ||
    typeof configuration !== "object" ||
    !isSakanafuguConfigurationValid(configuration as SakanafuguConfiguration) ||
    (configuration as SakanafuguConfiguration).version !== row.configuration_version
  ) {
    throw new Error("stored Sakanafugu principal configuration is invalid");
  }

  return {
    id: row.id,
    tenantId: row.tenant_id,
    entityType: "identity.agent",
    canonicalName: "sakanafugu",
    displayName: row.display_name,
    status: row.status,
    configuration: configuration as SakanafuguConfiguration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateCreate(input: CreateSakanafuguPrincipal): void {
  if (!input.id.trim() || input.id.length > 128) {
    throw new Error("invalid Sakanafugu principal id");
  }
  if (!input.tenantId.trim() || input.tenantId.length > 256) {
    throw new Error("invalid Sakanafugu tenant id");
  }
  if (!input.displayName.trim() || input.displayName.length > 120) {
    throw new Error("invalid Sakanafugu display name");
  }
  if (!isCanonicalIso(input.createdAt)) {
    throw new Error("invalid Sakanafugu creation timestamp");
  }
  if (!isSakanafuguConfigurationValid(input.configuration)) {
    throw new Error("invalid Sakanafugu configuration");
  }
  const serialized = JSON.stringify(input.configuration);
  if (!serialized || serialized.length > 16_384) {
    throw new Error("Sakanafugu configuration exceeds the storage limit");
  }
}

export class D1SakanafuguPrincipalRepository {
  constructor(private readonly db: D1Database) {}

  async create(input: CreateSakanafuguPrincipal): Promise<SakanafuguPrincipal> {
    validateCreate(input);
    const configurationJson = JSON.stringify(input.configuration);

    await this.db.prepare(
      `INSERT INTO sakanafugu_principals (
        id, tenant_id, canonical_name, display_name, status,
        configuration_version, configuration_json, created_at, updated_at
      ) VALUES (?, ?, 'sakanafugu', ?, 'active', ?, ?, ?, ?)`
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
    if (!created) throw new Error("Sakanafugu principal was not persisted");
    return created;
  }

  async getById(tenantId: string, id: string): Promise<SakanafuguPrincipal | null> {
    if (!tenantId.trim() || !id.trim()) return null;
    const row = await this.db.prepare(
      `SELECT * FROM sakanafugu_principals
       WHERE tenant_id = ? AND id = ? LIMIT 1`
    ).bind(tenantId, id).first<PrincipalRow>();

    return row ? fromRow(row) : null;
  }

  async getForTenant(tenantId: string): Promise<SakanafuguPrincipal | null> {
    if (!tenantId.trim()) return null;
    const row = await this.db.prepare(
      `SELECT * FROM sakanafugu_principals
       WHERE tenant_id = ? AND canonical_name = 'sakanafugu' LIMIT 1`
    ).bind(tenantId).first<PrincipalRow>();

    return row ? fromRow(row) : null;
  }
}
