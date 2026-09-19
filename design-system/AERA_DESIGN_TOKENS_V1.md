# Aera OS — Design Token System V1

**Document:** Design Token System V1  
**Projet:** Aera OS  
**Phase:** Semaine 2 — Design System  
**Statut:** Base de référence pour les extensions GNOME et futures interfaces Aera OS

---

## 1. Objectif

Ce document définit le **langage visuel commun d'Aera OS**.

L'objectif est d'éviter que chaque extension GNOME définisse ses propres couleurs, rayons, espacements, ombres, typographies ou animations. Toutes les futures interfaces doivent partir de ces tokens afin de conserver une identité visuelle cohérente.

Aera OS doit être perçu comme **un seul système**, même lorsque ses fonctionnalités sont réparties entre plusieurs extensions.

### Principe directeur

> **Wallpaper + Glass + Light + Depth + Cyan**

Le wallpaper participe à l'expérience visuelle. Les surfaces UI doivent donner une impression de verre translucide, avec une profondeur légère, sans sacrifier la lisibilité.

---

# 2. Direction visuelle

Aera OS utilise un langage visuel moderne fondé sur un **glassmorphism maîtrisé** avec deux thèmes :

- **Light Mode** : verre clair, lumineux et translucide.
- **Dark Mode** : verre fumé, plus dense et plus contrasté.
- **Accent global** : `#03DFF8`.

L'accent cyan ne doit pas devenir une couleur omniprésente. Il doit principalement signaler :

- un état actif ;
- une sélection ;
- une interaction importante ;
- un focus ;
- un contrôle activé ;
- une information système importante.

Les widgets peuvent posséder des couleurs secondaires propres à leur fonction, mais les surfaces, la typographie, les rayons, les espacements et les états doivent rester cohérents avec Aera OS.

---

# 3. Architecture des tokens

Les tokens doivent être organisés par catégories :

```text
Aera Design System
├── Colors
├── Typography
├── Spacing
├── Radius
├── Borders
├── Shadows
├── Glass
├── Blur
├── Components
├── Motion
└── States
```

La source canonique doit être centralisée dans le dépôt et ne doit pas être redéfinie individuellement dans chaque extension.

---

# 4. Color Tokens

## 4.1 Accent global

| Token | Valeur | Usage |
|---|---|---|
| `accent.primary` | `#03DFF8` | État actif, sélection, interaction principale |
| `accent.on-primary` | `#061316` | Texte/icône placé directement sur l'accent |
| `accent.hover` | À dériver du primaire | Hover d'un élément accentué |
| `accent.pressed` | À dériver du primaire | État pressé |
| `accent.muted` | Accent à faible opacité | Accent secondaire / indicateur discret |
| `accent.glow` | Accent avec faible alpha | Halo/glow ponctuel |

**Règle :** aucune couleur concurrente ne doit remplacer `accent.primary` pour les contrôles système globaux.

---

## 4.2 Light Mode

### Surfaces

```text
light.surface.root        = rgba(255, 255, 255, 0.35)
light.surface.strong      = rgba(255, 255, 255, 0.45)
light.surface.subtle      = rgba(255, 255, 255, 0.20)
light.surface.inner       = rgba(255, 255, 255, 0.15)
```

### Bordures

```text
light.border.glass        = rgba(255, 255, 255, 0.40)
light.border.subtle       = rgba(255, 255, 255, 0.25)
```

### Texte

```text
light.text.primary        = #FFFFFF
light.text.secondary      = rgba(255, 255, 255, 0.72)
light.text.muted          = rgba(255, 255, 255, 0.55)
light.text.disabled       = rgba(255, 255, 255, 0.40)
```

> Les valeurs de texte doivent être ajustées visuellement si le wallpaper rend le blanc insuffisamment lisible. La priorité est la lisibilité, sans abandonner la direction visuelle.

---

## 4.3 Dark Mode

### Surfaces

```text
dark.surface.root        = rgba(20, 25, 35, 0.70)
dark.surface.strong      = rgba(20, 25, 35, 0.82)
dark.surface.subtle      = rgba(20, 25, 35, 0.55)
dark.surface.inner       = rgba(255, 255, 255, 0.08)
```

**Note d'implémentation :** les noms ci-dessus sont des tokens conceptuels. La syntaxe finale utilisée dans le code doit respecter le système de tokens choisi par l'agent.

### Bordures

```text
dark.border.glass        = rgba(255, 255, 255, 0.20)
dark.border.subtle       = rgba(255, 255, 255, 0.12)
```

### Texte

```text
dark.text.primary        = #FFFFFF
dark.text.secondary      = #C6CBD3
dark.text.muted          = #9E9E9E
dark.text.disabled       = rgba(255, 255, 255, 0.40)
```

---

# 5. Widget Accent Colors

Les widgets peuvent employer des accents fonctionnels afin d'avoir une identité propre.

| Fonction | Direction initiale |
|---|---|
| Météo | Bleu électrique / cyan |
| Calendrier | Rose pastel |
| Horloge secondaire | Corail / pêche |
| Finance | Ambre / or |

Ces couleurs sont **fonctionnelles et contextuelles**. Elles ne remplacent pas l'accent global `#03DFF8` du système.

Les valeurs exactes de ces couleurs seront définies lorsqu'un widget correspondant sera implémenté.

---

# 6. Typography

## 6.1 Famille

Aera OS doit utiliser une police sans-serif moderne, géométrique et néo-grotesque, avec une préférence pour une famille proche de :

- Inter ;
- SF Pro Display ou équivalent disponible légalement dans l'environnement ;
- une sans-serif système comparable si nécessaire.

L'implémentation doit privilégier une police **réellement disponible et fiable** dans l'environnement cible plutôt qu'une dépendance fragile à un fichier externe.

## 6.2 Échelle

| Token | Taille | Poids indicatif | Usage |
|---|---:|---|---|
| `type.display` | `72–96px` | Bold / Heavy | Horloge centrale, grand affichage |
| `type.metric` | `18–24px` | Medium / Bold | Valeurs importantes |
| `type.label` | `13–14px` | Medium | Labels, contrôles |
| `type.caption` | `10–11px` | Regular / Light | Dates, metadata, sous-titres |

### Règle de hiérarchie

La taille seule ne doit pas porter toute la hiérarchie. Utiliser conjointement :

- taille ;
- poids ;
- opacité ;
- espacement ;
- position.

---

# 7. Spacing

Aera OS utilise une base d'espacement régulière.

```text
space.1   = 4px
space.2   = 8px
space.3   = 12px
space.4   = 16px
space.5   = 20px
space.6   = 24px
space.8   = 32px
space.10  = 40px
```

### Usage initial

- `8–12px` entre éléments proches ;
- `16–20px` de padding interne standard ;
- `12–16px` depuis les bords de l'écran pour les éléments flottants ;
- `24px+` pour séparer des groupes visuels distincts.

---

# 8. Border Radius

```text
radius.sm        = 8px
radius.md        = 12px
radius.lg        = 16px
radius.xl        = 20px
radius.2xl       = 24px
radius.pill      = 999px
```

### Usage

| Token | Usage |
|---|---|
| `radius.sm` | Petits contrôles / éléments compacts |
| `radius.md` | Contrôles internes |
| `radius.lg` | Cartes / dock / composants principaux compacts |
| `radius.xl` | Panneaux flottants |
| `radius.2xl` | Grandes surfaces principales |
| `radius.pill` | Boutons circulaires/pills |

---

# 9. Borders

Le bord du verre doit rester fin et discret.

```text
border.width.hairline = 1px
```

### Light

```text
border.glass.light = rgba(255, 255, 255, 0.40)
```

### Dark

```text
border.glass.dark  = rgba(255, 255, 255, 0.20)
```

### Règle

Le border sert à matérialiser la surface vitrée. Il ne doit pas devenir une ligne décorative épaisse.

---

# 10. Shadows

Aera OS utilise des ombres très diffuses.

```text
shadow.floating = 0 12px 32px rgba(0, 0, 0, 0.25)
```

Une ombre plus faible peut être utilisée pour les composants internes :

```text
shadow.subtle = 0 6px 18px rgba(0, 0, 0, 0.16)
```

### Règle

L'ombre doit créer une séparation spatiale, pas simuler une boîte noire autour du composant.

---

# 11. Glass System

Le glassmorphism est le cœur visuel d'Aera OS, mais il doit rester contrôlé.

## 11.1 Glass principal — Light

```text
glass.light.background = rgba(255, 255, 255, 0.35)
glass.light.border     = rgba(255, 255, 255, 0.40)
```

## 11.2 Glass principal — Dark

```text
glass.dark.background  = rgba(20, 25, 35, 0.70)
glass.dark.border      = rgba(255, 255, 255, 0.20)
```

## 11.3 Glass interne

```text
glass.inner.light      = rgba(255, 255, 255, 0.15–0.25)
glass.inner.dark       = rgba(255, 255, 255, 0.08–0.15)
```

## 11.4 Blur

Direction visuelle initiale :

```text
blur.glass = 25px
saturation.glass = 180%
```

**Important :** l'agent doit adapter la technique d'implémentation aux capacités réelles du CSS de GNOME Shell utilisé par la version cible. Le token décrit l'effet visuel recherché ; il ne faut pas introduire une propriété non supportée simplement pour reproduire une syntaxe web.

---

# 12. Règles de profondeur

Aera OS ne doit pas accumuler des couches de verre sans contrôle.

### Maximum recommandé

```text
Wallpaper
   ↓
Glass Level 1
   ↓
Glass Level 2
```

Éviter :

```text
Wallpaper
   ↓
Glass
   ↓
Glass
   ↓
Glass
   ↓
Glass
```

La multiplication des couches peut réduire la lisibilité et rendre l'interface visuellement confuse.

---

# 13. Component Sizing

## Dock

```text
dock.height = 52–60px
```

## Sliders

```text
slider.height = 28–32px
```

## Compact widgets / quick controls

```text
compact.height = 36–40px
```

Ces valeurs constituent des dimensions de départ. Les composants doivent rester adaptables à différentes résolutions et densités d'écran.

---

# 14. States

Chaque composant interactif doit avoir un comportement visuel cohérent.

## Hover

Augmentation légère de la luminosité/surface, sans changer brutalement la couleur.

Direction initiale :

```text
surface hover = surface normale + ~10% de présence blanche
```

## Focus

Le focus doit être immédiatement identifiable, avec priorité au système d'accent Aera :

```text
focus.color = #03DFF8
```

## Pressed / Active

L'élément passe vers l'accent cyan lorsqu'il représente un état actif ou sélectionné.

```text
active.color = #03DFF8
```

## Disabled

```text
disabled.opacity ≈ 40%
```

Les éléments désactivés doivent également perdre leur fond accentué et revenir vers un traitement neutre.

---

# 15. Motion

Les animations Aera OS doivent être :

- rapides ;
- fluides ;
- discrètes ;
- cohérentes.

## Principes

### Panel

```text
fade + slide
```

### Dock

```text
subtle scale on hover
```

### Sliders

```text
smooth value transition
```

### Règle

Ne pas animer une fonctionnalité uniquement parce qu'elle peut l'être. Une animation doit communiquer une relation spatiale, un changement d'état ou une réponse utilisateur.

Les durées exactes seront standardisées après observation dans la première implémentation réelle.

---

# 16. Iconography

## System / Control Center

- pictogrammes minimalistes ;
- style ligne/simple ;
- monochrome par défaut ;
- accent cyan pour les états actifs.

## Dock / Applications

- icônes applicatives colorées ;
- cohérentes avec les conventions GNOME et les applications existantes ;
- pas de recoloration automatique qui détruirait l'identité des applications.

---

# 17. Glassmorphism — règles obligatoires

### Règle 1 — Le glass doit rester lisible

Ne pas utiliser uniquement une opacité faible sur un wallpaper détaillé si cela rend le texte illisible.

### Règle 2 — Le bord est obligatoire

Les grandes surfaces vitrées doivent avoir un liseré subtil qui matérialise leur contour.

### Règle 3 — Maximum deux niveaux

Ne pas dépasser deux niveaux de surfaces vitrées superposées dans une même composition.

### Règle 4 — Light et Dark sont différents

Le thème sombre doit utiliser un verre plus dense que le thème clair.

### Règle 5 — Cyan avec parcimonie

`#03DFF8` indique principalement l'état et l'interaction. Ce n'est pas la couleur de fond de toute l'interface.

---

# 18. Source of Truth technique

Le projet doit posséder **une source centrale de tokens**.

Architecture recommandée :

```text
repo/
├── design-system/
│   ├── AERA_DESIGN_TOKENS_V1.md
│   ├── tokens.json
│   └── README.md
│
├── extensions/
│   ├── dream-shell/        # ou aera-shell si renommé plus tard
│   ├── dream-dock/
│   ├── dream-widgets/
│   └── dream-launcher/
│
└── ...
```

### `AERA_DESIGN_TOKENS_V1.md`

Source documentaire lisible par les humains.

### `tokens.json`

Source structurée pouvant servir de référence machine.

### `README.md`

Explique comment une extension doit consommer les tokens.

### Important

Une extension ne doit pas inventer ses propres valeurs pour un token déjà défini.

Par exemple, éviter :

```js
const cyan = '#11ccff';
```

si le système définit déjà :

```text
accent.primary = #03DFF8
```

---

# 19. Compatibilité GNOME

Le design system décrit **l'intention visuelle**. La technique utilisée pour la reproduire doit respecter l'environnement GNOME/GTK/GNOME Shell réellement utilisé par Aera OS.

L'implémentation doit donc distinguer :

```text
Design Token
     ↓
Implementation Adapter
     ↓
GNOME Shell / GTK / CSS / GJS
```

Ne pas supposer qu'une propriété CSS disponible dans un navigateur web est automatiquement disponible dans le moteur de style utilisé par GNOME Shell.

---

# 20. Ce qui est déjà défini vs ce qui sera affiné

## Défini dans V1

- direction glassmorphism ;
- Light/Dark ;
- accent `#03DFF8` ;
- hiérarchie typographique ;
- échelle d'espacement ;
- rayons ;
- bordures ;
- ombres ;
- niveaux de glass ;
- principes de blur ;
- dimensions initiales ;
- états ;
- principes d'animation ;
- règles de profondeur.

## À affiner après les premiers composants

- durées exactes des animations ;
- valeurs exactes des couleurs fonctionnelles des widgets ;
- comportement précis du contraste selon les wallpapers ;
- valeurs définitives de certaines nuances de surface ;
- tokens spécifiques aux composants complexes.

Le système doit rester évolutif. V1 fournit une base cohérente sans prétendre figer tous les détails du produit.

---

# 21. Critère de conformité d'une extension

Une extension Aera OS est considérée comme conforme au design system lorsqu'elle :

1. utilise la source centrale des tokens ;
2. respecte Light et Dark ;
3. utilise `#03DFF8` pour les états actifs globaux ;
4. respecte la hiérarchie typographique ;
5. respecte les rayons et espacements ;
6. utilise les surfaces glass prévues ;
7. respecte la règle des deux niveaux de glass ;
8. possède des états Hover / Focus / Pressed / Disabled cohérents ;
9. n'introduit pas arbitrairement de nouvelles couleurs ou dimensions ;
10. reste lisible et fonctionnelle dans la VM de développement.

---

# 22. Résultat attendu à la fin de la tâche

```text
Aera OS Repository
│
├── design-system/
│   ├── AERA_DESIGN_TOKENS_V1.md
│   ├── tokens.json
│   └── README.md
│
├── extensions/
│   └── première-extension/
│       ├── extension.js
│       ├── stylesheet.css
│       └── ...
│
└── ...
```

Le principe recherché est simple :

```text
               AERA DESIGN SYSTEM
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
      Shell Ext.    Dock Ext.   Widget Ext.
          │            │            │
          └────────────┼────────────┘
                       ↓
                 même langage UI
```

Chaque extension peut avoir sa propre logique et ses propres composants, mais **elle ne doit pas avoir sa propre identité visuelle indépendante**.
