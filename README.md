# Ionic Task Manager

Aplicacion demo para la prueba tecnica de desarrollo mobile con Ionic, Angular y Cordova.

## Resumen del proyecto

Se implementa una lista de tareas con persistencia local y administracion de categorias.
La app permite:

- Crear tareas.
- Marcar tareas como completadas.
- Eliminar tareas.
- Crear, editar y eliminar categorias.
- Asignar una categoria a cada tarea.
- Filtrar tareas por categoria o por `Sin categoria`.
- Mostrar una seccion de insights controlada por Firebase Remote Config.

## Enfoque tecnico

La entrega se prepara con **Cordova**, tal como lo solicita la guia de la prueba.
La aplicacion web se compila con Angular e Ionic y el resultado se reutiliza dentro del contenedor nativo que Cordova genera.

La aplicacion se mantiene intencionalmente simple en la UI y clara en la arquitectura:

- Una pantalla principal.
- Un servicio central de estado.
- Un servicio separado para Remote Config.
- Persistencia local con `localStorage`.
- Modelo tipado para tareas, categorias e insights.

## Arquitectura usada

Se usa una **arquitectura ligera por capas**:

1. **Presentacion**: `HomePage` renderiza la interfaz y maneja acciones de usuario.
2. **Estado y reglas**: `TaskStoreService` concentra el estado de tareas y categorias.
3. **Infraestructura**: `RemoteConfigService` conecta Firebase Remote Config y expone el feature flag.
4. **Persistencia**: `localStorage` guarda y recupera el estado completo de la app.

### Flujo de datos

```mermaid
flowchart LR
  UI[HomePage] --> Store[TaskStoreService]
  UI --> RC[RemoteConfigService]
  Store --> LS[(localStorage)]
  RC --> FB[(Firebase Remote Config)]
  Store --> VM[HomeViewModel]
  RC --> VM
  VM --> UI
```

### Decisiones de arquitectura

- Separacion de UI y logica de negocio para mantener la vista simple.
- Centralizacion del estado para evitar suscripciones y calculos dispersos.
- Construccion de un `HomeViewModel` unico para consumir el template con `async`.
- Encapsulacion del acceso a Firebase para aislar la dependencia externa.
- Fallback local cuando Remote Config no esta disponible.

## Estructura del proyecto

```text
ionic-task-manager/
|-- config.xml
|-- package.json
|-- angular.json
|-- README.md
|-- deliverables/
|   |-- android/
|   |-- media/
|   `-- ios/
|-- src/
|   |-- app/
|   |   |-- home/
|   |   |   |-- home.page.ts
|   |   |   |-- home.page.html
|   |   |   `-- home.page.scss
|   |   |-- models/
|   |   |   `-- task.models.ts
|   |   `-- services/
|   |       |-- task-store.service.ts
|   |       `-- remote-config.service.ts
|   |-- environments/
|   |   |-- environment.ts
|   |   `-- environment.prod.ts
|   |-- index.html
|   `-- global.scss
`-- platforms/
```

### Archivos clave

- `src/app/home/home.page.*`: pantalla principal y acciones de usuario.
- `src/app/services/task-store.service.ts`: estado, filtros, persistencia y calculos de vista.
- `src/app/services/remote-config.service.ts`: inicializacion de Firebase y feature flag.
- `src/app/models/task.models.ts`: contratos tipados del dominio.
- `src/environments/environment*.ts`: configuracion de Firebase y valores por defecto.
- `config.xml`: configuracion base de Cordova.
- `src/index.html`: carga de `cordova.js` para ejecucion nativa.

## Tecnologias y herramientas

### Frameworks y librerias

- **Angular 20**: framework principal de la aplicacion.
- **Ionic 8**: componentes y patrones de UI mobile-first.
- **Cordova 13**: empaquetado nativo para Android e iOS.
- **RxJS**: manejo reactivo del estado y combinacion de streams.
- **Firebase JS SDK**: integracion con Remote Config.
- **TypeScript**: tipado y estructura del dominio.

### Herramientas de desarrollo

- **Angular CLI**: desarrollo, build y lint.
- **ESLint**: control de calidad del codigo.
- **npm**: gestion de dependencias y scripts.
- **Android Studio / Android SDK**: compilacion de Android.
- **Xcode**: compilacion y archivo de iOS.

## Requisitos del entorno

- Node.js 20 LTS o una version compatible con Angular 20.
- npm.
- Android Studio y Android SDK para generar APK.
- Java 17 para compilar Android con Cordova.
- Xcode y macOS para generar IPA.
- Cuenta de Firebase con Remote Config habilitado.

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

Se deben completar `src/environments/environment.ts` y `src/environments/environment.prod.ts` con los datos reales del proyecto Firebase.

Configuracion aplicada:

```ts
firebase: {
  apiKey: 'AIzaSyDy4ckOBuOYT5wXmkKZXjc5IuZaDTUB4DU',
  authDomain: 'ionic-task-manager-8aa4f.firebaseapp.com',
  projectId: 'ionic-task-manager-8aa4f',
  storageBucket: 'ionic-task-manager-8aa4f.firebasestorage.app',
  messagingSenderId: '140769959464',
  appId: '1:140769959464:web:2e28a9ea9260fbd0db9f1d',
  measurementId: 'G-CRJL1RH04E',
}
```

El feature flag usado por la app es:

```text
category_insights_enabled
```

Valores:

- `true`: mostrar la seccion de insights por categoria.
- `false`: ocultar esa seccion.

### 3. Ejecutar en navegador

```bash
npm start
```

Se debe abrir la URL que entrega Angular CLI.

### 4. Generar build web de produccion

```bash
npm run build:prod
```

Este paso genera el contenido que Cordova consume desde `www`.

### 5. Preparar Cordova

```bash
npm run cordova:prepare
```

Se sincroniza el build web con la estructura nativa.

### 6. Agregar plataformas

```bash
npm run cordova:add:android
npm run cordova:add:ios
```

## Comandos utiles

```bash
npm start
npm run build
npm run build:prod
npm run lint
npm run cordova:prepare
npm run cordova:add:android
npm run cordova:add:ios
npm run cordova:build:android
npm run cordova:build:ios
npm run cordova:run:android
```

## Compilacion nativa con Cordova

### Android

```bash
npm run build:prod
npm run cordova:prepare
npm run cordova:build:android
```

Salida habitual:

```text
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS

En macOS:

```bash
npm run build:prod
npm run cordova:prepare
npm run cordova:build:ios
```

Debe abrirse el proyecto generado en Xcode para archivar y exportar el IPA.

## Firebase Remote Config

La aplicacion consulta Remote Config al iniciar.

Si la conexion responde y el flag `category_insights_enabled` esta activo, se muestra la seccion de insights por categoria.
Si la consulta falla, se usa el valor por defecto definido en `environment*.ts`.

### Comportamiento del feature flag

- `true`: se muestra el resumen de uso por categoria y la tarjeta de `Sin categoria`.
- `false`: la app permanece operativa sin esa seccion adicional.

## Optimizacion de rendimiento

- Uso de `ChangeDetectionStrategy.OnPush` en la pantalla principal.
- Consumo del estado con `async` pipe y sin suscripciones manuales en la vista.
- Aplicacion de `trackBy` en listas de tareas e insights.
- Concentracion de calculos en el servicio de estado, no en el template.
- Persistencia en `localStorage` solo cuando cambia el estado.
- Orden y filtrado en el modelo de vista para evitar logica repetida en UI.

## Validacion

```bash
npm run build
npm run lint
```

## Entregables del desafio

### Codigo fuente

Repositorio actualizado con:

- Implementacion de tareas y categorias.
- Persistencia local.
- Feature flag con Firebase Remote Config.
- Base Cordova lista para empaquetar Android e iOS.
- README extendido para evaluador.

### Nota sobre el fork

No se realizo un fork formal porque no se recibio un repositorio base independiente para crear la copia inicial.
El desarrollo se realizo directamente sobre el repositorio proporcionado para la entrega.

### Generacion de APK e IPA

La compilacion nativa se documenta con compatibilidad para **Java 17** y **Gradle 8.x**.

#### Build de Android

```bash
npm run build:prod
npm run cordova:prepare
npm run cordova:build:android
```

Salida habitual:

```text
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

Si el build se ejecuta desde Android Studio, conviene verificar que el proyecto use Java 17 y Gradle 8.x antes de exportar el APK final.

#### Build de iOS

Requiere macOS con Xcode, Apple Developer Account y una configuracion de firma valida en el proyecto generado por Cordova.

```bash
npm run build:prod
npm run cordova:prepare
npm run cordova:build:ios
```

Luego se abre `platforms/ios/App.xcworkspace` en Xcode, se verifica el equipo de firma en `Signing & Capabilities` y se genera el archivo `.ipa` desde `Product > Archive`.

### Capturas y video (Evidencia del Punto 3)

Se han preparado los siguientes escenarios para demostrar las funcionalidades:

1. **Gestion de Categorias:** Creacion de categorias con colores personalizados y asignacion dinamica a tareas existentes.
2. **Feature Flag (Remote Config):** Demostracion de la seccion "Insights" activandose/desactivandose mediante el flag `category_insights_enabled` en la consola de Firebase.
3. **Filtros Dinamicos:** Filtrado de la lista principal por categorias o por tareas sin categorizar.
4. **iOS Mode:** Captura de la interfaz en Chrome DevTools con emulacion de dispositivo `iPhone 14 Pro` para evidenciar el comportamiento responsive.

La evidencia puede encontrarse en `deliverables/android/` y `deliverables/media/`:

- `deliverables/android/ionic-task-manager.apk`
- `deliverables/android/demo app.mp4`
- `deliverables/media/demo.mp4`
- `deliverables/media/feature_flag_demo.mp4`

### Binarios finales

Los binarios finales pueden ubicarse en:

- `deliverables/android/`
- `deliverables/ios/`

## Aspectos importantes

### Principales desafios

- Integracion de categorias y filtros sin complicar la vista.
- Mantenimiento de un feature flag externo con fallback local.
- Ajuste de la entrega a Cordova sin mezclar dos flujos de empaquetado.

### Como asegurar calidad y mantenibilidad

- Definicion de tipos para el dominio.
- Separacion de UI, estado e infraestructura.
- Mantenimiento de una sola fuente de verdad para tareas y categorias.
- Validacion de `build` y `lint` antes de cerrar cambios.

### Como se abordo rendimiento

- Reduccion de trabajo en template.
- Reutilizacion de referencias con `trackBy`.
- Evitar recreacion innecesaria de componentes y listas.

## Respuestas al punto 3

### Principales desafios

El reto mas visible fue integrar categorias y filtro sin transformar la pantalla en una vista pesada. La decision fue concentrar la logica en un servicio de estado y dejar la pagina principal como una capa de presentacion relativamente delgada. Tambien aparecio el ajuste de Cordova, porque la entrega debia conservar el flujo web y, al mismo tiempo, dejar lista la base nativa para Android e iOS. El feature flag con Firebase Remote Config se resolvio con un fallback local para evitar que la app dependiera por completo de la red.

### Tecnicas de optimizacion aplicadas

Se aplico `OnPush` para reducir trabajo de deteccion de cambios, `async` pipe para evitar suscripciones manuales y `trackBy` para que las listas no se recrearan completo en cada cambio. La vista no calcula datos de negocio directamente; esos calculos se concentran en el servicio de estado. Eso deja el template mas simple y hace mas predecible el comportamiento cuando la lista crece.

### Calidad y mantenibilidad

Se trabajo con modelos tipados para tareas, categorias e insights, lo que reduce ambiguedades al mover datos entre componentes y servicios. El estado se centralizo en un solo lugar para no repartir reglas por la UI. Tambien se dejo validacion con `build` y `lint` antes de cerrar cambios, y la documentacion explica el flujo real del proyecto sin agregar capas que no aportan valor.

## Notas de entrega

- El proyecto se entrega con Cordova, no con Capacitor.
- El build nativo depende de la configuracion local de Android Studio, Java y Xcode.
- Los datos de Firebase deben reemplazarse con credenciales reales antes de compilar la demo final.
