# ADR-0007: Migración de RabbitMQ a Apache Kafka

**Fecha:** 2026-01-23  
**Estado:** Aceptado  
**Decisores:** @smarcilla

## Contexto

El proyecto "Football Oracle" utiliza actualmente RabbitMQ como broker de mensajería para desacoplar los servicios de Scraping, Simulación y Generación de Reportes. Tras completar el "Walking Skeleton", se ha evaluado la necesidad de evolucionar la infraestructura de mensajería para alinearla con objetivos de aprendizaje profesional y capacidades futuras del sistema.

Las limitaciones identificadas o necesidades futuras son:

1. **Aprendizaje profesional:** El autor busca adquirir experiencia práctica con Kafka por su alta demanda laboral.
2. **Event Replay:** La arquitectura actual se beneficiaría de poder re-procesar eventos históricos (ej: realizar nuevas simulaciones con datos ya extraídos) sin depender de sistemas de persistencia externos o re-scraping.
3. **Escalabilidad de Consumidores:** Prever la adición de múltiples consumidores independientes para el mismo stream de datos (analítica, histórico, auditoría).

## Decision

Sustituir **RabbitMQ** por **Apache Kafka** como bus de eventos principal del sistema. Se utilizará el modo **KRaft** (Kafka Raft) para simplificar la infraestructura al eliminar la dependencia de Zookeeper.

## Alternativas Consideradas

### Opción A: Mantener RabbitMQ

- **Pros:** Extremadamente ligero, configuración sencilla, ya implementado en el skeleton.
- **Contras:** Los mensajes son efímeros por naturaleza una vez consumidos, dificulta el re-procesamiento masivo.

### Opción B: Apache Kafka

- **Pros:** Persistencia nativa de eventos (log), capacidad de replay excelente, estándar de la industria para arquitecturas de datos.
- **Contras:** Mayor consumo de recursos (JVM), curva de aprendizaje más pronunciada en la gestión de offsets y particiones.

## Consecuencias

### Positivas

- Capacidad de auditoría y re-procesamiento de datos de partidos históricos.
- Desacoplamiento total entre productores y consumidores mediante el uso de logs persistentes.
- Alineación del stack tecnológico con objetivos de carrera profesional.

### Negativas

- Incremento en el uso de memoria RAM en el entorno de desarrollo (Docker).
- Necesidad de refactorizar los clientes de mensajería en Node.js (se usará `kafkajs`) y Python (se usará `confluent-kafka` o similares).

### Riesgos

- Complejidad adicional en la gestión de errores (DLQs en Kafka funcionan de forma distinta a RabbitMQ).
- Posible incremento en la latencia de procesamiento individual en favor del throughput.

## Referencias

- [Documentación de Kafka KRaft](https://developer.confluent.io/learn/kraft/)
- [KafkaJS Docs](https://kafka.js.org/docs/getting-started)
