# ============================================
# IAA Digital - Dockerfile
# ============================================
# Build: docker build -t iaa-digital .
# Run:   docker run -p 3000:3000 --env-file .env -v $(pwd)/public/uploads:/app/public/uploads iaa-digital

FROM node:20-slim

# Install dependencies untuk sharp & canvas
RUN apt-get update && apt-get install -y \
    libvips-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libgcc-12-dev \
    g++ \
    python3 \
    make \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN npm install --production=false

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Create uploads directory
RUN mkdir -p /app/public/uploads/branding /app/public/uploads/archives /app/public/uploads/gallery

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
