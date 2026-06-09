# El Escape de la Serpiente Macanche

Trabajo universitario para el curso de Programación Multimedia de la Universidad Nacional de Piura, junio 2026.

El juego está basado en la serpiente Macanche, un reptil típico del desierto piurano. El jugador controla a la serpiente usando las flechas del teclado y tiene que comer los frutos de zapote que aparecen en el canvas para ganar puntos. Si la serpiente choca con una pared, con un arbusto o con su propio cuerpo, el juego termina. Tiene dos niveles: en el primero hay 8 arbustos y hay que llegar a 100 puntos para avanzar, y en el segundo aparecen 14 grietas en el terreno con mayor velocidad y hay que llegar a 200 puntos para ganar. Al completar el juego, el nombre del jugador, su puntaje y el tiempo que tardó se guardan automáticamente en una base de datos MySQL.

El frontend está publicado en GitHub Pages y el backend con PHP y MySQL está alojado en InfinityFree.

Demo: https://isaacnavarrete900-commits.github.io/nombre-de-tu-repo/

## Tecnologías usadas

- HTML5, CSS3 y JavaScript con Canvas API
- PHP con PDO para el backend
- MySQL para guardar los récords
- GitHub Pages para el hosting del frontend
- InfinityFree para el hosting del backend

## Cómo se juega

Abre el juego, escribe tu nombre y haz clic en Jugar. Usa las flechas del teclado para mover la serpiente. Come los frutos rojos para ganar puntos y evita chocar con cualquier obstáculo. Si llegas a 100 puntos pasas al Nivel 2 y si llegas a 200 puntos la Macanche escapa y ganas.

## Estructura del proyecto

    index.html
    style.css
    game.js
    backend/
        db.php
        guardar_record.php

## Autor

Isaac Navarrete - Universidad Nacional de Piura, 2026