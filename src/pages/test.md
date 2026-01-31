---
title: Syntax Highlighting Test
---

# Syntax Highlighting Test

This page tests Shiki syntax highlighting for all supported languages.

## Python

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

## YAML

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: debezium
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
```

## SQL

```sql
SELECT
    u.id,
    u.name,
    COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5;
```

## JSON

```json
{
  "name": "debezium-course",
  "version": "1.0.0",
  "dependencies": {
    "astro": "^5.17.1",
    "react": "^19.2.4"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build"
  }
}
```

## JavaScript

```javascript
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

## TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}
```

## Java

```java
public class DebeziumConnector {
    private final String connectorName;

    public DebeziumConnector(String name) {
        this.connectorName = name;
    }

    public void start() {
        System.out.println("Starting connector: " + connectorName);
    }
}
```

## Bash

```bash
#!/bin/bash
set -e

echo "Starting Debezium setup..."
docker-compose up -d postgres
sleep 5
docker-compose up -d kafka
```

## Dockerfile

```dockerfile
FROM postgres:15

ENV POSTGRES_USER=debezium
ENV POSTGRES_PASSWORD=secret

RUN apt-get update && \
    apt-get install -y postgresql-15-wal2json && \
    rm -rf /var/lib/apt/lists/*

COPY init.sql /docker-entrypoint-initdb.d/
```
