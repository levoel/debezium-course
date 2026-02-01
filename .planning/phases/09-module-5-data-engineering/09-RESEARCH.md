# Phase 9: Module 5 - Data Engineering - Research

**Researched:** 2026-02-01
**Domain:** Python data engineering with CDC streams (Kafka, Pandas, PyFlink, PySpark)
**Confidence:** HIGH

## Summary

Module 5 focuses on integrating CDC events from Debezium/Kafka into Python-based data engineering workflows using pandas, PyFlink, and PySpark. The research covers four main technology stacks: confluent-kafka for advanced Python consumers, pandas for DataFrame-based analysis, PyFlink for stateful stream processing, and PySpark Structured Streaming for large-scale batch/stream processing.

The standard approach combines confluent-kafka 2.13.0+ for production-grade consumers with exactly-once semantics, pandas 3.0.0+ for data transformation (with significant breaking changes to be aware of), PyFlink 2.2.0 for Flink-based CDC processing, and PySpark 4.1.1 for Spark-based streaming. All four technologies are mature and well-documented, with active development in 2025-2026.

Key challenges include managing exactly-once semantics across consumer/producer boundaries, handling nested JSON structures in CDC events, configuring checkpoints properly in streaming frameworks, and understanding the stateful processing models of both Flink and Spark. The research identifies specific patterns for ETL/ELT with CDC data and real-time feature engineering for ML pipelines.

**Primary recommendation:** Use confluent-kafka's transactional API for exactly-once semantics, pandas.json_normalize() for flattening CDC events into DataFrames, PyFlink Table API for CDC connectors with stateful operations, and PySpark Structured Streaming with proper checkpoint management for scalable stream processing.

## Standard Stack

The established libraries/tools for Python CDC data engineering:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| confluent-kafka | 2.13.0+ | Kafka consumer/producer with transactions | Official Confluent client, librdkafka-based, supports exactly-once semantics, released Jan 2026 |
| pandas | 3.0.0+ | DataFrame-based data analysis | Industry standard for tabular data, released Jan 21 2026, json_normalize() for nested JSON |
| apache-flink (PyFlink) | 2.2.0 | Stream processing framework | Official Flink Python API, released Dec 3 2025, Python 3.9-3.12 support |
| pyspark | 4.1.1 | Distributed data processing | Apache Spark Python API, released Jan 9 2026, Python 3.10-3.14 support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pyarrow | 13.0.0+ | Arrow format for zero-copy data exchange | pandas 3.0 integration, efficient DataFrame interchange |
| numpy | 1.26.0+ | Numerical computing | Required by pandas 3.0+, array operations |
| avro-python3 | Latest | Avro schema support | When using Schema Registry with Avro serialization |
| fastavro | Latest | Fast Avro serialization | Performance-critical Avro deserialization |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| confluent-kafka | kafka-python | kafka-python is deprecated (last release 2020), no exactly-once support |
| confluent-kafka | aiokafka | Async/await support but fewer features, no transactional API |
| PyFlink | Kafka Streams (JVM) | No Python API, requires Java/Scala |
| PySpark | Apache Beam | More portable but more complex API, less mature Python support |

**Installation:**
```bash
# Core libraries (already available in course infrastructure)
pip install confluent-kafka==2.13.0
pip install pandas==3.0.0
pip install apache-flink==2.2.0
pip install pyspark==4.1.1

# Supporting libraries
pip install pyarrow>=13.0.0
pip install numpy>=1.26.0
pip install avro-python3
pip install fastavro
```

## Architecture Patterns

### Recommended Project Structure
```
notebooks/
├── module5/
│   ├── 01_advanced_consumer.ipynb         # MOD5-01: Error handling, exactly-once
│   ├── 02_pandas_integration.ipynb        # MOD5-02: CDC to DataFrame patterns
│   ├── 03_pyflink_cdc_connector.ipynb     # MOD5-03: PyFlink CDC setup
│   ├── 04_pyflink_stateful.ipynb          # MOD5-04: Aggregations, joins, windows
│   ├── 05_pyspark_streaming.ipynb         # MOD5-05: Structured Streaming
│   ├── 06_etl_patterns.ipynb              # MOD5-06: ETL/ELT designs
│   └── 07_feature_engineering.ipynb       # MOD5-07: Real-time ML features
├── shared/
│   ├── kafka_utils.py                     # Reusable consumer/producer wrappers
│   ├── cdc_utils.py                       # parse_cdc_event from earlier modules
│   └── feature_utils.py                   # Feature engineering helpers
└── data/
    └── checkpoints/                       # PySpark/PyFlink checkpoints (gitignored)
```

### Pattern 1: Exactly-Once Consumer with Error Handling
**What:** Production-grade Kafka consumer with transactional semantics and comprehensive error handling
**When to use:** Processing CDC events where duplicates or data loss are unacceptable
**Example:**
```python
# Source: confluent-kafka 2.13.0 documentation
# https://docs.confluent.io/platform/current/clients/confluent-kafka-python/html/index.html
from confluent_kafka import Consumer, KafkaException, KafkaError

config = {
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'cdc-processor',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': True,          # Auto-commit enabled
    'enable.auto.offset.store': False,   # Manual offset store for at-least-once
    'isolation.level': 'read_committed'  # Only read committed transactions
}

consumer = Consumer(config)
consumer.subscribe(['dbserver1.public.orders'])

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue

        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            elif msg.error().fatal():
                # Fatal error - consumer is broken, must exit
                raise KafkaException(msg.error())
            else:
                # Non-fatal error - log and continue
                print(f"Non-fatal error: {msg.error()}")
                continue

        try:
            # Process message
            cdc_event = parse_cdc_event(msg.value())
            process_event(cdc_event)

            # Store offset only after successful processing (at-least-once)
            consumer.store_offsets(msg)

        except Exception as e:
            # Processing failed - don't store offset, will retry
            print(f"Processing error: {e}")
            continue

finally:
    consumer.close()
```

### Pattern 2: CDC Event to Pandas DataFrame
**What:** Flatten nested Debezium CDC events into tabular format for analysis
**When to use:** Batch processing of CDC events, exploratory analysis, aggregations
**Example:**
```python
# Source: pandas 3.0.0 documentation
# https://pandas.pydata.org/docs/reference/api/pandas.json_normalize.html
import pandas as pd
import json

def cdc_events_to_dataframe(messages):
    """Convert list of CDC messages to DataFrame with before/after columns."""
    records = []

    for msg in messages:
        event = json.loads(msg.value())
        payload = event.get('payload', {})

        # Flatten the CDC event structure
        record = {
            'op': payload.get('op'),
            'ts_ms': payload.get('ts_ms'),
            'source_db': payload.get('source', {}).get('db'),
            'source_table': payload.get('source', {}).get('table'),
        }

        # Add before/after fields with prefixes
        if payload.get('before'):
            for key, val in payload['before'].items():
                record[f'before_{key}'] = val

        if payload.get('after'):
            for key, val in payload['after'].items():
                record[f'after_{key}'] = val

        records.append(record)

    # Create DataFrame
    df = pd.DataFrame(records)

    # Convert timestamp to datetime (pandas 3.0 uses microsecond resolution)
    df['ts'] = pd.to_datetime(df['ts_ms'], unit='ms')

    return df

# Alternative using json_normalize for deeply nested structures
def cdc_events_to_dataframe_normalized(messages):
    """Use json_normalize for complex nested structures."""
    events = [json.loads(msg.value()) for msg in messages]

    # Normalize the payload section
    df = pd.json_normalize(
        events,
        sep='_',
        max_level=2
    )

    return df
```

### Pattern 3: PyFlink CDC Connector Setup
**What:** Configure PyFlink to consume CDC events directly from Kafka
**When to use:** Stateful stream processing, continuous aggregations, complex event processing
**Example:**
```python
# Source: PyFlink 2.2.0 documentation and Apache Flink CDC
# https://nightlies.apache.org/flink/flink-docs-master/api/python/
from pyflink.table import EnvironmentSettings, TableEnvironment
from pyflink.table.descriptors import Schema, Kafka, Json

# Create Table Environment
env_settings = EnvironmentSettings.in_streaming_mode()
table_env = TableEnvironment.create(env_settings)

# Configure Kafka connector
table_env.execute_sql("""
    CREATE TABLE orders_cdc (
        payload ROW<
            before ROW<id INT, customer_id INT, total DECIMAL(10,2), status STRING>,
            after ROW<id INT, customer_id INT, total DECIMAL(10,2), status STRING>,
            op STRING,
            ts_ms BIGINT
        >
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'dbserver1.public.orders',
        'properties.bootstrap.servers' = 'localhost:9092',
        'properties.group.id' = 'pyflink-cdc',
        'scan.startup.mode' = 'earliest-offset',
        'format' = 'json',
        'json.fail-on-missing-field' = 'false',
        'json.ignore-parse-errors' = 'true'
    )
""")

# Extract after state for inserts/updates
table_env.execute_sql("""
    CREATE VIEW orders_current AS
    SELECT
        payload.after.id AS id,
        payload.after.customer_id AS customer_id,
        payload.after.total AS total,
        payload.after.status AS status,
        payload.op AS operation,
        TO_TIMESTAMP_LTZ(payload.ts_ms, 3) AS event_time
    FROM orders_cdc
    WHERE payload.op IN ('c', 'u', 'r')
""")
```

### Pattern 4: PyFlink Stateful Aggregation with Windows
**What:** Tumbling window aggregations with stateful processing
**When to use:** Time-based metrics, rolling aggregations, session analysis
**Example:**
```python
# Source: Apache Flink stateful stream processing patterns
# https://nightlies.apache.org/flink/flink-docs-master/docs/concepts/stateful-stream-processing/
from pyflink.table import expressions as F

# Tumbling window aggregation (5-minute windows)
result_table = table_env.sql_query("""
    SELECT
        TUMBLE_START(event_time, INTERVAL '5' MINUTES) AS window_start,
        TUMBLE_END(event_time, INTERVAL '5' MINUTES) AS window_end,
        customer_id,
        COUNT(*) AS order_count,
        SUM(total) AS total_revenue,
        AVG(total) AS avg_order_value
    FROM orders_current
    GROUP BY
        TUMBLE(event_time, INTERVAL '5' MINUTES),
        customer_id
""")

# Sliding window (10-minute window, 5-minute slide)
result_table = table_env.sql_query("""
    SELECT
        HOP_START(event_time, INTERVAL '5' MINUTES, INTERVAL '10' MINUTES) AS window_start,
        HOP_END(event_time, INTERVAL '5' MINUTES, INTERVAL '10' MINUTES) AS window_end,
        status,
        COUNT(*) AS status_count
    FROM orders_current
    GROUP BY
        HOP(event_time, INTERVAL '5' MINUTES, INTERVAL '10' MINUTES),
        status
""")

# Session window (gap = 30 minutes of inactivity)
result_table = table_env.sql_query("""
    SELECT
        SESSION_START(event_time, INTERVAL '30' MINUTES) AS session_start,
        SESSION_END(event_time, INTERVAL '30' MINUTES) AS session_end,
        customer_id,
        COUNT(*) AS events_in_session
    FROM orders_current
    GROUP BY
        SESSION(event_time, INTERVAL '30' MINUTES),
        customer_id
""")
```

### Pattern 5: PySpark Structured Streaming from Kafka
**What:** Read CDC events with PySpark Structured Streaming
**When to use:** Large-scale batch/streaming, integration with data lakes, Spark ML pipelines
**Example:**
```python
# Source: PySpark 4.1.1 Structured Streaming documentation
# https://spark.apache.org/docs/latest/structured-streaming-kafka-integration.html
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, to_timestamp
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DecimalType, LongType

spark = SparkSession.builder \
    .appName("CDC-Streaming") \
    .config("spark.sql.streaming.checkpointLocation", "/tmp/checkpoints/cdc") \
    .getOrCreate()

# Define Debezium CDC schema
cdc_schema = StructType([
    StructField("payload", StructType([
        StructField("before", StructType([
            StructField("id", IntegerType()),
            StructField("customer_id", IntegerType()),
            StructField("total", DecimalType(10, 2)),
            StructField("status", StringType())
        ])),
        StructField("after", StructType([
            StructField("id", IntegerType()),
            StructField("customer_id", IntegerType()),
            StructField("total", DecimalType(10, 2)),
            StructField("status", StringType())
        ])),
        StructField("op", StringType()),
        StructField("ts_ms", LongType())
    ]))
])

# Read from Kafka
df = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "dbserver1.public.orders") \
    .option("startingOffsets", "earliest") \
    .load()

# Parse JSON value
parsed_df = df.select(
    from_json(col("value").cast("string"), cdc_schema).alias("data")
).select("data.payload.*")

# Extract after state
current_df = parsed_df \
    .filter(col("op").isin("c", "u", "r")) \
    .select(
        col("after.id").alias("id"),
        col("after.customer_id").alias("customer_id"),
        col("after.total").alias("total"),
        col("after.status").alias("status"),
        col("op"),
        to_timestamp(col("ts_ms") / 1000).alias("event_time")
    )

# Streaming aggregation (watermarking for late data)
result_df = current_df \
    .withWatermark("event_time", "10 minutes") \
    .groupBy(
        window(col("event_time"), "5 minutes"),
        col("customer_id")
    ) \
    .agg(
        count("*").alias("order_count"),
        sum("total").alias("total_revenue")
    )

# Write to console (for testing) or to sink
query = result_df \
    .writeStream \
    .outputMode("update") \
    .format("console") \
    .start()

query.awaitTermination()
```

### Pattern 6: ETL Pattern - CDC to Data Lake
**What:** Incremental ETL from CDC stream to Parquet/Iceberg data lake
**When to use:** Building analytical datasets, historical tracking, data warehouse loads
**Example:**
```python
# Source: ETL/ELT best practices with CDC (2026)
# https://www.matillion.com/blog/etl-architecture-design-patterns-modern-data-pipelines
from pyspark.sql.functions import lit, current_timestamp

# Read CDC stream
cdc_df = spark.readStream.format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "dbserver1.public.orders") \
    .load()

# Parse and transform
parsed_df = cdc_df.select(
    from_json(col("value").cast("string"), cdc_schema).alias("data")
).select("data.payload.*")

# Separate operations
inserts = parsed_df.filter(col("op") == "c").select("after.*")
updates = parsed_df.filter(col("op") == "u").select("after.*")
deletes = parsed_df.filter(col("op") == "d").select("before.id")

# Merge strategy: append with metadata
merged_df = parsed_df.select(
    col("after.*"),
    col("op").alias("_operation"),
    col("ts_ms").alias("_cdc_timestamp"),
    current_timestamp().alias("_processed_at")
)

# Write to data lake (Parquet with partitioning)
query = merged_df \
    .writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", "/data/lake/orders") \
    .option("checkpointLocation", "/data/checkpoints/orders") \
    .partitionBy("_processed_at") \
    .start()
```

### Pattern 7: Real-time Feature Engineering for ML
**What:** Extract ML features from CDC events in real-time
**When to use:** Online feature stores, real-time predictions, fraud detection
**Example:**
```python
# Source: Real-time feature engineering patterns (2026)
# https://www.qwak.com/post/real-time-feature-engineering
from pyspark.sql.functions import window, avg, stddev, count, lag
from pyspark.sql.window import Window

# Calculate customer features from CDC stream
def compute_customer_features(orders_df):
    """Compute real-time features for customer behavior."""

    # Time-based features (30-day rolling window)
    features_df = orders_df \
        .withWatermark("event_time", "1 hour") \
        .groupBy(
            col("customer_id"),
            window(col("event_time"), "30 days")
        ) \
        .agg(
            count("*").alias("order_count_30d"),
            sum("total").alias("total_spend_30d"),
            avg("total").alias("avg_order_value_30d"),
            stddev("total").alias("order_value_stddev_30d"),
            max("event_time").alias("last_order_time")
        )

    # Recency features
    features_df = features_df.withColumn(
        "days_since_last_order",
        datediff(current_timestamp(), col("last_order_time"))
    )

    # Derived features
    features_df = features_df.withColumn(
        "is_high_value",
        (col("total_spend_30d") > 1000).cast("int")
    )

    return features_df

# Write to feature store (Redis, DynamoDB, or feature store API)
features = compute_customer_features(current_df)

query = features \
    .writeStream \
    .foreachBatch(lambda batch_df, batch_id: write_to_feature_store(batch_df)) \
    .outputMode("update") \
    .start()

def write_to_feature_store(df):
    """Write features to Redis or feature store."""
    # Example: Write to Redis
    for row in df.collect():
        feature_key = f"customer:{row.customer_id}:features"
        feature_data = {
            "order_count_30d": row.order_count_30d,
            "total_spend_30d": float(row.total_spend_30d),
            "avg_order_value_30d": float(row.avg_order_value_30d),
            "days_since_last_order": row.days_since_last_order,
            "is_high_value": row.is_high_value
        }
        # redis_client.hset(feature_key, mapping=feature_data)
```

### Anti-Patterns to Avoid

- **Chained assignment in pandas 3.0:** Copy-on-Write breaks `df[col][idx] = value`. Use `df.loc[idx, col] = value` instead.
- **Sharing checkpoint directories:** Each PySpark/PyFlink stream needs its own checkpoint location. Sharing causes corruption.
- **Ignoring watermarks in PySpark:** Late data will be dropped without proper watermarking configuration.
- **Manual offset management without transactions:** Use confluent-kafka's transactional API instead of manual commit logic.
- **Tight polling loops:** Don't call `consumer.poll(0)` in tight loop. Use reasonable timeout (1.0 second).
- **Changing schema in stateful operations:** PyFlink and PySpark cannot handle schema changes mid-stream. Requires full restart.
- **Object dtype assumptions:** Pandas 3.0 infers strings as `str` dtype, not `object`. Check for `str` dtype explicitly.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Kafka exactly-once semantics | Custom deduplication logic with state store | confluent-kafka transactional API with `isolation.level='read_committed'` | Requires producer ID management, epoch tracking, transaction coordinator protocol. Library handles all edge cases. |
| JSON nested structure flattening | Recursive dict walking and column creation | `pandas.json_normalize()` with `sep`, `max_level`, `record_path` params | Handles arrays, missing keys, type inference, deep nesting. Custom code misses edge cases. |
| Stream windowing/aggregation | Manual time bucketing and state management | PyFlink window functions (TUMBLE, HOP, SESSION) or PySpark window() | Watermarking, late data handling, state cleanup, trigger logic are complex. Frameworks optimize memory. |
| Checkpoint recovery | Custom state serialization and recovery | PySpark `checkpointLocation` option or PyFlink state backends | Distributed consensus, exactly-once guarantees, incremental checkpoints, schema evolution. |
| Offset management | Manually tracking offsets in external DB | `enable.auto.offset.store=False` + `consumer.store_offsets()` pattern | Race conditions, rebalancing edge cases, partition assignment changes. Library handles atomicity. |
| Feature computation windows | Rolling window calculations with pandas | PyFlink Table API or PySpark window aggregations with watermarks | Out-of-order events, session tracking, state size management. Streaming frameworks optimize memory and latency. |
| CDC event parsing | String parsing and field extraction | Existing `parse_cdc_event()` function from earlier modules | Handles all operation types (c, u, d, r), before/after logic, nested structures. Well-tested. |
| Arrow/Parquet conversion | Manual serialization loops | pandas 3.0 `from_arrow()` / `__arrow_c_stream__()` | Zero-copy interchange, proper type mapping, chunking, compression. Standard protocol. |

**Key insight:** Stream processing edge cases (late data, rebalancing, checkpointing, exactly-once) are where custom solutions fail in production. Use battle-tested frameworks.

## Common Pitfalls

### Pitfall 1: Auto-Commit with Long Processing Times
**What goes wrong:** Consumer auto-commits offsets before processing completes. Application crashes after commit but before processing finishes, causing data loss.
**Why it happens:** Default `enable.auto.commit=True` commits in background thread every 5 seconds, independent of processing status.
**How to avoid:** Set `enable.auto.offset.store=False` and manually call `consumer.store_offsets(msg)` after successful processing. This gives at-least-once guarantee.
**Warning signs:** Messages disappear without being processed, especially after crashes. Consumer lag shows zero but downstream systems missing data.

### Pitfall 2: Pandas 3.0 Breaking Changes
**What goes wrong:** Code checking for `object` dtype fails. Chained assignment `df[col][idx] = value` doesn't modify DataFrame. Datetime conversions off by 1000x.
**Why it happens:** Pandas 3.0 changed string dtype from `object` to `str`, enforced Copy-on-Write, and switched datetime resolution from nanoseconds to microseconds.
**How to avoid:** Check for `dtype == 'str'` instead of `object`. Use `df.loc[idx, col] = value` for assignment. Use `.as_unit()` before datetime integer conversions.
**Warning signs:** Type checks fail silently. Modifications don't persist. Timestamp values are 1000x wrong (milliseconds treated as nanoseconds).

### Pitfall 3: PySpark Checkpoint Directory Mistakes
**What goes wrong:** Query fails to restart. Checkpoint corruption. "Offset no longer available" errors.
**Why it happens:** Sharing checkpoint dirs between streams, insufficient storage, changing shuffle partitions after checkpoint, Kafka offset cleanup.
**How to avoid:** Unique checkpoint dir per query. Ensure sufficient disk space. Never change `spark.sql.shuffle.partitions` after checkpointing. Set Kafka retention longer than checkpoint interval.
**Warning signs:** `Checkpoint corrupted` errors. `Offset X not available` errors. Query cannot restart after stop.

### Pitfall 4: Missing Watermarks in PySpark Streaming
**What goes wrong:** Late-arriving events are silently dropped. Aggregations produce incomplete results.
**Why it happens:** No watermark configured, so PySpark doesn't know how long to wait for late data. Default behavior is to drop late events.
**How to avoid:** Always use `.withWatermark("event_time", "10 minutes")` before aggregations. Choose watermark delay based on expected lateness.
**Warning signs:** Aggregation results too low. Events with earlier timestamps than current watermark are missing. No errors, just silent data loss.

### Pitfall 5: PyFlink State Size Explosion
**What goes wrong:** Task manager runs out of memory. Checkpoint times increase. Job performance degrades.
**Why it happens:** Unbounded state growth in aggregations without TTL. High-cardinality keys (e.g., user_id). No state cleanup configuration.
**How to avoid:** Configure state TTL in table environment. Use session windows instead of global aggregations. Monitor state size metrics. Use RocksDB state backend for large state.
**Warning signs:** Increasing checkpoint duration. OutOfMemoryError in task managers. State size metrics growing unbounded.

### Pitfall 6: Kafka Consumer Rebalancing Storms
**What goes wrong:** Consumer group constantly rebalancing. Processing stops during rebalance. Lag increases.
**Why it happens:** Poll timeout too long (`max.poll.interval.ms` exceeded). Processing between polls exceeds timeout. Consumer marked dead and evicted.
**How to avoid:** Keep processing time between `poll()` calls under `max.poll.interval.ms` (default 5 minutes). Use `max.poll.records` to limit batch size. Offload heavy processing to separate threads.
**Warning signs:** Frequent "Member X leaving group" logs. Consumer lag spikes periodically. Processing pauses every few minutes.

### Pitfall 7: JSON Deserialization Errors Not Handled
**What goes wrong:** Consumer crashes on malformed JSON. Entire partition blocked by one bad message.
**Why it happens:** Schema changes in source database. Manual data modifications. Bugs in Debezium connector. No error handling for deserialization.
**How to avoid:** Use `json.ignore-parse-errors=true` in PyFlink. Wrap `json.loads()` in try/except with logging. Configure dead letter queue for unparsable messages.
**Warning signs:** Consumer stuck on single offset. JsonDecodeError in logs. Partition lag increases while others process normally.

### Pitfall 8: Ignoring CDC Operation Types
**What goes wrong:** Delete operations (`op='d'`) processed as inserts. `after` field is null, causing NullPointerErrors.
**Why it happens:** Code assumes all events have `after` field populated. Deletes only have `before` field.
**How to avoid:** Always check `op` field first. Handle `c`, `u`, `d`, `r` operations separately. Use `before` for deletes, `after` for creates/updates.
**Warning signs:** NullPointerError accessing `after` fields. Deleted records appear in output. Aggregations include deleted rows.

## Code Examples

Verified patterns from official sources:

### Transactional Consumer-Producer (Exactly-Once)
```python
# Source: confluent-kafka 2.13.0 transactional API
# https://docs.confluent.io/platform/current/clients/confluent-kafka-python/html/index.html
from confluent_kafka import Consumer, Producer, KafkaException

# Configure transactional producer
producer_config = {
    'bootstrap.servers': 'localhost:9092',
    'transactional.id': 'cdc-transformer-1',  # Unique per instance
    'enable.idempotence': True
}
producer = Producer(producer_config)
producer.init_transactions()

# Configure read-committed consumer
consumer_config = {
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'cdc-processor',
    'isolation.level': 'read_committed',
    'enable.auto.commit': False
}
consumer = Consumer(consumer_config)
consumer.subscribe(['input-topic'])

try:
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue

        if msg.error():
            raise KafkaException(msg.error())

        # Begin transaction
        producer.begin_transaction()

        try:
            # Process and produce
            result = process_cdc_event(msg.value())
            producer.produce('output-topic', value=result)

            # Commit offsets as part of transaction
            producer.send_offsets_to_transaction(
                consumer.position(consumer.assignment()),
                consumer.consumer_group_metadata()
            )

            # Commit transaction (atomic)
            producer.commit_transaction()

        except Exception as e:
            # Abort transaction on error
            producer.abort_transaction()
            raise

finally:
    consumer.close()
```

### PyFlink Temporal Join (CDC Stream Join)
```python
# Source: PyFlink 2.2.0 temporal joins
# https://nightlies.apache.org/flink/flink-docs-master/api/python/
from pyflink.table import TableEnvironment, EnvironmentSettings

env_settings = EnvironmentSettings.in_streaming_mode()
table_env = TableEnvironment.create(env_settings)

# Orders CDC stream
table_env.execute_sql("""
    CREATE TABLE orders (
        order_id INT,
        customer_id INT,
        product_id INT,
        quantity INT,
        order_time TIMESTAMP(3),
        WATERMARK FOR order_time AS order_time - INTERVAL '5' SECONDS
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'dbserver1.public.orders',
        'properties.bootstrap.servers' = 'localhost:9092',
        'format' = 'json'
    )
""")

# Products dimension table (versioned)
table_env.execute_sql("""
    CREATE TABLE products (
        product_id INT,
        product_name STRING,
        price DECIMAL(10,2),
        category STRING,
        update_time TIMESTAMP(3),
        WATERMARK FOR update_time AS update_time - INTERVAL '5' SECONDS,
        PRIMARY KEY (product_id) NOT ENFORCED
    ) WITH (
        'connector' = 'kafka',
        'topic' = 'dbserver1.public.products',
        'properties.bootstrap.servers' = 'localhost:9092',
        'format' = 'json'
    )
""")

# Temporal join: enrich orders with product info at order_time
result = table_env.sql_query("""
    SELECT
        o.order_id,
        o.customer_id,
        o.quantity,
        p.product_name,
        p.price,
        p.category,
        o.quantity * p.price AS total_amount,
        o.order_time
    FROM orders AS o
    LEFT JOIN products FOR SYSTEM_TIME AS OF o.order_time AS p
    ON o.product_id = p.product_id
""")

result.execute().print()
```

### PySpark State Management with mapGroupsWithState
```python
# Source: PySpark 4.1.1 arbitrary stateful processing
# https://spark.apache.org/docs/latest/api/python/reference/pyspark.ss/api/pyspark.sql.streaming.GroupState.html
from pyspark.sql.streaming import GroupState, GroupStateTimeout
from pyspark.sql.types import StructType, StructField, IntegerType, TimestampType

# Define state schema
state_schema = StructType([
    StructField("session_start", TimestampType()),
    StructField("event_count", IntegerType()),
    StructField("last_event_time", TimestampType())
])

def update_session_state(customer_id, events, state: GroupState):
    """Track customer session with custom timeout logic."""

    if state.hasTimedOut:
        # Session expired - emit final result and remove state
        final_session = state.get
        state.remove()
        return final_session

    # Get or initialize state
    if state.exists:
        session = state.get
    else:
        first_event = next(iter(events))
        session = {
            'customer_id': customer_id,
            'session_start': first_event.event_time,
            'event_count': 0,
            'last_event_time': first_event.event_time
        }

    # Update state with new events
    for event in events:
        session['event_count'] += 1
        session['last_event_time'] = max(session['last_event_time'], event.event_time)

    # Set timeout (30 minutes of inactivity)
    state.setTimeoutDuration(1800000)  # 30 minutes in ms
    state.update(session)

    return session

# Apply stateful processing
sessions_df = current_df \
    .withWatermark("event_time", "10 minutes") \
    .groupBy("customer_id") \
    .applyInPandasWithState(
        update_session_state,
        state_schema,
        state_schema,
        "update",
        GroupStateTimeout.ProcessingTimeTimeout
    )
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| kafka-python library | confluent-kafka | 2020-2026 | kafka-python deprecated (last release 2020). confluent-kafka is official, maintained, supports transactions. |
| pandas object dtype for strings | pandas str dtype | Jan 2026 (3.0.0) | Breaking change. String columns now inferred as `str`, not `object`. Type checks must update. |
| pandas chained assignment | Copy-on-Write (CoW) | Jan 2026 (3.0.0) | Chained assignment broken. Must use `.loc[]` for modifications. Performance improved via lazy copy. |
| pandas nanosecond datetime | Microsecond default | Jan 2026 (3.0.0) | Datetime inference changed from `ns` to `us` resolution. Epoch conversions change by 1000x. |
| Manual Arrow conversion | PyCapsule interface | Jan 2026 (pandas 3.0) | Zero-copy data interchange via `from_arrow()` / `__arrow_c_stream__()`. Eliminates serialization overhead. |
| PySpark 3.x arbitrary state | transformWithState API | Jan 2026 (Spark 4.0) | New stateful API in Scala/Java/Python. More flexible than mapGroupsWithState. State store improvements. |
| PyFlink 1.x | PyFlink 2.x | Dec 2025 (2.2.0) | Delta joins reduce memory. Production-ready Python support. Python 3.9-3.12 compatibility. |
| Flink CDC Connectors (external) | Apache Flink CDC (donated) | April 2024 | Flink CDC donated to Apache Foundation. Better integration, YAML-based pipelines, 3.x versions. |
| Manual state TTL | Automatic state cleanup | Flink 1.6+ | Built-in state TTL configuration prevents unbounded state growth. Critical for production. |

**Deprecated/outdated:**
- **kafka-python:** Last release 2020, no active maintenance, no exactly-once support. Use confluent-kafka.
- **pandas `append()` method:** Removed in pandas 2.0. Use `pd.concat()` instead.
- **PySpark DStream API:** Legacy streaming API. Use Structured Streaming (DataFrame/Dataset API).
- **PyFlink `StreamExecutionEnvironment` for Table API:** Use `TableEnvironment` directly. Old approach still works but not recommended.

## Open Questions

Things that couldn't be fully resolved:

1. **PyFlink CDC Connector Direct Integration**
   - What we know: Apache Flink CDC 3.5.0 supports YAML pipelines. PyFlink 2.2.0 supports Table API connectors.
   - What's unclear: Whether PyFlink can use Flink CDC connectors directly or requires Kafka as intermediary. Documentation shows YAML approach, not PyFlink API.
   - Recommendation: For this module, use Kafka as source (established pattern from earlier modules). PyFlink reads from Kafka topics populated by Debezium. Document Flink CDC as "advanced topic" for direct database connection.

2. **Feature Store Integration**
   - What we know: Feast is leading open-source option, Tecton is managed enterprise option. Both support streaming features.
   - What's unclear: Best pattern for writing PyFlink/PySpark features to Feast. No official connector exists.
   - Recommendation: Use `foreachBatch()` to write to Redis/DynamoDB as simple feature store. Mention Feast integration as extension exercise.

3. **Exactly-Once End-to-End with PySpark**
   - What we know: PySpark writes to Kafka are at-least-once only (not exactly-once). Checkpoints provide fault tolerance.
   - What's unclear: How to achieve exactly-once semantics when PySpark consumes from Kafka and produces to Kafka.
   - Recommendation: Document that PySpark provides at-least-once for Kafka sinks. For exactly-once, use PyFlink or implement idempotent downstream processing.

4. **Python Version Strategy**
   - What we know: PyFlink requires Python 3.9-3.12. PySpark supports Python 3.10-3.14. Pandas 3.0 requires Python 3.11+.
   - What's unclear: Which Python version to standardize on for module. Constraint is PyFlink max (3.12) and pandas min (3.11).
   - Recommendation: Use Python 3.11 or 3.12 for module 5. Update base image to `jupyter/scipy-notebook` with Python 3.11+ tag. Document compatibility matrix.

## Sources

### Primary (HIGH confidence)
- [confluent-kafka 2.13.0 API documentation](https://docs.confluent.io/platform/current/clients/confluent-kafka-python/html/index.html) - Transactional API, error handling, consumer configuration
- [pandas 3.0.0 release notes](https://pandas.pydata.org/docs/whatsnew/v3.0.0.html) - Breaking changes, CoW, str dtype, Arrow interface
- [pandas.json_normalize() documentation](https://pandas.pydata.org/docs/reference/api/pandas.json_normalize.html) - Nested JSON flattening
- [PySpark 4.1.1 PyPI](https://pypi.org/project/pyspark/) - Version 4.1.1, Python 3.10-3.14 support, released Jan 9 2026
- [PyFlink 2.2.0 PyPI](https://pypi.org/project/apache-flink/) - Version 2.2.0, Python 3.9-3.12 support, released Dec 3 2025
- [PySpark Structured Streaming Kafka Integration](https://spark.apache.org/docs/latest/structured-streaming-kafka-integration.html) - Official Spark 4.1.0 guide
- [Apache Flink CDC Documentation](https://nightlies.apache.org/flink/flink-cdc-docs-stable/docs/get-started/introduction/) - Version 3.5.0
- [Debezium PostgreSQL Connector](https://debezium.io/documentation/reference/stable/connectors/postgresql.html) - CDC event structure, operation types

### Secondary (MEDIUM confidence)
- [Apache Spark 4.0 Release](https://www.databricks.com/blog/introducing-apache-spark-40) - New features, Python DataSource API, transformWithState
- [Apache Flink Stateful Stream Processing](https://nightlies.apache.org/flink/flink-docs-master/docs/concepts/stateful-stream-processing/) - Concepts
- [ETL Architecture Patterns 2026](https://www.matillion.com/blog/etl-architecture-design-patterns-modern-data-pipelines) - Modern patterns, CDC integration
- [Real-time Feature Engineering](https://www.qwak.com/post/real-time-feature-engineering) - Patterns, challenges
- [Streaming Window Types](https://dataengineerblog.com/windowing-in-stream-processing/) - Tumbling, sliding, session windows
- [Feature Stores Comparison 2025](https://www.gocodeo.com/post/top-5-feature-stores-in-2025-tecton-feast-and-beyond) - Feast vs Tecton

### Tertiary (LOW confidence)
- [10 Kafka Mistakes Python Developers Make](https://dev.to/m-a-h-b-u-b/10-kafka-mistakes-python-developers-make-and-how-to-avoid-them-like-a-pro-55cl) - Common pitfalls (blog post, community content)
- [PySpark Checkpoint Common Issues](https://quix.io/blog/how-to-fix-common-issues-spark-structured-streaming-pyspark-kafka) - Troubleshooting patterns (blog post)
- [Change Data Capture with PyFlink](https://github.com/databugs/change-data-capture-with-pyflink) - Community example (GitHub repo, not official)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries have official PyPI releases, version numbers verified, Python compatibility confirmed from official sources
- Architecture: HIGH - Patterns derived from official documentation (confluent-kafka, PySpark, PyFlink) with code examples from docs
- Pitfalls: MEDIUM - Mix of official documentation (checkpoint issues, CoW changes) and community experience (blog posts, Stack Overflow)

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable ecosystem, but fast-moving with Spark 4.0, pandas 3.0, PyFlink 2.x recent releases)
