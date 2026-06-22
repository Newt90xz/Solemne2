# IDEA DEL JUEGO

## Titulo

Digital Void

## Descripción del juego

Juego 2D estilo top-down shooter roguelike, inspirado en
Alien Shooter,
Vampire Survivors y
Picayune Dreams.

El jugador controla un pequeño bicho malware que se inyectó dentro del sistema de archivos de una computadora local, con el objetivo de robar información de la computadora (edificios), corromperla y sobrevivir ante protocolos de cuarentena que intenten neutralizarla para poder seguir infectando otras computadoras.
Al matar enemigos el malware se vuelve más fuerte, hasta desbloquear nuevos métodos de ataque de malware como armas.

### Mecanicas

1.- Captura de edificios / zonas que dan potenciadores.  
2.- Subir de nivel da un arma nueva o mejora una actual.  
3.- Una barra extra se rellena. Al completarse un jefe aparece.  
4.- Jefe inmortal aparece al azar y te persigue por el mapa. La única opción es escapar de él.

### Reglas

- Movimiento WASD
- Disparo automatico dirigido por cursor.
- Municion infinita.
- Enemigos derrotados dan experiencia para subir de nivel.

### Flujo de juego (Game Loop)

1) Pantalla de inicio.  
2) Aparece en el mapa y instrucciones aparecen en la pantalla.
3) El jugador inicia la partida con un personaje con su arma predeterminada y sin mejoras.
4) Enemigos comienzan a aparecer en oleadas, cada vez más difíciles.  
5) El jugador se mueve y ataca.  
6) Al derrotar enemigos, el jugador gana experiencia y una barra de progreso se llena.  
7) Al subir de nivel, el jugador puede elegir entre varias mejoras para su arma.  
8) El jugador puede explorar el mapa para encontrar edificios que puede capturar para obtener potenciadores.  
9) Al llenar una barra secundaria, un jefe aparece en el mapa.  
10) El jugador debe derrotar al jefe para avanzar a la siguiente etapa, donde las oleadas de enemigos seran mas dificiles y el mapa se corrompe aun mas.  
11) Al llegar al tercer jefe, que es inmortal, ya habrás corrompido todo y tendrás que encontrar un "puerto de escape" o una "red adyacente" donde tu malware escapara para poder corromper otra computadora.  
12) Al escapar, pierdes toda tu experiencia y armas, que se traduce en puntos de mejora que puedes gastar para mejorar tus capacidades iniciales.  
13) Al estar listo, el jugador es mostrado una pantalla para el siguiente escenario, donde puede decidir si jugar con otra persona que ya esta infectando una computadora o ir a una sin tocar, al decidi presiona "siguiente inyección" y empieza de 0 con las nuevas mejoras.  
14) El juego continúa hasta que el jugador muere, se pierde todo, y se muestra la pantalla de fin de juego con la puntuacion obtenida. Esta puntuación, más la cantidad de computadoras corrompidas y oleadas derrotadas, serán guardadas en un leaderboard con el nombre de usuario.

## Comportamiento de enemigos

1) Spawn en oleadas, cada vez más difíciles.
2) Diferentes tipos de enemigos con habilidades únicas (ejemplo: enemigos que disparan a distancia, enemigos que explotan al morir, enemigos que se mueven rápidamente, etc.).
3) Jefes al final de cada etapa, con patrones de ataque únicos y mayor dificultad.
4) IA simple: siguen al jugador

## Especificaciones técnicas

Framework elegido: Vue + Vite para el desarrollo del juego.

Renderizado del juego utilizando HTML5 Canvas para gráficos 2D, flexibilidad en el diseño visual.

### Estructura de carpetas

```
src/  
│  
├── App.vue  
├── main.ts  
│  
├── components/  
│   ├── scenario.vue  
│   ├── GameScene.vue  
│   ├── Instrucciones.vue  
│   ├── mainmenu.vue  
│   ├── PlayerHub.vue  
│   ├── Bosses.vue  
│   ├── Configuración.vue  
│  
├── game/  
│   ├── enemies.ts  
│
├── assets/  
│   ├── sprites/  
│   ├── audio/  
│  
└── stores/  
    ├── game.ts  
    ├── counter.ts  
```

### Dependencias principales

- vue
- vite
- pnpm
- pinia (estado global)
- howler.js (audio)

### Descripción de armas

- Memoria corrupta (Arma por defecto)
- Ransomware (Arma penetrante)
- Gusano/Worm (Disparo disperso/Escopeta)
- Tormenta de Popups (Arma que orbita alrededor del mouse)
- Virus Troyano (Disparo explosivo)


## Fase 2

### Mejoras y correcciones

Principalmente, las mejoras que se quieren implementar son correcciones visuales y la experiencia de first-time players (explicación de controles y otras mecánicas).

- Indicador visual del daño causado a enemigos (número flotante sobre el enemigo al recibir daño).
- Indicador visual del daño recibido por el jugador (flash de personaje).
- Pantalla de tutorial o instrucciones al iniciar la primera partida.

### Nuevas mecánicas o pantallas de juego

- Fases visuales del mapa: el escenario cambia progresivamente (más corrupto) conforme se derroten cierta cantidad de enemigos.
- Fase intermedia/descanso: Al completar un loop, el jugador es transportado a otro escenario y destripado de sus mejoras. Dentro de esta pantalla antes de seguir al siguiente loop, el jugador gasta puntos para potenciar las capacidades basicas del malware que controla.

## Arquitectura fullstack

### Descripción

La siguiente fase del diseño es la implementación del backend. Su uso está orientado a:

- Registro y autenticación de usuarios.
- Persistencia del puntaje máximo y loops (computadoras infectadas).
- Leaderboard global consultable por cualquier usuario.
- Preferencias de configuración por usuario.
- Gestión de usuarios por parte del administrador.

### Autenticación y autorización

El sistema diferencia dos tipos de usuarios: `user` y `admin`, definidos por el campo `role` en MongoDB.

#### Registro

Al registrarse, el frontend envía `username` y `password`. El backend hashea la contraseña con bcrypt y crea el usuario en MongoDB con `role: "user"`, `maxscore: 0` y `loops: 0`. El rol nunca viene del frontend.

```
POST /api/register { username, password }
  → Hashea password con bcrypt
    → Crea usuario con role: "user", maxscore: 0, loops: 0
    → Responde { ok: true }
```

#### Login de Usuario

Al hacer login, el backend genera un JWT y lo almacena en una **cookie `httpOnly`**. El browser la envía automáticamente en cada request. 
El usuario nunca manipula el token directamente.

```
POST /api/login { username, password }
  → Backend verifica credenciales
    → Detecta role: "user"
      → Setea cookie httpOnly con el JWT
        → Responde { ok: true }
```

#### Login de Admin

Al hacer login con una cuenta de rol `admin`, el backend también responde con el JWT en el **body de la respuesta**, además de la cookie. El admin usa ese token manualmente en herramientas como Postman o Thunder Client mediante el header `Authorization: Bearer <token>`.

```
POST /api/login { username, password }
  → Backend verifica credenciales
    → Detecta role: "admin"
      → Setea cookie httpOnly con el JWT
        → Responde { ok: true, token: "xxxx" }
```

#### Middleware de autorización

Un único middleware `auth` maneja ambos roles. Recibe un parámetro opcional `requiredRole` (por defecto `'user'`).
 
```js
const auth = (requiredRole = 'user') => {
  return (req, res, next) => {
 
    // Lee el token desde la cookie (usuario) o desde el header (admin)
    const token = req.cookies.session
      || req.headers.authorization?.split(' ')[1]
 
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' })
    }
 
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
 
      // Si la ruta requiere admin, verifica el rol
      if (requiredRole === 'admin' && decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' })
      }
 
      req.user = decoded  // datos del usuario disponibles en el endpoint en json
      next() //continuar
    } catch {
      return res.status(401).json({ error: 'Token inválido' })
    }
  }
}
```

Uso en rutas:

```
auth()          → cualquier usuario logueado (user o admin)
auth('admin')   → solo admin
```

## Estructura

### Frontend
```
Stack: Vue.js + Pinia (estado global). 
Comunicación con el backend vía axios sobre HTTPS. 
Gestión de cookies delegada al browser (httpOnly, automática en cada request)
```
---

### Backend

```
- Framework: "Node.js con Express.js"
- Lenguaje: "JavaScript"
- Entry point: `app.js` — inicializa conexión a MongoDB y levanta el servidor HTTP. Utiliza la biblioteca de mongoose.
- Puerto del backend: "6139"
- Ruta base: "/api/"
```

---

### MongoDB

Base de datos: `digitalvoiddb`.

#### Schema del usuario:


| Campo           | Tipo    | Requerido | Valor por defecto |
|-----------------|---------|-----------|-------------------|
| username        | String  | Sí        | —                 |
| password        | String  | Sí        | —                 |
| role            | String  | Sí        | `"user"`          |
| maxscore        | Integer | No        | `0`               |
| loops           | Integer | No        | `0`               |
| keybind-up      | String  | No        | `"w"`             |
| keybind-down    | String  | No        | `"s"`             |
| keybind-left    | String  | No        | `"a"`             |
| keybind-right   | String  | No        | `"d"`             |
| keybind-dash    | String  | No        | `"shift"`         |
| keybind-shoot   | String  | No        | `"mouse1"`        |
| keybind-weaponnext | String | No     | `"e"`             |
| keybind-weaponback | String | No     | `"q"`             |

### Endpoints
---
#### Públicos (sin autenticación)

| Método | Ruta               | Descripción                                      |
|--------|--------------------|--------------------------------------------------|
| POST   | `/api/register`    | Crea un nuevo usuario con maxscore y loops en 0  |
| POST   | `/api/login`       | Autentica al usuario, setea cookie (o token si es admin) |
| GET    | `/api/leaderboard` | Retorna el ranking global de todos los usuarios  |

#### Usuario autenticado (requiere cookie)

| Método | Ruta             | Descripción                                                  |
|--------|------------------|--------------------------------------------------------------|
| GET    | `/api/profile`   | Retorna los datos del usuario logueado (score, loops, keybinds) |
| PUT    | `/api/game/end`  | Actualiza maxscore y loops si el nuevo score supera el anterior |
| PUT    | `/api/settings`  | Actualiza las preferencias de keybinds del usuario           |
| POST   | `/api/logout`    | Elimina la cookie de sesión                                  |

#### Admin (requiere Bearer token)

| Método | Ruta                  | Descripción                              |
|--------|-----------------------|------------------------------------------|
| GET    | `/api/admin/users`    | Lista todos los usuarios registrados     |
| DELETE | `/api/admin/users/:id`| Elimina un usuario por ID                |

### WebSockets

---

Planeamos utilizar Websockets para establecer una conexión estable entre el cliente y servidor para futura implementacion de lobbies y cooperativo en tiempo real.

### Servicio Rest Externo

---

Random User Generator API: Genera un json de un usuario aleatorio, devolviendo nombre, genero, edad, etc.  
Esta api sera utilizada para dar un nombre de usuario a las computadoras/lobbies que estemos infectando.

```
curl https://randomuser.me//api
```

Devuelve:

```
{
  "results": [
    {
      "gender": "female",
      "name": {
        "title": "Ms",
        "first": "Addison",
        "last": "Johnson"
      },
      "location": {
        "street": {
          "number": 3790,
          "name": "George St"
        },
        "city": "Georgetown",
        "state": "Saskatchewan",
        "country": "Canada",
        "postcode": "P0V 2J9",
        }...
    }]
}
```

### Lógica de actualización de score
---  

El usuario nunca envía su score directamente al endpoint de registro. El flujo es:

1. Al registrarse (`POST /api/register`), se crea el usuario con nombre, contraseña, el resto de los campos vacios.
2. Al terminar una partida, el frontend llama a `PUT /api/game/end` actualizando el puntaje obtenido y los loops realizados.
3. El backend compara el puntaje recibido con el `maxscore` almacenado:
   - Si el nuevo puntaje es mayor → actualiza `maxscore` y `loops`.
   - Si es menor o igual → no modifica nada.

### Dependencias definidas en la fase 2

---

#### Dependencia de Frontend

- axios
- socket.io-client

#### Dependencias de Backend

- express.js
- mongoose
- bcrypt
- jsonwebtoken
- cookie-parser
- axios
- cors
- dotenv
- socket.io
- cookie (parseo de cookies en el handshake del socket)