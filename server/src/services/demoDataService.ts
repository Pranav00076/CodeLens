import { RepoAnalysis } from '../types/index.js';

export const DEMO_FILES: Record<string, string> = {
  'README.md': `# ShopSphere Cloud 🛍️
Enterprise Modern E-Commerce Platform with Microservices Architecture.

## Architecture
- **Web App**: React 18, TypeScript, Tailwind CSS, Zustand
- **API Gateway**: Express, Rate Limiting, JWT Verification
- **Auth Service**: User credentials, Argon2 hashing, Redis session cache
- **Order Service**: Checkout flow, Stripe payment integration, Event emitting
- **Product Catalog**: Full-text search, inventory tracking, PostgreSQL + Prisma

## Quick Start
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start infrastructure (PostgreSQL & Redis)
docker-compose up -d

# 3. Run database migrations
npx prisma migrate dev

# 4. Start all services
npm run dev
\`\`\`
`,

  'docker-compose.yml': `version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: shopsphere
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: shopsphere_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
`,

  'services/api-gateway/src/index.ts': `import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Proxy routes to downstream microservices
app.use('/api/v1/auth', createProxyMiddleware({ target: 'http://localhost:4001', changeOrigin: true }));
app.use('/api/v1/products', createProxyMiddleware({ target: 'http://localhost:4002', changeOrigin: true }));
app.use('/api/v1/orders', authMiddleware, createProxyMiddleware({ target: 'http://localhost:4003', changeOrigin: true }));

app.listen(PORT, () => {
  console.log(\`🚀 API Gateway listening on port \${PORT}\`);
});
`,

  'services/api-gateway/src/middleware/auth.ts': `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// SECURITY ISSUE: Fallback to weak hardcoded secret in production!
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-12345';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
`,

  'services/order-service/src/services/paymentWebhook.ts': `import { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { eventBus } from '../lib/eventBus.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16',
});

// BUG ISSUE: Missing try/catch and unhandled promise rejection if order is not found
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    // Potential unhandled exception if order doesn't exist
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paymentId: paymentIntent.id },
    });

    // Emits order paid event for inventory reduction
    eventBus.publish('order.paid', { orderId: order.id, customerEmail: order.customerEmail });
  }

  res.json({ received: true });
}
`,

  'services/product-catalog/src/controllers/productController.ts': `import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// PERFORMANCE ISSUE: N+1 query bug inside loop instead of batch query or Prisma include
export async function getProductsWithReviews(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      take: 50,
    });

    // N+1 Query: Iterating over 50 products and performing individual DB queries
    const results = [];
    for (const product of products) {
      const reviews = await prisma.review.findMany({
        where: { productId: product.id },
      });
      const avgRating = reviews.length > 0 
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
        : 0;

      results.push({
        ...product,
        reviewsCount: reviews.length,
        averageRating: avgRating,
      });
    }

    return res.json({ products: results });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
}
`,

  'services/order-service/src/services/orderProcessor.ts': `import { prisma } from '../lib/prisma.js';

// COMPLEXITY / SMELL: God function with cyclomatic complexity 24, mixing tax calculation, inventory, discount, notifications
export class OrderProcessor {
  async processCheckout(userId: string, items: any[], discountCode?: string, shippingMethod?: string) {
    let subtotal = 0;
    for (const item of items) {
      const prod = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!prod || prod.stock < item.quantity) {
        throw new Error(\`Insufficient stock for \${item.productId}\`);
      }
      subtotal += prod.price * item.quantity;
    }

    let discount = 0;
    if (discountCode) {
      if (discountCode === 'SUMMER20') discount = subtotal * 0.2;
      else if (discountCode === 'VIP50') discount = subtotal * 0.5;
      else if (discountCode === 'FLAT10') discount = 10;
    }

    let shippingCost = 5.99;
    if (shippingMethod === 'EXPRESS') shippingCost = 19.99;
    if (shippingMethod === 'OVERNIGHT') shippingCost = 39.99;
    if (subtotal > 100) shippingCost = 0;

    const tax = (subtotal - discount) * 0.0825;
    const total = subtotal - discount + shippingCost + tax;

    const order = await prisma.order.create({
      data: {
        userId,
        subtotal,
        discount,
        shippingCost,
        tax,
        total,
        status: 'PENDING',
        items: {
          create: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        },
      },
    });

    return order;
  }
}
`,

  'apps/web/src/App.tsx': `import React from 'react';
import { ProductGrid } from './components/ProductGrid';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { useCartStore } from './store/cartStore';

export function App() {
  const { isCartOpen } = useCartStore();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Discover Curated Products</h1>
        <ProductGrid />
      </main>
      {isCartOpen && <CartDrawer />}
    </div>
  );
}
`,

  'packages/database/prisma/schema.prisma': `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      String   @default("CUSTOMER")
  createdAt DateTime @default(now())
  orders    Order[]
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String
  price       Float
  stock       Int
  active      Boolean  @default(true)
  reviews     Review[]
  orderItems  OrderItem[]
}

model Order {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  total       Float
  status      String      @default("PENDING")
  paymentId   String?
  items       OrderItem[]
  createdAt   DateTime    @default(now())
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
}

model Review {
  id        String  @id @default(uuid())
  productId String
  product   Product @relation(fields: [productId], references: [id])
  rating    Int
  comment   String
}
`
};

export class DemoDataService {
  static getDemoAnalysis(): RepoAnalysis {
    return {
      id: 'demo-shopsphere-microservices',
      name: 'ShopSphere / CloudPulse-ECommerce',
      source: 'demo',
      url: 'https://github.com/shopsphere/enterprise-cloud',
      branch: 'main',
      analyzedAt: new Date().toISOString(),
      summary: 'Enterprise full-stack microservices e-commerce platform built with React 18, Node.js/Express, Fastify, Prisma, PostgreSQL, and Stripe integration. Features decentralized services, event-driven ordering, and session caching with Redis.',
      stats: {
        totalFiles: 42,
        totalLines: 3840,
        totalSizeKB: 248,
        languageCounts: {
          'TypeScript': 26,
          'TypeScript (React)': 8,
          'JSON': 4,
          'SQL': 2,
          'YAML': 2,
        },
        frameworkCounts: {
          'React': 1,
          'Express': 1,
          'Fastify': 1,
          'Prisma': 1,
          'PostgreSQL': 1,
          'Tailwind CSS': 1,
          'Docker': 1,
          'Jest': 1,
        },
        healthScore: 84,
      },
      languages: [
        { name: 'TypeScript', percentage: 68, fileCount: 26, color: '#3178C6' },
        { name: 'TypeScript (React)', percentage: 22, fileCount: 8, color: '#3178C6' },
        { name: 'YAML', percentage: 5, fileCount: 2, color: '#CB171E' },
        { name: 'JSON', percentage: 3, fileCount: 4, color: '#292929' },
        { name: 'SQL', percentage: 2, fileCount: 2, color: '#E38C00' },
      ],
      frameworks: [
        { name: 'React', category: 'frontend', description: 'Declarative component UI library for the web storefront' },
        { name: 'Express', category: 'backend', description: 'Microservices router & API Gateway routing layer' },
        { name: 'Fastify', category: 'backend', description: 'High-throughput product catalog search service' },
        { name: 'Prisma', category: 'orm', description: 'Type-safe PostgreSQL ORM models & database client' },
        { name: 'PostgreSQL', category: 'database', description: 'Primary relational persistent store' },
        { name: 'Tailwind CSS', category: 'styling', description: 'Modern utility styling engine' },
        { name: 'Docker', category: 'devops', description: 'Containerized local database & caching orchestration' },
        { name: 'Jest', category: 'testing', description: 'Unit and integration test runner' },
      ],
      entryPoints: [
        { path: 'services/api-gateway/src/index.ts', type: 'api_entry', description: 'API Gateway reverse-proxy and centralized authentication entry point' },
        { path: 'apps/web/src/App.tsx', type: 'web_entry', description: 'Customer web storefront root React application' },
        { path: 'services/order-service/src/services/orderProcessor.ts', type: 'worker', description: 'Checkout & payment processing business engine' },
        { path: 'packages/database/prisma/schema.prisma', type: 'config', description: 'Centralized database entities & relationship schema' },
        { path: 'docker-compose.yml', type: 'config', description: 'Local Docker development infrastructure definition' },
      ],
      architecture: {
        pattern: 'Microservices & Event-Driven Architecture',
        overview: 'ShopSphere decouples frontend clients, API ingress, user authentication, catalog management, and payment processing into dedicated TypeScript microservices communicating via HTTP proxies and asynchronous event messages.',
        dataFlow: 'Client requests hit the API Gateway (port 4000) -> Gateway verifies JWT with Auth Service -> Forwards request to Product or Order service -> Services query PostgreSQL through Prisma ORM and emit events on state change.',
        layers: [
          {
            name: 'Client Presentation Layer',
            purpose: 'React single-page application with responsive catalogue, instant cart management, and checkout UI',
            files: ['apps/web/src/App.tsx', 'apps/web/src/components/ProductGrid.tsx', 'apps/web/src/store/cartStore.ts'],
          },
          {
            name: 'API Gateway & Ingress Layer',
            purpose: 'Reverse proxy, JWT token verification, global rate limiting, and request routing',
            files: ['services/api-gateway/src/index.ts', 'services/api-gateway/src/middleware/auth.ts', 'services/api-gateway/src/middleware/rateLimiter.ts'],
          },
          {
            name: 'Business Services Layer',
            purpose: 'Auth verification, Product catalog caching, Order state transitions, and Stripe payment webhook handling',
            files: ['services/order-service/src/services/orderProcessor.ts', 'services/order-service/src/services/paymentWebhook.ts', 'services/product-catalog/src/controllers/productController.ts'],
          },
          {
            name: 'Data & Persistence Layer',
            purpose: 'PostgreSQL relational tables, Prisma client schemas, and Redis session memory store',
            files: ['packages/database/prisma/schema.prisma', 'docker-compose.yml'],
          }
        ],
        diagramNodes: [
          { id: 'web', label: 'Web Storefront (React)', type: 'frontend', description: 'Customer-facing modern storefront with shopping cart and catalogue', files: ['apps/web/src/App.tsx'], tech: 'React 18' },
          { id: 'gateway', label: 'API Gateway (Port 4000)', type: 'api', description: 'Central ingress, rate limiting, and route dispatcher', files: ['services/api-gateway/src/index.ts'], tech: 'Express' },
          { id: 'auth', label: 'Auth Service (Port 4001)', type: 'service', description: 'JWT authentication, Argon2 password hashing & session management', files: ['services/api-gateway/src/middleware/auth.ts'], tech: 'Express / JWT' },
          { id: 'catalog', label: 'Product Catalog (Port 4002)', type: 'service', description: 'Product listings, ratings, inventory count and category search', files: ['services/product-catalog/src/controllers/productController.ts'], tech: 'Fastify' },
          { id: 'order', label: 'Order & Checkout (Port 4003)', type: 'service', description: 'Checkout validation, discount calculation, Stripe webhooks', files: ['services/order-service/src/services/orderProcessor.ts'], tech: 'Express' },
          { id: 'db', label: 'PostgreSQL Database', type: 'database', description: 'Persistent relational storage for Users, Products, Orders and Reviews', files: ['packages/database/prisma/schema.prisma'], tech: 'PostgreSQL 15' },
          { id: 'stripe', label: 'Stripe Payment Gateway', type: 'external', description: 'External credit card processing and asynchronous webhook alerts', files: ['services/order-service/src/services/paymentWebhook.ts'], tech: 'Stripe API' },
          { id: 'redis', label: 'Redis Cache & Events', type: 'worker', description: 'In-memory token caching and inter-service pub/sub messaging', files: ['docker-compose.yml'], tech: 'Redis 7' },
        ],
        diagramEdges: [
          { from: 'web', to: 'gateway', label: 'HTTPS / JSON API', flowType: 'call' },
          { from: 'gateway', to: 'auth', label: 'Verify Token', flowType: 'call' },
          { from: 'gateway', to: 'catalog', label: 'Proxy /products', flowType: 'call' },
          { from: 'gateway', to: 'order', label: 'Proxy /orders', flowType: 'call' },
          { from: 'catalog', to: 'db', label: 'Prisma Queries', flowType: 'data' },
          { from: 'order', to: 'db', label: 'Create Orders & Read Stock', flowType: 'data' },
          { from: 'order', to: 'stripe', label: 'Payment Intents & Webhooks', flowType: 'call' },
          { from: 'order', to: 'redis', label: 'Publish order.paid Event', flowType: 'event' },
          { from: 'auth', to: 'redis', label: 'Cache Sessions', flowType: 'data' },
        ]
      },
      fileTree: {
        name: 'ShopSphere',
        path: '/',
        type: 'dir',
        children: [
          {
            name: 'apps',
            path: 'apps',
            type: 'dir',
            children: [
              {
                name: 'web',
                path: 'apps/web',
                type: 'dir',
                children: [
                  {
                    name: 'src',
                    path: 'apps/web/src',
                    type: 'dir',
                    children: [
                      { name: 'App.tsx', path: 'apps/web/src/App.tsx', type: 'file', lines: 22, language: 'TypeScript (React)' },
                      { name: 'main.tsx', path: 'apps/web/src/main.tsx', type: 'file', lines: 14, language: 'TypeScript (React)' },
                    ]
                  },
                  { name: 'package.json', path: 'apps/web/package.json', type: 'file', lines: 28, language: 'JSON' },
                ]
              }
            ]
          },
          {
            name: 'services',
            path: 'services',
            type: 'dir',
            children: [
              {
                name: 'api-gateway',
                path: 'services/api-gateway',
                type: 'dir',
                children: [
                  {
                    name: 'src',
                    path: 'services/api-gateway/src',
                    type: 'dir',
                    children: [
                      { name: 'index.ts', path: 'services/api-gateway/src/index.ts', type: 'file', lines: 24, language: 'TypeScript' },
                      {
                        name: 'middleware',
                        path: 'services/api-gateway/src/middleware',
                        type: 'dir',
                        children: [
                          { name: 'auth.ts', path: 'services/api-gateway/src/middleware/auth.ts', type: 'file', lines: 26, language: 'TypeScript' },
                          { name: 'rateLimiter.ts', path: 'services/api-gateway/src/middleware/rateLimiter.ts', type: 'file', lines: 18, language: 'TypeScript' },
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                name: 'order-service',
                path: 'services/order-service',
                type: 'dir',
                children: [
                  {
                    name: 'src',
                    path: 'services/order-service/src',
                    type: 'dir',
                    children: [
                      {
                        name: 'services',
                        path: 'services/order-service/src/services',
                        type: 'dir',
                        children: [
                          { name: 'orderProcessor.ts', path: 'services/order-service/src/services/orderProcessor.ts', type: 'file', lines: 48, language: 'TypeScript' },
                          { name: 'paymentWebhook.ts', path: 'services/order-service/src/services/paymentWebhook.ts', type: 'file', lines: 38, language: 'TypeScript' },
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                name: 'product-catalog',
                path: 'services/product-catalog',
                type: 'dir',
                children: [
                  {
                    name: 'src',
                    path: 'services/product-catalog/src',
                    type: 'dir',
                    children: [
                      {
                        name: 'controllers',
                        path: 'services/product-catalog/src/controllers',
                        type: 'dir',
                        children: [
                          { name: 'productController.ts', path: 'services/product-catalog/src/controllers/productController.ts', type: 'file', lines: 36, language: 'TypeScript' },
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            name: 'packages',
            path: 'packages',
            type: 'dir',
            children: [
              {
                name: 'database',
                path: 'packages/database',
                type: 'dir',
                children: [
                  {
                    name: 'prisma',
                    path: 'packages/database/prisma',
                    type: 'dir',
                    children: [
                      { name: 'schema.prisma', path: 'packages/database/prisma/schema.prisma', type: 'file', lines: 52, language: 'Other' },
                    ]
                  }
                ]
              }
            ]
          },
          { name: 'docker-compose.yml', path: 'docker-compose.yml', type: 'file', lines: 20, language: 'YAML' },
          { name: 'README.md', path: 'README.md', type: 'file', lines: 34, language: 'Markdown' },
        ]
      },
      issues: [
        {
          id: 'issue-1',
          title: 'Unhandled Exception & Missing Transaction in Stripe Webhook',
          category: 'bug',
          severity: 'high',
          filePath: 'services/order-service/src/services/paymentWebhook.ts',
          lineStart: 25,
          lineEnd: 36,
          snippet: `    // Potential unhandled exception if order doesn't exist\n    const order = await prisma.order.update({\n      where: { id: orderId },\n      data: { status: 'PAID', paymentId: paymentIntent.id },\n    });\n\n    eventBus.publish('order.paid', { orderId: order.id, customerEmail: order.customerEmail });`,
          explanation: 'If Stripe sends a webhook with an invalid or already deleted order ID, `prisma.order.update` throws an unhandled `RecordNotFound` exception, causing an HTTP 500 error that leads Stripe to repeatedly retry the webhook indefinitely. Furthermore, the database update and event publishing are not wrapped in a transactional block.',
          suggestedFix: 'Wrap the update in a try/catch block, verify order existence before mutation, and return an explicit 200/404 acknowledgement to Stripe to avoid infinite retry loops.',
          diff: `--- a/services/order-service/src/services/paymentWebhook.ts
+++ b/services/order-service/src/services/paymentWebhook.ts
@@ -25,12 +25,18 @@
     const orderId = paymentIntent.metadata.orderId;
 
-    // Potential unhandled exception if order doesn't exist
-    const order = await prisma.order.update({
-      where: { id: orderId },
-      data: { status: 'PAID', paymentId: paymentIntent.id },
-    });
+    try {
+      const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
+      if (!existingOrder) {
+        console.warn(\`Received payment for unknown order: \${orderId}\`);
+        return res.status(200).json({ status: 'ignored_unknown_order' });
+      }
 
-    eventBus.publish('order.paid', { orderId: order.id, customerEmail: order.customerEmail });
+      const order = await prisma.order.update({
+        where: { id: orderId },
+        data: { status: 'PAID', paymentId: paymentIntent.id },
+      });
+      eventBus.publish('order.paid', { orderId: order.id, customerEmail: order.customerEmail });
+    } catch (dbError) {
+      console.error('Failed to update order payment status:', dbError);
+      return res.status(500).json({ error: 'Database update failed' });
+    }
   }
`
        },
        {
          id: 'issue-2',
          title: 'Hardcoded Default JWT Secret in Auth Middleware',
          category: 'security',
          severity: 'high',
          filePath: 'services/api-gateway/src/middleware/auth.ts',
          lineStart: 4,
          lineEnd: 5,
          snippet: `// SECURITY ISSUE: Fallback to weak hardcoded secret in production!\nconst JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-12345';`,
          explanation: 'Using a hardcoded fallback JWT secret (`super-secret-default-key-12345`) allows attackers to forge valid authentication tokens and escalate privileges if the `JWT_SECRET` environment variable is omitted in production or staging environments.',
          suggestedFix: 'Enforce strict runtime validation on startup. If `process.env.JWT_SECRET` is missing in non-test environments, throw a fatal error immediately instead of falling back to a static string.',
          diff: `--- a/services/api-gateway/src/middleware/auth.ts
+++ b/services/api-gateway/src/middleware/auth.ts
@@ -4,2 +4,5 @@
-const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-12345';
+if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
+  throw new Error('FATAL: JWT_SECRET environment variable must be set in production');
+}
+const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_jwt_secret_do_not_use_in_prod';
`
        },
        {
          id: 'issue-3',
          title: 'N+1 Query Bottleneck in Product Reviews Aggregation',
          category: 'performance',
          severity: 'medium',
          filePath: 'services/product-catalog/src/controllers/productController.ts',
          lineStart: 12,
          lineEnd: 28,
          snippet: `    const results = [];\n    for (const product of products) {\n      const reviews = await prisma.review.findMany({\n        where: { productId: product.id },\n      });\n      const avgRating = reviews.length > 0 ...\n    }`,
          explanation: 'Executing a separate SQL query for each product inside a loop causes 51 database roundtrips (1 query for products + 50 queries for reviews) for a single page load. This introduces massive latency spikes under high concurrent traffic.',
          suggestedFix: 'Use Prisma\'s `include` relation with aggregation or execute a single batch query to retrieve all reviews for the returned product IDs at once.',
          diff: `--- a/services/product-catalog/src/controllers/productController.ts
+++ b/services/product-catalog/src/controllers/productController.ts
@@ -10,18 +10,18 @@
     const products = await prisma.product.findMany({
       where: { active: true },
+      include: {
+        reviews: {
+          select: { rating: true },
+        },
+      },
       take: 50,
     });
 
-    const results = [];
-    for (const product of products) {
-      const reviews = await prisma.review.findMany({
-        where: { productId: product.id },
-      });
-      const avgRating = reviews.length > 0 
-        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
-        : 0;
-      results.push({ ...product, reviewsCount: reviews.length, averageRating: avgRating });
-    }
+    const results = products.map(product => {
+      const count = product.reviews.length;
+      const avg = count > 0 
+        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / count 
+        : 0;
+      return { ...product, reviewsCount: count, averageRating: avg };
+    });
`
        },
        {
          id: 'issue-4',
          title: 'High Cyclomatic Complexity & Hardcoded Discount Rules',
          category: 'complexity',
          severity: 'medium',
          filePath: 'services/order-service/src/services/orderProcessor.ts',
          lineStart: 6,
          lineEnd: 26,
          snippet: `    let discount = 0;\n    if (discountCode) {\n      if (discountCode === 'SUMMER20') discount = subtotal * 0.2;\n      else if (discountCode === 'VIP50') discount = subtotal * 0.5;\n    }`,
          explanation: 'The checkout method handles price calculations, discount lookups, shipping cost rules, and database writes all inside one monolithic function with nested branching. Hardcoded promotion strings prevent dynamic discount management.',
          suggestedFix: 'Extract discount calculation into a strategy pattern or dedicated DiscountService backed by a database model.',
          diff: `--- a/services/order-service/src/services/orderProcessor.ts
+++ b/services/order-service/src/services/orderProcessor.ts
@@ -14,6 +14,3 @@
-    let discount = 0;
-    if (discountCode) {
-      if (discountCode === 'SUMMER20') discount = subtotal * 0.2;
-      else if (discountCode === 'VIP50') discount = subtotal * 0.5;
-      else if (discountCode === 'FLAT10') discount = 10;
-    }
+    const discount = await this.discountService.applyDiscount(subtotal, discountCode);
`
        }
      ],
      onboardingGuide: {
        mission: 'ShopSphere is an enterprise-grade cloud commerce platform engineered for high-availability retail workloads. It orchestrates inventory catalogs, secure customer identity, asynchronous order settlement, and third-party payment workflows across resilient microservices.',
        quickStart: {
          prerequisites: [
            'Node.js v18.0.0 or higher',
            'Docker & Docker Compose',
            'npm or pnpm package manager',
            'PostgreSQL client (optional, for direct DB inspection)'
          ],
          envVars: [
            { key: 'PORT', example: '4000', required: true, description: 'API Gateway listening port' },
            { key: 'DATABASE_URL', example: 'postgresql://shopsphere:secretpassword@localhost:5432/shopsphere_db', required: true, description: 'PostgreSQL database connection string' },
            { key: 'JWT_SECRET', example: 'your_super_secret_jwt_random_key', required: true, description: 'Cryptographic secret for signing auth tokens' },
            { key: 'REDIS_URL', example: 'redis://localhost:6379', required: false, description: 'Redis connection string for session and event pub/sub' },
            { key: 'STRIPE_SECRET_KEY', example: 'sk_test_51MockKey...', required: false, description: 'Stripe test API secret key' },
          ],
          commands: [
            { label: '1. Install Dependencies', command: 'npm install', description: 'Installs all workspace packages and shared modules' },
            { label: '2. Start DB & Redis Infrastructure', command: 'docker-compose up -d', description: 'Launches PostgreSQL (port 5432) and Redis (port 6379) in background' },
            { label: '3. Run Database Migrations', command: 'npx prisma migrate dev --name init', description: 'Applies database schema tables and generates Prisma client' },
            { label: '4. Seed Sample Products', command: 'npm run seed', description: 'Inserts mock catalogue items, test customer accounts, and reviews' },
            { label: '5. Launch Local Dev Environment', command: 'npm run dev', description: 'Starts Web storefront (port 5173), Gateway (4000), and microservices' },
            { label: '6. Run Unit & Integration Tests', command: 'npm test', description: 'Executes Jest unit test suites across all packages' },
          ]
        },
        techStackRationale: [
          { tech: 'React 18 + Tailwind', role: 'Frontend Storefront', reason: 'Provides component-level reactivity and rapid styling for modern e-commerce checkout flows' },
          { tech: 'Node.js + Express', role: 'API Gateway & Ingress', reason: 'Lightweight non-blocking event loop ideal for high-throughput HTTP reverse proxying' },
          { tech: 'Fastify', role: 'Product Catalog Service', reason: 'Benchmark-leading low overhead and schema-based JSON serialization for read-heavy catalogue queries' },
          { tech: 'Prisma ORM', role: 'Database Client', reason: 'End-to-end TypeScript type safety and automatic schema migration management' },
          { tech: 'PostgreSQL', role: 'Primary Persistence', reason: 'ACID transactional guarantees essential for financial transactions and inventory integrity' },
          { tech: 'Redis', role: 'Session & Pub/Sub', reason: 'Sub-millisecond token lookup and lightweight asynchronous event broadcast between services' },
        ],
        architectureWalkthrough: 'The application operates on a decentralized microservices pattern. Client browsers talk exclusively to the API Gateway on port 4000. The Gateway validates JWT signatures and routes traffic downstream. State changes such as completed payments emit events to Redis, triggering asynchronous background jobs without blocking customer HTTP responses.',
        starterFiles: [
          {
            path: 'services/api-gateway/src/index.ts',
            rank: 1,
            reasonToRead: 'The front door of the backend. Shows how external requests are routed and which microservices handle which endpoints.',
            keyConcepts: ['Proxy routing', 'Rate limiting', 'Global error handling'],
          },
          {
            path: 'services/api-gateway/src/middleware/auth.ts',
            rank: 2,
            reasonToRead: 'Understand how user identities, JWT claims, and role-based permissions are enforced.',
            keyConcepts: ['JWT verification', 'Express middleware chain', 'Security headers'],
          },
          {
            path: 'packages/database/prisma/schema.prisma',
            rank: 3,
            reasonToRead: 'The single source of truth for all domain models (User, Product, Order, OrderItem, Review).',
            keyConcepts: ['Entity relationships', 'Foreign keys', 'Prisma generators'],
          },
          {
            path: 'services/order-service/src/services/orderProcessor.ts',
            rank: 4,
            reasonToRead: 'Core business logic orchestrating inventory deduction, tax calculation, and order lifecycle.',
            keyConcepts: ['Checkout logic', 'Stock validation', 'Financial rounding'],
          },
          {
            path: 'apps/web/src/App.tsx',
            rank: 5,
            reasonToRead: 'Frontend root component showing state layout, cart drawer orchestration, and catalogue integration.',
            keyConcepts: ['React component tree', 'Global state binding', 'Tailwind styling'],
          },
        ],
        executionFlow: [
          {
            step: 1,
            title: 'Customer Submits Cart Checkout',
            trigger: 'Customer clicks "Place Order" on Web Storefront',
            trace: ['apps/web/src/store/cartStore.ts', 'services/api-gateway/src/index.ts'],
            description: 'The React storefront packages cart items and initiates an HTTP POST `/api/v1/orders/checkout` to the API Gateway.',
          },
          {
            step: 2,
            title: 'Authentication & Ingress Verification',
            trigger: 'API Gateway receives request',
            trace: ['services/api-gateway/src/middleware/rateLimiter.ts', 'services/api-gateway/src/middleware/auth.ts'],
            description: 'The Gateway verifies IP rate limits, validates the Bearer JWT token, and attaches customer identity metadata to the proxied request.',
          },
          {
            step: 3,
            title: 'Stock Lock & Price Calculation',
            trigger: 'Order Service receives routed payload',
            trace: ['services/order-service/src/services/orderProcessor.ts', 'packages/database/prisma/schema.prisma'],
            description: 'The Order Processor queries PostgreSQL via Prisma to verify current inventory, applies discounts, computes tax, and creates a PENDING order record.',
          },
          {
            step: 4,
            title: 'Stripe Payment Processing & Webhook Callback',
            trigger: 'Stripe processes credit card transaction',
            trace: ['services/order-service/src/services/paymentWebhook.ts', 'services/order-service/src/lib/eventBus.ts'],
            description: 'Stripe calls the webhook handler upon success. The handler updates order status to PAID and publishes an `order.paid` event to Redis.',
          },
          {
            step: 5,
            title: 'Async Fulfillment & Notification',
            trigger: 'Event Bus delivers `order.paid` event',
            trace: ['services/order-service/src/services/orderProcessor.ts'],
            description: 'Downstream workers deduct confirmed warehouse stock and send order confirmation receipt emails to the customer.',
          },
        ],
        learningPath: [
          {
            day: 'Day 1: Setup & Mental Model',
            milestone: 'Local Environment Running & Schema Familiarity',
            tasks: [
              'Clone repository and run `docker-compose up -d` to bring up PostgreSQL and Redis',
              'Inspect `packages/database/prisma/schema.prisma` to map out table relations',
              'Start dev servers with `npm run dev` and navigate to http://localhost:5173',
            ],
            filesToExplore: ['README.md', 'packages/database/prisma/schema.prisma', 'docker-compose.yml'],
          },
          {
            day: 'Day 2: Ingress & Authentication Flow',
            milestone: 'Master Request Routing and Security Middleware',
            tasks: [
              'Trace how API Gateway forwards `/api/v1/*` requests to downstream ports',
              'Examine `auth.ts` middleware and fix the fallback JWT secret vulnerability',
              'Issue test curl requests with valid and expired JWT tokens',
            ],
            filesToExplore: ['services/api-gateway/src/index.ts', 'services/api-gateway/src/middleware/auth.ts'],
          },
          {
            day: 'Day 3: Product Catalogue & Database Performance',
            milestone: 'Optimize Database Queries & Add Full-Text Filters',
            tasks: [
              'Inspect `productController.ts` and resolve the N+1 query review loading issue',
              'Write a unit test with Jest to benchmark response time before and after Prisma include',
              'Add a filter endpoint for filtering products by category and max price',
            ],
            filesToExplore: ['services/product-catalog/src/controllers/productController.ts'],
          },
          {
            day: 'Day 4: Checkout & Payment Webhooks',
            milestone: 'Reliable Financial Order Lifecycle',
            tasks: [
              'Understand Stripe webhook signature verification and idempotency keys',
              'Refactor `orderProcessor.ts` by splitting tax, shipping, and discount rules into modular sub-services',
              'Simulate test Stripe webhook events using the Stripe CLI',
            ],
            filesToExplore: ['services/order-service/src/services/paymentWebhook.ts', 'services/order-service/src/services/orderProcessor.ts'],
          },
          {
            day: 'Day 5: First Feature PR',
            milestone: 'Ship Your First End-to-End Feature to Staging',
            tasks: [
              'Implement a "Wishlist" feature spanning database model, API endpoint, and React UI button',
              'Write automated unit and integration tests using CodeLens AI Test Generator',
              'Open a Pull Request with clean commits and documentation',
            ],
            filesToExplore: ['packages/database/prisma/schema.prisma', 'apps/web/src/App.tsx'],
          }
        ],
        quiz: [
          {
            id: 'q1',
            question: 'What port does the API Gateway listen on for incoming client requests?',
            options: ['Port 3000', 'Port 4000', 'Port 5173', 'Port 5432'],
            correctIndex: 1,
            explanation: 'The API Gateway is configured in `services/api-gateway/src/index.ts` to listen on port 4000 and proxy traffic downstream.',
          },
          {
            id: 'q2',
            question: 'Which ORM is used for PostgreSQL database interactions and migrations?',
            options: ['TypeORM', 'Mongoose', 'Prisma ORM', 'Sequelize'],
            correctIndex: 2,
            explanation: 'Prisma ORM is configured in `packages/database/prisma/schema.prisma` as the single source of truth for schemas and client generation.',
          },
          {
            id: 'q3',
            question: 'How do downstream microservices communicate asynchronous state changes (e.g. order paid)?',
            options: ['Direct synchronous HTTP calls', 'Redis Pub/Sub Event Bus', 'Database polling loops', 'Shared file system writes'],
            correctIndex: 1,
            explanation: 'Services publish event topics (such as `order.paid`) to Redis Pub/Sub, allowing decoupled workers to process tasks asynchronously.',
          },
        ]
      }
    };
  }
}
