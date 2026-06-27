# UnaHur Anti-Social Net — Coronados Tech

Backend REST para **UnaHur Anti-Social Net**, una red social donde los usuarios publican posts, comentan, etiquetan contenido y siguen a otros usuarios. Trabajo Práctico de la materia **Estrategias de Persistencia** (2026, C1).

## Descripción

API desarrollada con **Node.js** y **Express**, persistiendo datos en **MongoDB** (modelo documental con relaciones referenciadas) y utilizando **Redis** como capa de caché para las consultas de publicaciones. El proyecto incluye validaciones con **Joi**, mensajes internacionalizados en español, carga de imágenes en el servidor y orquestación completa con **Docker Compose**.

## Funcionalidades implementadas

### Requerimientos del MVP

- **Usuarios**: registro, consulta, actualización y eliminación. `nickname` y `email` únicos.
- **Posts**: publicaciones con descripción obligatoria, asociadas a un usuario y con soporte para múltiples etiquetas.
- **Imágenes de post**: carga, actualización (incluyendo mover entre posts) y eliminación. Archivos almacenados en `uploads/` y servidos en `/uploads`.
- **Comentarios**: CRUD completo sobre publicaciones.
- **Tags**: CRUD con nombres normalizados (minúsculas). Asociación a posts al crear o desde el body del post.
- **Filtrado de comentarios antiguos**: en las rutas de lectura de posts, los comentarios con más de `X` meses no se devuelven. Configurable con `MESES` (por defecto 6) o el query param `?meses=N`.

### Bonus

- **Upload de imágenes** con Multer (jpg, jpeg, png, webp — máx. 5 MB).
- **Sistema de seguidores**: cada usuario mantiene un array `following` con referencias a otros usuarios. Endpoints para seguir, dejar de seguir y listar seguidores/seguidos.
- **Caché de posts con Redis**: las lecturas de posts se cachean y se mantienen sincronizadas mediante un sistema de eventos (`EventEmitter`) que actualiza o invalida la caché ante cambios en comentarios, imágenes, tags o el propio post.

## Stack tecnológico

| Tecnología     | Uso                                         |
| -------------- | ------------------------------------------- |
| Node.js 20     | Runtime                                     |
| Express 5      | Framework HTTP                              |
| Mongoose 9     | ODM para MongoDB                            |
| Redis 7        | Caché de publicaciones                      |
| Joi            | Validación de request bodies y query params |
| Multer         | Upload de archivos                          |
| i18n           | Mensajes de error y respuesta en español    |
| Docker Compose | MongoDB, Redis, API y Mongo Express         |
| Swagger UI     | Documentación interactiva de la API         |

## Modelo de datos

Se optó por **relaciones referenciadas** entre colecciones independientes:

```
User ──< Post ──< Comment
  │       │
  │       ├──< PostImage
  │       └──> Tag (array de refs en Post)
  └──> User (following[])
```

| Colección    | Campos principales                                                                        |
| ------------ | ----------------------------------------------------------------------------------------- |
| `users`      | nickname (único), name, lastName, email (único), password, birthDate, gender, following[] |
| `posts`      | description, user_id, tags[]                                                              |
| `comments`   | content, user_id, post_id                                                                 |
| `postimages` | filename, path, post_id                                                                   |
| `tags`       | name (único, lowercase)                                                                   |

Todos los modelos incluyen `createdAt` / `updatedAt` y serializan `_id` como `id` en las respuestas JSON.

## Arquitectura

```
src/
├── main.js                  # Punto de entrada
├── config/                  # DB, Redis, caché, i18n
├── models/                  # Schemas de Mongoose
├── schemas/                 # Validaciones Joi
├── routes/                  # Definición de endpoints
├── controllers/             # Capa HTTP (una responsabilidad por handler)
├── services/                # Lógica de negocio
├── middlewares/             # Validaciones, upload, filtro de comentarios, errores
├── events/                  # EventEmitter para sincronización de caché
├── listeners/               # Listeners que actualizan Redis ante eventos
├── cache/                   # RedisCacheStore / NoOpCacheStore
├── helpers/                 # Utilidades compartidas
└── locales/                 # Traducciones (es)
```

**Flujo de caché (lectura):** al consultar posts (`GET /posts`, `GET /posts/:id`), el servicio busca primero en Redis. Si no hay hit, lee de MongoDB, enriquece el documento (usuario, tags, imágenes, comentarios) y lo guarda en caché con un TTL configurable.

### Sincronización de caché por eventos

Para mantener Redis coherente sin invalidar toda la caché en cada escritura, se implementó un patrón **Observer / Pub-Sub** con el `EventEmitter` nativo de Node.js:

- **Emisores:** los servicios de negocio (`post`, `comment`, `postImage`, `tag`) persisten en MongoDB y emiten un evento al terminar (`COMMENT_CREATED`, `POST_IMAGE_REMOVED`, `TAG_ADDED_TO_POST`, etc.).
- **Listener:** `postCache.listener.js` escucha esos eventos y delega en `postCache.service.js` la actualización puntual de las entradas afectadas (post individual y listas `posts:all` / `posts:user:{id}`).
- **Ventaja:** los `GET /posts` siguen respondiendo desde caché aunque haya comentarios, imágenes o tags nuevos, sin reconsultar MongoDB en cada lectura.

```mermaid
flowchart LR
    A[Servicio de negocio] -->|escribe| B[(MongoDB)]
    A -->|emitPostEvent| C[postEvents]
    C -->|notifica| D[postCache.listener]
    D -->|actualiza| E[(Redis)]
    F[GET /posts] -->|lee| E
    F -.->|miss| B
```

Eventos disponibles en `src/events/postEvents.js`:

| Evento                                                 | Disparado cuando                            |
| ------------------------------------------------------ | ------------------------------------------- |
| `COMMENT_CREATED` / `UPDATED` / `REMOVED`              | Se crea, edita o elimina un comentario      |
| `POST_IMAGE_CREATED` / `UPDATED` / `MOVED` / `REMOVED` | Se sube, modifica, mueve o borra una imagen |
| `TAG_ADDED_TO_POST`                                    | Se asocia un tag a un post                  |
| `POST_FIELDS_UPDATED`                                  | Cambian campos del post (descripción, tags) |
| `POST_ADDED_TO_LISTS`                                  | Se crea un post nuevo                       |
| `POST_REMOVED`                                         | Se elimina un post                          |

## Requisitos previos

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) y Docker Compose (recomendado)

## Instalación y ejecución

### Con Docker (recomendado)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar todos los servicios
npm run docker:up

# 3. Ver logs
npm run docker:logs
```

Servicios disponibles:

| Servicio      | URL                           |
| ------------- | ----------------------------- |
| API           | http://localhost:3001         |
| Swagger UI    | http://localhost:3001/swagger |
| Mongo Express | http://localhost:8081         |
| MongoDB       | localhost:27017               |
| Redis         | localhost:6379                |

Para detener los contenedores:

```bash
npm run docker:down
```

### Sin Docker (desarrollo local)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env (ver sección siguiente)
cp .env.example .env

# 3. Tener MongoDB y Redis corriendo localmente

# 4. Iniciar en modo desarrollo
npm run dev
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar según el entorno. A continuación, qué hace cada variable y dónde se usa.

### Servidor

| Variable   | Descripción                                                                                                                                  | Default |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `PORT`     | Puerto HTTP en el que escucha la API Express.                                                                                                | `3001`  |
| `NODE_ENV` | Entorno de ejecución. En `production`, Swagger queda deshabilitado salvo que `ENABLE_SWAGGER=true`. Docker Compose lo setea en `production`. | —       |

### Aplicación

| Variable         | Descripción                                                                                                                                                                                                                   | Default |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MESES`          | Cantidad de meses hacia atrás a partir de los cuales los comentarios **dejan de mostrarse** al leer posts (`GET /posts`, `GET /posts/:id`). Se puede sobreescribir por request con `?meses=N`. Si no se define, no se filtra. | `6`     |
| `IDIOMA`         | Locale de los mensajes de error y respuestas traducibles (i18n). Actualmente solo hay traducciones en `es`.                                                                                                                   | `es`    |
| `ENABLE_SWAGGER` | Si es `true`, expone la documentación interactiva en `/swagger` aunque `NODE_ENV` sea `production`. En desarrollo, Swagger se habilita siempre que exista `docs/swagger.yaml`.                                                | `true`  |

### Base de datos

| Variable              | Descripción                                                                                                                                                                             | Default                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `MONGO_URL`           | Connection string completo de MongoDB. Incluye usuario, contraseña, host, nombre de base (`antiSocial`) y `authSource`. La app lo usa en `src/config/db.js` para conectar con Mongoose. | `mongodb://admin:admin1234@localhost:27017/antiSocial?authSource=admin` |
| `MONGO_ROOT_USERNAME` | Usuario administrador de MongoDB. **Solo lo usa Docker Compose** al crear el contenedor de MongoDB y al configurar Mongo Express.                                                       | `admin`                                                                 |
| `MONGO_ROOT_PASSWORD` | Contraseña del usuario root de MongoDB. Misma lógica que la anterior; debe coincidir con las credenciales del `MONGO_URL`.                                                              | `admin1234`                                                             |

### Caché (Redis)

| Variable                  | Descripción                                                                                                                                                          | Default                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `REDIS_URL`               | URL de conexión a Redis (`redis://host:puerto`). Si la caché está habilitada, la app falla al iniciar si no puede conectar.                                          | `redis://localhost:6379` |
| `CACHE_POSTS_ENABLED`     | Activa o desactiva la caché de posts. Con `false`, no se conecta a Redis y se usa `NoOpCacheStore` (todas las lecturas van directo a MongoDB).                       | `true`                   |
| `CACHE_POSTS_TTL_SECONDS` | Tiempo de vida en segundos de cada entrada cacheada en Redis. Pasado ese tiempo, la clave expira y la próxima lectura vuelve a consultar MongoDB. Mínimo: 1 segundo. | `60`                     |

### Docker Compose (opcionales)

| Variable      | Descripción                                                                                                                                                                        | Default     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `ME_USERNAME` | Usuario para autenticación de Mongo Express (interfaz web en el puerto 8081). En el `docker-compose.yml` actual la autenticación está deshabilitada (`ME_CONFIG_BASICAUTH=false`). | `admin`     |
| `ME_PASSWORD` | Contraseña para Mongo Express. Misma consideración que `ME_USERNAME`.                                                                                                              | `admin1234` |

### Ejemplo mínimo para desarrollo local

```env
PORT=3001
MESES=6
IDIOMA=es
CACHE_POSTS_ENABLED=true
CACHE_POSTS_TTL_SECONDS=60
ENABLE_SWAGGER=true
MONGO_URL=mongodb://admin:admin1234@localhost:27017/antiSocial?authSource=admin
REDIS_URL=redis://localhost:6379
```

### Ejemplo con Docker

Al usar `npm run docker:up`, Docker Compose sobreescribe `MONGO_URL` y `REDIS_URL` para apuntar a los contenedores internos (`mongodb`, `redis`). Solo hace falta definir en `.env` las credenciales de MongoDB y las variables de la aplicación:

```env
PORT=3001
MESES=6
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin1234
```

## Endpoints

### Usuarios — `/users`

| Método   | Ruta                             | Descripción                                 |
| -------- | -------------------------------- | ------------------------------------------- |
| `GET`    | `/users`                         | Listar usuarios                             |
| `POST`   | `/users`                         | Crear usuario                               |
| `GET`    | `/users/:id`                     | Obtener usuario por ID                      |
| `PUT`    | `/users/:id`                     | Actualizar usuario                          |
| `DELETE` | `/users/:id`                     | Eliminar usuario                            |
| `GET`    | `/users/:id/followers`           | Listar seguidores                           |
| `GET`    | `/users/:id/following`           | Listar seguidos                             |
| `POST`   | `/users/:id/follow`              | Seguir a un usuario (`follower_id` en body) |
| `DELETE` | `/users/:id/follow/:follower_id` | Dejar de seguir                             |

### Posts — `/posts`

| Método   | Ruta                          | Descripción                                                             |
| -------- | ----------------------------- | ----------------------------------------------------------------------- |
| `GET`    | `/posts`                      | Listar posts (`?user_id=` opcional, `?meses=` para filtrar comentarios) |
| `POST`   | `/posts`                      | Crear post (`description`, `user_id`, `tags[]` opcional)                |
| `GET`    | `/posts/:id`                  | Obtener post por ID                                                     |
| `PATCH`  | `/posts/:id`                  | Actualizar post                                                         |
| `DELETE` | `/posts/:id`                  | Eliminar post (y sus comentarios e imágenes)                            |
| `GET`    | `/posts/:id/images`           | Listar imágenes del post                                                |
| `POST`   | `/posts/:id/images`           | Subir imagen (`multipart/form-data`, campo `image`)                     |
| `PATCH`  | `/posts/:id/images/:image_id` | Actualizar o mover imagen                                               |
| `DELETE` | `/posts/:id/images/:image_id` | Eliminar imagen                                                         |

### Tags — `/tags`

| Método   | Ruta        | Descripción                            |
| -------- | ----------- | -------------------------------------- |
| `GET`    | `/tags`     | Listar tags (`?post_id=` opcional)     |
| `POST`   | `/tags`     | Crear tag (`name`, `post_id` opcional) |
| `GET`    | `/tags/:id` | Obtener tag con sus posts              |
| `PATCH`  | `/tags/:id` | Actualizar tag                         |
| `DELETE` | `/tags/:id` | Eliminar tag                           |

### Comentarios — `/comments`

| Método   | Ruta            | Descripción                               |
| -------- | --------------- | ----------------------------------------- |
| `GET`    | `/comments`     | Listar comentarios (`?post_id=` opcional) |
| `POST`   | `/comments`     | Crear comentario                          |
| `GET`    | `/comments/:id` | Obtener comentario                        |
| `PATCH`  | `/comments/:id` | Actualizar comentario                     |
| `DELETE` | `/comments/:id` | Eliminar comentario                       |

### Archivos estáticos

| Ruta             | Descripción               |
| ---------------- | ------------------------- |
| `GET /uploads/*` | Acceso a imágenes subidas |

## Documentación Swagger

La API expone documentación interactiva en `/swagger` cuando existe el archivo `docs/swagger.yaml`. En entornos de desarrollo se habilita automáticamente; en producción se controla con `ENABLE_SWAGGER=true`.

### Archivos locales en `docs/`

| Archivo                                                | Descripción                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| `docs/Api-Antisocial.postman_collection.json`          | Colección con todos los endpoints del TP documental              |
| `docs/Anti-Social-Documental.postman_environment.json` | Environment de respaldo para uso local (`http://localhost:3001`) |

**Uso recomendado**

1. Importar la colección desde `docs/Api-Antisocial.postman_collection.json`.
2. Usar el environment de Postman Cloud (link arriba) o importar el JSON local.
3. Crear un usuario (`POST /users`) y copiar el `id` (ObjectId de 24 caracteres) a las variables `user_id`, `post_id`, etc.
4. Ejecutar el resto de requests en orden: posts → comentarios → tags → imágenes → followers.

> **Nota:** En MongoDB los IDs son ObjectIds (ej. `507f1f77bcf86cd799439011`), no números enteros como en el TP relacional.

## Scripts disponibles

| Script                | Descripción                     |
| --------------------- | ------------------------------- |
| `npm start`           | Inicia la API                   |
| `npm run dev`         | Inicia con nodemon (hot reload) |
| `npm run docker:up`   | Levanta Docker Compose          |
| `npm run docker:down` | Detiene contenedores            |
| `npm run docker:logs` | Logs de app, MongoDB y Redis    |

## Equipo

**Coronados Tech** — Universidad de Hurlingham (UnaHur), 2026.

| Integrante                        | DNI        |
| --------------------------------- | ---------- |
| Carla Andrea Pérez                | 34.259.069 |
| Malena Celeste Fernández Mansilla | 34.101.003 |
| Rafael Alberto Barberi Salcedo    | 95.151.120 |

## Licencia

MIT
