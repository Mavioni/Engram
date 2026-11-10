import { expect, type Page } from "@playwright/test";

export async function mockCloud(page: Page, signedIn = true) {
  await page.route("**/api/auth/get-session", (route) =>
    route.fulfill({
      json: signedIn
        ? {
            session: {
              id: "test-session",
              userId: "test-user",
              token: "test-only",
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
            },
            user: {
              id: "test-user",
              email: "test@example.com",
              name: "Test User",
              emailVerified: true,
            },
          }
        : null,
    }),
  );
  let records: { id: string; memory_type: string; content: string }[] = [];
  const writes: Record<string, unknown>[] = [];
  await page.route("**/api/memory**", async (route) => {
    const request = route.request();
    const id = new URL(request.url()).pathname.split("/").pop();
    if (request.method() === "GET")
      return route.fulfill({ json: { memories: records, pagination: { hasMore: false } } });
    if (request.method() === "DELETE") {
      records = records.filter((record) => record.id !== id);
      return route.fulfill({ status: 204 });
    }
    const body = request.postDataJSON() as Record<string, unknown>;
    writes.push(body);
    const memory = {
      id: request.method() === "POST" ? `server-${records.length + 1}` : id!,
      memory_type: "journal_entry",
      content: String(body.content),
    };
    records = [memory, ...records.filter((record) => record.id !== memory.id)];
    return route.fulfill({ status: request.method() === "POST" ? 201 : 200, json: { memory } });
  });
  return { writes, records: () => records };
}

export async function openDevice(page: Page) {
  await mockCloud(page, false);
  await page.goto("/");
  await page.getByRole("button", { name: "Use a separate encrypted device notebook" }).click();
  await page.getByLabel("Vault passphrase", { exact: true }).fill("Disposable-test-notebook-2026!");
  await page
    .getByLabel("Confirm passphrase", { exact: true })
    .fill("Disposable-test-notebook-2026!");
  await page.getByRole("button", { name: "Create private notebook" }).click();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
}

export async function nav(page: Page, name: string) {
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
}
