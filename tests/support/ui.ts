import { expect, type Page, type Locator } from '@playwright/test';
import { env } from './env';

// Thao tác giao diện dùng chung cho test e2e.
export async function loginUI(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="Nhập tên đăng nhập hoặc email"]', env.adminUser);
  await page.fill('input[type="password"]', env.adminPassword);
  await page.locator('button[type="submit"]').first().click();
  await expect(page.locator('aside:visible').first()).toBeVisible();
}

export const sidebar = (page: Page) => page.locator('aside:visible').first();
export const main = (page: Page) => page.locator('main').first();

export async function openSidebarItem(page: Page, label: string) {
  await sidebar(page).locator('button', { hasText: label }).first().click();
}

/** Mở module Giám định rồi một tab con (Chờ Giám định, Lịch sử Giám định...). */
export async function openSurveyTab(page: Page, tab: string) {
  await openSidebarItem(page, 'Giám Định');
  await page.locator('button', { hasText: tab }).first().click();
}

/** Nút trong một dòng bảng có chứa text (vd số container). */
export const rowButton = (page: Page, rowText: string, title: string): Locator =>
  main(page).locator('tr', { hasText: rowText }).first().locator(`button[title="${title}"]`);

/** Thẻ khu vực trong tab Checklist của form giám định. */
export const checklistCards = (page: Page) => main(page).locator('div.grid > div.rounded-2xl');
export const checklistTab = (page: Page) => main(page).locator('button', { hasText: /Checklist \d+ Khu Vực Khảo Sát/ }).first();
