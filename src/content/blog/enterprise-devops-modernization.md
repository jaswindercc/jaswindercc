---
title: "Enterprise Cloud & DevOps Modernization: Migrating to GitHub and Maturing Your DevOps Practice"
date: 2026-04-23
description: "A battle-tested guide to modernizing enterprise DevOps — migrating from legacy SCM to GitHub, building mature CI/CD pipelines, and evolving from 'we do deployments' to a genuine engineering culture."
---

# Enterprise Cloud & DevOps Modernization: Migrating to GitHub and Maturing Your DevOps Practice

Most enterprises in 2026 are somewhere in the middle of their DevOps journey. They've moved past manual server provisioning and FTP deployments. They have CI/CD pipelines. They use some form of infrastructure as code. But "having pipelines" and "having a mature DevOps practice" are very different things.

The telltale signs of an immature DevOps org:

- Deployments still require a "deployment lead" to babysit the process
- The CI pipeline takes 45 minutes and breaks three times a week
- Infrastructure changes go through a ticket queue with a 2-week SLA
- There are 14 Jenkins servers and nobody knows who owns them
- Source code lives across Bitbucket Server, GitLab on-prem, Azure DevOps, and that one team still using SVN
- "DevOps team" is a separate team that engineers throw work over the wall to

If this sounds familiar, this guide is for you. We'll cover the full modernization arc: consolidating source control onto GitHub, building mature CI/CD, adopting platform engineering, and evolving the culture that makes it all stick.

---

## Phase 1: Consolidating on GitHub

### Why GitHub Won

The enterprise SCM debate is effectively over. GitHub has 100M+ developers, the deepest ecosystem, and Copilot. But the real reason enterprises consolidate on GitHub isn't features — it's **developer gravity**. Every engineer you hire already knows GitHub. Every open-source dependency you consume lives on GitHub. Every tool integrates with GitHub first.

The cost of maintaining multiple SCM platforms — Bitbucket Server licenses, GitLab self-hosted infrastructure, Azure DevOps repos that nobody can find — exceeds the cost of migration within 12 months for most enterprises.

### Migration Planning

A large enterprise migration typically involves:

| Source | Typical Scale | Complexity |
|---|---|---|
| Bitbucket Server/Data Center | 500–5,000 repos | Medium — Git-based, clean migration |
| GitLab self-hosted | 200–2,000 repos | Medium — Git-based, CI config needs rewriting |
| Azure DevOps Repos | 300–3,000 repos | Medium — TFVC repos need conversion first |
| SVN | 50–500 repos | High — history conversion, path-based auth mapping |
| TFS (TFVC) | 100–1,000 repos | High — centralized VCS to distributed Git |

### The Migration Toolkit

GitHub provides `gh` CLI and the **GitHub Enterprise Importer (GEI)** for large-scale migrations:

```bash
# Install GitHub Enterprise Importer CLI
gh extension install github/gh-gei

# Migrate from Bitbucket Server
gh gei migrate-repo \
  --bbs-server-url https://bitbucket.corp.internal \
  --bbs-username svc-migration \
  --bbs-shared-home /var/atlassian/application-data/bitbucket/shared \
  --bbs-project PAYMENTS \
  --bbs-repo payment-gateway \
  --github-org enterprise-org \
  --github-repo payment-gateway

# Migrate from Azure DevOps
gh gei migrate-repo \
  --ado-org legacy-ado-org \
  --ado-team-project CoreBanking \
  --ado-repo account-service \
  --github-org enterprise-org \
  --github-repo account-service
```

For SVN and TFVC, convert to Git first:

```bash
# SVN to Git conversion with full history
git svn clone \
  --stdlayout \
  --authors-file=authors.txt \
  https://svn.corp.internal/repos/legacy-app \
  legacy-app-git

cd legacy-app-git

# Clean up SVN metadata and push to GitHub
git remote add origin https://github.com/enterprise-org/legacy-app.git
git push --all origin
git push --tags origin
```

### TFVC to Git: The Hard Migration

TFVC (Team Foundation Version Control) repositories are the hardest to migrate because TFVC is a centralized VCS with fundamentally different concepts — workspaces, shelvesets, and path-based branching don't have Git equivalents.

```bash
# Use git-tfs for TFVC conversion
git tfs clone \
  https://dev.azure.com/legacy-org \
  $/CoreBanking/Main \
  --branches=all \
  --authors=authors.txt \
  core-banking-git

# TFVC branches become Git branches
git tfs branch --init $/CoreBanking/Release/2025
git tfs branch --init $/CoreBanking/Feature/new-payments
```

**Key decision:** Don't migrate all TFVC history. For repos with 10+ years of history, the conversion takes days and produces a bloated Git repo. Migrate the last 2–3 years of history and archive the rest as a read-only snapshot.

### Organizational Structure on GitHub

Map your enterprise structure to GitHub Organizations, Teams, and Repository permissions:

```
Enterprise Account: corp-enterprise
│
├── Organization: corp-platform
│   ├── Team: platform-core (maintain → infra repos)
│   ├── Team: platform-sre (maintain → monitoring repos)
│   └── Team: platform-security (admin → security tooling)
│
├── Organization: corp-banking
│   ├── Team: payments-team (write → payments-*)
│   ├── Team: cards-team (write → cards-*)
│   └── Team: banking-leads (maintain → all repos)
│
└── Organization: corp-data
    ├── Team: data-engineering (write → pipelines-*)
    └── Team: data-science (write → models-*)
```

Use **repository rulesets** (not legacy branch protection) for governance:

```bash
# Create an organization-level ruleset via API
gh api orgs/corp-banking/rulesets \
  --method POST \
  --field name="production-branch-rules" \
  --field target="branch" \
  --field enforcement="active" \
  --field conditions='{"ref_name":{"include":["~DEFAULT_BRANCH","refs/heads/release/*"],"exclude":[]}}' \
  --field rules='[
    {"type":"required_status_checks","parameters":{"required_status_checks":[{"context":"ci/build"},{"context":"ci/test"},{"context":"security/scan"}]}},
    {"type":"pull_request","parameters":{"required_approving_review_count":2,"dismiss_stale_reviews_on_push":true,"require_code_owner_reviews":true}},
    {"type":"required_signatures"},
    {"type":"non_fast_forward"}
  ]' \
  --field bypass_actors='[{"actor_id":1,"actor_type":"OrganizationAdmin","bypass_mode":"always"}]'
```

This ruleset applies across **every repository** in the organization — no more per-repo configuration that drifts over time.

---

## Phase 2: Building Mature CI/CD

### The Maturity Model

| Level | Characteristics | Typical Org |
|---|---|---|
| **Level 0: Manual** | Build on developer machines, deploy via SSH/RDP | Legacy shops |
| **Level 1: Basic CI** | Automated builds on push, manual deployments | Most enterprises start here |
| **Level 2: CD Pipeline** | Automated deployments to staging, manual prod approval | "We have CI/CD" |
| **Level 3: Continuous Delivery** | Automated deployment to prod with gates, rollback capability | Mature teams |
| **Level 4: Continuous Deployment** | Every merged PR deploys to prod automatically, feature flags | Elite performers |
| **Level 5: Progressive Delivery** | Canary deployments, traffic shifting, automated rollback on metrics | Top 5% |

Most enterprises are at Level 2. Getting to Level 3-4 requires structural changes, not just better YAML.

### GitHub Actions: The CI/CD Platform

Replace Jenkins, TeamCity, Bamboo, and whatever else is running on forgotten VMs with GitHub Actions:

```yaml
# .github/workflows/ci-cd.yml — a mature pipeline for a containerized service
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  packages: write
  id-token: write  # For OIDC authentication to cloud providers
  security-events: write

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
      
      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  build-and-push:
    needs: [lint-and-test, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest
      
      - name: Build and push
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy
          aws-region: us-east-1
      
      - name: Deploy to EKS staging
        run: |
          aws eks update-kubeconfig --name eks-staging
          kubectl set image deployment/app \
            app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ needs.build-and-push.outputs.digest }} \
            -n staging
          kubectl rollout status deployment/app -n staging --timeout=300s

  integration-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run integration tests against staging
        run: |
          npm ci
          STAGING_URL=https://staging.api.corp.com npm run test:integration

  deploy-production:
    needs: integration-tests
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy-prod
          aws-region: us-east-1
      
      - name: Deploy canary (10% traffic)
        run: |
          aws eks update-kubeconfig --name eks-production
          kubectl apply -f k8s/canary-deployment.yaml
          sleep 120  # Bake time
      
      - name: Check canary metrics
        run: |
          ERROR_RATE=$(curl -s "https://prometheus.internal/api/v1/query?query=rate(http_requests_total{status=~'5..', deployment='canary'}[2m])" | jq '.data.result[0].value[1]')
          if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
            echo "Canary error rate too high: $ERROR_RATE"
            kubectl rollout undo deployment/app-canary -n production
            exit 1
          fi
      
      - name: Promote to full rollout
        run: |
          kubectl set image deployment/app \
            app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ needs.build-and-push.outputs.digest }} \
            -n production
          kubectl rollout status deployment/app -n production --timeout=600s
```

### Key CI/CD Maturity Practices

#### OIDC Authentication — No Stored Secrets

The biggest CI/CD security improvement: **stop storing cloud credentials as GitHub Secrets.** Use OpenID Connect (OIDC) federation instead:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:enterprise-org/payment-service:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

This IAM trust policy says: "Only the `main` branch of the `payment-service` repo can assume this role." No secrets to rotate, no credentials to leak, and the permissions are scoped to exactly the right repository and branch.

Azure equivalent with Workload Identity Federation:

```bash
# Create federated credential for GitHub Actions
az ad app federated-credential create \
  --id $APP_OBJECT_ID \
  --parameters '{
    "name": "github-actions-main",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:enterprise-org/payment-service:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

#### Reusable Workflows — DRY at Scale

When you have 500+ repositories, you can't maintain 500 separate CI/CD configurations. Use **reusable workflows** stored in a central repository:

```yaml
# .github/workflows/standard-service-ci.yml (in enterprise-org/.github repo)
name: Standard Service CI

on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '22'
      deploy-staging:
        type: boolean
        default: true
    secrets:
      CODECOV_TOKEN:
        required: false

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

Individual repos consume it in 5 lines:

```yaml
# In payment-service/.github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  ci:
    uses: enterprise-org/.github/.github/workflows/standard-service-ci.yml@v2
    with:
      node-version: '22'
```

One change to the reusable workflow updates every consuming repository. This is how you maintain CI/CD standards across hundreds of repos without a "DevOps team" manually updating each one.

---

## Phase 3: Infrastructure as Code Maturity

### The IaC Evolution

| Stage | Tool | Pattern | Problem |
|---|---|---|---|
| **Manual** | AWS Console / Azure Portal | Click-ops | Nothing is reproducible |
| **Scripted** | Bash + AWS CLI / Azure CLI | Imperative scripts | No state management, drift |
| **IaC v1** | Terraform/CloudFormation monolith | Single state file, one repo | Blast radius, slow plans |
| **IaC v2** | Terraform modules + workspaces | Shared modules, separated state | Module versioning pain |
| **IaC v3** | Platform-managed IaC | Self-service modules via internal platform | Where you want to be |

### Terraform at Enterprise Scale

The monolithic Terraform repo is the #1 IaC anti-pattern in enterprises. A single `terraform plan` takes 15 minutes, touches 2,000 resources, and one bad change can take down everything.

**The fix: decompose into layered, independently deployable stacks.**

```
infrastructure/
├── layers/
│   ├── 01-network/           # VPC, subnets, transit gateway
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terragrunt.hcl
│   ├── 02-security/          # IAM roles, KMS keys, security groups
│   │   ├── main.tf
│   │   └── terragrunt.hcl
│   ├── 03-data/              # RDS, ElastiCache, S3 buckets
│   │   ├── main.tf
│   │   └── terragrunt.hcl
│   └── 04-compute/           # EKS, Lambda, ECS
│       ├── main.tf
│       └── terragrunt.hcl
├── modules/
│   ├── vpc/                  # Reusable VPC module
│   ├── eks-cluster/          # Reusable EKS module
│   └── rds-postgres/         # Reusable RDS module
└── terragrunt.hcl            # Root config — backend, provider
```

```hcl
# layers/04-compute/terragrunt.hcl
include "root" {
  path = find_in_parent_folders()
}

dependency "network" {
  config_path = "../01-network"
}

dependency "security" {
  config_path = "../02-security"
}

inputs = {
  vpc_id            = dependency.network.outputs.vpc_id
  private_subnets   = dependency.network.outputs.private_subnet_ids
  node_role_arn     = dependency.security.outputs.eks_node_role_arn
  cluster_version   = "1.31"
}
```

**Terragrunt** manages the dependencies between layers and ensures they're applied in order. Each layer has its own state file, its own plan, and its own blast radius.

### IaC in CI/CD with GitHub Actions

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths: ['infrastructure/**']
  push:
    branches: [main]
    paths: ['infrastructure/**']

jobs:
  plan:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    permissions:
      contents: read
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/terraform-plan
          aws-region: us-east-1
      
      - name: Terraform Plan
        run: |
          cd infrastructure/layers/04-compute
          terraform init
          terraform plan -out=plan.tfplan -no-color 2>&1 | tee plan-output.txt
      
      - name: Post plan to PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const plan = fs.readFileSync('infrastructure/layers/04-compute/plan-output.txt', 'utf8');
            const truncated = plan.length > 60000 ? plan.substring(0, 60000) + '\n... truncated' : plan;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Terraform Plan\n\`\`\`\n${truncated}\n\`\`\``
            });

  apply:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/terraform-apply
          aws-region: us-east-1
      
      - name: Terraform Apply
        run: |
          cd infrastructure/layers/04-compute
          terraform init
          terraform apply -auto-approve
```

**Critical detail:** The role for `terraform plan` on PRs has **read-only** permissions. The role for `terraform apply` on `main` has write permissions and requires a GitHub Environment approval. This prevents a compromised PR from modifying infrastructure.

### Cost Estimation in PRs

Every Terraform PR should show the cost impact before merge:

```yaml
  cost-estimate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Infracost
        uses: infracost/actions/setup@v3
        with:
          api-key: ${{ secrets.INFRACOST_API_KEY }}
      
      - run: |
          infracost breakdown --path infrastructure/layers/04-compute \
            --format json --out-file infracost.json
          infracost comment github \
            --path infracost.json \
            --repo ${{ github.repository }} \
            --pull-request ${{ github.event.pull_request.number }} \
            --behavior update
```

Engineers see "This change adds $340/month" directly on their PR. Cost awareness becomes automatic.

---

## Phase 4: Platform Engineering

### From "DevOps Team" to Platform Team

The biggest cultural shift in DevOps maturity: **dissolve the DevOps team.**

The "DevOps team" anti-pattern creates a bottleneck. Engineering teams throw requests over the wall — "we need a new environment," "can you update our pipeline," "we need access to production." The DevOps team becomes a ticket queue, and the engineers never learn how their infrastructure works.

**Platform engineering** inverts this model. The platform team builds self-service tools and golden paths. Engineering teams consume them directly. No tickets. No waiting.

### The Internal Developer Platform (IDP)

An IDP gives engineers self-service access to infrastructure, environments, and deployments through a standardized interface:

```yaml
# developer-portal/templates/new-service.yaml
# Engineers fill this out to get a fully provisioned service
apiVersion: platform.corp.com/v1
kind: ServiceRequest
metadata:
  name: fraud-detection-v2
spec:
  team: payments-team
  language: python
  framework: fastapi
  
  infrastructure:
    compute: kubernetes  # or lambda, ecs
    database:
      type: postgresql
      size: small  # small=db.t4g.medium, medium=db.r6g.large
    cache:
      type: redis
      size: small
    queue:
      type: sqs
  
  environments:
    - name: dev
      auto_deploy: true
    - name: staging
      auto_deploy: true
    - name: production
      auto_deploy: false  # Requires approval
  
  observability:
    logging: true
    metrics: true
    tracing: true
    alerts:
      - type: error_rate
        threshold: 1%
        channel: "#payments-alerts"
```

When this manifest is submitted (via PR to a platform repo), automation provisions:

- A GitHub repository from a template with CI/CD pre-configured
- Kubernetes namespaces in dev, staging, and prod clusters
- A PostgreSQL database with connection strings in Secrets Manager
- A Redis cache
- An SQS queue
- Grafana dashboards and alert rules
- DNS entries and TLS certificates

The engineer goes from "I have an idea" to "I have a running service with observability" in under 30 minutes. No tickets filed. No meetings scheduled.

### Backstage: The Service Catalog

Spotify's **Backstage** has become the standard internal developer portal. It provides:

- **Service catalog:** Every service, who owns it, its dependencies, its health
- **Software templates:** Scaffolding new services with golden path defaults
- **TechDocs:** Documentation lives with the code and renders in the portal
- **Plugin ecosystem:** Integrate with GitHub, Kubernetes, cloud providers, PagerDuty

```yaml
# catalog-info.yaml — lives in every repo
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payment-gateway
  description: Core payment processing service
  annotations:
    github.com/project-slug: enterprise-org/payment-gateway
    backstage.io/techdocs-ref: dir:.
  tags:
    - python
    - payments
    - tier-1
spec:
  type: service
  lifecycle: production
  owner: team:payments-team
  system: payments-platform
  dependsOn:
    - resource:payments-db
    - component:fraud-service
    - component:ledger-service
  providesApis:
    - payment-api
```

When an incident happens at 3 AM, the on-call engineer opens Backstage, finds the service, sees who owns it, what it depends on, and links to runbooks — all in one place.

---

## Phase 5: Measuring DevOps Maturity

### DORA Metrics

The four DORA (DevOps Research and Assessment) metrics are the industry standard for measuring engineering performance:

| Metric | Elite | High | Medium | Low |
|---|---|---|---|---|
| **Deployment Frequency** | On-demand (multiple/day) | Weekly–monthly | Monthly–quarterly | Quarterly+ |
| **Lead Time for Changes** | <1 hour | 1 day–1 week | 1 week–1 month | 1–6 months |
| **Change Failure Rate** | <5% | 5–10% | 10–15% | >15% |
| **Mean Time to Recovery** | <1 hour | <1 day | 1 day–1 week | 1 week+ |

### Tracking DORA with GitHub

GitHub natively tracks deployment frequency and lead time through **Deployments** and **Actions**:

```bash
# Query deployment frequency via GitHub API
gh api repos/enterprise-org/payment-gateway/deployments \
  --jq '[.[] | select(.environment=="production")] | length' \
  --paginate

# Lead time: time from first commit to production deployment
gh api repos/enterprise-org/payment-gateway/actions/runs \
  --jq '.workflow_runs[] | select(.conclusion=="success" and .name=="Deploy Production") | {created: .created_at, updated: .updated_at}'
```

For a full DORA dashboard, tools like **Sleuth**, **LinearB**, or **Jellyfish** integrate with GitHub and provide automated tracking. Or build your own with GitHub webhooks → EventBridge → Athena → QuickSight.

### The Metrics That Actually Drive Change

DORA metrics tell you **what** your performance is. To improve, you need to measure **why**:

| Diagnostic Metric | What It Reveals | Target |
|---|---|---|
| CI pipeline duration (p95) | Is the pipeline a bottleneck? | <10 minutes |
| PR review wait time (p50) | Is code review blocking delivery? | <4 hours |
| Flaky test rate | Is test instability eroding trust? | <2% |
| Rollback frequency | Are deployments reliable? | <5% of deployments |
| Time to first deploy (new service) | How painful is onboarding? | <1 day |
| Incident-to-postmortem time | Is the learning loop working? | <48 hours |

---

## The Migration Roadmap

### Quarter 1: Foundation

- [ ] Audit all SCM platforms — inventory every repo, owner, and activity level
- [ ] Pilot GitHub migration with 2–3 willing teams (50–100 repos)
- [ ] Set up GitHub Enterprise with SSO (SAML) and SCIM provisioning
- [ ] Establish organization structure, teams, and repository rulesets
- [ ] Deploy GitHub Advanced Security (CodeQL, secret scanning, Dependabot)
- [ ] Build first reusable CI/CD workflow

### Quarter 2: Migration Wave 1

- [ ] Migrate active Bitbucket/GitLab repos (the easy ones — pure Git)
- [ ] Rewrite CI configs from Jenkins/GitLab CI to GitHub Actions
- [ ] Decommission Jenkins servers as repos migrate (celebrate each one)
- [ ] Set up OIDC federation for AWS/Azure — remove stored credentials
- [ ] Implement Terraform PR workflow with plan comments and cost estimation

### Quarter 3: Migration Wave 2 + Platform

- [ ] Convert and migrate TFVC/SVN repos
- [ ] Archive inactive repos (>12 months no commits)
- [ ] Launch Backstage service catalog
- [ ] Build self-service environment provisioning
- [ ] Implement DORA metrics dashboard
- [ ] Begin decommissioning legacy SCM platforms

### Quarter 4: Maturity

- [ ] Achieve >80% repos on GitHub with standardized CI/CD
- [ ] All infrastructure changes through Terraform PRs (no click-ops)
- [ ] Self-service provisioning for new services (<30 min from request to running)
- [ ] DORA metrics at "High" level for pilot teams
- [ ] Full decommission of legacy SCM platforms
- [ ] Platform team operating model established

---

## Common Failures and How to Avoid Them

**"Big Bang" migration.** Migrating 3,000 repos in one weekend. It never works. Migrate in waves, team by team, validating CI/CD at each step.

**Lift-and-shift CI/CD.** Converting a 2,000-line Jenkinsfile into a 2,000-line GitHub Actions workflow. Don't translate — redesign. The old pipeline was probably bad. Use migration as an opportunity to simplify.

**Ignoring the Jenkins plugin problem.** Jenkins pipelines often depend on dozens of plugins (SonarQube, Artifactory, custom notification plugins). Map every plugin dependency before migration and find GitHub Actions equivalents or replacements.

**No deprecation timeline.** If the old platform still works, teams won't migrate. Set a hard decommission date: "Bitbucket Server goes read-only on June 1. Goes offline on August 1." Urgency drives action.

**Over-engineering the platform.** Building a Kubernetes-based self-service platform when your teams just need a better CI pipeline. Start with reusable workflows and gradually add platform capabilities as demand grows. Don't build a platform nobody asked for.

**Forgetting Windows teams.** If you have .NET developers on Windows, their migration experience is different — Visual Studio integration, Windows-based runners, MSBuild pipelines. Don't treat them as an afterthought:

```yaml
# GitHub Actions for .NET on Windows
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0'
      - run: dotnet restore
      - run: dotnet build --no-restore
      - run: dotnet test --no-build --verbosity normal
```

---

## The Bottom Line

Enterprise DevOps modernization isn't a tools problem — it's a systems problem. Migrating to GitHub is the easy part. The hard parts are: convincing 50 teams to abandon their custom Jenkins setups, decomposing monolithic Terraform into manageable layers, building a platform that engineers actually want to use, and shifting the culture from "throw it over the wall to DevOps" to "you build it, you run it."

But the math is clear. Organizations at the DORA "Elite" level deploy 973x more frequently than "Low" performers, with 6,570x faster lead times and 3x lower change failure rates. The gap between mature and immature DevOps isn't incremental — it's exponential.

Start with GitHub. Build the CI/CD golden path. Measure with DORA. Build the platform. And decommission the old stuff before it becomes permanent.
