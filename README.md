# QualityTrack

QualityTrack es un sistema para centralizar la gestion, trazabilidad y documentacion de ordenes de trabajo en una empresa dedicada al mecanizado de piezas para clientes industriales.

El proyecto busca que cada trabajo tenga un expediente unico, vinculando la solicitud del cliente, cotizacion, orden de trabajo, documentacion tecnica, operaciones de planta, controles de calidad y entrega final.

## Contexto

Actualmente, gran parte de la informacion se administra mediante archivos fisicos, documentos independientes y planillas. Esto dificulta reconstruir el historial completo de una pieza, consultar informacion tecnica en planta y demostrar el proceso ante auditorias, errores de produccion o no conformidades.

QualityTrack propone ordenar ese flujo en una fuente unica de informacion:

```text
Solicitud del cliente -> Cotizacion -> Aprobacion -> Orden de Trabajo -> Hoja de Ruta -> Operaciones -> Control de Calidad -> Entrega
```

## Criterio de exito

El proyecto sera exitoso si un usuario puede tomar una Orden de Trabajo y reconstruir el historial completo del trabajo sin buscar informacion en diferentes sistemas, planillas o carpetas.

## Estructura inicial

```text
backend/
frontend/
```

## Flujo de trabajo

- `main` sera la rama principal del proyecto.
- `develop` sera la rama de integracion tecnica.
- Las ramas de trabajo deberian partir de `develop`.
- Los cambios hacia `main` deberian llegar desde `develop`.

Ramas sugeridas:

```text
feature/frontend-nombre-corto
feature/backend-nombre-corto
fix/frontend-nombre-corto
fix/backend-nombre-corto
docs/nombre-corto
qa/nombre-corto
chore/nombre-corto
```

