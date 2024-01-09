# Use an official Node runtime as a parent image
FROM node:21

# Set environment variables
ENV NEXT_PUBLIC_SUPABASE_URL=
ENV NEXT_PUBLIC_SUPABASE_KEY=
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_HOST=http://localhost:5001
ENV NEXT_PUBLIC_MENDELEY_APP_ID=
ENV NEXT_PUBLIC_MENDELEY_REDIRECT=http://localhost:3000/integration/mendeley
ENV NEXT_PUBLIC_MENDELEY_SECRET=
ENV NEXT_PUBLIC_ZOTERO_CLIENT_KEY=
ENV NEXT_PUBLIC_ZOTERO_CLIENT_SECRET=
ENV NEXT_PUBLIC_ZOTERO_REDIRECT=http://localhost:3000/api/auth/zotero

WORKDIR /app

# Copy requirements first for better cache utilization
COPY . .

RUN npm install

EXPOSE 3000

CMD npm run dev