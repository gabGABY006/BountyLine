# BountyLine
Proyecto final de Bases de Datos 2 "Bounty Line"

---

## Arquitectura del Proyecto
Para mantener el código organizado, limpio y modular, este repositorio utiliza una estrategia de desarrollo basada en ramas independientes para cada capa de la aplicación:

### Rama Principal (`main`)
Es la rama de producción. Contiene el código estable y consolidado de la aplicación. Aquí se integran las ramas de desarrollo una vez que han sido verificadas y probadas.

### Ramas de Desarrollo Separadas
Para trabajar, revisar o modificar una parte específica del sistema, se debe cambiar a su respectiva rama mediante Git:

*   **Rama `backend`**: Aloja la lógica del servidor, la API, las rutas y los controladores de la aplicación.
    *   *Comando de acceso:* `git checkout backend`
*   **Rama `frontend`**: Contiene la interfaz de usuario, los componentes visuales, los estilos y la lógica del cliente.
    *   *Comando de acceso:* `git checkout frontend`
*   **Rama `bd`**: Almacena los scripts de inicialización, las migraciones, los modelos y los diagramas de la base de datos correspondientes a la materia de Bases de Datos 2.
    *   *Comando de acceso:* `git checkout bd`

---

## Tecnologías Utilizadas

### Frontend
*   [Angular]

### Backend
*   [Java | SpringBoot]

### Base de Datos
*   [Relacional: MySQL]
*   [No relacional: MongoDB]

