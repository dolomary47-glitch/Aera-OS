# Dream OS — Roadmap V1
## Construire progressivement une distribution Linux qui s’adapte à l’utilisateur

> **Vision :** rendre Linux accessible à tout le monde sans retirer la puissance aux utilisateurs avancés.
>
> **Principe :** l’utilisateur ne doit pas avoir besoin de comprendre Linux pour utiliser Dream OS, mais le terminal et les outils avancés restent toujours disponibles.
>
> **Approche V1 :** partir d’Ubuntu LTS, construire d’abord l’expérience de bureau avec GNOME Shell/extensions et ne créer une ISO/installation personnalisée qu’une fois l’expérience stable.

---

## 1. Vision du produit

Dream OS doit proposer une expérience moderne, élégante et familière aux utilisateurs venant de Windows, tout en conservant les avantages de Linux : contrôle, liberté, confidentialité et personnalisation.

### Direction visuelle initiale

- Interface moderne, propre et premium.
- Inspiration générale des interfaces desktop modernes, sans copier Windows, macOS ou un autre OS.
- Glassmorphism/frost léger et maîtrisé, utilisé avec parcimonie.
- Mode clair et mode sombre.
- Dock inférieur.
- Horloge centrale en haut.
- Zone de widgets à gauche.
- Zone système/notifications à droite.
- Composants séparés visuellement plutôt qu’un énorme panneau unique.
- Animations discrètes et rapides.
- Interface cohérente jusque dans les paramètres, notifications et états vides.

### Philosophie technique

**Ne pas réinventer Linux inutilement.**

Réutiliser les services existants pour le réseau, le son, la batterie, les notifications, les applications, etc. Dream OS doit surtout améliorer l’expérience utilisateur et l’intégration.

---

# 2. Architecture cible de la V1

```text
Ubuntu LTS
    │
    ├── GNOME
    │
    ├── Dream Theme
    │   ├── GTK
    │   ├── GNOME Shell
    │   ├── Icônes
    │   └── Curseurs / éléments visuels
    │
    ├── Dream Shell
    │   ├── Horloge
    │   ├── Dock
    │   ├── Widgets
    │   ├── Zone système
    │   └── Notifications
    │
    ├── Dream Launcher
    │
    ├── Dream Settings
    │
    └── Dream First Run / OOBE
```

**Important :** cette architecture est progressive. Tous les composants ne doivent pas être développés dès la première semaine.

---

# 3. Roadmap — 16 semaines

## Semaine 1 — Fondation et environnement

### Objectif
Créer un environnement de développement sûr et reproductible.

### À faire
- Installer Ubuntu LTS dans une VM.
- Configurer Git.
- Créer le dépôt Dream OS.
- Installer les outils nécessaires au développement GNOME.
- Comprendre la structure d’une extension GNOME.
- Créer une extension minimale.
- Afficher un premier élément Dream OS dans GNOME Shell.
- Tester activation/désactivation de l’extension.

### Résultat attendu
Une extension GNOME minimale fonctionne dans une VM sans modifier dangereusement le système hôte.

---

## Semaine 2 — Design System Dream OS

### Objectif
Définir le langage visuel avant de multiplier les composants.

### À définir
- Palette claire.
- Palette sombre.
- Typographie.
- Tailles de texte.
- Rayons.
- Bordures.
- Ombres.
- Transparence.
- Flou.
- Espacements.
- Hauteurs de composants.
- Animations.
- États hover/focus/pressed/disabled.
- Icônes.
- Règles d’utilisation du glassmorphism.

### Résultat attendu
Un document de design system suffisamment précis pour que chaque composant puisse être construit avec les mêmes règles.

---

## Semaine 3 — Dream Theme

### Objectif
Donner à GNOME sa première identité visuelle Dream OS.

### À travailler
- GNOME Shell CSS.
- GTK theme.
- Couleurs.
- Menus.
- Popovers.
- Notifications.
- Dialogues.
- Boutons.
- Champs de recherche.
- Switches.
- Sliders.
- États de sélection.
- Cohérence clair/sombre.

### Résultat attendu
Même sans le dock ni les widgets, GNOME commence déjà à ressembler à Dream OS.

---

## Semaine 4 — Dream Shell : structure

### Objectif
Construire la structure principale du bureau.

### Zones
- **Haut-centre :** horloge.
- **Bas :** dock.
- **Gauche :** zone de widgets.
- **Droite :** zone système et notifications.

### À faire
- Créer les conteneurs.
- Définir les espacements.
- Gérer les différentes résolutions.
- Préparer les animations d’apparition/disparition.
- Éviter que les composants gênent les fenêtres maximisées.

### Résultat attendu
Une première maquette fonctionnelle du bureau Dream OS.

---

## Semaine 5 — Horloge

### Objectif
Créer l’élément d’identité central du bureau.

### Fonctionnalités
- Heure en temps réel.
- Format 12/24 h.
- Date optionnelle.
- Mode clair/sombre.
- Typographie cohérente.
- Animation subtile si nécessaire.
- Adaptation aux différentes tailles d’écran.

### Résultat attendu
Une horloge élégante, lisible et parfaitement intégrée au bureau.

---

## Semaine 6 — Dream Dock

### Objectif
Créer un dock propriétaire plutôt que dépendre immédiatement d’un dock tiers.

### Fonctionnalités initiales
- Applications favorites.
- Applications ouvertes.
- Lancement d’application.
- Indication d’application active.
- Ajout/retrait des favoris.
- Réorganisation.
- Masquage automatique.
- Animation d’apparition.
- Taille configurable.

### Design
- Glass/frost maîtrisé.
- Pas de surcharge visuelle.
- Icônes cohérentes.
- Animations rapides et naturelles.

### Résultat attendu
Un dock fonctionnel qui constitue l’un des éléments principaux de l’identité Dream OS.

---

## Semaine 7 — Architecture des widgets

### Objectif
Créer un système permettant d’ajouter des widgets sans réécrire toute l’interface.

### Premier travail
- Définir une API/interface interne de widget.
- Gestion de taille.
- Position.
- Visibilité.
- Configuration.
- Persistance des préférences.
- États de chargement/erreur.
- Possibilité de désactiver les widgets.

### Résultat attendu
Un framework interne simple permettant de développer plusieurs widgets de manière cohérente.

---

## Semaine 8 — Widget météo + zone système

### Widget météo
- Température.
- Conditions.
- Localisation configurable.
- Unités.
- États de chargement.
- Gestion d’erreur.
- Rafraîchissement raisonnable.

### Zone système
Commencer à intégrer :
- Wi-Fi.
- Volume.
- Bluetooth si pertinent.
- Batterie.
- Réseau.
- Luminosité si disponible.

### Principe
Utiliser les services Linux existants plutôt que recréer toute la couche système.

### Résultat attendu
Le côté gauche et le côté droit du bureau commencent à devenir réellement utiles.

---

## Semaine 9 — Panneau système

### Objectif
Transformer la zone système en véritable centre de contrôle rapide.

### Fonctionnalités possibles
- Réseau.
- Wi-Fi.
- Bluetooth.
- Volume.
- Micro.
- Luminosité.
- Batterie.
- Mode nuit.
- Mode sombre/clair.
- Paramètres rapides.

### Résultat attendu
L’utilisateur peut effectuer les actions courantes sans ouvrir plusieurs fenêtres de configuration.

---

## Semaine 10 — Intégration système

### Objectif
Faire communiquer proprement Dream Shell avec Linux.

### À étudier
- D-Bus.
- NetworkManager.
- PipeWire.
- UPower.
- Portails desktop.
- Notifications.
- Gestion des applications.

### Règle
Dream OS ne doit pas remplacer un composant système sans raison technique ou UX claire.

### Résultat attendu
Une interface Dream OS qui contrôle réellement les fonctions du système.

---

## Semaine 11 — Dream Launcher V1

### Objectif
Créer un launcher simple et rapide.

### Interaction
- Touche Super.
- Apparition centrée.
- Champ de recherche immédiatement actif.
- Recherche d’applications.
- Navigation clavier.
- Lancement avec Entrée.
- Échap pour fermer.

### Design
- Fenêtre légère.
- Recherche au centre.
- Résultats très lisibles.
- Pas de gros dashboard inutile.

### Résultat attendu
Un launcher aussi naturel qu’un outil de recherche système moderne.

---

## Semaine 12 — Dream Launcher avancé

### Ajouter progressivement
- Applications.
- Fichiers.
- Paramètres.
- Actions système.
- Calculs.
- Recherche rapide.
- Historique récent si pertinent.

### Exemple

```text
wifi
→ ouvrir les paramètres Wi-Fi

calculator
→ calculer immédiatement

dark mode
→ activer/désactiver le mode sombre

documents
→ rechercher les fichiers correspondants
```

### Résultat attendu
Le launcher devient le point d’accès universel aux fonctions de Dream OS.

---

## Semaine 13 — Dream Settings

### Objectif
Créer une expérience de paramètres cohérente.

### Catégories possibles
- Apparence.
- Bureau.
- Dock.
- Widgets.
- Notifications.
- Réseau.
- Son.
- Affichage.
- Clavier.
- Souris.
- Confidentialité.
- Applications.
- Système.

### Résultat attendu
Une interface de configuration identifiable comme Dream OS.

---

## Semaine 14 — Personnalisation

### Objectif
Mettre en pratique la promesse : **« une distribution qui s’adapte à vous »**.

### Options possibles
- Clair/sombre.
- Accent.
- Position du dock.
- Taille du dock.
- Widgets actifs.
- Position des widgets.
- Horloge.
- Format de date/heure.
- Animations.
- Densité de l’interface.

### Important
La personnalisation doit rester compréhensible. Ne pas transformer Dream OS en panneau de contrôle rempli de centaines d’options.

---

## Semaine 15 — OOBE / First Run

### Objectif
Créer la première expérience après installation.

### Parcours

```text
Bienvenue
   ↓
Langue
   ↓
Clavier
   ↓
Compte utilisateur
   ↓
Mot de passe
   ↓
Nom du PC
   ↓
Apparence
   ↓
Mode clair / sombre
   ↓
Préférences de bureau
   ↓
Widgets
   ↓
Bienvenue dans Dream OS
```

### Résultat attendu
Un nouvel utilisateur comprend Dream OS sans avoir besoin de lire une documentation Linux.

---

## Semaine 16 — Polish et V0.1

### Objectif
Arrêter d’ajouter des fonctionnalités et améliorer ce qui existe.

### Vérifications
- Performances.
- Temps de démarrage.
- Mémoire.
- Animations.
- Responsive desktop.
- Multi-écrans.
- Clavier.
- Souris.
- Accessibilité.
- Notifications.
- États d’erreur.
- États de chargement.
- Mode clair.
- Mode sombre.
- Stabilité.
- Crash recovery.

### Résultat attendu
Une **Dream OS V0.1 utilisable quotidiennement en VM**.

---

# 4. Après les 16 semaines — Passage vers une vraie distribution

Une fois l’expérience de bureau solide :

1. Définir les paquets Dream OS.
2. Créer les paquets/thèmes/extensions propres au projet.
3. Automatiser leur installation.
4. Construire une image ISO de test.
5. Ajouter un environnement Live.
6. Intégrer l'installateur.
7. Créer le branding système.
8. Ajouter le First Boot/OOBE.
9. Tester sur plusieurs machines.
10. Mettre en place CI/CD pour construire les images.
11. Créer les mises à jour.
12. Mettre en place une stratégie de rollback.
13. Effectuer des tests matériels.
14. Stabiliser.
15. Préparer une V1 publique.

---

# 5. Règles du projet

### Règle 1 — Petit à petit

Ne jamais développer cinq systèmes simultanément.

### Règle 2 — Fonctionnel avant spectaculaire

Une fonctionnalité doit fonctionner réellement avant d’être embellie.

### Règle 3 — Ne pas réinventer Linux

Si NetworkManager, PipeWire, D-Bus, UPower ou un autre composant fait déjà correctement le travail, Dream OS doit l’utiliser.

### Règle 4 — L'utilisateur n'est jamais forcé d'utiliser le terminal

Mais le terminal reste disponible pour ceux qui le souhaitent.

### Règle 5 — La simplicité est une fonctionnalité

Chaque option doit avoir une raison d'exister.

### Règle 6 — Le design est un système

Pas de composants dessinés individuellement sans respecter le design system.

### Règle 7 — Tester avant d'empiler

Chaque semaine doit produire quelque chose de testable.

---

# 6. Jalons

| Jalon | Résultat |
|---|---|
| M1 | Extension GNOME minimale |
| M2 | Design system |
| M3 | Thème Dream OS |
| M4 | Structure Dream Shell |
| M5 | Horloge |
| M6 | Dock |
| M7 | Architecture widgets |
| M8 | Météo + système |
| M9 | Centre de contrôle |
| M10 | Intégration Linux |
| M11 | Launcher V1 |
| M12 | Launcher avancé |
| M13 | Dream Settings |
| M14 | Personnalisation |
| M15 | OOBE |
| M16 | Dream OS V0.1 |

---

# 7. Philosophie finale

> **Dream OS ne doit pas demander à l'utilisateur de devenir un expert Linux.**
>
> Il doit simplement lui donner un ordinateur qui fonctionne, qui respecte sa vie privée, qui reste puissant quand il veut aller plus loin, et qui s'adapte progressivement à sa manière de travailler.

**Petit à petit, l'oiseau fait son nid.**
