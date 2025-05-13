# # 1) Install dependencies
# FROM node:18-alpine AS deps
# WORKDIR /app

# # Copy package files first for caching
# COPY package.json ./

# # Install all deps (including devDependencies)
# RUN yarn install

# # 2) Build the Next.js app
# FROM node:18-alpine AS builder
# WORKDIR /app

# # Copy just deps from the deps stage
# COPY --from=deps /app/node_modules ./node_modules
# # Copy the rest of the source
# COPY . .

# # Build the production-ready Next.js app
# RUN yarn build

# # 3) Production image
# FROM node:18-alpine AS runner
# WORKDIR /app

# # Copy build output and production dependencies
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=deps    /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json
# COPY .env .env

# # Expose the port you use in production (9002)
# EXPOSE 9002

# # Start the app
# CMD ["yarn", "start", "-p", "9002"]


# 1. Build stage: Install all deps and compile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Production stage: Only runtime bits
FROM node:18-alpine AS runtime
WORKDIR /app

# Copy compiled output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy env files and expose port
COPY .env .env
EXPOSE 9002

CMD ["npm", "start", "--", "-p", "9002"]
