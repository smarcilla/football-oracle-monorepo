# Outbox Relay Job Design (V2)

**Estado:** Definición técnica revisada  
**Fecha:** 2026-01-29  
**Servicio:** `data-registry`  
**Responsable:** GitHub Copilot

## 1. Objetivo

Garantizar la entrega de eventos a Kafka de forma asíncrona y robusta, evitando que errores individuales en mensajes bloqueen la progresión global del sistema (evitar Head-of-Line Blocking).

## 2. Estrategia de Procesamiento y Resiliencia

### 2.1 Procesamiento No Bloqueante

El job no se detendrá ante el fallo de un mensaje individual. Si se recupera un lote de $N$ mensajes, se intentará publicar cada uno de forma independiente:

- **Éxito:** Marcado inmediato como `PROCESSED` y registro de `processedAt`.
- **Fallo puntual (Sin ACK):** El mensaje permanece en `PENDING` para ser reintentado en el siguiente ciclo de polling.

### 2.2 Gestión de Reintentos y Estado `FAILED`

Para evitar que mensajes con errores persistentes (ej: tópico inexistente, payload corrupto, error de serialización) saturen el sistema en un bucle infinito:

1.  **Contador de Reintentos:** Se utilizará una columna `retries` en la tabla `Outbox`.
2.  **Incremento:** Cada vez que el envío a Kafka falle, el job incrementará este contador.
3.  **Abandono (Circuit Breaker por Mensaje):** Si un mensaje alcanza un umbral de `MAX_RETRIES` (ej: 5), su estado cambiará a `FAILED`.
4.  **Intervención:** Los mensajes en estado `FAILED` dejan de ser consultados por el job, permitiendo que el flujo de eventos nuevos continúe. Estos registros quedan disponibles en la base de datos para auditoría o corrección manual.

## 3. Especificación Técnica

### 3.1 Algoritmo del Job (Polling Loop)

1.  **Fetch:** Consultar eventos donde `status = 'PENDING'` y `retries < MAX_RETRIES`, ordenados por `createdAt` con un `LIMIT 20`.
2.  **Process Batch:** Para cada evento en el lote:
    - Intentar el envío a Kafka.
    - **Si hay éxito (ACK):** Actualizar a `PROCESSED`.
    - **Si hay fallo:** Incrementar `retries` y, si llega al máximo, marcar como `FAILED`.
3.  **Wait:** Dormir durante el intervalo configurado (ej: 500ms) antes de la siguiente iteración.

### 3.2 Implicaciones de Orden

Al permitir que mensajes posteriores se procesen aunque uno anterior falle temporalmente, se sacrifica el **orden estricto** en favor de la **disponibilidad global**. Dado que los eventos en este sistema suelen ser atómicos por partido, este compromiso es aceptable.

## 4. Cambios en el Modelo de Datos

Es necesario actualizar el `schema.prisma` para incluir el campo de control:

- `retries Int @default(0)` en el modelo `Outbox`.

## 5. Próximos Pasos

1.  Actualizar el esquema Prisma y generar el cliente.
2.  Implementar `OutboxRepository` con lógica de incremento de reintentos.
3.  Desarrollar el `OutboxRelay` utilizando el cliente de Kafka.
