---
title: "Retail Banking API Integration Architecture: Building for Scale, Security, and Compliance"
date: 2026-04-23
description: "How modern retail banks design API integration architectures that handle millions of transactions, satisfy regulators, and still ship features fast — covering Open Banking, event-driven patterns, and real production topologies on AWS and Azure."
---

# Retail Banking API Integration Architecture: Building for Scale, Security, and Compliance

Every retail bank in 2026 is an API company whether it wants to be or not. Open Banking mandates in the UK, EU, Australia, Canada, and now the US have forced banks to expose customer data and payment initiation through standardized APIs. Fintechs are building on top of those APIs faster than banks can ship internal features. And internally, the monolithic core banking systems that ran unchallenged for 30 years are being strangled — one API at a time — into something that can actually evolve.

The architecture that connects all of this together is the most critical piece of infrastructure a retail bank owns. Get it wrong and you're looking at failed payments, regulatory fines, data breaches, and a fintech competitor eating your lunch while you're stuck in a 6-month release cycle.

This guide covers what a production-grade retail banking API integration architecture actually looks like — the topology, the patterns, the security model, and the operational reality.

---

## The Problem Space

A mid-size retail bank in 2026 typically has:

- **1 or 2 core banking systems** (Temenos, FIS, Finastra, or a mainframe running COBOL)
- **15–30 internal microservices** (payments, cards, loans, KYC, fraud)
- **5–10 third-party integrations** (credit bureaus, payment networks, card processors, identity providers)
- **Open Banking APIs** exposing account data and payment initiation to licensed third parties
- **Mobile and web channels** consuming internal APIs
- **Partner APIs** for embedded finance (BNPL, insurance, wealth management)

That's 50+ integration points. Without a deliberate architecture, you get spaghetti — point-to-point connections between systems, duplicated authentication logic, inconsistent error handling, and no observability into what's actually happening.

---

## The Integration Architecture: Three Layers

A well-designed banking API architecture has three distinct layers:

```
┌─────────────────────────────────────────────────────┐
│                  External Consumers                   │
│    (TPPs, Fintechs, Partners, Mobile/Web Apps)       │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              API Gateway Layer                        │
│   (Rate limiting, AuthN/AuthZ, TLS termination,      │
│    request routing, Open Banking compliance)          │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│           Integration / Orchestration Layer           │
│   (Event bus, saga orchestration, transformation,     │
│    anti-corruption layers, circuit breakers)          │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Backend Services Layer                    │
│   (Core banking, payments engine, fraud detection,    │
│    card management, KYC, ledger)                     │
└──────────────────────────────────────────────────────┘
```

Let's break down each layer.

---

## Layer 1: The API Gateway

The gateway is the front door. Every external and internal API call passes through it. In banking, the gateway does more work than in a typical SaaS company because of regulatory requirements.

### What the Gateway Handles

| Responsibility | Why It Matters in Banking |
|---|---|
| mTLS termination | Open Banking requires mutual TLS with TPP certificates |
| OAuth 2.0 / FAPI enforcement | Financial-grade API security profiles are mandatory |
| Rate limiting per client | Prevents a single TPP from overwhelming your systems |
| Request/response logging | Regulatory audit trail — every API call must be traceable |
| Consent validation | PSD2/CDR requires checking customer consent before data access |
| IP allowlisting | Some payment network APIs only accept traffic from known IPs |
| Payload validation | Reject malformed requests before they hit backend services |

### AWS Implementation

```yaml
# API Gateway with WAF and mutual TLS
Resources:
  BankingApiGateway:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      Name: retail-banking-api
      ProtocolType: HTTP
      DisableExecuteApiEndpoint: true

  CustomDomain:
    Type: AWS::ApiGatewayV2::DomainName
    Properties:
      DomainName: api.bank.com
      DomainNameConfigurations:
        - CertificateArn: !Ref TlsCert
          SecurityPolicy: TLS_1_2
      MutualTlsAuthentication:
        TruststoreUri: s3://banking-certs/truststore.pem

  WafAssociation:
    Type: AWS::WAFv2::WebACLAssociation
    Properties:
      ResourceArn: !GetAtt BankingApiGateway.Arn
      WebACLArn: !Ref BankingWaf
```

For high-throughput banking workloads, many banks front API Gateway with a **Network Load Balancer** to handle connection pooling and TCP-level DDoS absorption.

### Azure Implementation

```bash
# Azure API Management — the de facto choice for Azure-first banks
az apim create \
  --name apim-retail-banking \
  --resource-group rg-banking-prod \
  --publisher-name "Retail Bank" \
  --publisher-email api@bank.com \
  --sku-name Premium \
  --virtual-network-type Internal

# Enable mutual TLS
az apim update \
  --name apim-retail-banking \
  --resource-group rg-banking-prod \
  --set hostnameConfigurations[0].negotiateClientCertificate=true
```

Azure API Management (APIM) in **Internal VNet mode** is the standard for banks on Azure. It sits inside your VNet with no public exposure, fronted by an Application Gateway with WAF v2 for external traffic.

### Open Banking: FAPI Compliance

Financial-grade APIs (FAPI) are a security profile on top of OAuth 2.0 that's required for Open Banking. The key requirements:

- **PKCE (Proof Key for Code Exchange)** — prevents authorization code interception
- **PAR (Pushed Authorization Requests)** — authorization parameters are sent server-to-server, not in the browser URL
- **JARM (JWT Secured Authorization Response Mode)** — authorization responses are signed JWTs
- **Client authentication via private_key_jwt** — no shared secrets

```python
# FAPI-compliant token endpoint validation
from jose import jwt, JWTError

def validate_client_assertion(assertion: str, expected_issuer: str):
    """Validate private_key_jwt client authentication per FAPI."""
    try:
        # Fetch the TPP's JWKS from the Open Banking Directory
        jwks = fetch_jwks(expected_issuer)
        
        claims = jwt.decode(
            assertion,
            jwks,
            algorithms=["PS256"],  # FAPI requires PS256 or ES256
            audience="https://api.bank.com/token",
            issuer=expected_issuer,
        )
        
        # FAPI: jti must be unique (replay protection)
        if is_jti_replayed(claims["jti"]):
            raise ValueError("Replayed client assertion")
        
        # FAPI: exp must be short-lived (< 5 minutes)
        mark_jti_used(claims["jti"], claims["exp"])
        
        return claims["sub"]  # client_id
    except JWTError as e:
        raise AuthenticationError(f"Invalid client assertion: {e}")
```

Most banks don't build this themselves — they use **ForgeRock**, **Ping Identity**, or **Curity** as their authorization server, which handles FAPI compliance out of the box. These sit behind the API gateway and handle the OAuth/OIDC flows.

---

## Layer 2: Integration and Orchestration

This is where the real architectural decisions live. The integration layer connects the API gateway to backend services and handles the messy reality of distributed banking transactions.

### The Event-Driven Backbone

Synchronous request-response works for simple reads (check balance, get transaction history). But banking operations that span multiple systems — payment processing, loan origination, account opening — need an **event-driven architecture**.

```
Payment Request → API Gateway → Payment Service
                                      │
                                      ├──► Event: PaymentInitiated
                                      │         │
                                      │         ├──► Fraud Service (check)
                                      │         ├──► AML Service (check)
                                      │         └──► Balance Service (hold)
                                      │
                                      ├──► Event: PaymentApproved
                                      │         │
                                      │         ├──► Core Banking (debit)
                                      │         ├──► Card Processor (if card)
                                      │         └──► Notification Service
                                      │
                                      └──► Event: PaymentCompleted
                                                │
                                                ├──► Ledger (record)
                                                └──► Reporting (async)
```

**AWS — Amazon EventBridge + SQS:**

```python
import boto3
import json
from datetime import datetime, timezone

eventbridge = boto3.client("events")

def publish_payment_event(payment_id: str, event_type: str, payload: dict):
    eventbridge.put_events(
        Entries=[{
            "Source": "banking.payments",
            "DetailType": event_type,
            "Detail": json.dumps({
                "payment_id": payment_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "version": "2.0",
                **payload,
            }),
            "EventBusName": "banking-events",
        }]
    )

# Route events to consumers
# EventBridge Rule: PaymentInitiated → Fraud SQS Queue
# EventBridge Rule: PaymentInitiated → AML SQS Queue
# EventBridge Rule: PaymentInitiated → Balance SQS Queue
```

**Azure — Event Grid + Service Bus:**

```python
from azure.eventgrid import EventGridPublisherClient
from azure.core.credentials import AzureKeyCredential
from datetime import datetime, timezone
import uuid

client = EventGridPublisherClient(
    endpoint="https://banking-events.eastus-1.eventgrid.azure.net",
    credential=AzureKeyCredential(key),
)

def publish_payment_event(payment_id: str, event_type: str, payload: dict):
    client.send([{
        "id": str(uuid.uuid4()),
        "subject": f"payments/{payment_id}",
        "event_type": f"Banking.Payments.{event_type}",
        "data": {
            "payment_id": payment_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **payload,
        },
        "event_time": datetime.now(timezone.utc),
        "data_version": "2.0",
    }])
```

### The Saga Pattern: Distributed Transactions

Banking operations that span multiple services need transactional guarantees. But distributed transactions (2PC) are brittle and don't scale. The **Saga pattern** implements long-running transactions as a sequence of local transactions with compensating actions.

**Example: Payment Processing Saga**

```python
# AWS Step Functions state machine for payment saga
PAYMENT_SAGA = {
    "Comment": "Payment processing saga with compensations",
    "StartAt": "FraudCheck",
    "States": {
        "FraudCheck": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:fraud-check",
            "Next": "AmlCheck",
            "Catch": [{
                "ErrorEquals": ["FraudDetected"],
                "Next": "RejectPayment"
            }],
            "TimeoutSeconds": 10
        },
        "AmlCheck": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:aml-check",
            "Next": "HoldBalance",
            "Catch": [{
                "ErrorEquals": ["AmlFlagged"],
                "Next": "RejectPayment"
            }],
            "TimeoutSeconds": 15
        },
        "HoldBalance": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:hold-balance",
            "Next": "ExecutePayment",
            "Catch": [{
                "ErrorEquals": ["InsufficientFunds"],
                "Next": "RejectPayment"
            }]
        },
        "ExecutePayment": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:execute-payment",
            "Next": "PaymentSucceeded",
            "Catch": [{
                "ErrorEquals": ["States.ALL"],
                "Next": "ReleaseHold"
            }]
        },
        "ReleaseHold": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:release-hold",
            "Comment": "Compensating action — release the balance hold",
            "Next": "RejectPayment"
        },
        "PaymentSucceeded": {
            "Type": "Succeed"
        },
        "RejectPayment": {
            "Type": "Fail",
            "Error": "PaymentRejected",
            "Cause": "Payment failed fraud, AML, balance, or execution check"
        }
    }
}
```

The critical detail: **every forward action has a compensating action.** If `ExecutePayment` fails after `HoldBalance` succeeds, the saga automatically runs `ReleaseHold` to undo the balance reservation. Without this, you get ghost holds that lock up customer funds.

### Anti-Corruption Layer: Talking to Core Banking

Core banking systems speak their own language — ISO 8583 for card transactions, proprietary SOAP/XML for account operations, fixed-width flat files for batch processing. Modern APIs speak JSON/REST or gRPC.

The **Anti-Corruption Layer (ACL)** translates between these worlds:

```python
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime

@dataclass
class PaymentRequest:
    """Modern API payment model."""
    payment_id: str
    from_account: str
    to_account: str
    amount: Decimal
    currency: str
    reference: str

def to_core_banking_format(payment: PaymentRequest) -> str:
    """Transform modern API request into core banking wire format."""
    # Core banking expects fixed-width fields
    return (
        f"TXN"
        f"{payment.from_account:>20}"
        f"{payment.to_account:>20}"
        f"{int(payment.amount * 100):>012}"  # Amount in cents, right-justified
        f"{payment.currency:3}"
        f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        f"{payment.reference:>35}"
    )

def from_core_banking_response(raw: str) -> dict:
    """Parse core banking response into modern API format."""
    return {
        "status": "COMPLETED" if raw[0:2] == "00" else "FAILED",
        "core_reference": raw[2:20].strip(),
        "timestamp": raw[20:34],
        "error_code": raw[0:2] if raw[0:2] != "00" else None,
    }
```

The ACL is the only place that knows about core banking's data formats. Every other service works with clean, modern domain objects. When the bank eventually replaces or upgrades the core system, only the ACL changes.

### Circuit Breakers: Surviving Downstream Failures

In banking, downstream systems fail regularly — the card processor has maintenance windows, the credit bureau rate-limits you, the core banking system slows down during batch processing. Without circuit breakers, a single slow dependency cascades into system-wide failure.

```python
import time
from enum import Enum
from threading import Lock

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 30.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = CircuitState.CLOSED
        self._lock = Lock()

    def call(self, func, *args, **kwargs):
        with self._lock:
            if self.state == CircuitState.OPEN:
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                else:
                    raise CircuitOpenError("Circuit is open — downstream unavailable")

        try:
            result = func(*args, **kwargs)
            with self._lock:
                self.failure_count = 0
                self.state = CircuitState.CLOSED
            return result
        except Exception as e:
            with self._lock:
                self.failure_count += 1
                self.last_failure_time = time.time()
                if self.failure_count >= self.failure_threshold:
                    self.state = CircuitState.OPEN
            raise

# Usage
core_banking_circuit = CircuitBreaker(failure_threshold=3, recovery_timeout=60)

def debit_account(account_id: str, amount: Decimal):
    return core_banking_circuit.call(
        core_banking_client.debit, account_id, amount
    )
```

When the circuit opens, the payment service can immediately return a "try again later" response instead of hanging for 30 seconds waiting for a timeout. This protects the customer experience and prevents thread pool exhaustion.

---

## Layer 3: Backend Services

The backend layer contains the actual banking logic. In a modern architecture, these are domain-driven microservices, each owning its data store.

### Service Boundaries

| Service | Responsibility | Data Store | Event Produces |
|---|---|---|---|
| **Account Service** | Account lifecycle, balances, statements | PostgreSQL (ACID) | AccountOpened, BalanceUpdated |
| **Payment Service** | Payment initiation, routing, status | PostgreSQL + Redis | PaymentInitiated, PaymentCompleted |
| **Fraud Service** | Real-time transaction scoring | Redis + ML model store | FraudFlagged, FraudCleared |
| **KYC Service** | Identity verification, document checks | PostgreSQL + S3/Blob | KycCompleted, KycFailed |
| **Card Service** | Card issuance, activation, controls | PostgreSQL | CardIssued, CardBlocked |
| **Notification Service** | Email, SMS, push notifications | DynamoDB/CosmosDB | NotificationSent |
| **Ledger Service** | Double-entry bookkeeping, reconciliation | PostgreSQL (strict ACID) | EntryRecorded |

### The Ledger: The Most Important Service

Every banking transaction must be recorded in a double-entry ledger. This is non-negotiable for regulatory compliance and reconciliation.

```sql
-- Double-entry ledger schema
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    account_id VARCHAR(34) NOT NULL,
    entry_type VARCHAR(6) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount BIGINT NOT NULL CHECK (amount > 0),  -- Store in minor units (cents)
    currency CHAR(3) NOT NULL,
    balance_after BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Every transaction MUST have balanced debits and credits
CREATE OR REPLACE FUNCTION verify_balanced_transaction(txn_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    debit_sum BIGINT;
    credit_sum BIGINT;
BEGIN
    SELECT
        COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount END), 0)
    INTO debit_sum, credit_sum
    FROM ledger_entries
    WHERE transaction_id = txn_id;
    
    RETURN debit_sum = credit_sum;
END;
$$ LANGUAGE plpgsql;

-- Index for fast account statement queries
CREATE INDEX idx_ledger_account_time 
ON ledger_entries (account_id, created_at DESC);
```

**Critical rule:** All amounts are stored as integers in minor units (cents, pence). Never use floating-point for money. `$19.99` is stored as `1999`. This eliminates an entire class of rounding errors that will cause reconciliation failures.

---

## Security Architecture

Banking API security goes far beyond TLS and OAuth. Here's the full defense model.

### API-Level Security Controls

```yaml
# Rate limiting tiers per client type
rate_limits:
  open_banking_tpp:
    requests_per_second: 50
    burst: 100
    daily_limit: 500000
  
  internal_mobile_app:
    requests_per_second: 200
    burst: 500
    daily_limit: null  # No daily limit for first-party
  
  partner_embedded_finance:
    requests_per_second: 100
    burst: 200
    daily_limit: 1000000
```

### Data Masking and Tokenization

Account numbers, card numbers, and PII must never appear in logs, error messages, or API responses to unauthorized parties:

```python
import re
from functools import lru_cache

def mask_pan(card_number: str) -> str:
    """Mask card number — show only last 4 digits."""
    cleaned = re.sub(r'\D', '', card_number)
    return f"{'*' * (len(cleaned) - 4)}{cleaned[-4:]}"

def mask_iban(iban: str) -> str:
    """Mask IBAN — show country + check digits + last 4."""
    return f"{iban[:4]}{'*' * (len(iban) - 8)}{iban[-4:]}"

def mask_response(response: dict) -> dict:
    """Sanitize API response before logging."""
    sensitive_fields = {
        "account_number": mask_iban,
        "card_number": mask_pan,
        "sort_code": lambda x: "***",
        "date_of_birth": lambda x: "****-**-**",
        "national_id": lambda x: f"***{x[-3:]}",
    }
    masked = response.copy()
    for field, masker in sensitive_fields.items():
        if field in masked:
            masked[field] = masker(masked[field])
    return masked
```

### Idempotency: Preventing Double Payments

Network failures, retries, and timeouts mean payment requests can arrive more than once. Without idempotency, a customer gets charged twice.

```python
import hashlib
import redis

r = redis.Redis(host="redis-payments", port=6379, db=0)
IDEMPOTENCY_TTL = 86400  # 24 hours

def check_idempotency(idempotency_key: str) -> dict | None:
    """Check if this request has already been processed."""
    cached = r.get(f"idemp:{idempotency_key}")
    if cached:
        return json.loads(cached)
    return None

def store_idempotency(idempotency_key: str, response: dict):
    """Store the response for a processed request."""
    r.setex(
        f"idemp:{idempotency_key}",
        IDEMPOTENCY_TTL,
        json.dumps(response),
    )

# In the payment endpoint
def process_payment(request):
    idemp_key = request.headers.get("Idempotency-Key")
    if not idemp_key:
        return error_response(400, "Idempotency-Key header required")
    
    existing = check_idempotency(idemp_key)
    if existing:
        return existing  # Return the same response — no double processing
    
    result = execute_payment(request.body)
    store_idempotency(idemp_key, result)
    return result
```

Every payment API must require an `Idempotency-Key` header. This is non-optional. Banks that skip this learn the hard way when a mobile app retry causes a double direct debit.

---

## Observability for Banking APIs

Banking observability has unique requirements: **you need to prove** to auditors that every transaction was processed correctly, that SLAs were met, and that no data was exposed.

### The Four Signals

```yaml
# OpenTelemetry configuration for banking API services
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 5s
  
  # CRITICAL: Scrub PII from traces before export
  attributes:
    actions:
      - key: http.request.body
        action: delete
      - key: account_number
        action: hash  # Hash, don't delete — preserves correlation

exporters:
  otlphttp:
    endpoint: https://otel-collector.internal:4318

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [attributes, batch]
      exporters: [otlphttp]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp]
```

### Business Metrics That Matter

Technical metrics (p99 latency, error rate) aren't enough for banking. Track these:

| Metric | Target | Alert Threshold |
|---|---|---|
| Payment success rate | >99.5% | <99.0% |
| Payment end-to-end latency (p95) | <3s | >5s |
| Open Banking API availability | 99.9% | <99.5% (regulatory SLA) |
| Fraud detection latency | <500ms | >1s |
| Consent API response time | <1s | >2s |
| Failed transaction reconciliation rate | 100% within 1hr | Any unreconciled after 2hr |

```python
from prometheus_client import Counter, Histogram

payment_total = Counter(
    "banking_payments_total",
    "Total payment attempts",
    ["payment_type", "status", "currency"],
)

payment_latency = Histogram(
    "banking_payment_duration_seconds",
    "Payment processing duration",
    ["payment_type"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 3.0, 5.0, 10.0, 30.0],
)

reconciliation_lag = Histogram(
    "banking_reconciliation_lag_seconds",
    "Time between transaction and reconciliation",
    ["source_system"],
    buckets=[60, 300, 600, 1800, 3600, 7200],
)
```

---

## Deployment Topology

### Multi-Region Active-Active

Banking APIs cannot have single points of failure. The standard topology is active-active across two regions:

**AWS:**

```
Region: us-east-1 (Primary)          Region: us-west-2 (Secondary)
┌──────────────────────┐             ┌──────────────────────┐
│  Route 53 (Latency)  │◄───────────►│  Route 53 (Latency)  │
│  ALB + WAF           │             │  ALB + WAF           │
│  EKS Cluster         │             │  EKS Cluster         │
│  Aurora Global (RW)  │──replicate──►│  Aurora Global (RO)  │
│  ElastiCache         │             │  ElastiCache         │
│  EventBridge         │──replicate──►│  EventBridge         │
└──────────────────────┘             └──────────────────────┘
```

**Azure:**

```
Region: East US (Primary)             Region: West US (Secondary)
┌──────────────────────┐             ┌──────────────────────┐
│  Front Door + WAF    │◄───────────►│  Front Door + WAF    │
│  AKS Cluster         │             │  AKS Cluster         │
│  Azure SQL (Geo-Rep) │──replicate──►│  Azure SQL (Geo-Rep) │
│  Redis Cache         │             │  Redis Cache         │
│  Service Bus         │──geo-DR─────►│  Service Bus         │
└──────────────────────┘             └──────────────────────┘
```

The database is the hard part. **Aurora Global Database** and **Azure SQL Geo-Replication** both provide async replication with sub-second lag. Writes go to the primary region; reads can go to either. On failover, the secondary promotes to read-write automatically.

### Disaster Recovery: RPO and RTO

Banking regulators require documented RPO (Recovery Point Objective) and RTO (Recovery Time Objective):

| Tier | Workload | RPO | RTO | Strategy |
|---|---|---|---|---|
| Tier 1 | Payments, Core Banking API | 0 (zero data loss) | <5 minutes | Active-active, synchronous replication |
| Tier 2 | Account Queries, Statements | <1 minute | <15 minutes | Active-passive, async replication |
| Tier 3 | Reporting, Analytics | <1 hour | <4 hours | Backup + restore |
| Tier 4 | Internal Tools | <24 hours | <24 hours | Cross-region backup |

---

## Compliance as Code

In banking, compliance isn't a checkbox — it's continuous. Every API change must be validated against regulatory requirements automatically.

```yaml
# Open Policy Agent (OPA) — enforce banking API policies
package banking.api

# Every API must have rate limiting configured
deny[msg] {
  input.kind == "Ingress"
  not input.metadata.annotations["nginx.ingress.kubernetes.io/limit-rps"]
  msg := "API ingress must have rate limiting configured"
}

# No API endpoint may return raw account numbers
deny[msg] {
  input.kind == "APISchema"
  some path
  input.spec.paths[path].responses["200"].schema.properties["account_number"]
  not input.spec.paths[path].responses["200"].schema.properties["account_number"]["x-masked"]
  msg := sprintf("Endpoint %v must mask account_number field", [path])
}

# All payment endpoints require idempotency key
deny[msg] {
  input.kind == "APISchema"
  some path
  contains(path, "/payments")
  input.spec.paths[path].post
  not input.spec.paths[path].post.parameters[_].name == "Idempotency-Key"
  msg := sprintf("Payment endpoint %v must require Idempotency-Key header", [path])
}
```

Run OPA checks in CI/CD. No API change merges without passing compliance validation.

---

## The Production Stack

| Layer | AWS | Azure |
|---|---|---|
| **API Gateway** | API Gateway + NLB | API Management (Internal VNet) |
| **WAF** | AWS WAF v2 | Azure Front Door + WAF v2 |
| **Identity/OAuth** | Cognito or ForgeRock | Entra ID or ForgeRock |
| **Event Bus** | EventBridge + SQS | Event Grid + Service Bus |
| **Orchestration** | Step Functions | Durable Functions |
| **Compute** | EKS (Fargate) | AKS |
| **Primary Database** | Aurora PostgreSQL Global | Azure SQL Hyperscale Geo-Rep |
| **Cache** | ElastiCache Redis | Azure Cache for Redis |
| **Secrets** | Secrets Manager + KMS | Key Vault |
| **Observability** | CloudWatch + X-Ray | Azure Monitor + App Insights |
| **Policy Enforcement** | OPA + Config Rules | OPA + Azure Policy |
| **Ledger** | QLDB or Aurora | Azure SQL (strict mode) |

---

## The Bottom Line

Retail banking API architecture isn't just software architecture — it's **risk architecture**. Every design decision has regulatory, financial, and reputational implications. A dropped payment is a customer complaint. A double payment is a regulatory finding. A data breach is an existential threat.

The banks that are winning in 2026 aren't the ones with the most APIs. They're the ones with the cleanest integration layers — event-driven, saga-orchestrated, circuit-broken, and observable top to bottom. They treat their API platform as a product, not a project, and they invest in the boring fundamentals: idempotency, ledger integrity, masking, and compliance-as-code.

Build the architecture right, and you have a platform that ships features fast, passes audits easily, and survives failures gracefully. Build it wrong, and you're one retry storm away from the front page of the Financial Times.
