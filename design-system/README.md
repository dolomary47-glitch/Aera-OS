# Aera OS — Design System

Ce dossier est la **source unique de vérité** pour tous les tokens visuels d'Aera OS.

## Structure

```
design-system/
├── tokens.json              ← Source canonique structurée (JSON)
├── aera-tokens.js           ← Module GJS importable par les extensions GNOME
├── aera-theme.css           ← Classes CSS de référence (valeurs issues de tokens.json)
├── AERA_DESIGN_TOKENS_V1.md ← Documentation humaine complète
└── README.md                ← Ce fichier
```

---

## Comment une extension consomme les tokens

### Contrainte GNOME Shell

GNOME Shell utilise **Clutter CSS** — un sous-ensemble CSS.  
Les propriétés suivantes **ne sont pas supportées** :

| Technique web | Support GNOME Shell | Alternative |
|---|---|---|
| `var(--custom-property)` | ❌ Non supporté | Import GJS `aera-tokens.js` |
| `backdrop-filter: blur()` | ❌ Non supporté | `Shell.BlurEffect` en GJS |
| `filter: saturate()` | ❌ Non supporté | Non implémentable actuellement |
| `:-gtk-dark` pseudo-class | ✅ Supporté | Utiliser pour light/dark |

---

### Stratégie 1 — Valeurs dynamiques en GJS (recommandée)

Importer `aera-tokens.js` depuis l'extension pour les valeurs appliquées via `actor.set_style()`.

**Étape 1 — Créer un symlink dans l'extension :**

```bash
# Depuis la racine du dépôt
ln -s ../../design-system/aera-tokens.js extensions/ma-nouvelle-extension/aera-tokens.js
```

**Étape 2 — Importer dans `extension.js` :**

```js
import * as T from './aera-tokens.js';

// Utilisation
someActor.set_style(`
    color: ${T.color.light.text.primary};
    font-size: ${T.type.display.size};
    font-weight: ${T.type.display.weight};
`);

// Accent pour état actif
focusActor.set_style(`border: 2px solid ${T.accent.primary};`);

// Blur (via GJS, pas CSS)
const blurFx = new Shell.BlurEffect({
    mode: Shell.BlurMode.BACKGROUND,
    radius: T.glass.blurRadius,
    brightness: T.glass.blurBrightness,
});
```

---

### Stratégie 2 — Valeurs statiques en CSS

Pour les valeurs non-dynamiques dans `stylesheet.css`, copier les classes depuis `design-system/aera-theme.css`.

**Ne pas réinventer les valeurs.** Copier depuis `aera-theme.css` :

```css
/* ✅ Correct — valeur issue du design system */
.mon-widget-time {
    font-size: 80px;          /* type.display.size */
    font-weight: 700;         /* type.display.weight */
    color: #FFFFFF;           /* light.text.primary */
}

/* ❌ Incorrect — valeur arbitraire inventée */
.mon-widget-time {
    font-size: 73px;
    color: #F0F0F0;
}
```

**Light/Dark via `:-gtk-dark` :**

```css
.mon-element {
    color: #FFFFFF;                      /* light.text.primary */
}
:-gtk-dark .mon-element {
    color: #FFFFFF;                      /* dark.text.primary — identique ici */
}

.ma-surface {
    background-color: rgba(255, 255, 255, 0.35);    /* glass.light.background */
    border: 1px solid rgba(255, 255, 255, 0.40);    /* glass.light.border */
}
:-gtk-dark .ma-surface {
    background-color: rgba(20, 25, 35, 0.70);       /* glass.dark.background */
    border: 1px solid rgba(255, 255, 255, 0.20);    /* glass.dark.border */
}
```

---

## Créer une nouvelle extension conforme

1. Copier le template d'une extension existante.
2. **Créer le symlink** vers `aera-tokens.js` dans le dossier de l'extension.
3. Importer `aera-tokens.js` dans `extension.js`.
4. Pour `stylesheet.css`, copier les classes pertinentes depuis `aera-theme.css`.
5. **Ne pas hardcoder** de couleurs, tailles ou rayons — tout doit venir des tokens.
6. Documenter tout écart technique (propriété CSS non supportée, etc.).

---

## Ajouter un nouveau token

1. Ajouter la valeur dans `design-system/tokens.json` dans la bonne catégorie.
2. Ajouter la constante correspondante dans `design-system/aera-tokens.js`.
3. Si c'est un style CSS, ajouter la classe dans `design-system/aera-theme.css`.
4. Mettre à jour les extensions qui en ont besoin.
5. Documenter la décision dans `AERA_DESIGN_TOKENS_V1.md` si c'est un ajout significatif.

> **Règle :** n'ajouter un token que lorsqu'un besoin réel apparaît. Ne pas spéculer.

---

## Limitations techniques documentées (V1)

| Token d'intention | Technique cible | Support GNOME | Solution actuelle |
|---|---|---|---|
| `glass.blur = 25px` | `backdrop-filter: blur(25px)` | ❌ | `Shell.BlurEffect` en GJS |
| `glass.saturation = 180%` | `filter: saturate(180%)` | ❌ | Non implémentable — réservé GTK4 |
| Variables CSS | `var(--aera-accent)` | ❌ | Constantes GJS dans `aera-tokens.js` |
| Dark mode | `prefers-color-scheme: dark` | ❌ | `:-gtk-dark` pseudo-class |

---

## Référence rapide des tokens essentiels

| Token | Valeur |
|---|---|
| `accent.primary` | `#03DFF8` |
| `accent.on-primary` | `#061316` |
| `glass.light.background` | `rgba(255, 255, 255, 0.35)` |
| `glass.dark.background` | `rgba(20, 25, 35, 0.70)` |
| `type.display` | `80px / 700` |
| `type.metric` | `20px / 600` |
| `shadow.floating` | `0 12px 32px rgba(0,0,0,0.25)` |
| `radius.2xl` | `24px` |
