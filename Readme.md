# Digital Void

Digital Void es un juego web desarrollado con Vue 3 y Vite, y usa Pinia para el manejo de estado.

## Tecnologías principales

- **Frontend:** Vue 3
- **Estado:** Pinia
- **Bundler/Dev Server:** Vite
- **Gestor de paquetes:** pnpm (lockfile: `pnpm-lock.yaml`)

## Requisitos

- Node.js 20.x+ (se recomienda 20.19.0)

## Ejecutar la aplicación localmente

1. Clona el repositorio:

```bash
git clone <repo-url>
cd digitalvoid
```

2. Instalar `pnpm` si no está activo:

```bash
npm install pnpm
```

3. Instala dependencias y ejecuta en modo desarrollo:

```bash
pnpm install
pnpm run dev
```

4. Abre `http://localhost:5173` (o la URL que muestre Vite) en tu navegador.

## Construir para producción

```bash
pnpm build
pnpm run preview
```

`pnpm run preview` sirve el contenido de `dist` localmente para pruebas.

## Ejecutar con Docker

1. Construir la imagen:

Para construir la imagen de Docker, asegúrate de tener abierto docker y debes estar en la raíz del proyecto (donde se encuentra el `Dockerfile`) en este caso es en solemne2, luego ejecuta:

```bash
docker build -t TU-USUARIO/digitalvoid:1.0 .
```

2. Ejecutar el contenedor (puerto 10081):

```bash
docker run --rm -p 10081:10081 TU-USUARIO/digitalvoid:1.0
```

Se abrirá la aplicación en `http://localhost:10081`.

3. Uso con Docker Compose:

```bash
docker compose up --build
```

Se abrirá la aplicación en `http://localhost:10081`.

## Imagen en DockerHub

https://hub.docker.com/r/mrireal/digitalvoid
