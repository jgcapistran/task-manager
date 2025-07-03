
# TaskManager API by JGCapistran

Una API REST desarrollada con NestJS que nos permite:

- **Gestión de usuarios**  
  - Crear usuarios  
  - Listar y ver usuarios  
  - Filtrar y ordenar usuarios por cualquier campo parametrizado (nombre, apellido paterno, apellido materno, correo, rol o estatus)
  - Paginación en listado de usuarios

- **Gestión de tareas**  
  - Crear tareas  
  - Asignar una o varias tareas a usuarios existentes  
  - Actualizar campos de la tarea (detalle, fecha límite, costo, estado…)  
  - Reasignar tareas a otros usuarios  
  - Filtrar y ordenar tareas por parámetros diversos, incluyendo el usuario asignado (por ID, nombre o correo)
  - Paginación en listado de tareas

---

## Requisitos

- **Node.js** v22.16.0  
- **NestJS** (CLI instalado globalmente)  
- **PostgreSQL** (servidor en ejecución)

---

## Configuración

1. Clonar el repositorio:
   ```bash
   git clone <REPO_URL> taskmanager-api
   cd taskmanager-api
   ```

2. Crear (o completar) el archivo de entorno `.env` en la raíz:

   ```env
    PORT=3001
    DATABASE_TYPE=postgres
    DATABASE_HOST=
    DATABASE_PORT=5432
    DATABASE_USERNAME=
    DATABASE_PASSWORD=
    DATABASE_NAME=
   ```

3. Asegúrate de que la base de datos PostgreSQL exista y tus credenciales sean correctas.

---

## Instalación y ejecución

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Ejecutar migraciones y sincronizar entidades (automático al iniciar la app).

3. Iniciar el servidor:

   ```bash
   npm run start
   ```

   Por defecto arrancará en `http://localhost:3001`.

---

## Documentación API

Una vez en marcha, la documentación interactiva se encuentra disponible en:

```
http://<HOST_NAME>:<PORT>/api
```

Por defecto disponible en `http://localhost:3001/api`.


Allí podrás ver todos los endpoints, sus parámetros, respuestas de ejemplo y probarlos directamente desde el navegador.

---

¡Listo! Ahora tienes corriendo tu TaskManager API para gestionar usuarios y tareas de forma flexible y parametrizada.
