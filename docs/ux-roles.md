# UX por roles

Tres experiencias distintas dentro de la misma plataforma, cada una diseñada para un perfil diferente.

---

## Comprador

**Perfil:** Persona que quiere comprar productos frescos directamente al productor. Puede ser un usuario ocasional o recurrente. No tiene conocimientos técnicos específicos. Valora la confianza, la simplicidad y la velocidad.

**Principio rector:** Zero fricción — del landing al carrito en máximo 3 clics.

### Mapa de pantallas

```
Home
 ├── Categorías (grid visual)
 ├── Productos destacados
 ├── Sección "Cómo funciona"
 ├── Productores destacados
 └── CTA captación productor

Catálogo /productos
 ├── Filtro por categoría (sidebar)
 ├── Filtro por certificación
 ├── Ordenación (precio, novedad)
 └── Grid de productos

Detalle producto /productos/[slug]
 ├── Galería de fotos
 ├── Precio + unidad
 ├── Badges (ECO, DOP, KM0)
 ├── Stock visible
 ├── Añadir al carrito
 ├── Origen y productor
 └── Productos relacionados

Carrito /carrito
 ├── Lista de ítems
 ├── Cambiar cantidad
 ├── Alerta si precio cambió
 └── Resumen + ir a checkout

Checkout /checkout
 ├── Dirección de entrega
 ├── Método de pago
 └── Confirmación

Cuenta /cuenta
 ├── Mis pedidos (con estados)
 ├── Mis direcciones
 ├── Mis favoritos
 └── Datos personales

Auth
 ├── /auth/login
 └── /auth/register
```

### Navegación

```
[Mercado Productor]  [Categorías ▾] [Productores]  [Buscar...]  [Entrar] [Registro] [🛒 3]
```

- Logo → Home
- Categorías → dropdown con 8 categorías + icono
- Buscar → search bar central, siempre visible
- Carrito → badge con contador animado
- Usuario autenticado → avatar con dropdown (cuenta, pedidos, cerrar sesión)
- Mobile → hamburger con drawer completo

### Acciones principales por pantalla

| Pantalla | Acción primaria | Acción secundaria |
|----------|----------------|------------------|
| Home | "Explorar productos" | "Conocer productores" |
| Catálogo | Añadir al carrito | Filtrar |
| Producto | Añadir al carrito | Ver productor |
| Carrito | Ir a checkout | Eliminar ítem |
| Checkout | Confirmar pedido | Editar dirección |
| Cuenta | Ver mis pedidos | — |

### Principios UX aplicados

1. **Trust signals siempre visibles:** badges ECO, DOP, KM0 en cards y detalle
2. **Estado de stock claro:** "¡Últimas 5 unidades!" / overlay "Sin stock"
3. **Transparencia de precio:** precio tachado si hay oferta, IVA indicado
4. **Productor visible:** nombre y origen en cada card de producto
5. **Cero dead ends:** siempre hay un CTA visible para seguir comprando
6. **Mobile-first:** filtros en drawer, búsqueda destacada

### Errores a evitar

- ❌ Registro obligatorio para explorar el catálogo
- ❌ Precios sin IVA que luego sorprenden en checkout
- ❌ Carrito que pierde ítems al cerrar sesión
- ❌ Filtros que no muestran el número de resultados
- ❌ Fotos pequeñas o de baja calidad
- ❌ Botón "Añadir al carrito" invisible o poco contrastado

---

## Productor

**Perfil:** Agricultor, artesano o pequeño productor que vende en el marketplace. Probablemente no es un experto digital. Necesita entender rápidamente qué hacer en cada momento. Valora la claridad, la guía paso a paso y la transparencia financiera.

**Principio rector:** "¿Qué necesito hacer hoy?" — siempre con respuesta inmediata.

### Mapa de pantallas

```
Dashboard /dashboard
 ├── Checklist de setup (solo nuevos)
 │    ├── Completar perfil
 │    ├── Añadir primer producto
 │    └── Añadir cuenta bancaria
 ├── Alertas urgentes (pedidos pendientes/listos)
 ├── Stats (próxima liquidación, pedidos activos, productos, rating)
 ├── Últimas liquidaciones
 └── Tips para nuevos productores

Pedidos /pedidos
 ├── Tabs: Activos / Urgentes / Enviados / Todos
 ├── Badge de urgentes en tab
 ├── Tarjeta por fulfillment
 │    ├── Estado con badge coloreado
 │    ├── Productos del pedido
 │    └── Botón de acción contextual
 │         ├── "Confirmar pedido" (PENDING → CONFIRMED)
 │         ├── "Empezar preparación" (CONFIRMED → PREPARING)
 │         ├── "Marcar como listo" (PREPARING → READY)
 │         └── "Marcar enviado" + campo tracking (READY → SHIPPED)
 └── Highlight ámbar en pedidos urgentes

Catálogo /catalogo
 ├── Tabs: Todos / Activos / En revisión / Borradores / Rechazados
 ├── Alertas stock bajo / sin stock al tope
 ├── Grid de productos
 │    ├── Badge de estado con dot de color
 │    ├── Indicator stock con color
 │    ├── Nota de rechazo inline (si aplica)
 │    ├── Botón "Editar"
 │    └── Botón "Ver en tienda"
 └── CTA "Añadir producto"

Liquidaciones /liquidaciones
 ├── Lista de liquidaciones con períodos
 ├── Desglose: ventas brutas → comisiones → devoluciones → neto
 └── Estado del pago (Pendiente / Pagado)

Perfil /perfil
 ├── Barra de progreso de completitud (0–100%)
 ├── Checklist de pasos pendientes
 ├── Info pública (nombre, descripción, localización)
 ├── Config de pedidos (hora de corte, días preparación)
 └── Datos bancarios (lectura, ofuscados)
```

### Navegación (sidebar)

```
┌─────────────────┐
│ MP  Portal      │
│     Productor   │
│     ● Activo    │
├─────────────────┤
│ 🏠 Inicio       │
│ 📦 Mis pedidos 3│  ← badge ámbar si hay urgentes
│ 🌿 Mi catálogo  │
│ 💰 Liquidaciones│
│ 👤 Mi perfil    │
├─────────────────┤
│ Ver mi tienda → │
└─────────────────┘
```

### Acciones principales por pantalla

| Pantalla | Acción primaria | Cuándo |
|----------|----------------|--------|
| Dashboard | Atender pedidos urgentes | Si hay pedidos PENDING o READY |
| Dashboard (nuevo) | Completar setup | Si falta perfil, productos o banco |
| Pedidos | Avanzar estado del fulfillment | Siempre hay un botón contextual |
| Catálogo | Editar stock / añadir producto | Al ver alertas de stock |
| Perfil | Guardar cambios | Tras editar cualquier campo |

### Principios UX aplicados

1. **Onboarding progresivo:** checklist solo aparece para cuentas nuevas/incompletas
2. **Cola de urgencias:** bloque rojo con pedidos que necesitan acción inmediata
3. **Botón contextual único:** nunca más de una acción principal por pedido
4. **Transparencia financiera:** desglose claro de qué se cobra y por qué
5. **Confirmación visual de éxito:** al guardar perfil aparece "✓ Cambios guardados"
6. **Estado del negocio siempre visible:** dot verde "Activo" en sidebar

### Errores a evitar

- ❌ Terminología técnica ("fulfillment", "SKU") sin explicación
- ❌ Pantalla vacía sin CTA al entrar por primera vez
- ❌ Acciones destructivas (borrar producto) sin confirmación
- ❌ Datos bancarios visibles en texto plano
- ❌ Formulario de producto que pierde datos al navegar
- ❌ Liquidación sin desglose de conceptos

---

## Administrador

**Perfil:** Operador del marketplace con responsabilidades de gestión, moderación y resolución de problemas. Trabaja con varios casos a la vez. Valora la eficiencia, la densidad de información y la capacidad de actuar rápido.

**Principio rector:** Densidad + control — alertas arriba, cero pasos innecesarios.

### Mapa de pantallas

```
Dashboard /dashboard
 ├── Barra de alertas prioritarias (incidencias, productores, productos)
 ├── Stats grid (facturación, pedidos, productores, incidencias)
 ├── Cola productores pendientes
 ├── Cola incidencias SLA
 ├── Cola productos por revisar
 └── Pedidos recientes

Pedidos /pedidos
 ├── Búsqueda libre
 ├── Tabs: Todos / Activos / Pago🔴 / Enviados / Cancelados
 ├── Tabla con highlight para estados prioritarios
 ├── Columnas: Nº Pedido, Cliente, Estado, Pago, Total, Fecha
 └── Paginación con meta de API

Productores /productores
 ├── Búsqueda por nombre/email
 ├── Tabs: Todos / Solicitudes / Activos / Suspendidos / Rechazados
 ├── Tabla con dot de estado y highlight para APPLYING
 ├── Acciones inline: Activar / Rechazar / Suspender
 └── Modal de confirmación con campo de motivo obligatorio

Productos /productos
 ├── Búsqueda por nombre/productor
 ├── Contador de pendientes
 ├── Lista con imagen + info completa
 ├── Botones Aprobar / Rechazar por ítem
 ├── Modal de detalle con galería
 └── Modal de rechazo con textarea de motivo

Liquidaciones /liquidaciones
 ├── Selección de productor y período
 ├── Generación de liquidación
 ├── Aprobación (SUPERADMIN)
 └── Marcar como pagada

Incidencias /incidencias
 ├── Pills resumen (abiertas, SLA vencido)
 ├── Tabs: Todas / Abiertas / Acción requerida / Esp. productor / Resueltas
 ├── Tabla con indicador SLA y highlight para vencidas
 ├── Botón "Resolver"
 └── Modal de resolución
      ├── Radio buttons (devolución total/parcial, reenvío, crédito, rechazar)
      ├── Importe y quién asume el coste (si hay devolución)
      └── Nota interna para el equipo
```

### Navegación (sidebar)

```
┌─────────────────────┐
│ MP  Panel Admin     │
│     Mercado Prod.   │
├─────────────────────┤
│ 🏠 Dashboard        │
│ 📦 Pedidos      12 │  ← ámbar
│ 👥 Productores   3 │  ← ámbar (solicitudes)
│ 🌿 Productos     8 │  ← ámbar (revisión)
│ 💰 Liquidaciones   │
│ ⚠️  Incidencias  5 │  ← rojo
│ 📊 Informes        │
├─────────────────────┤
│ Ver tienda →        │
└─────────────────────┘
```

Badge rojo: incidencias abiertas (urgente)
Badge ámbar: productores pendientes, productos en revisión, pedidos activos

### Acciones principales por pantalla

| Pantalla | Acción primaria | Cuándo |
|----------|----------------|--------|
| Dashboard | Procesar cola de productores | Siempre que haya solicitudes |
| Dashboard | Resolver incidencias SLA | Siempre que haya vencidas |
| Productores | Activar/rechazar solicitudes | Estado APPLYING |
| Productos | Aprobar/rechazar | Estado PENDING_REVIEW |
| Incidencias | Resolver con resolución guiada | Estado OPEN o AWAITING_ADMIN |

### Principios UX aplicados

1. **Priority queue:** las alertas más urgentes siempre en la parte superior
2. **Badges en tiempo real:** el sidebar se refresca cada 60s automáticamente
3. **Modales propios:** nunca `prompt()` del navegador (motivo obligatorio en inputs)
4. **Invalidación de cache:** al aprobar/rechazar, el badge del sidebar se actualiza inmediatamente
5. **Densidad de tabla:** info relevante en una fila, sin expansión necesaria para decisiones simples
6. **Highlight de prioridad:** filas con color de fondo para estados críticos

### Errores a evitar

- ❌ `prompt()` / `confirm()` del navegador para acciones críticas
- ❌ Acciones sin motivo registrado (para auditoría)
- ❌ Datos sin refrescar (stale data sin indicador)
- ❌ Navegación que pierde el filtro activo
- ❌ Bulk actions que no muestran progreso
- ❌ Incidencias sin SLA visible

---

## Comparativa de experiencias

| Aspecto | Comprador | Productor | Admin |
|---------|-----------|-----------|-------|
| **Densidad de info** | Baja (simple) | Media (guiada) | Alta (densa) |
| **Acciones por pantalla** | 1-2 | 2-4 | 5-10 |
| **Frecuencia de uso** | Esporádico | Diario | Continuo |
| **Tolerancia a errores** | Muy baja | Baja | Media |
| **Necesidad de ayuda** | Mínima | Alta (onboarding) | Baja |
| **Velocidad requerida** | Alta | Media | Muy alta |
| **Tecnicismo** | Ninguno | Bajo | Medio |
