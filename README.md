# Alfocea App

Mini CRM familiar para gestionar el terreno: reservas, manuales, normas de uso y familias.

## Poner en marcha

```powershell
npm install
npm run dev
```

Abre http://localhost:3000. La primera vez se crea sola la carpeta `data/` con contenido
de ejemplo (tres familias, reservas de la semana en curso, cinco manuales y siete normas).
Puedes borrar ese contenido desde la propia app sin miedo.

### Verla en el movil

Con el movil en el mismo wifi que el ordenador:

```powershell
npm run dev:movil
ipconfig    # busca "Direccion IPv4", algo tipo 192.168.1.40
```

Y en el navegador del movil entra en `http://192.168.1.40:3000` (con tu IP).
Si no carga, es el firewall de Windows: al arrancar por primera vez pide permiso
para Node.js y hay que marcar "Redes privadas".

## Como se navega

La app tiene dos pantallas principales unidas por el boton circular flotante que hay
en el centro del lateral:

- **Inicio** (`/`): resumen de la semana, quien esta hoy en el terreno, la proxima
  reserva, lo que falta por confirmar y las normas destacadas. El boton flotante de
  la derecha lleva a los modulos.
- **Modulos** (`/modulos`): los seis widgets de la app. El boton flotante de la
  izquierda vuelve a Inicio.

## Modulos

| Modulo | Ruta | Estado |
| --- | --- | --- |
| Inicio | `/` | Funcionando |
| Reservas | `/reservas` | Funcionando (calendario, ficha, alta, edicion, estados) |
| Manuales | `/manuales` | Funcionando |
| Normas de uso | `/normas` | Funcionando |
| Familias | `/familias` | Funcionando (familias, miembros y roles) |
| Proyectos y tareas | `/proyectos` | Pendiente de desarrollar |
| Inventario | `/inventario` | Pendiente de desarrollar |

## Estructura

```
src/
  app/                 Pantallas (App Router) y acciones de servidor
    page.tsx             Inicio
    modulos/             Segunda pantalla con los widgets
    reservas/            Calendario, ficha, alta y edicion
    manuales/            Listado, ficha, alta y edicion
    normas/              Listado, ficha, alta y edicion
    familias/            Familias, miembros y roles
    proyectos/           Placeholder
    inventario/          Placeholder
  components/          Componentes de interfaz reutilizables
  lib/
    types.ts             Modelo de dominio
    dates.ts             Utilidades de fecha (claves "YYYY-MM-DD")
    queries.ts           Lecturas preparadas para las pantallas
    db/
      adapter.ts         Contrato de acceso a datos
      json-adapter.ts    Implementacion sobre ficheros JSON en /data
      seed.ts            Datos de ejemplo iniciales
      index.ts           Punto unico donde se elige el almacenamiento
```

## Sobre los datos

De momento todo se guarda en ficheros JSON dentro de `data/`, que no se versionan.
Las pantallas nunca leen esos ficheros directamente: hablan con la interfaz
`DataAdapter`.

Cuando decidas la base de datos definitiva, el cambio consiste en escribir un
adaptador nuevo que cumpla `DataAdapter` y devolverlo desde `src/lib/db/index.ts`.
Ninguna pantalla necesita tocarse.

**Importante para desplegar en Vercel**: el sistema de ficheros de Vercel es de solo
lectura y efimero, asi que el adaptador JSON solo sirve en local. Hay que tener la
base de datos real antes de subirlo.

## Comandos

| Comando | Que hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilacion de produccion |
| `npm start` | Arranca la compilacion de produccion |
| `npm run typecheck` | Comprueba los tipos (ejecuta antes `npm run dev` una vez) |
