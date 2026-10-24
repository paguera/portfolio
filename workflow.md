# 🛡️ Étude de cas : Conception d'un poste de dev souverain, sécurisé et assisté par IA locale

> **Auteur :** Gabriel  
> **Contexte :** Ingénierie du poste de travail de développement & préparation à la reconversion DevSecOps / AppSec  
> **Environnement :** CachyOS Linux (Rolling / Noyau optimisé) • Hyprland (Wayland) • GPU AMD Radeon AI PRO R9700 32 Go (ROCm)  
> **Date :** Octobre 2026  

---

## 📌 Executive Summary

L'intégration d'assistants de code IA (type Cursor, Claude Code, OpenCode) est devenue un standard de productivité. Cependant, dans les contextes sensibles ou en entreprise, l'usage d'outils cloud pose deux risques majeurs :
1. **La fuite de données et de secrets** (*Data exfiltration* / *Shadow AI*) par l'envoi de code vers des serveurs tiers.
2. **L'exécution de code arbitraire non contrôlée** par des agents dotés de permissions trop permissives sur la machine hôte.

Ce document retrace la conception, le durcissement réseau et l'optimisation matérielle d'une **station de travail souveraine, 100 % locale, cloisonnée et assistée par des agents IA**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Machine Hôte (CachyOS)                          │
│                                                                        │
│   ┌─────────────────────┐                 ┌────────────────────────┐   │
│   │   Hyprland (4K)     │                 │      OpenCode CLI      │   │
│   │   Buffer VRAM dédié │                 │   (Agent Sandboxté)    │   │
│   └──────────▲──────────┘                 └───────────▲────────────┘   │
│              │ (4 Go réservés)                        │ (MCP stdio)    │
│   ┌──────────┴──────────┐                 ┌───────────┴────────────┐   │
│   │ Ollama (ROCm Local) │◄────────────────┤ MCP Codebase Indexer   │   │
│   │  Qwen3-Coder 30B    │ (127.0.0.1)     │  (AST + BM25 + Embed)  │   │
│   └──────────▲──────────┘                 └────────────────────────┘   │
│              │                                                         │
│       UFW Firewall (DEFAULT: DROP)                                     │
│       ├── lo (127.0.0.1)          ──► [ACCEPT]                         │
│       ├── tailscale0 (VPN Maillé) ──► [ACCEPT]                         │
│       └── enp10s0 (LAN Physique)  ──► [DENY]                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Problématiques & Contraintes Initiales

### A. Le crash d'affichage Wayland / Hyprland
La machine est équipée d'une carte graphique **AMD Navi 48 (Radeon AI PRO R9700 de 32 Go de VRAM)** pilotée par ROCm, alimentant un écran 4K (`3840x2160`).  
Lors de l'utilisation d'Ollama avec des modèles de programmation (Qwen3-Coder 30B, Devstral) :
- Le modèle de poids prenait ~6,2 Go.
- Le **KV cache** (contexte étendu de 131k tokens) prenait **24,5 Go**.
- **Résultat :** 31,25 Go sur 31,9 Go de VRAM consommés. Ne laissant qu'environ 1 Go libre, le compositeur Wayland (`Aquamarine/Hyprland`) subissait des échecs d'allocation de buffer de trame, provoquant un reset du pilote `amdgpu` et **la déconnexion brutale de la session graphique**.

### B. Le dilemme de l'exposition réseau
Pour piloter les modèles locaux depuis un laptop portable en mobilité sans compromettre la sécurité :
- Ollama devait être accessible depuis le réseau maillé chiffré **Tailscale** (`tailscale0`).
- Ollama devait répondre sur la boucle locale (`127.0.0.1`) pour les outils de la machine fixe.
- **Tout le reste (en particulier le réseau local filaire LAN `enp10s0`) devait être strictement hermétique.**

---

## 2. Ingénierie Système : Budgétisation Matérielle du GPU

Pour stabiliser l'affichage sans sacrifier la puissance des LLM locaux, nous avons configuré une surcharge systemd (*drop-in*) sur `ollama.service`.

### Configuration de la surcharge (`/etc/systemd/system/ollama.service.d/override.conf`)
```ini
[Service]
# Écoute globale (le filtrage sera délégué au pare-feu réseau)
Environment="OLLAMA_HOST=0.0.0.0:11434"

# Réserve stricte de 4 Go de VRAM pour le système (4 * 1024^3 octets)
Environment="OLLAMA_GPU_OVERHEAD=4294967296"

# Quantification du KV cache en 8-bit (économie de 50% de VRAM sur le contexte)
Environment="OLLAMA_KV_CACHE_TYPE=q8_0"

# Autorisation CORS pour les clients web distants du Tailnet
Environment="OLLAMA_ORIGINS=*"
```

### 💡 Piège technique évité :
Ollama ne prend pas en charge les notations abrégées (`4G` ou `4GiB`) pour `OLLAMA_GPU_OVERHEAD` et repasse silencieusement à `0`. La valeur doit impérativement être passée en **octets entiers** (`4294967296`).

**Résultat mesuré :**  
Ollama adapte désormais son allocation à **27.9 GiB max**, sanctuarisant **4 Go permanents** pour Mesa, Aquamarine et Hyprland. Zéro crash constaté depuis l'application.

---

## 3. Durcissement Réseau : Segmentation par Interface (UFW)

Plutôt que d'exposer publiquement un service d'inférence non authentifié, nous avons couplé l'écoute réseau avec le pare-feu **UFW** :

1. **Politique par défaut :** `DEFAULT_INPUT_POLICY="DROP"` (tout flux entrant inconnu est rejeté).
2. **Localhost (`lo`) :** Autorisé nativement pour les agents locaux.
3. **Tailscale (`tailscale0`) :** Autorisation ciblée du port `11434/tcp`.
4. **LAN physique (`enp10s0`) :** Règle explicite de rejet du port `11434/tcp`.

### Commandes appliquées :
```bash
sudo ufw allow in on tailscale0 to any port 11434 proto tcp comment 'Ollama Tailscale'
sudo ufw deny in on enp10s0 to any port 11434 proto tcp comment 'Block Ollama on LAN'
sudo ufw reload
```

**Matrice de connectivité vérifiée :**
- `http://127.0.0.1:11434/` ➔ **200 OK** (Agents locaux)
- `http://100.120.252.122:11434/` ➔ **200 OK** (Laptop distant via VPN Tailscale)
- `http://192.168.1.29:11434/` ➔ **DROP / REFUSED** (Postes sur le Wi-Fi/LAN physique)

---

## 4. Orchestration de l'Agent : OpenCode & Sandboxing

Au lieu de dépendre d'outils tiers fermés, nous avons déployé **OpenCode CLI**, configuré globalement dans [`~/.config/opencode/opencode.json`](file:///home/gabriel/.config/opencode/opencode.json).

### Politique de sécurité : Principe du Moindre Privilège (*Least Privilege*)
Pour éviter qu'un modèle hallucine une suppression de fichier ou exécute un script malveillant sur l'hôte, une matrice de permissions stricte a été définie :

```json
{
  "permission": {
    "read": "allow",
    "list": "allow",
    "glob": "allow",
    "grep": "allow",
    "lsp": "allow",
    "websearch": "allow",

    "edit": "ask",
    "bash": "ask",
    "external_directory": "ask",
    "webfetch": "ask"
  }
}
```

- **Fluide en lecture :** L'agent explore, lit l'arborescence et analyse le code sans interruption.
- **Verrouillé en écriture et exécution :** Toute commande terminal (`bash`) ou modification de code (`edit`) exige une **validation humaine explicite** dans la console.
- **Confinement :** L'agent ne peut pas accéder aux dossiers parents hors du projet sans avertissement (`external_directory: ask`).

---

## 5. RAG & Indexation Sémantique : Le passage à l'échelle via MCP

### Abandon du prototype custom (IAception)
Un projet précédent développé en Rust (`iaception`) implémentait son propre moteur de RAG, son serveur local et un découpeur par expressions régulières. Bien qu'instructif, ce projet présentait des limites :
- Découpage naïf ignorant la sémantique du code (AST).
- Maintenance logicielle lourde d'un démon supplémentaire.

### La solution retenue : `open-codebase-index` via MCP
Nous avons intégré le standard industriel **MCP (Model Context Protocol)** avec le serveur `open-codebase-index-mcp` connecté directement à Ollama :

1. **Tree-sitter AST :** Découpage du code par classes, fonctions et blocs logiques (Rust, TypeScript, Go, Python, Bash...).
2. **Recherche Hybride :** Fusion de similarité vectorielle (embeddings locaux Ollama `nomic-embed-text`) et de recherche lexicale BM25.
3. **Graphe d'appels :** Outils d'inspection des dépendances (`callers`, `callees`, définitions de symboles).

### Benchmark d'indexation réel (Projet `iaception`) :
- **Fichiers traités :** 38 fichiers source.
- **Fragments vectorisés :** 796 chunks (163 032 tokens).
- **Durée totale :** **22,7 secondes** sur le GPU local.
- **Précision :** Une requête sémantique sur *"scrubber secrets filtre"* identifie instantanément la struct `Scrubber` (score 1.00) et la méthode de caviardage sans aucune hallucination.

---

## 6. Bilan & Enseignements DevSecOps

Cette infrastructure démontre qu'il est possible de concilier **haute productivité par l'IA** et **rigueur absolue de sécurité** :

1. **Souveraineté des données :** Aucun jeton de code ou secret ne transite sur internet ; tout le cycle d'inférence (génération + embeddings RAG) est confiné au silicium local.
2. **Défense en profondeur :**
   - Couche matérielle (sanctuarisation VRAM pour éviter le DoS de l'OS).
   - Couche réseau (filtrage d'interface UFW + VPN maillé Tailscale).
   - Couche applicative (contrôle d'accès RBAC/matrice de permissions sur l'agent).
3. **Automatisation maintenable :** Remplacement d'un outil maison instable par des standards ouverts (`systemd`, `UFW`, `MCP`, `OpenCode`).
