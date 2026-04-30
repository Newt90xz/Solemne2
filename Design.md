IDEA DEL JUEGO

Descripción del juego

Juego 2D estilo top-down shooter roguelike, inspirado en
Alien Shooter,
Vampire Survivors y
Picayune Dreams.

El jugador controla un personaje que debe sobrevivir a oleadas de enemigos en un mapa abierto, mejorando sus armas a medida que avanza. Mientras mas explores, edificios empezar a aparecer, los cuales puedes capturar para obtener un potenciador. (Dash, Double weapons, Friend npc, Mayores drops)
Los enemigos botan xp o recursos miscelaneos. (Granadas, Botiquin) 


Flujo de juego (Game Loop)

1.- Pantalla de inicio.
2.- El jugador inicia la partida con un personaje con su arma predeterminada y sin mejoras.
3.- Aparece en el mapa.  
4.- Enemigos comienzan a aparecer en oleadas, cada vez más difíciles.
5.- El jugador se mueve y ataca.
6.- Al derrotar enemigos, el jugador gana experiencia y una barra de progreso se llena.
7.- Al subir de nivel, el jugador puede elegir entre varias mejoras para su arma o habilidades.
8.- El jugador puede explorar el mapa para encontrar edificios que puede capturar para obtener potenciadores.
9.- Al llenar una barra secundaria, un jefe aparece en el mapa.
10.- El jugador debe derrotar al jefe para avanzar a la siguiente etapa, donde las oleadas de enemigos serán más difíciles.
11.- El juego continúa hasta que el jugador muere, momento en el cual se muestra la pantalla de fin de juego con la puntuación obtenida.



Mecánicas principales :

1.- Municion Infinita.
2.- Captura de edificios.
3.- Parry, patada.

Movimiento

1.- Movimiento básico con WASD.
2.- camara centrada en el jugador.


Combate

1.- Daño por contacto con enemigos o proyectiles.
2.


Enemigos

1.- Spawn en oleadas, cada vez más difíciles.
2.- Diferentes tipos de enemigos con habilidades únicas (ejemplo: enemigos que disparan a distancia, enemigos que explotan al morir, enemigos que se mueven rápidamente, etc.).
3.- Jefes al final de cada etapa, con patrones de ataque únicos y mayor dificultad.
4.- IA simple: siguen al jugador

Progresion

1.- Sistema de experiencia y niveles: el jugador gana experiencia al derrotar enemigos, lo que le permite subir de nivel y elegir mejoras para su personaje.

Sistema de edificios:

1.- Edificios aparecen en el mapa a medida que el jugador explora.

2.- El jugador puede capturar un edificio al interactuar con él, lo que le otorga un potenciador permanente.


Especificaciones técnicas

Framework elegido: Vue + vite para el desarrollo del juego, debido a su facilidad de uso, rendimiento y comunidad activa.

Renderizado del juego utilizando HTML5 Canvas para gráficos 2D, lo que permite un buen rendimiento y flexibilidad en el diseño visual.


Estructura de carpetas:

src/
│
├── GameCanvas.vue
│
├── components/
│   ├── UI/
│
├── game/
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Enemy.js
│   │   ├── Bullet.js
│   │
│   ├── systems/
│   │   ├── SpawnSystem.js
│   │   ├── CollisionSystem.js
│   │
│   ├── core/
│   │   ├── GameLoop.js
│   │   ├── Renderer.js
│
├── assets/
│   ├── sprites/
│   ├── audio/
│
├── stores/
│   ├── gameStore.js
│
├── utils/
│
└── main.js


Dependencias principales
- vue
- vite
- pnpm 

Opcionales:

- pinia (estado global)
- howler.js (audio)