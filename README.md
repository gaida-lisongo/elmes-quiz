# 🏆 ELMES-QUIZ : La Plateforme Virale de Génie en Herbe à Kinshasa

> **elmes-quiz** est une application web de quiz ultra-rapide et gamifiée, conçue pour digitaliser l'univers du Génie en Herbe à Kinshasa. Le projet intègre un modèle économique circulaire (Free-to-Play) basé sur des jetons consommables, une boucle de parrainage virale et des cagnottes de compétition hebdomadaires autofinancées.

---

## ⚡ Fonctionnalités Clés du MVP

*   **🎮 Moteur de Quiz Dynamique :** Sessions de questions thématiques rapides avec animations et feedbacks sonores optimisés pour mobile.
*   **🪙 Économie de Jetons (Tokenisation) :** Gestion de 3 types de jetons consommables (*Elikya*, *Elonga*, *Motuya*) achetés par Mobile Money pour recharger les parties.
*   **🔗 Boucle Virale de Parrainage (Niveau 1) :** Génération de liens uniques (`?ref=`) et QR Codes permettant aux utilisateurs de gagner des bonus de parties en recrutant de nouveaux joueurs.
*   **📊 Supervision des Ventes (Admin) :** Tableau de bord pour la validation manuelle instantanée des transactions Mobile Money des élèves.
*   **🔥 Système de Teaser & Progression Collective :** Barre d'objectif communautaire bloquant les cagnottes jusqu'à l'atteinte du seuil critique de 30 équipes créées à Kinshasa.

---

## 🛠️ Stack Technique

*   **Frontend & Layout :** Next.js / React (Approche minimaliste avec *Controlled Components* via `useState`)
*   **Design & UI :** Tailwind CSS & Template TailAdmin (Épuré pour le réseau mobile kinois)
*   **Base de données & Logique :** Architecture optimisée pour la décrémentation rapide des jetons et la liaison des parrainages.
*   **Déploiement :** Vercel

---

## 📂 Contenu Pédagogique (Catégories OBED)

Les questions de la plateforme sont réparties sur les thématiques officielles des compétitions de vacances :
*   Sciences et Techniques
*   Amour du Pays (RDC)
*   Histoire du Monde
*   Littérature et Art
*   Sports et Jeux
*   Musique & Cinéma

---

## ⚙️ Installation et Démarrage

### Installer les dépendances
```bash
npm install