import { test, expect } from '@playwright/test';

test('Dashboard temel akış', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Başlangıç Görseli')).toBeVisible();

  // URL gir
  await page.getByPlaceholder('https://... (public image URL)').fill('https://picsum.photos/800');
  await page.getByRole('button', { name: 'Devam Et → Presetler' }).click();
  await expect(page.getByText('Presetler & Ayarlar')).toBeVisible();

  // Refine butonu görünür mü
  await expect(page.getByRole('button', { name: /Refine İşlemini Başlat/ })).toBeVisible();

  // Gemini Assist butonları
  await expect(page.getByRole('button', { name: 'Analyze current' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Insert to Prompt' })).toBeVisible();
});
