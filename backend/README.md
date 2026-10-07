# QualityTrack Backend

Backend de **QualityTrack**, una plataforma para gestionar y dar trazabilidad al ciclo completo de trabajos industriales, desde la solicitud inicial de un cliente hasta la producción, control de calidad y entrega.

La API centraliza los procesos comerciales y operativos, conserva el historial de cada caso y aplica reglas de negocio para que las distintas etapas avancen de forma consistente.

## Flujo principal

```text
Cliente
  │
  ▼
Solicitud
  │
  ▼
Revisión / Expediente
  │
  ▼
Cotización
  │
  ▼
Orden de trabajo
  │
  ▼
Hoja de ruta
  │
  ▼
Producción
  │
  ▼
Calidad
  │
  ▼
Entrega
  │
  ▼
Trazabilidad completa
```

QualityTrack mantiene conectados ambos lados del proceso:

- **Portal cliente**: solicitudes, empresa, miembros, cotizaciones, seguimiento y entregas.
- **Operación interna**: expedientes, cotización, ingeniería, órdenes de trabajo, materiales, producción, calidad, logística y administración.

---

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| Java 17 | Lenguaje principal |
| Spring Boot 4.1.1 | Framework de aplicación |
| Spring Web MVC | API REST |
| Spring Data JPA | Persistencia |
| Spring Security | Seguridad y autorización |
| OAuth2 Resource Server / JWT | Autenticación stateless |
| PostgreSQL | Base de datos |
| Flyway | Migraciones |
| Bean Validation | Validación de requests |
| MapStruct | Mapeo entre modelos |
| Lombok | Reducción de código repetitivo |
| SpringDoc OpenAPI | Swagger / documentación de API |
| Thymeleaf | Plantillas de correo |
| Resend | Envío de correos transaccionales |
| Cloudinary | Almacenamiento remoto de documentos |
| Docker / Docker Compose | Entorno reproducible |
| JUnit / Testcontainers | Pruebas |

---

## Módulos principales

El backend está organizado por capacidades de negocio.

```text
com.nocountry.qualitytrack
├── auth
├── customers
├── dashboard
├── deliveries
├── devseed
├── documents
├── machines
├── materials
├── nonconformities
├── notification
├── production
├── quality
├── quotations
├── requests
├── routing
├── search
├── shared
├── traceability
├── users
└── workorders
```

### Responsabilidades por módulo

- **auth**: login, registro, verificación de correo, recuperación de contraseña, JWT y acceso demo.
- **customers**: empresas cliente, miembros, invitaciones, perfiles y direcciones.
- **requests**: solicitudes del cliente y expediente asociado.
- **quotations**: cotizaciones, revisiones y solicitudes de ajuste.
- **workorders**: creación y administración de órdenes de trabajo.
- **materials**: materiales, lotes y planeación de materiales por orden.
- **routing**: hojas de ruta, operaciones y dependencias de fabricación.
- **production**: ejecución y avance de operaciones.
- **quality**: inspecciones y checks de calidad flexibles.
- **nonconformities**: gestión de no conformidades.
- **deliveries**: preparación, despacho y confirmación de entregas.
- **documents**: documentos, versiones y almacenamiento.
- **traceability**: historial de eventos del proceso.
- **dashboard**: indicadores del equipo interno.
- **search**: búsqueda global interna.
- **users**: usuarios internos, roles, estados y administración de cuenta.
- **devseed**: datos determinísticos de demostración.

---

## Requisitos

Para ejecutar el backend localmente:

- Java 17
- Docker y Docker Compose, recomendado para PostgreSQL
- Maven 3.9+, opcional si se utiliza el Maven Wrapper incluido

Comprueba Java con:

```bash
java -version
```

El proyecto incluye `mvnw` y `mvnw.cmd`, por lo que no es obligatorio instalar Maven globalmente.

---

## Configuración

El archivo de referencia se encuentra en:

```text
backend/.env.example
```

Crea tu archivo local:

```bash
cp .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

> No subas `.env` al repositorio.

### Base de datos

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qualitytrack
DB_USER=qualitytrack
DB_PASSWORD=your_password
```

### JWT

```env
JWT_SECRET=
JWT_ACCESS_EXPIRATION=15m
JWT_ISSUER=qualitytrack
```

`JWT_SECRET` debe contener un secreto Base64 suficientemente fuerte. La aplicación espera al menos 256 bits de entropía decodificada.

### Frontend y CORS

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_BASE_URL=http://localhost:5173
```

### Documentos

```env
DOCUMENT_STORAGE_PROVIDER=local
DOCUMENT_STORAGE_ROOT=./storage/documents
DOCUMENT_MAX_FILE_SIZE=25MB
DOCUMENT_MAX_REQUEST_SIZE=130MB
DOCUMENT_MAX_FILES_PER_REQUEST=5
CLOUDINARY_URL=
```

Para desarrollo local se recomienda `DOCUMENT_STORAGE_PROVIDER=local`. En ambientes compartidos o productivos puede utilizarse Cloudinary.

### Correo

```env
RESEND_APIKEY=
RESEND_EMAIL=QualityTrack@cambers.lat
RESEND_CONNECT_TIMEOUT=3s
RESEND_READ_TIMEOUT=5s
```

### Expiraciones e invitaciones

```env
EMAIL_VERIFICATION_EXPIRATION=24h
PASSWORD_RESET_EXPIRATION=30m
CUSTOMER_INVITATION_EXPIRATION=72h
INTERNAL_INVITATION_EXPIRATION=72h
```

### Cotizaciones

```env
QUOTATION_EXPIRATION_ZONE=America/Mazatlan
QUOTATION_EXPIRATION_CRON=0 */5 * * * *
```

---

## Administrador inicial

QualityTrack puede crear un administrador interno inicial al aprovisionar un ambiente nuevo.

```env
APP_BOOTSTRAP_ADMIN_ENABLED=true
APP_BOOTSTRAP_ADMIN_FIRST_NAME=Admin
APP_BOOTSTRAP_ADMIN_LAST_NAME=QualityTrack
APP_BOOTSTRAP_ADMIN_EMAIL=admin@example.com
APP_BOOTSTRAP_ADMIN_PASSWORD=change_me
```

El bootstrap está pensado únicamente para inicialización. Después de comprobar que el administrador fue creado correctamente:

```env
APP_BOOTSTRAP_ADMIN_ENABLED=false
```

Deshabilitar el bootstrap **no elimina** el usuario creado.

---

## Modo demo público

QualityTrack dispone de un modo demo independiente del bootstrap administrativo.

```env
APP_DEMO_ENABLED=true
APP_DEMO_PASSWORD=use_a_private_random_password
APP_DEMO_INTERNAL_EMAIL=admin.demo@qualitytrack.com
APP_DEMO_CUSTOMER_EMAIL=cliente.demo@qualitytrack.com
```

Cuando está habilitado, el backend mantiene cuentas destinadas exclusivamente a la demostración y prepara escenarios para recorrer distintas etapas del sistema.

El frontend puede iniciar una sesión demo mediante:

```http
POST /api/v1/auth/demo-login
```

El cliente solo indica el tipo de cuenta:

```json
{
  "accountType": "INTERNAL"
}
```

o:

```json
{
  "accountType": "CUSTOMER"
}
```

La contraseña demo permanece únicamente en el backend.

> `APP_DEMO_PASSWORD` debe mantenerse separada de cualquier contraseña administrativa real.

### Seed local determinístico

Existe además un perfil de Spring específico para generar datos locales de desarrollo:

```text
seed-demo
```

Este mecanismo es diferente del modo demo público y no debe habilitarse contra una base de datos compartida o productiva.

---

## Ejecutar con Docker Compose

La forma recomendada de levantar backend y PostgreSQL juntos es:

```bash
cd backend
docker compose up --build
```

Por defecto:

| Servicio | Dirección |
| --- | --- |
| API | `http://localhost:8085` |
| PostgreSQL desde host | `localhost:5435` |

Para detener:

```bash
docker compose down
```

Para eliminar también los volúmenes locales:

```bash
docker compose down -v
```

> `docker compose down -v` elimina los datos persistidos del entorno Docker local.

---

## Ejecutar desde Maven

Con PostgreSQL disponible y las variables de entorno configuradas:

### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
./mvnw spring-boot:run
```

La aplicación utiliza internamente el puerto `8080`.

---

## Base de datos y migraciones

QualityTrack utiliza **Flyway** como fuente de verdad para el esquema.

La configuración de JPA utiliza:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Esto significa que Hibernate valida el esquema, pero no debe crearlo ni modificarlo automáticamente.

Las migraciones están en:

```text
src/main/resources/db/migration
```

Al iniciar la aplicación, Flyway aplica automáticamente las migraciones pendientes en orden.

> No modifiques una migración que ya haya sido aplicada en un ambiente compartido. Crea una nueva migración versionada.

---

## API y Swagger

Con el backend ejecutándose:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI:

```text
http://localhost:8080/v3/api-docs
```

Si utilizas Docker Compose con la configuración incluida:

```text
http://localhost:8085/swagger-ui.html
```

---

## Health check

Spring Boot Actuator expone:

```http
GET /actuator/health
```

Ejemplo:

```bash
curl http://localhost:8080/actuator/health
```

---

## Autenticación y seguridad

QualityTrack utiliza autenticación **JWT stateless**.

```text
Credenciales
    │
    ▼
POST /api/v1/auth/login
    │
    ▼
Validación de usuario
    │
    ▼
JWT
    │
    ▼
Authorization: Bearer <token>
```

Además de validar el token, el backend comprueba el estado vigente del usuario para evitar que una cuenta suspendida conserve acceso únicamente por tener un JWT todavía válido.

Entre las capacidades de autenticación se encuentran:

- registro de clientes;
- verificación de correo;
- login;
- recuperación de contraseña;
- invitaciones de clientes;
- invitaciones de usuarios internos;
- autorización por roles;
- protección de cuentas demo;
- validación de usuarios activos.

---

## Roles internos

El sistema contempla responsabilidades internas como:

```text
ADMIN
COMMERCIAL
ENGINEERING
PRODUCTION
QUALITY
LOGISTICS
AUDITOR
```

Los permisos y acciones dependen del rol y de la etapa actual del proceso.

---

## Flujo de negocio

### 1. Solicitud

El cliente crea una solicitud con información de la pieza, requerimientos, documentos, material y destino de entrega.

### 2. Expediente

Se crea el caso asociado y el equipo interno puede tomar la solicitud, solicitar aclaraciones, definir especificaciones y completar la revisión.

### 3. Cotización

El equipo comercial crea la cotización, administra conceptos y revisiones y puede enviarla al cliente. El cliente puede aprobar, rechazar o solicitar ajustes.

### 4. Orden de trabajo

Una cotización aprobada habilita la creación de la orden de trabajo.

### 5. Preparación y hoja de ruta

La orden puede incluir documentos fijados para fabricación, planeación de materiales, hoja de ruta, operaciones y dependencias entre operaciones.

### 6. Producción

Las operaciones se ejecutan respetando el estado y la secuencia permitida por el flujo.

### 7. Calidad

El producto pasa a inspección mediante checks flexibles. Cuando corresponde, una inspección puede derivar en una no conformidad.

### 8. Entrega

Después de superar los requisitos operativos y de calidad, logística prepara, despacha y registra la entrega.

### 9. Trazabilidad

Los eventos relevantes del proceso permanecen disponibles en la línea de tiempo del expediente.

---

## Documentos

El módulo de documentos soporta:

- carga de archivos;
- versiones;
- acceso controlado;
- asociación a solicitudes y procesos;
- documentos de referencia de materiales;
- documentos vinculados a lotes;
- versiones fijadas para fabricación.

El almacenamiento puede funcionar localmente o mediante Cloudinary.

---

## Pruebas

### Windows

```powershell
.\mvnw.cmd test
```

### Linux / macOS

```bash
./mvnw test
```

Compilar y empaquetar:

```bash
./mvnw clean package
```

En Windows:

```powershell
.\mvnw.cmd clean package
```

El proyecto utiliza pruebas unitarias e integración. Algunas pruebas de persistencia utilizan **Testcontainers**, por lo que requieren Docker disponible.

---

## Build de producción

El proyecto incluye un `Dockerfile` multi-stage que:

1. compila con Maven y Java 17;
2. crea una imagen de runtime con Eclipse Temurin 17 JRE;
3. ejecuta la aplicación con un usuario no root;
4. expone el puerto `8080`.

Construcción manual:

```bash
docker build -t qualitytrack-backend .
```

Ejecución:

```bash
docker run --env-file .env -p 8080:8080 qualitytrack-backend
```

---

## Despliegue

El backend puede desplegarse como contenedor Docker en un proveedor compatible con PostgreSQL.

Para producción se recomienda:

- PostgreSQL administrado;
- `DOCUMENT_STORAGE_PROVIDER=cloudinary`;
- secretos gestionados por variables de entorno;
- CORS limitado al dominio del frontend;
- bootstrap administrativo deshabilitado después de aprovisionar el primer administrador;
- contraseña demo independiente de credenciales reales;
- HTTPS;
- migraciones Flyway aplicadas durante el arranque.

---

## Estructura simplificada

```text
backend/
├── src/
│   ├── main/
│   │   ├── java/com/nocountry/qualitytrack/
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── dashboard/
│   │   │   ├── deliveries/
│   │   │   ├── devseed/
│   │   │   ├── documents/
│   │   │   ├── machines/
│   │   │   ├── materials/
│   │   │   ├── nonconformities/
│   │   │   ├── notification/
│   │   │   ├── production/
│   │   │   ├── quality/
│   │   │   ├── quotations/
│   │   │   ├── requests/
│   │   │   ├── routing/
│   │   │   ├── search/
│   │   │   ├── shared/
│   │   │   ├── traceability/
│   │   │   ├── users/
│   │   │   └── workorders/
│   │   └── resources/
│   │       ├── db/migration/
│   │       ├── templates/
│   │       └── application.properties
│   └── test/
├── .env.example
├── compose.yaml
├── Dockerfile
├── mvnw
├── mvnw.cmd
└── pom.xml
```

---

## Principios del backend

- El estado del dominio determina qué acciones son válidas.
- Una etapa no debe adelantarse a otra sin cumplir sus precondiciones.
- Las operaciones importantes generan trazabilidad.
- Las credenciales y secretos permanecen fuera del código fuente.
- Flyway controla la evolución del esquema.
- Las integraciones externas se encapsulan detrás de servicios específicos.
- Los escenarios demo se mantienen separados de las cuentas administrativas reales.

---

## Proyecto

**QualityTrack** fue desarrollado como una plataforma de simulación industrial enfocada en trazabilidad, coordinación entre áreas y seguimiento del trabajo desde la solicitud hasta la entrega.

Repositorio:

```text
EdgarCamberos1894/QualityTrack
```

Frontend desplegado:

```text
https://qualitytrack-frontend.vercel.app/
```

Backend:

```text
https://qualitytrack.onrender.com
```
