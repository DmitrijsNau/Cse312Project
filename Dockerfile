FROM python:3.8

ENV HOME /root
WORKDIR /root

COPY . .

RUN pip3 install --no-cache-dir --upgrade -r requirements.txt

CMD ["fastapi", "run", "main.py", "--port", "80"]