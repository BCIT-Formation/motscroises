/**
 * Tests d'intégration — parcours complet : générer → afficher → imprimer,
 * plus les fonctionnalités clés (solutions, partage, mode interactif, sombre).
 */
const { test, expect } = require('@playwright/test');

async function generate(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Générer/ }).click();
  await expect(page.locator('.crossword-card').first()).toBeVisible();
}

test('génère et affiche une grille avec ses indices', async ({ page }) => {
  await generate(page);

  // La grille contient des cases blanches et des indices
  await expect(page.locator('.crossword-grid td.white').first()).toBeVisible();
  await expect(page.locator('.clue-item').first()).toBeVisible();

  // Les lettres sont masquées à l'écran (c'est un jeu)
  await expect(page.locator('.content .cell-letter').first()).toBeHidden();
});

test('le bouton « Voir les solutions » révèle puis masque les lettres', async ({ page }) => {
  await generate(page);

  await page.getByRole('button', { name: 'Voir les solutions' }).click();
  await expect(page.locator('.content .cell-letter').first()).toBeVisible();

  await page.getByRole('button', { name: 'Masquer les solutions' }).click();
  await expect(page.locator('.content .cell-letter').first()).toBeHidden();
});

test('le bouton PDF déclenche l\'impression du navigateur', async ({ page }) => {
  await page.addInitScript(() => {
    window.__printed = false;
    window.print = () => { window.__printed = true; };
  });
  await generate(page);

  await page.getByRole('button', { name: /Exporter en PDF/ }).click();
  expect(await page.evaluate(() => window.__printed)).toBe(true);
});

test('une URL de partage régénère la même grille', async ({ page }) => {
  const shareURL = '/?d=3&t=tous&l=fr&s=424242';

  await page.goto(shareURL);
  await expect(page.locator('.crossword-card').first()).toBeVisible();
  const first = await page.locator('.crossword-grid').first().textContent();

  await page.goto(shareURL);
  await expect(page.locator('.crossword-card').first()).toBeVisible();
  const second = await page.locator('.crossword-grid').first().textContent();

  expect(first).toBe(second);
  expect(first.length).toBeGreaterThan(0);
});

test('le mode interactif permet de saisir et vérifier des lettres', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Mode interactif (remplir dans le navigateur)').check();
  await page.getByRole('button', { name: /Générer/ }).click();
  await expect(page.locator('.crossword-card').first()).toBeVisible();

  // Saisie : la lettre est mise en majuscule
  const input = page.locator('.cell-input').first();
  await input.fill('a');
  await expect(input).toHaveValue('A');

  // Vérification : un score s'affiche
  await page.getByRole('button', { name: /Vérifier/ }).first().click();
  await expect(page.locator('.verify-result').first()).toContainText('lettres');
});

test('le bouton de mode sombre bascule le thème', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', /light|dark/);
  const before = await html.getAttribute('data-theme');

  await page.getByRole('button', { name: 'Basculer le mode sombre' }).click();
  await expect(html).toHaveAttribute('data-theme', before === 'dark' ? 'light' : 'dark');
});

test('l\'export SVG télécharge un fichier par grille', async ({ page }) => {
  await generate(page);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Exporter en SVG/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('mots-croises-grille-1.svg');
});
