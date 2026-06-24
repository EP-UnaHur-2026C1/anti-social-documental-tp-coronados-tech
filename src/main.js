const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const i18n = require("i18n");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const errorMiddleware = require("./middlewares/error.middleware");
const commentRoutes = require("./routes/comment.routes");
const postImageRoutes = require("./routes/postImage.routes");

const PORT = process.env.PORT || 3001;
const locale = process.env.IDIOMA === "es" ? process.env.IDIOMA : "es";

i18n.configure({
    locales: ["es"],
    directory: path.join(__dirname, "locales"),
    defaultLocale: locale,
    autoReload: true,
    updateFiles: false,
});

const usersRouter = require("./routes/user.routes");
const postsRouter = require("./routes/post.routes");
const tagsRouter = require("./routes/tag.routes");

const app = express();

const enableSwagger = process.env.NODE_ENV !== "production" || process.env.ENABLE_SWAGGER === "true";

app.use(i18n.init);
app.use(express.json());

if (enableSwagger) {
    const swaggerPath = path.join(__dirname, "../docs/swagger.yaml");
    if (fs.existsSync(swaggerPath)) {
        const swaggerUi = require("swagger-ui-express");
        const YAML = require("yamljs");
        const swaggerDocument = YAML.load(swaggerPath);
        app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    } else {
        console.warn("Swagger no disponible: falta docs/swagger.yaml");
    }
}

app.use("/users", usersRouter);
app.use("/posts", postsRouter); 
app.use("/tags", tagsRouter);
app.use("/api/comments", commentRoutes);
app.use("/api/post-images", postImageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(errorMiddleware);

connectDB()
    .then(() => connectRedis())
    .then(() => {
        app.listen(PORT, () => {
            console.log(`App iniciada en el puerto ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("No se pudo iniciar la aplicación:", err.message);
        process.exit(1);
    });