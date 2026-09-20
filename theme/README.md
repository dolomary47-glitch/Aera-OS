# Aera OS — GNOME Shell Theme Layer

Thème officiel GNOME Shell pour **Aera OS** basé sur la référence `Transparent shell theme 4.8`.

---

## 1. Architecture

```text
theme/
├── dist/                              ← Distribution prête à installer
│   ├── Aera/
│   │   ├── gnome-shell/
│   │   │   ├── calendar-event-disabled.svg
│   │   │   ├── calendar-event-today.svg
│   │   │   ├── calendar-event.svg
│   │   │   ├── gnome-shell.css
│   │   │   └── workspace-placeholder.svg
│   │   └── index.theme
│   ├── README.md
│   ├── LICENSE
│   └── install.sh                     ← Script d'installation directe
├── scripts/
│   ├── build-theme.js                 ← Déployeur / synchroniseur de thème
│   └── package-theme.sh               ← Empaqueteur d'archive tar.gz
└── Aera-Theme-1.0.tar.gz              ← Archive de distribution
```

---

## 2. Versions GNOME supportées

- **GNOME 45**
- **GNOME 46** (Ubuntu 24.04 LTS / Zorin OS 18.1)
- **GNOME 47**
- **GNOME 48**

---

## 3. Installation & Activation

### Installation automatique
```bash
bash theme/dist/install.sh
```

### Activation

1. Activer l'extension **User Themes** :
```bash
gnome-extensions enable user-theme@gnome-shell-extensions.gcampax.github.com
```

2. Appliquer le thème Aera :
```bash
gsettings set org.gnome.shell.extensions.user-theme name 'Aera'
```

---

## 4. Packaging

```bash
# Recompiler et mettre à jour dist/
node theme/scripts/build-theme.js

# Créer la nouvelle archive Aera-Theme-1.0.tar.gz
bash theme/scripts/package-theme.sh
```
