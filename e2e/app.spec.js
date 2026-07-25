/**
 * Tests d'intégration — parcours principal : générer → afficher → imprimer,
 * plus les interactions par grille (solution, saisie, partage, mode sombre).
 */

const { test, expect } = require('@playwright/test')

// window.print est remplacé par un compteur : on vérifie le déclenchement
// de l'impression sans ouvrir la boîte de dialogue native.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__printCount = 0
    window.print = () => { window.__printCount++ }
  })
  await page.goto('/')
})

async function generate(page) {
  await page.getByRole('button', { name: /Générer/ }).click()
  await expect(page.locator('.crossword-card:not(.solution-card)').first()).toBeVisible()
}

test('génère et affiche une grille avec ses indices', async ({ page }) => {
  await expect(page.getByText('Aucune grille générée')).toBeVisible()

  await generate(page)

  const card = page.locator('.crossword-card:not(.solution-card)').first()
  await expect(card.getByRole('heading', { name: 'Grille n°1' })).toBeVisible()
  // La grille contient des cases blanches numérotées
  expect(await card.locator('td.white').count()).toBeGreaterThan(0)
  await expect(card.locator('.cell-number').first()).toBeVisible()
  // Au moins une liste d'indices est affichée
  expect(await card.locator('.clue-item').count()).toBeGreaterThanOrEqual(3)
})

test('exporte les grilles et les solutions via l\'impression', async ({ page }) => {
  // Impossible d'imprimer avant de générer
  await expect(page.getByRole('button', { name: /Exporter en PDF/ })).toBeDisabled()

  await generate(page)

  await page.getByRole('button', { name: /Exporter en PDF/ }).click()
  await expect.poll(() => page.evaluate(() => window.__printCount)).toBe(1)

  await page.getByRole('button', { name: 'Imprimer les solutions' }).click()
  await expect.poll(() => page.evaluate(() => window.__printCount)).toBe(2)
})

test('le toggle « voir la solution » révèle puis masque les lettres', async ({ page }) => {
  await generate(page)
  const card = page.locator('.crossword-card:not(.solution-card)').first()

  // Par défaut : cases jouables (saisie), pas de lettres visibles
  await expect(card.locator('.cell-letter')).toHaveCount(0)
  expect(await card.locator('.cell-input').count()).toBeGreaterThan(0)

  await card.getByRole('button', { name: 'Voir la solution' }).click()
  expect(await card.locator('.cell-letter').count()).toBeGreaterThan(0)

  await card.getByRole('button', { name: 'Masquer la solution' }).click()
  await expect(card.locator('.cell-letter')).toHaveCount(0)
})

test('la saisie interactive se vérifie (vert si correct, rouge sinon)', async ({ page }) => {
  await generate(page)
  const card = page.locator('.crossword-card:not(.solution-card)').first()

  // Lire la bonne lettre de la première case via la grille solution cachée
  const solutionLetter = await page
    .locator('.solution-card')
    .first()
    .locator('.cell-letter')
    .first()
    .textContent()

  const firstInput = card.locator('.cell-input').first()
  await firstInput.fill(solutionLetter)
  const secondInput = card.locator('.cell-input').nth(1)
  await secondInput.fill(solutionLetter === 'Z' ? 'Y' : 'Z')

  await card.getByRole('button', { name: 'Vérifier' }).click()
  expect(await card.locator('td.cell-ok').count()).toBeGreaterThanOrEqual(1)
  // La seconde lettre volontairement fausse peut, par hasard, être juste
  // seulement si la case attendait exactement cette lettre : on vérifie
  // surtout que la vérification a marqué les cases remplies.
  expect(await card.locator('td.cell-ok, td.cell-ko').count()).toBe(2)

  await card.getByRole('button', { name: 'Effacer' }).click()
  await expect(card.locator('td.cell-ok, td.cell-ko')).toHaveCount(0)
})

test('régénère une seule grille sans toucher aux autres', async ({ page }) => {
  await page.getByLabel('Nombre de grilles').fill('2')
  await generate(page)
  const cards = page.locator('.crossword-card:not(.solution-card)')
  await expect(cards).toHaveCount(2)

  await cards.first().getByRole('button', { name: 'Régénérer' }).click()
  await expect(page.locator('.toast')).toContainText('Grille n°1 régénérée')
  await expect(cards).toHaveCount(2)
})

test('le mode sombre se bascule et persiste', async ({ page }) => {
  const html = page.locator('html')
  const initial = await html.getAttribute('data-theme')

  await page.getByRole('button', { name: /mode (sombre|clair)/i }).click()
  const flipped = initial === 'dark' ? 'light' : 'dark'
  await expect(html).toHaveAttribute('data-theme', flipped)

  await page.reload()
  await expect(html).toHaveAttribute('data-theme', flipped)
})

test('une grille peut être partagée puis rechargée par URL', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await generate(page)

  await page
    .locator('.crossword-card:not(.solution-card)')
    .first()
    .getByRole('button', { name: 'Partager' })
    .click()
  await expect(page.locator('.toast')).toContainText('copié')

  const url = await page.evaluate(() => navigator.clipboard.readText())
  expect(url).toContain('?grille=')

  await page.goto(url)
  await expect(page.locator('.crossword-card:not(.solution-card)')).toBeVisible()
  await expect(page.locator('.toast')).toContainText('Grille partagée chargée')
})
