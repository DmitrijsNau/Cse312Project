# Builds UI as first stage
FROM node:18 as ui-builder
WORKDIR /app
COPY ui/ ./ui/
WORKDIR /app/ui
RUN npm install 
RUN npm run build 

# Builds python app as second stage
FROM python:3.11
WORKDIR /app

# Moves the built files over
RUN mkdir -p /app/ui/build/
COPY --from=ui-builder /app/ui/build/ /app/ui/build/

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
