import { test, expect } from "@playwright/test";
import { mockCloud } from "./helpers";

test("IRIS sends explicit memory choice and reuses the returned session ID", async ({ page }) => {
  await mockCloud(page);
  const requests: Record<string, unknown>[] = [];
  await page.route("**/api/intelligence", async (route) => {
    requests.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      json: { content: "A response from the configured provider.", sessionId: "iris-session-1" },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Open IRIS", exact: true }).click();
  await expect(page.getByLabel("Use saved Engram memory in this conversation")).not.toBeChecked();
  await page.getByLabel("Message IRIS").fill("What can I notice today?");
  await page.getByRole("button", { name: "Send to IRIS" }).click();
  await expect(
    page.getByText("A response from the configured provider.", { exact: true }),
  ).toBeVisible();
  expect(requests[0].useMemory).toBe(false);
  expect(requests[0].sessionId).toBeUndefined();
  await page.getByLabel("Use saved Engram memory in this conversation").check();
  await page.getByLabel("Message IRIS").fill("Reflect using my approved memories.");
  await page.getByRole("button", { name: "Send to IRIS" }).click();
  await expect(
    page.getByText("A response from the configured provider.", { exact: true }),
  ).toHaveCount(2);
  expect(requests[1].sessionId).toBe("iris-session-1");
  expect(requests[1].useMemory).toBe(true);
});

test("failed AI requests preserve the user draft and expose the error", async ({ page }) => {
  await mockCloud(page);
  await page.route("**/api/intelligence", (route) =>
    route.fulfill({ status: 503, json: { error: "Provider unavailable" } }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Open IRIS", exact: true }).click();
  await page.getByLabel("Message IRIS").fill("Keep this if the provider fails.");
  await page.getByRole("button", { name: "Send to IRIS" }).click();
  await expect(page.getByRole("alert")).toContainText("Provider unavailable");
  await expect(page.getByLabel("Message IRIS")).toHaveValue("Keep this if the provider fails.");
});

test("sign-in page exposes Engram registration without claiming ChatGPT is connected", async ({
  page,
}) => {
  await mockCloud(page, false);
  await page.goto("/");
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Create an Engram account" }).click();
  await expect(page.getByLabel("Display name", { exact: true })).toBeVisible();
  await expect(
    page.getByText("ChatGPT account connection is pending. This is your Engram login."),
  ).toBeVisible();
});
