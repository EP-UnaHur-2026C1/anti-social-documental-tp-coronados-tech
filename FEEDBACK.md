# Feedback del Trabajo Práctico (TP2 — MongoDB)

## Integrantes

A partir de los commits del repositorio:

- **Carla Perez** (`Loncha`)
- **Celeste Fernández** (`celesteFernandez`)
- **Rafael Barberi** (`RafaelBarberiS`)

> Trabajo repartido entre los tres integrantes. 👏

---

## Resumen General

¡Excelente trabajo! 🎉 Es una de las entregas más completas y profesionales del conjunto. Cumple el MVP con una arquitectura en capas muy clara (`routes → middlewares → controllers → services → models`), **controladores finos** que delegan en servicios (justo la “única responsabilidad” que pide el enunciado), modelado documental **referenciado** coherente, y la **regla de los comentarios antiguos aplicada y configurable**. Además resolvieron **tres bonus** —caché con Redis (con *fallback* en memoria), seguidores y upload de imágenes— y sumaron i18n, manejo de errores centralizado y validación de `ObjectId`/existencia/unicidad en middlewares.

### Estado por criterio

| Criterio        | Estado | Comentario breve |
|-----------------|:------:|------------------|
| Arquitectura    |   ✅   | Capas + servicios; controladores de única responsabilidad. |
| Modelado        |   ✅   | Referenciado coherente; `nickname` y `email` únicos. |
| Validaciones    |   ✅   | Joi + `ObjectId` + unicidad, todo en middlewares. |
| Middlewares     |   ✅   | Genéricos parametrizables (objectId, exist, unique, schema). |
| API REST        |   ✅   | CRUD + relaciones (imágenes, tags, follow) completos. |
| Configuración   |   ✅   | `MONGO_URL`, `PORT`, `MESES` por `.env`; sin números mágicos. |
| Documentación   |   ✅   | Swagger, `docker-compose`, locales. |

---

## Fortalezas

### 1. Controladores de única responsabilidad + capa de servicios 🏗️
**Ubicación:** `src/controllers/post.controller.js`, `src/services/post.service.js`

Los controladores son delgados y delegan toda la lógica en los servicios; las comprobaciones (formato de `ObjectId`, existencia, unicidad) viven en middlewares. Es exactamente lo que pide el enunciado para esta entrega, y está muy bien logrado. 👌

### 2. Regla de comentarios antiguos aplicada y configurable ⏳
**Ubicación:** `src/middlewares/filterPostComments.middleware.js`, `src/helpers/filterCommentsByMonths.js`

El filtro se aplica al visualizar los posts y el umbral sale del entorno (`MESES`), con la posibilidad extra de sobrescribirlo por query (`?meses=`). Cumple las dos condiciones del requisito: se aplica en la lectura y es configurable. 🎯

### 3. Validación de `ObjectId`, existencia y unicidad en middlewares ♻️
**Ubicación:** `src/middlewares/validations/`

`objectIdParamValidateMiddleware`, `existValidateMiddleware(Modelo, campo)` y `uniqueValidateMiddleware` son genéricos y se componen de forma declarativa en las rutas (`post.routes.js`, `user.routes.js`). Excelente reutilización.

### 4. Tres bonus, todos cableados 🌟
**Ubicación:** `src/cache/`, `src/services/follower.service.js`, `src/middlewares/upload.middleware.js`

- **Caché**: `RedisCacheStore` con `NoOpCacheStore` de respaldo (la app funciona aunque no haya Redis) e invalidación por **eventos** (`events/` + `listeners/`).
- **Seguidores**: `User.following` por referencias, con guardas `alreadyFollowing` / `notFollowing`.
- **Upload**: `multer` (`uploadSingleImage` + `requireImage`), sirviendo `/uploads` como estático.

### 5. Modelado referenciado coherente y prolijo 🗃️
**Ubicación:** `src/models/`

Entidades separadas con referencias (`user_id`, `post_id`, `tags`), `nickname` y `email` únicos (con `syncIndexes()` al conectar), y `toJSON` que oculta el `password`. Validación con **Joi** (lo recomendado) más las restricciones del schema de Mongoose.

---

## Observaciones

### 1. El filtro de comentarios sobrescribe `res.json`

**Estado:** ⚠️  **Severidad:** 🟡 Mejora recomendada
**Ubicación:** `src/middlewares/filterPostComments.middleware.js`

**Descripción:**
El filtrado por antigüedad se implementa reemplazando `res.json` dentro de un middleware. Funciona muy bien (incluso respeta el override `?meses=` por request y no “ensucia” la caché, porque filtra después de leerla), pero es un patrón algo indirecto.

**Impacto:**
No es un error; es una cuestión de legibilidad: a quien lea el código puede sorprenderle que `res.json` esté “envuelto”.

**Recomendación:**
Una alternativa es exponer el filtro como una función explícita que el controlador/servicio aplique al serializar los comentarios. Si mantienen el middleware, un breve comentario explicando *por qué* se intercepta `res.json` ayuda a futuros lectores.

---

### A futuro (fuera del alcance de la materia)

Solo informativo: el `password` se guarda en texto plano (un detalle muy bueno: ya lo ocultan en `toJSON`, así que no se expone en las respuestas). Más adelante, con temas de seguridad, se suele almacenar un *hash*.

---

## Conclusión

Es una entrega sobresaliente: arquitectura en capas con controladores de única responsabilidad, modelado documental coherente, la regla de negocio resuelta y configurable, y tres bonus muy bien integrados (con caché tolerante a fallos e invalidación por eventos). Se nota muchísimo oficio y cuidado. 🌟

Prácticamente no hay nada de fondo para corregir. ¡Felicitaciones por el nivel del trabajo! 🚀
