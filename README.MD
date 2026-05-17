# InsightFlow

AI-powered secure analytics engine that converts natural language into safe SQL queries for e-commerce intelligence.

---

# Overview

InsightFlow allows users to query business data using plain language instead of writing SQL manually.

The platform uses Google Gemini to generate analytical PostgreSQL queries while enforcing a multi-layer security architecture that prevents malicious instructions, unsafe SQL execution, and prompt injection attacks.

---

# Features

- Natural Language → SQL
- Multi-layer AI Security
- Prompt Injection Protection
- SQL Injection Prevention
- Business Insights Generation
- PostgreSQL Analytics Engine
- Dockerized Environment
- Read-Only Query Enforcement
- AI-Powered Query Interpretation
- E-commerce Analytics Focus

---

# Architecture

```text
User Prompt
     ↓
Intent Middleware
     ↓
Gemini AI Service
     ↓
SQL Security Guard
     ↓
AST Validation
     ↓
Database Execution
     ↓
Business Insight Consolidation
     ↓
JSON Response
```

---

# Security System

InsightFlow implements a defense-in-depth security architecture.

## Security Layers

### 1. Intent Middleware

Detects malicious prompts before AI processing.

Blocks:

- Prompt Injection
- SQL Injection
- Destructive Commands
- Jailbreak Attempts

Examples:

```text
DROP TABLE users
DELETE FROM orders
Ignore previous instructions
Bypass security
```

---

### 2. Strict SQL Validation

Only `SELECT` queries are allowed.

Blocked SQL operations:

- INSERT
- UPDATE
- DELETE
- DROP
- ALTER
- TRUNCATE
- GRANT
- REVOKE

---

### 3. AST (Abstract Syntax Tree) Validation

Generated SQL is parsed structurally using:

```js
node - sql - parser;
```

This prevents:

- Hidden malicious instructions
- Nested dangerous statements
- SQL manipulation attacks

---

### 4. Column & Schema Whitelisting

Only approved tables and columns can be accessed.

If the AI generates:

- non-existing columns
- fake aliases
- unauthorized fields

the query is rejected automatically.

---

### 5. Read-Only Database Enforcement

The database layer only executes analytical read operations.

No write operations are ever allowed.

---

### 6. Prompt Hardening

The Gemini system prompt includes:

- strict SQL rules
- schema isolation
- JSON-only responses
- alias restrictions
- forbidden operation constraints

---

### 7. Audit Logging

All suspicious requests are logged for traceability.

Example log:

```json
{
  "status": "blocked",
  "reason": "Prompt Injection Attempt"
}
```

---

# AI Model

Powered by:

- Google Gemini Flash

The AI generates:

- SQL queries
- Business insights
- Analytical summaries

---

# Database Schema

Main analytics table:

```sql
v_analytics_ventas_maestra_fisica_test
```

Columns:

```text
id_interno
order_id
product_id
precio_articulo
costo_envio
monto_total_articulo
categoria_producto
fecha_compra
estado_orden
ciudad_cliente
estado_cliente
```

---

# Tech Stack

## Backend

- Node.js
- Express.js

## AI

- Google Gemini API

## Database

- PostgreSQL
- Supabase

## Security

- node-sql-parser
- Custom Middleware
- AST Validation

## DevOps

- Docker
- Docker Compose

---

# 🐳 Running with Docker

## Build & Start

```bash
docker compose up --build
```

Server:

```text
http://localhost:3000
```

---

# Environment Variables

Create a `.env` file:

```env
GOOGLE_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
PORT=3000
```

---

# API Usage

## Endpoint

```http
POST /api/query
```

## Request

```json
{
  "prompt": "Show the top 5 product categories by revenue"
}
```

## Response

```json
{
  "success": true,
  "metadata": {
    "sql_executed": "SELECT ..."
  },
  "business_insight": "...",
  "results": []
}
```

---

# Security Testing Examples

## Valid Query

```bash
curl -X POST http://localhost:3000/api/query \
-H "Content-Type: application/json" \
-d '{"prompt":"Which states generate the highest revenue?"}'
```

---

## Blocked Injection Attempt

```bash
curl -X POST http://localhost:3000/api/query \
-H "Content-Type: application/json" \
-d '{"prompt":"DROP TABLE users"}'
```

Response:

```json
{
  "error": true,
  "message": "Intent blocked by security"
}
```

---

# Example Analytics Questions

- Which category generates the most revenue?
- What is the average product price per category?
- Which states have the highest sales?
- What are the top-selling products?
- Which orders have the highest shipping costs?

---

# Hackathon Goals

- Secure AI-driven analytics
- Natural language database access
- Enterprise-grade query protection
- Real-time business intelligence
- Safe AI-to-SQL architecture

---

# Team

DevTacOS Hackathon Team

---
