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
cd <repo-folder>/digitalvoid
```

2. Habilita Corepack y activa `pnpm` (si no está activo):

```bash
corepack enable
corepack prepare pnpm@latest --activate
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

```bash
docker build -t solemne2 .
```

2. Ejecutar el contenedor (puerto 80):

```bash
docker run --rm -p 80:80 solemne2
```

3. Uso con Docker Compose:

```bash
docker compose up --build
```

## Imagen en DockerHub

La imagen se publica en Docker Hub en (reemplaza `<usuario>` por tu usuario de Docker Hub):

https://hub.docker.com/r/<usuario>/digitalvoid

Ejemplo de etiqueta utilizada en CI/CD:

```
<usuario>/digitalvoid:latest
```

## Notas y buenas prácticas

- Este proyecto usa `pnpm` y el lockfile `pnpm-lock.yaml` para instalaciones reproducibles.
- Si usas `act` para testear GitHub Actions localmente, ejecuta `docker login` antes si se requieren pulls autenticados.

Si quieres, puedo actualizar la URL de Docker Hub con tu nombre de usuario y agregar instrucciones para publicar la imagen automáticamente desde GitHub Actions.
