# Projet SPHIMX

## Description
Projet SPHIMX est une application web pour gérer les ventes de menus pour les membres et les non-membres. L'application permet d'ajouter, de supprimer des menus, de sauvegarder les données et de créer des sauvegardes.

## Installation
1. Clonez le dépôt :
    ```sh
    git clone <URL_DU_DEPOT>
    ```
2. Accédez au répertoire du projet :
    ```sh
    cd Projet SPHIMX
    ```
3. Installez les dépendances pour le backend :
    ```sh
    cd Backend
    npm install
    ```
4. Démarrez le serveur backend :
    ```sh
    npm start
    ```

## Utilisation
1. Ouvrez votre navigateur et accédez à `http://localhost:3000`.
2. Utilisez l'interface pour ajouter ou supprimer des menus, et pour gérer les ventes.
3. Cliquez sur "Activer/Desactiver Mode Editeur" pour afficher ou masquer le menu d'édition.
4. Utilisez les boutons "+" et "-" pour ajuster les quantités vendues.
5. Créez des sauvegardes en entrant un nom de sauvegarde et en cliquant sur "Create Backup".

## Fonctionnalités
- Ajouter des menus avec des prix pour les membres et les non-membres.
- Supprimer des menus.
- Sauvegarder les données sur le serveur.
- Charger les données sauvegardées.
- Créer des sauvegardes des données actuelles.

## Structure du projet
- `Frontend/` : Contient les fichiers HTML, CSS et JavaScript pour l'interface utilisateur.
- `Backend/` : Contient le serveur Node.js pour gérer les requêtes et les sauvegardes de données.
- `data.csv` : Fichier CSV pour stocker les données des menus.
- `backups/` : Répertoire pour stocker les sauvegardes.

## Auteurs
- Nathan

## Licence
Ce projet est sous licence MIT.
