FROM python:3.11

ENV HOME /root
WORKDIR /root

COPY . .

RUN pip3 install --no-cache-dir --upgrade -r requirements.txt

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
