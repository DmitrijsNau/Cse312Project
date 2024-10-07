from typing import Union
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
