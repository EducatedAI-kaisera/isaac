#!/bin/bash

cd supabase

echo "Starting Supabase..."
npx supabase start > /dev/null

echo "Setting environment variables..."
eval $(npx supabase status -o env | grep -E "ANON_KEY|SERVICE_ROLE_KEY")

cd ..

cp ./api/.env.example ./api/.env
cp ./web/.env.example ./web/.env

sed -i '' "s/SUPABASE_KEY=.*/SUPABASE_KEY=$ANON_KEY/" ./api/.env
sed -i '' "s/NEXT_PUBLIC_SUPABASE_KEY=.*/NEXT_PUBLIC_SUPABASE_KEY=$ANON_KEY/" ./web/.env
sed -i '' "s/SUPABASE_SERVICE_KEY=.*/SUPABASE_SERVICE_KEY=$SERVICE_ROLE_KEY/" ./web/.env

echo "Starting Docker containers"

docker-compose up