# Astra Foxglove Interface

## 🧾 Description

Cette interface graphique est basée sur la solution **Foxglove**, qui bien que non open-source, permet le développement de **plugins personnalisés** pour des cas d'usage spécifiques, sans restrictions.

Les layouts et panneaux développés dans ce projet ont été créés spécifiquement pour le projet [Astra](https://git.sitia.fr/Astra/astra)

---

## 🚧 Statut

Travail en cours — certains paramètres sont encore **codés en dur**.

---

## 🌳 Arborescence du projet

```bash
docs/
└── Documentation et images de tests

Layouts/
└── Layout spécifique au projet Astra ( Présentation de différents panneaux)

src/
├── Contient tout les pannaux crées pour Astra
│
├── barakuda_speed_panel/
│   └── récupère la vitesse depuis /hardware_interface/odom :
│
├── control_sensors/
│   └── Active ou deactive les differents capteurs via une service ( via des switch buttons) :
│       Service : /sensor/set_sensor_state
│       Request :
│           string sensor_name
│           bool state
│       Response :
│           bool success
│   └── l`etat de capteur est publié sur ( `/sensor/<capteur>/state` )
├── LisierePanel/
│   └── Affiche si une lisière est detecté ou pas.
│   └── Active la suivie lisière via un switch ( LEFT ou RIGHT ).
│       Service : /<SIDE>/edge_tracking/control
│       Request :
│           bool state
│       Response :
│           bool success
├── RobotPositionPlugin/
│   └── Conversion et Affichage depuis GPS vers UTM31U.
│   └── récupère la pos depuis /loc/gps_filtered :
│
├── sensors_status_barakuda/
│   └── Affichage en format LED l`etat de capteurs depuis.
│
│    - { topic: "/sensor/lidar_av/state", label: "LIDAR AV" },
│    - { topic: "/sensor/lidar_ar/state", label: "LIDAR AR" },
│    - { topic: "/sensor/lidar_left/state", label: "LIDAR G" },
│    - { topic: "/sensor/lidar_right/state", label: "LIDAR D" },
│    - { topic: "/sensor/lidar_middle/state", label: "LIDAR C" },
│    - { topic: "/sensor/camera_front/state", label: "CAM AV" },
│    - { topic: "/sensor/cam_ar_2/state", label: "CAM AR" },
│    - { topic: "/sensor/imu/state", label: "IMU" },
│    - { topic: "/sensor/gps/state", label: "GNSS" },
│    - { topic: "/sensor/rtk/state", label: "RTK" },
│    - { topic: "/sensor/nav/state", label: "NAV" },
│    - { topic: "/sensor/motor/state", label: "MOTOR" }

```

## ⚙️ Installation

1. Installation des panneaux personnalisés (sur le PC de contrôle)

a. Installer Node.js 16.04

```bash
cd scripts
./install-node-js.sh
```

b. Installer les dépendances globales de pannaux

```bash
cd scripts
./install-deps.sh
```

c. Builder les panneaux personnalisés

```bash
cd scripts
./build.sh
```

## 🚀 Lancement

### 📡 Sur le robot _Barakuda_

Lancer le backend ROS 2 :

```bash
ros2 launch astra_ihm_backend astra_ihm_backend.launch.py
```

ça lance foxglove_bridge et le backend de different services

### 🖥️ Sur le PC de contrôle

1. Lancer Foxglove Studio
2. En haut à droite, cliquer sur LAYOUT → Import from file
3. Sélectionner le fichier : ASTRA_GUI ( qui se retrouve dans dossier `Layouts`)

### 🖼️ Première vue

1. **Vue principale utilisée par le jury**, mais également utilisée pour commander le robot ( à l'instant ):  
   <img src="docs/AstraHome.png" alt="Vue principale AstraNav" style="width: 100%; max-width: 600px; height: auto;" />

2. **Vue de contrôle des capteurs séparés**, conçue pour ne pas encombrer l'interface principale :  
   <img src="docs/Ctrl.png" alt="Contrôle des capteurs" style="width: 100%; max-width: 600px; height: auto;" />

- Vert : aucune problème
- Rouge : Coupé ou infonctionnel
- orange : inconnu

## 📌 Remarques

- Tous les topics /sensor/`<capteur>`/state sont latched, donc leur dernière valeur est toujours disponible ( capteur allumé ou pas/infonctionnel (true ou false )).
- Ce projet est spécifique à l’environnement du robot Barakuda et au projet Astra.

## ✅ TODO

- [ ] Rajout de tous les capteurs utilisés (Lidar avant, arrière ? à confirmer)
- [ ] Rajout de panneaux pour la gestion de trajectoires et l’upload de scénarios
- [ ] Rajout de boutons **Safety First**
- [ ] Rajout d’un indicateur de **position du point de départ** (UTM31)
- [ ] Rajout d’un indicateur de **position objectif** (UTM31)
- [x] Rajout d’un indicateur de **position absolue du robot** (UTM31)
- [ ] Rajout de l’état des fonctions **rejeu** et **retour sur trace**
- [x] Rajout de Vitesse du Barakuda **bas-côté**
- [x] Projection des Global plan sur vue camera
- [x] Rajout de l’état du suivi **bas-côté**
- [x] Rajout Affichage Batterie **bas-côté**
- [x] Rajout de l’état du **mode de pilotage du robot**
