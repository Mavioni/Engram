import { test, expect } from "@playwright/test";
import { mockCloud, nav, openDevice } from "./helpers";

test.use({ timezoneId: "America/Phoenix" });

test("phone notebook creates, edits, filters and deletes an entry with the correct local date", async ({
  page,
}) => {
  await page.setViewportSize({ width: 412, height: 915 });
  await openDevice(page);
  await page.getByRole("button", { name: "Classic", exact: true }).click();
  await page.getByLabel("Entry title", { exact: true }).fill("A day worth saving");
  await page
    .getByLabel("Journal entry", { exact: true })
    .fill("I made space for a quiet walk and a new idea.");
  await page.getByRole("button", { name: "Steady", exact: true }).click();
  await page.getByLabel("Add tag", { exact: true }).fill("growth");
  await page.getByLabel("Add tag", { exact: true }).press("Enter");
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.getByRole("button", { name: "Entry saved", exact: true })).toBeVisible();
  await nav(page, "Timeline");
  const entry = page
    .getByRole("button")
    .filter({ has: page.getByRole("heading", { name: "A day worth saving" }) });
  await expect(entry).toBeVisible();
  await entry.click();
  const today = await page.evaluate(() =>
    new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
  );
  await expect(page.getByRole("dialog")).toContainText(today);
  await page.getByRole("button", { name: "Edit entry", exact: true }).click();
  await page.getByLabel("Edit entry title").fill("A title that persists");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: "A title that persists" })).toBeVisible();
  for (const view of ["grid", "list", "map", "river"]) {
    await page
      .getByRole("group", { name: "Timeline view" })
      .getByRole("button", { name: view, exact: true })
      .click();
    await expect(page.getByText("A title that persists", { exact: true })).toBeVisible();
  }
  await page.getByLabel("Search entries").fill("nothing-matches-this");
  await expect(page.getByRole("heading", { name: "No entries match your search." })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "Filter Heavy", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No entries match your search." })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page
    .getByRole("button")
    .filter({ has: page.getByRole("heading", { name: "A title that persists" }) })
    .click();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await page
    .locator(".delete-confirm")
    .getByRole("button", { name: "Delete entry", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Your story begins with a day." })).toBeVisible();
});

test("encrypted draft and unsent thought survive lock/reload without plaintext browser storage", async ({
  page,
}) => {
  await openDevice(page);
  await page.getByLabel("Capture a thought").fill("This private draft survives a reload.");
  await nav(page, "Timeline");
  await nav(page, "Today");
  await expect(page.getByLabel("Capture a thought")).toHaveValue(
    "This private draft survives a reload.",
  );
  await expect(page.getByText("Draft encrypted on this device", { exact: true })).not.toBeVisible();
  await nav(page, "Settings");
  await page.getByRole("button", { name: "Lock", exact: true }).click();
  await page.getByLabel("Vault passphrase", { exact: true }).fill("incorrect-test-password");
  await page.getByRole("button", { name: "Unlock notebook" }).click();
  await expect(page.getByRole("alert")).toContainText("did not unlock");
  await page.reload();
  await page.getByRole("button", { name: "Use a separate encrypted device notebook" }).click();
  await page.getByLabel("Vault passphrase", { exact: true }).fill("Disposable-test-notebook-2026!");
  await page.getByRole("button", { name: "Unlock notebook" }).click();
  await expect(page.getByLabel("Capture a thought")).toHaveValue(
    "This private draft survives a reload.",
  );
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(stored).not.toContain("private draft");
  expect(stored).not.toContain("Disposable-test");
});

test("cloud entries reconcile server IDs and retain content after reload", async ({ page }) => {
  const cloud = await mockCloud(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Classic", exact: true }).click();
  await page.getByLabel("Entry title", { exact: true }).fill("Cloud entry");
  await page.getByLabel("Journal entry").fill("A note stored in my own account.");
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.getByRole("button", { name: "Entry saved", exact: true })).toBeVisible();
  expect(cloud.writes[0].provenance).toBe("user_stated");
  expect(cloud.records()[0].id).toBe("server-1");
  await page.reload();
  await nav(page, "Timeline");
  await expect(page.getByRole("heading", { name: "Cloud entry", exact: true })).toBeVisible();
});

test("private alpha states pending AI clearly and never sends a guest inference request", async ({
  page,
}) => {
  let requests = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/intelligence")) requests++;
  });
  await openDevice(page);
  await page.getByRole("button", { name: "Open IRIS", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("CONNECTION PENDING");
  await expect(page.getByLabel("Message IRIS")).toBeDisabled();
  await page.getByRole("button", { name: "Return to my notebook" }).click();
  await nav(page, "Settings");
  await expect(page.getByText("PENDING", { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

test("reference layout stays usable at phone and desktop sizes", async ({ page }, testInfo) => {
  await openDevice(page);
  for (const width of [320, 412, 1440]) {
    await page.setViewportSize({ width, height: width === 320 ? 640 : 915 });
    for (const destination of ["Today", "Timeline", "Insights", "Recap", "Settings"]) {
      await nav(page, destination);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    }
    await nav(page, "Today");
    await page.screenshot({ path: testInfo.outputPath(`notes-${width}.png`) });
  }
  await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
