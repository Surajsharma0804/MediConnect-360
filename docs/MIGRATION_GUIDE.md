# 🔄 Migration Guide - Switch Services & Providers

## 📋 Overview

This guide shows you how to migrate between different services and providers for MediConnect 360. Whether you want to switch AI providers, hosting platforms, databases, or other services, this guide has you covered.

---

## 🤖 **Part 1: AI Provider Migration**

### **Current: Google Gemini → OpenAI**

**Why switch?**
- Better medical accuracy
- More training data
- Advanced features (function calling, vision)
- Better multilingual support

**Cost comparison:**
- Gemini: FREE (60 req/min)
- OpenAI GPT-4: ~$0.03 per request
- OpenAI GPT-3.5: ~$0.002 per request

### **Step 1: Get OpenAI API Key**

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up and add payment method
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Create new secret key
5. Copy key (starts with `sk-`)

### **Step 2: Install OpenAI SDK**

```bash
cd backend
npm install openai
```

### **Step 3: Update Environment Variables**

```bash
# backend/.env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4-turbo-preview  # or gpt-3.5-turbo for cheaper
```

### **Step 4: Update AI Service**

```typescript
// backend/src/services/ai.service.ts
import { OpenAI } from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor() {
    if (process.env.AI_PROVIDER === 'openai') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    if (process.env.AI_PROVIDER === 'openai') {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });
      return response.choices[0].message.content;
    }
    // Fallback to Gemini
    return this.generateWithGemini(prompt);
  }
}
```

### **Step 5: Test**

```bash
# Restart backend
npm run start:dev

# Test AI features
# - Symptom checker
# - Health assistant
# - Voice chat
```

### **Alternative: Anthropic Claude**

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
});
```

---

## 🗄️ **Part 2: Database Migration**

### **Current: PostgreSQL → MySQL**

**Why switch?**
- Existing MySQL infrastructure
- Team familiarity
- Specific features needed

### **Step 1: Install MySQL**

```bash
# Docker
docker run -d \
  --name mediconnect-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=mediconnect \
  -p 3306:3306 \
  mysql:8

# Or update docker-compose.yml
```

### **Step 2: Install MySQL Driver**

```bash
cd backend
npm uninstall pg
npm install mysql2
```

### **Step 3: Update TypeORM Config**

```typescript
// backend/src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',  // Changed from 'postgres'
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,  // Changed from 5432
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mediconnect',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};
```

### **Step 4: Update Environment Variables**

```bash
# backend/.env
DATABASE_URL=mysql://root:password@localhost:3306/mediconnect
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=mediconnect
```

### **Step 5: Migrate Data**

**Option A: Export/Import**

```bash
# Export from PostgreSQL
pg_dump -U postgres mediconnect > backup.sql

# Convert SQL (manual or use tools)
# - Change data types (e.g., uuid → varchar(36))
# - Change syntax (e.g., SERIAL → AUTO_INCREMENT)
# - Update functions

# Import to MySQL
mysql -u root -p mediconnect < converted.sql
```

**Option B: Use Migration Tool**

```bash
npm install -g pgloader

# Create config file
pgloader postgres://postgres:password@localhost/mediconnect \
         mysql://root:password@localhost/mediconnect
```

### **Step 6: Update Entity Definitions**

```typescript
// MySQL doesn't have native UUID, use varchar
@PrimaryGeneratedColumn('uuid')  // PostgreSQL
@PrimaryColumn({ type: 'varchar', length: 36 })  // MySQL

// Or use auto-increment
@PrimaryGeneratedColumn()
id: number;
```

### **Step 7: Test**

```bash
# Restart backend
npm run start:dev

# Verify all features work
# Check data integrity
```

### **PostgreSQL → MongoDB**

For document-based storage:

```bash
npm install @nestjs/mongoose mongoose
```

```typescript
// app.module.ts
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
  ],
})
```

---

## 📦 **Part 3: Storage Migration**

### **Current: MinIO → AWS S3**

**Why switch?**
- Global CDN
- Better reliability
- Automatic backups
- Scalability

**Cost:**
- MinIO: FREE (self-hosted)
- AWS S3: ~$0.023/GB/month + transfer

### **Step 1: Create S3 Bucket**

1. Go to [AWS Console](https://console.aws.amazon.com/s3/)
2. Create bucket:
   - Name: `mediconnect-files`
   - Region: `us-east-1`
   - Block public access: OFF (for public files)
3. Enable versioning (optional)
4. Enable encryption

### **Step 2: Create IAM User**

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Create user: `mediconnect-s3`
3. Attach policy: `AmazonS3FullAccess` (or custom)
4. Create access key
5. Copy credentials

### **Step 3: Update Environment Variables**

```bash
# backend/.env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=mediconnect-files
AWS_REGION=us-east-1
AWS_ENDPOINT=  # Leave empty for real AWS
```

### **Step 4: Update Storage Service**

```typescript
// backend/src/services/storage.service.ts
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      // Remove endpoint for real AWS
      // endpoint: process.env.AWS_ENDPOINT,
      // forcePathStyle: true,
    });
  }
}
```

### **Step 5: Migrate Existing Files**

```bash
# Install AWS CLI
# https://aws.amazon.com/cli/

# Sync from MinIO to S3
aws s3 sync s3://mediconnect-files s3://mediconnect-files \
  --endpoint-url http://localhost:9000 \
  --source-region us-east-1 \
  --region us-east-1
```

### **Alternative: Cloudflare R2**

**Benefits:**
- FREE 10GB storage
- FREE egress (no bandwidth charges)
- S3-compatible API

```bash
# backend/.env
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
AWS_S3_BUCKET=mediconnect-files
AWS_REGION=auto
AWS_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

---

## 🚀 **Part 4: Hosting Platform Migration**

### **Vercel → Netlify**

**Why switch?**
- Different features
- Better pricing
- Team preference

### **Step 1: Prepare for Netlify**

```bash
# Create netlify.toml
cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
EOF
```

### **Step 2: Deploy to Netlify**

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import existing project"
3. Connect GitHub repository
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables
6. Deploy

### **Render → Railway**

**Why switch?**
- Better pricing
- Faster deployments
- Better DX

### **Step 1: Create railway.json**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **Step 2: Deploy to Railway**

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub"
3. Select repository
4. Add environment variables
5. Deploy

### **VPS → Kubernetes**

For enterprise scale:

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mediconnect-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mediconnect-backend
  template:
    metadata:
      labels:
        app: mediconnect-backend
    spec:
      containers:
      - name: backend
        image: your-registry/mediconnect-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mediconnect-secrets
              key: database-url
```

---

## 📧 **Part 5: Email Provider Migration**

### **Resend → SendGrid**

**Why switch?**
- More features
- Better deliverability
- Existing account

**Cost:**
- Resend: FREE 3K/month
- SendGrid: FREE 100/day

### **Step 1: Get SendGrid API Key**

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up
3. Go to Settings → API Keys
4. Create API key
5. Copy key

### **Step 2: Install SendGrid SDK**

```bash
cd backend
npm install @sendgrid/mail
```

### **Step 3: Update Email Service**

```typescript
// backend/src/services/email.service.ts
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    if (process.env.EMAIL_PROVIDER === 'sendgrid') {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (process.env.EMAIL_PROVIDER === 'sendgrid') {
      await sgMail.send({
        to,
        from: process.env.FROM_EMAIL,
        subject,
        html,
      });
    }
    // Fallback to Resend
  }
}
```

### **Step 4: Update Environment Variables**

```bash
# backend/.env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-key-here
FROM_EMAIL=noreply@mediconnect360.com
```

---

## 🔴 **Part 6: Cache Migration**

### **Redis → Memcached**

```bash
# Install Memcached client
npm install memcached

# Update cache service
import Memcached from 'memcached';

const memcached = new Memcached('localhost:11211');
```

### **Redis → Redis Cloud**

For managed Redis:

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create database
3. Copy connection string
4. Update `REDIS_URL` in .env

---

## 📊 **Part 7: Analytics Migration**

### **Google Analytics → Plausible**

**Why switch?**
- Privacy-focused
- GDPR compliant
- Simpler

```html
<!-- Replace in index.html -->
<!-- Remove Google Analytics -->

<!-- Add Plausible -->
<script defer data-domain="mediconnect360.com" src="https://plausible.io/js/script.js"></script>
```

---

## ✅ **Migration Checklist**

### **Pre-Migration**
- [ ] Backup all data
- [ ] Document current setup
- [ ] Test new service in development
- [ ] Plan rollback strategy
- [ ] Schedule maintenance window
- [ ] Notify users (if downtime expected)

### **During Migration**
- [ ] Enable maintenance mode
- [ ] Export data from old service
- [ ] Import data to new service
- [ ] Update environment variables
- [ ] Update code
- [ ] Deploy changes
- [ ] Test thoroughly

### **Post-Migration**
- [ ] Verify all features work
- [ ] Check data integrity
- [ ] Monitor for errors
- [ ] Update documentation
- [ ] Keep old service running (backup)
- [ ] Notify users of completion

### **After 1 Week**
- [ ] Confirm stability
- [ ] Decommission old service
- [ ] Update billing
- [ ] Archive old data

---

## 🔧 **Troubleshooting**

### **Data Loss**
- Restore from backup
- Check export/import logs
- Verify data mapping

### **Performance Issues**
- Check connection pooling
- Optimize queries
- Add caching
- Scale resources

### **Authentication Errors**
- Verify API keys
- Check permissions
- Update credentials

### **Connection Timeouts**
- Check network/firewall
- Increase timeout values
- Verify service status

---

## 📚 **Additional Resources**

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment options
- [GET_API_KEYS.md](GET_API_KEYS.md) - API keys guide
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - Development setup

---

## 🆘 **Need Help?**

- **Email:** support@mediconnect360.com
- **GitHub Issues:** Report migration issues
- **Documentation:** Check service-specific docs

---

**Last Updated:** December 2025  
**Status:** Complete ✅
