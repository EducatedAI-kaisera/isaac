# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

ARG OPENAI_API_KEY

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Copy requirements first for better cache utilization
COPY requirements.txt .

# Combine pip install commands
RUN pip3 install --no-cache-dir -r requirements.txt "unstructured[all-docs]==0.10.10" "psycopg2-binary"

# Copy project
COPY . .

EXPOSE 5001

CMD OPENAI_API_KEY=sk-${OPENAI_API_KEY} python3 -m uvicorn app.main:app --host 0.0.0.0 --port 5001 --reload