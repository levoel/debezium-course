# Phase 8: Module 4 - Advanced Patterns - Research

**Researched:** 2026-02-01
**Domain:** Debezium Single Message Transformations (SMTs), Outbox Pattern, Schema Registry Integration
**Confidence:** HIGH

## Summary

Module 4 covers advanced Debezium capabilities that enable production-ready CDC pipelines: Single Message Transformations (SMTs) for event processing, the Outbox pattern for microservices data exchange, and Schema Registry integration for schema evolution.

The research confirms that Debezium 2.5.4 includes a comprehensive set of built-in SMTs for filtering, routing, masking, and flattening events. The Outbox Event Router SMT is production-ready and widely used in microservices architectures. Confluent Schema Registry 7.8.1 integrates with Debezium via Avro converters (requires manual installation in Debezium 2.0+). Schema evolution with backward/forward/full compatibility modes is well-documented and supported.

Key technical constraints: SMTs execute synchronously in Kafka Connect (performance overhead for complex transformations), predicates require Kafka 2.6+, Avro converter JARs must be manually installed in Debezium 2.5.4 containers, and Outbox pattern provides eventual consistency (not ACID guarantees across services).

**Primary recommendation:** Teach SMT chaining patterns with predicates for selective application, emphasize Outbox pattern's transactional guarantees (single-database only), and demonstrate Avro serialization with Schema Registry using TopicNameStrategy for simplicity.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Debezium PostgreSQL Connector | 2.5.4.Final | CDC with built-in SMTs | Project constraint: Java 21 ARM64 compatibility |
| Confluent Schema Registry | 7.8.1 | Schema management and evolution | Already deployed in labs/docker-compose.yml |
| Confluent Avro Converter | 7.8.1 | Avro serialization for Kafka Connect | Standard for Confluent ecosystem integration |
| Apache Kafka | 7.8.1 (Confluent) | Message broker with SMT support | Predicates require Kafka 2.6+, project uses 7.8.1 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| kafka-connect-avro-converter | 7.8.1 | AvroConverter class | Required for Schema Registry integration |
| kafka-connect-avro-data | 7.8.1 | Avro data mapping | Required dependency for Avro converter |
| kafka-avro-serializer | 7.8.1 | Avro serialization | Required dependency for Avro converter |
| kafka-schema-serializer | 7.8.1 | Schema serialization | Required dependency for Avro converter |
| kafka-schema-registry-client | 7.8.1 | Schema Registry API client | Required dependency for Avro converter |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Confluent Schema Registry | Apicurio Registry | Apicurio offers Confluent compatibility mode, but course already uses Confluent stack |
| Avro | Protobuf | Protobuf is 5% faster and slightly smaller, but Avro is Kafka ecosystem standard |
| Built-in SMTs | Custom SMTs | Custom SMTs offer flexibility but require compilation, deployment, and maintenance overhead |
| Outbox Event Router SMT | Custom polling | Polling requires custom code and doesn't guarantee ordering; SMT uses CDC log |

**Installation:**

For Avro converter (Debezium 2.0+ requires manual installation):
```bash
# Download Confluent Avro converter from Maven repository
# Extract JARs to Kafka Connect plugin directory
# Required JARs: kafka-connect-avro-converter, kafka-connect-avro-data,
# kafka-avro-serializer, kafka-schema-serializer, kafka-schema-registry-client
```

All SMTs are built into Debezium 2.5.4 except:
- Filter SMT (requires JSR 223 implementation like Groovy)
- ContentBasedRouter SMT (requires JSR 223 implementation)

## Architecture Patterns

### Recommended Project Structure
```
labs/
├── docker-compose.yml           # Schema Registry already deployed
├── connectors/
│   ├── outbox-connector.json   # Outbox Event Router configuration
│   └── avro-connector.json     # Connector with Avro serialization
├── schemas/
│   └── outbox-table.sql        # Outbox table DDL
└── notebooks/
    ├── smt-filtering.ipynb     # SMT filtering demonstrations
    ├── outbox-demo.ipynb       # Outbox pattern implementation
    └── avro-schema.ipynb       # Schema Registry integration
```

### Pattern 1: SMT Chaining with Predicates
**What:** Apply multiple transformations in sequence with conditional logic
**When to use:** Complex event processing pipelines requiring filtering, routing, and flattening
**Example:**
```json
// Source: https://debezium.io/documentation/reference/stable/transformations/applying-transformations-selectively.html
{
  "transforms": "filter,unwrap,route",
  "transforms.filter.type": "io.debezium.transforms.Filter",
  "transforms.filter.language": "jsr223.groovy",
  "transforms.filter.condition": "value.op == 'c' || value.op == 'u'",
  "transforms.filter.predicate": "IsDataEvent",

  "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
  "transforms.unwrap.drop.tombstones": "false",
  "transforms.unwrap.add.fields": "op,table,source.ts_ms",

  "transforms.route.type": "io.debezium.transforms.ByLogicalTableRouter",
  "transforms.route.topic.regex": "(.*)customers_shard(.*)",
  "transforms.route.topic.replacement": "$1customers_all_shards",

  "predicates": "IsDataEvent",
  "predicates.IsDataEvent.type": "org.apache.kafka.connect.transforms.predicates.TopicNameMatches",
  "predicates.IsDataEvent.pattern": "dbserver1.inventory.*"
}
```

### Pattern 2: Outbox Event Router with Selective Capture
**What:** Capture only outbox table with SMT for event routing
**When to use:** Microservices publishing domain events transactionally
**Example:**
```json
// Source: https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html
{
  "name": "outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "postgres",
    "database.dbname": "inventory",
    "table.include.list": "public.outbox",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.table.field.event.id": "id",
    "transforms.outbox.table.field.event.key": "aggregateid",
    "transforms.outbox.table.field.event.payload": "payload",
    "transforms.outbox.route.by.field": "aggregatetype",
    "transforms.outbox.route.topic.replacement": "outbox.event.${routedByValue}",
    "transforms.outbox.table.expand.json.payload": "true",
    "transforms.outbox.predicate": "IsOutboxTable",
    "predicates": "IsOutboxTable",
    "predicates.IsOutboxTable.type": "org.apache.kafka.connect.transforms.predicates.TopicNameMatches",
    "predicates.IsOutboxTable.pattern": ".*outbox"
  }
}
```

### Pattern 3: Avro Serialization with Schema Registry
**What:** Use AvroConverter with TopicNameStrategy for schema management
**When to use:** Production pipelines requiring schema evolution and compact serialization
**Example:**
```json
// Source: https://debezium.io/documentation/reference/stable/configuration/avro.html
{
  "name": "postgres-avro-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "key.converter": "io.confluent.connect.avro.AvroConverter",
    "key.converter.schema.registry.url": "http://schema-registry:8081",
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "http://schema-registry:8081",
    "value.converter.schemas.enable": "true"
  }
}
```

### Pattern 4: PII Masking with MaskField
**What:** Mask sensitive fields before publishing to Kafka
**When to use:** Compliance requirements (GDPR, PII protection)
**Example:**
```json
// Source: https://docs.confluent.io/platform/current/connect/transforms/maskfield.html
{
  "transforms": "unwrap,mask",
  "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
  "transforms.mask.type": "org.apache.kafka.connect.transforms.MaskField$Value",
  "transforms.mask.fields": "ssn,credit_card,email",
  "transforms.mask.replacement": "***MASKED***"
}
```

### Pattern 5: Content-Based Routing
**What:** Route events to different topics based on field values
**When to use:** Multi-tenant systems, region-based routing, priority queues
**Example:**
```json
// Source: https://debezium.io/documentation/reference/stable/transformations/content-based-routing.html
{
  "transforms": "route",
  "transforms.route.type": "io.debezium.transforms.ContentBasedRouter",
  "transforms.route.language": "jsr223.groovy",
  "transforms.route.topic.expression": "value.after.region == 'EU' ? 'events-eu' : 'events-us'"
}
```

### Anti-Patterns to Avoid
- **Applying SMTs without predicates to all events:** Heartbeat and tombstone messages don't have `op` field, causing failures. Use `TopicNameMatches` predicate to apply SMTs selectively.
- **Complex transformations in SMTs:** SMTs execute synchronously in Connect worker threads. Heavy transformations create bottlenecks. Use Kafka Streams or Flink for complex logic.
- **Outbox table without cleanup:** Deleted outbox records still consume WAL space. Implement cleanup strategy (Debezium filters DELETE events by default).
- **Custom null handling for default values:** Use `ExtractNewRecordState` with `replace.null.with.default=true` instead of custom logic.
- **Ignoring SMT ordering:** SMT execution order matters. Apply filters early to reduce downstream processing. Apply flattening before routing.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Event filtering | Custom filter logic in consumer | Filter SMT with predicates | Reduces Kafka traffic, supports JSR 223 languages (Groovy, JS, Go/WASM) |
| Event flattening | Manual `after` field extraction | ExtractNewRecordState SMT | Handles all operation types (c/u/d), configurable metadata, tombstone handling |
| PII masking | Custom field redaction | MaskField SMT | Type-safe masking (string, numeric, date), custom replacement values |
| Topic routing | Consumer-side routing logic | ByLogicalTableRouter or ContentBasedRouter SMT | Maintains key uniqueness, regex-based patterns, Kafka-level routing |
| Outbox polling | SELECT/DELETE polling loop | Outbox Event Router SMT | CDC-based (WAL log), guaranteed ordering, no polling overhead, handles deletes |
| Schema versioning | Custom schema management | Confluent Schema Registry | Version management, compatibility checks, centralized schema storage |
| Avro serialization | Manual Avro encoding | AvroConverter with Schema Registry | Automatic schema registration, schema ID caching, subject naming strategies |
| Delete event handling | Custom tombstone logic | ExtractNewRecordState `delete.handling.mode` | Five modes: drop, tombstone, rewrite, rewrite-with-tombstone, delete-to-tombstone |

**Key insight:** SMTs are designed for simple inline transformations (10-100ms overhead). For complex business logic (joins, aggregations, stateful processing), use Kafka Streams or Flink. The decision point: if transformation requires external service calls or complex state, it doesn't belong in an SMT.

## Common Pitfalls

### Pitfall 1: Debezium 2.0+ Missing Avro Converters
**What goes wrong:** Connector fails with "Class io.confluent.connect.avro.AvroConverter could not be found"
**Why it happens:** Debezium 2.0.0+ removed bundled Confluent dependencies due to licensing
**How to avoid:** Manually install Confluent Avro converter JARs (5 required: kafka-connect-avro-converter, kafka-connect-avro-data, kafka-avro-serializer, kafka-schema-serializer, kafka-schema-registry-client) from Confluent Maven repository into Connect plugin directory
**Warning signs:** Connector startup fails with ClassNotFoundException for io.confluent.connect.avro.AvroConverter

### Pitfall 2: SMT Fails on Non-DML Events
**What goes wrong:** SMT throws NullPointerException or field not found error
**Why it happens:** Heartbeat, tombstone, and schema change events don't have `op`, `before`, or `after` fields
**How to avoid:** Always use predicates to apply SMTs selectively:
```json
"transforms.unwrap.predicate": "IsDataEvent",
"predicates": "IsDataEvent",
"predicates.IsDataEvent.type": "org.apache.kafka.connect.transforms.predicates.TopicNameMatches",
"predicates.IsDataEvent.pattern": "dbserver1.inventory.*"
```
**Warning signs:** Intermittent connector failures, errors mentioning heartbeat or tombstone messages

### Pitfall 3: Outbox Pattern Misunderstood as Distributed Transaction
**What goes wrong:** Developers expect ACID guarantees across microservices
**Why it happens:** Outbox pattern is frequently described as "transactional" but only guarantees atomicity within single database
**How to avoid:** Document clearly: Outbox provides at-least-once delivery and eventual consistency, not distributed ACID. Consumers must handle idempotency (use event ID in message headers for deduplication)
**Warning signs:** Duplicate event processing, expectations of cross-service rollback

### Pitfall 4: Incorrect SMT Chaining Order
**What goes wrong:** Events processed incorrectly or transformations fail
**Why it happens:** SMTs execute in order, each receives output from previous. Flattening before routing loses metadata.
**How to avoid:** Standard order: Filter → Unwrap/Flatten → Route/Transform → Mask. Apply predicates at each stage.
**Warning signs:** Missing fields in routed events, routing logic not working, metadata lost

### Pitfall 5: Schema Evolution Breaking Consumers
**What goes wrong:** Consumer applications fail after producer schema update
**Why it happens:** Incompatible schema changes (removing required field, changing field type) violate compatibility mode
**How to avoid:** Set Schema Registry compatibility mode (BACKWARD default is safest), test schema changes with compatibility API before deployment, understand upgrade order (BACKWARD: upgrade consumers first, FORWARD: upgrade producers first)
**Warning signs:** Consumer deserialization errors after schema update, Schema Registry rejects new schema version

### Pitfall 6: Performance Degradation from Complex SMTs
**What goes wrong:** Connector throughput drops significantly
**Why it happens:** SMTs execute synchronously in Connect worker thread. Complex logic (scripting, external calls) blocks event processing.
**How to avoid:** Profile SMT performance, keep transformations simple (<10ms per record), offload complex logic to Kafka Streams or Flink
**Warning signs:** Increasing connector lag, MilliSecondsBehindSource metric rising, CPU saturation on Connect workers

### Pitfall 7: Outbox Table Growth Without Cleanup
**What goes wrong:** Outbox table grows indefinitely, impacting transaction performance
**Why it happens:** Applications insert into outbox without DELETE, or cleanup strategy missing
**How to avoid:** Two strategies: (1) Application DELETEs outbox record in same transaction (Debezium filters DELETE events by default), (2) External cleanup process (risk: lock contention between inserts/deletes)
**Warning signs:** Outbox table size growing, slow INSERT performance, database disk space alerts

## Code Examples

Verified patterns from official sources:

### Complete Outbox Table Schema
```sql
-- Source: https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html
CREATE TABLE public.outbox (
    id UUID PRIMARY KEY,
    aggregatetype VARCHAR(255) NOT NULL,
    aggregateid VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_outbox_created ON public.outbox(created_at);
```

### Outbox Application Pattern
```sql
-- Source: https://debezium.io/blog/2019/02/19/reliable-microservices-data-exchange-with-the-outbox-pattern/
BEGIN;

-- Business logic update
UPDATE purchase_orders
SET status = 'APPROVED'
WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- Event emission in same transaction
INSERT INTO outbox (id, aggregatetype, aggregateid, type, payload)
VALUES (
    gen_random_uuid(),
    'Order',
    '123e4567-e89b-12d3-a456-426614174000',
    'OrderApproved',
    '{"orderId": "123e4567-e89b-12d3-a456-426614174000", "amount": 299.99}'::jsonb
);

-- Optional: Delete event immediately (Debezium captures INSERT, ignores DELETE)
DELETE FROM outbox WHERE id = '...';

COMMIT;
```

### ExtractNewRecordState with Metadata
```json
// Source: https://debezium.io/documentation/reference/stable/transformations/event-flattening.html
{
  "transforms": "unwrap",
  "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
  "transforms.unwrap.drop.tombstones": "false",
  "transforms.unwrap.delete.handling.mode": "rewrite",
  "transforms.unwrap.add.fields": "op,table,source.ts_ms,source.lsn",
  "transforms.unwrap.add.fields.prefix": "__",
  "transforms.unwrap.add.headers": "db",
  "transforms.unwrap.add.headers.prefix": "source_"
}
```

Result for UPDATE operation:
```json
{
  "id": 123,
  "name": "Updated Name",
  "__op": "u",
  "__table": "customers",
  "__source.ts_ms": 1706745600000,
  "__source.lsn": "0/1A2B3C4D"
}
```

### Predicate with Filter and Route
```json
// Source: https://debezium.io/documentation/reference/stable/transformations/applying-transformations-selectively.html
{
  "transforms": "filter,route",

  "transforms.filter.type": "io.debezium.transforms.Filter",
  "transforms.filter.language": "jsr223.groovy",
  "transforms.filter.condition": "value.after.status == 'ACTIVE'",
  "transforms.filter.predicate": "IsUpdate",

  "transforms.route.type": "io.debezium.transforms.ByLogicalTableRouter",
  "transforms.route.topic.regex": "(.*)customers_(.*)",
  "transforms.route.topic.replacement": "$1customers_all",
  "transforms.route.predicate": "IsCustomerTable",

  "predicates": "IsUpdate,IsCustomerTable",
  "predicates.IsUpdate.type": "org.apache.kafka.connect.transforms.predicates.RecordIsTombstone",
  "predicates.IsUpdate.negate": "true",
  "predicates.IsCustomerTable.type": "org.apache.kafka.connect.transforms.predicates.TopicNameMatches",
  "predicates.IsCustomerTable.pattern": ".*customers.*"
}
```

### Schema Registry Compatibility Mode Configuration
```bash
# Source: https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html

# Set global compatibility mode
curl -X PUT http://localhost:8081/config \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{"compatibility": "BACKWARD"}'

# Set per-subject compatibility mode
curl -X PUT http://localhost:8081/config/dbserver1.inventory.customers-value \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{"compatibility": "FULL"}'

# Test schema compatibility before registration
curl -X POST http://localhost:8081/compatibility/subjects/dbserver1.inventory.customers-value/versions/latest \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{"schema": "{\"type\":\"record\",\"name\":\"Customer\",\"fields\":[{\"name\":\"id\",\"type\":\"int\"},{\"name\":\"name\",\"type\":\"string\"}]}"}'
```

### Consumer Idempotency with Outbox Event ID
```python
# Source: https://debezium.io/blog/2019/02/19/reliable-microservices-data-exchange-with-the-outbox-pattern/
from confluent_kafka import Consumer

consumer = Consumer({'bootstrap.servers': 'kafka:9092', 'group.id': 'order-processor'})
consumer.subscribe(['outbox.event.Order'])

processed_events = set()  # In production: Redis, database, etc.

while True:
    msg = consumer.poll(1.0)
    if msg is None:
        continue

    # Extract event ID from message header
    event_id = None
    for header_key, header_value in msg.headers():
        if header_key == 'id':
            event_id = header_value.decode('utf-8')
            break

    # Idempotency check
    if event_id in processed_events:
        print(f"Skipping duplicate event: {event_id}")
        continue

    # Process event
    process_order_event(msg.value())

    # Mark as processed
    processed_events.add(event_id)
    consumer.commit()
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ComputePartition SMT | PartitionRouting SMT | Debezium 2.5.0 | ComputePartition removed in 2.5.4; use PartitionRouting instead |
| Bundled Confluent converters | Manual Avro converter installation | Debezium 2.0.0 | Licensing separation; requires manual JAR installation |
| Separate delete/tombstone config | Unified `delete.handling.mode` | Debezium 2.5.0 | ExtractNewRecordState simplified with 5 modes instead of 2 configs |
| Outbox polling | CDC-based Outbox Event Router | Debezium 0.9.3 (2019) | Eliminated polling overhead, guaranteed ordering, transactional consistency |
| JSON serialization | Avro with Schema Registry | Standard since 2016 | 2x smaller payloads, 2x faster serialization, schema evolution support |
| Kafka 2.4 and earlier | Kafka 2.6+ for predicates | Kafka 2.6 (2020) | Predicates enable conditional SMT application; required for production SMT chains |

**Deprecated/outdated:**
- **ComputePartition SMT**: Removed in Debezium 2.5.0. Use `io.debezium.transforms.partitions.PartitionRouting` instead.
- **Separate `drop.tombstones` and `drop.deletes` configs**: Merged into single `delete.handling.mode` in ExtractNewRecordState (Debezium 2.5.0).
- **Outbox polling pattern**: Replaced by Outbox Event Router SMT using CDC log (more efficient, guarantees ordering).

**Current (2026) state:**
- Debezium 3.4 is latest (released December 2025), but course uses 2.5.4 for Java 21 ARM64 compatibility
- Debezium 3.x added per-table metrics, improved timezone conversion (ts_ms/ts_us/ts_ns fields eligible)
- Debezium 2.5.4 feature set is stable and production-ready for all Module 4 requirements
- Schema Registry compatibility modes unchanged since initial release (backward/forward/full/none)

## Open Questions

Things that couldn't be fully resolved:

1. **Debezium 3.x migration timeline**
   - What we know: Debezium 3.4 is latest (Dec 2025), includes improved metrics and SMT features
   - What's unclear: When Java 21 ARM64 stability issues will be resolved for course upgrade
   - Recommendation: Mention Debezium 3.x improvements in lessons as "future enhancements" but teach 2.5.4 capabilities

2. **JSR 223 implementation choice (Groovy vs JavaScript vs Go/WASM)**
   - What we know: Filter and ContentBasedRouter SMTs support JSR 223 scripting (Groovy, JS) and Go/WASM
   - What's unclear: Which implementation is most stable for lab environment (Docker-based Debezium Connect)
   - Recommendation: Use Groovy for lab demos (most common in documentation examples), mention JS and Go/WASM as alternatives

3. **Outbox cleanup strategy recommendations**
   - What we know: Two strategies exist: (1) DELETE in same transaction, (2) external cleanup process
   - What's unclear: Which strategy is more production-appropriate for different scales
   - Recommendation: Teach DELETE-in-transaction pattern for course (simpler), mention external cleanup as "high-volume alternative"

4. **Schema Registry subject naming strategy for multi-connector setups**
   - What we know: TopicNameStrategy (default), RecordNameStrategy, TopicRecordNameStrategy available
   - What's unclear: Best practices for complex multi-source CDC pipelines
   - Recommendation: Teach TopicNameStrategy (default) for simplicity, mention RecordNameStrategy for advanced use cases

## Sources

### Primary (HIGH confidence)
- [Debezium Transformations Documentation](https://debezium.io/documentation/reference/stable/transformations/index.html) - Complete SMT reference
- [Outbox Event Router SMT](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html) - Configuration and table schema
- [Avro Serialization with Debezium](https://debezium.io/documentation/reference/stable/configuration/avro.html) - Schema Registry integration
- [ExtractNewRecordState SMT](https://debezium.io/documentation/reference/stable/transformations/event-flattening.html) - Event flattening configuration
- [Message Filtering SMT](https://debezium.io/documentation/reference/stable/transformations/filtering.html) - Filtering with predicates
- [Topic Routing SMT](https://debezium.io/documentation/reference/stable/transformations/topic-routing.html) - ByLogicalTableRouter configuration
- [Content-Based Routing SMT](https://debezium.io/documentation/reference/stable/transformations/content-based-routing.html) - ContentBasedRouter with scripting
- [Applying Transformations Selectively](https://debezium.io/documentation/reference/stable/transformations/applying-transformations-selectively.html) - Predicate patterns
- [Confluent Schema Registry Schema Evolution](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html) - Compatibility modes
- [Confluent MaskField SMT](https://docs.confluent.io/platform/current/connect/transforms/maskfield.html) - PII masking configuration
- [Reliable Microservices Data Exchange With the Outbox Pattern](https://debezium.io/blog/2019/02/19/reliable-microservices-data-exchange-with-the-outbox-pattern/) - Outbox pattern architecture

### Secondary (MEDIUM confidence)
- [Red Hat Debezium 2.5.4 Documentation](https://docs.redhat.com/en/documentation/red_hat_build_of_debezium/2.5.4/html/debezium_user_guide/applying-transformations-to-modify-messages-exchanged-with-kafka) - Enterprise documentation
- [Debezium 2.5 Release Notes](https://debezium.io/releases/2.5/release-notes) - Version-specific features
- [Making Debezium 2.x Support Confluent Schema Registry](https://dev.to/lazypro/making-debezium-2x-support-confluent-schema-registry-3mf2) - Avro converter installation guide
- [Analyzing Schema Registry Performance](https://medium.com/@sercan.celenk/analyzing-schema-registry-performance-in-apache-kafka-a-deep-dive-into-avro-protobuf-and-json-958e6d371760) - Avro vs JSON performance comparison
- [Kafka Connect at Scale: The Hidden Challenges](https://medium.com/@rajkumar.rajaratnam/kafka-connect-at-scale-the-hidden-challenges-44bab174740d) - SMT performance considerations
- [Kafka Avro Subject Naming Strategies](https://ranjeetborate.medium.com/kafka-avro-topic-naming-strategies-in-schema-registry-3d7b2a63f071) - Schema Registry naming patterns

### Tertiary (LOW confidence)
- [Twelve Days of SMT - Day 5: MaskField](https://rmoff.net/2020/12/14/twelve-days-of-smt-day-5-maskfield/) - Community blog post (2020, may be outdated)
- [Twelve Days of SMT - Day 11: Predicate and Filter](https://rmoff.net/2020/12/22/twelve-days-of-smt-day-11-predicate-and-filter/) - Community blog post (2020)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Debezium 2.5.4 and Confluent 7.8.1 versions verified in project .env file, official documentation confirms SMT availability
- Architecture: HIGH - All patterns sourced from official Debezium documentation with verified examples
- Pitfalls: HIGH - Documented in official sources and community discussions, verified against Debezium 2.0+ changelog

**Research date:** 2026-02-01
**Valid until:** 2026-04-01 (60 days - Debezium/Kafka ecosystem is stable, but monitor for Debezium 3.x ARM64 compatibility updates)
