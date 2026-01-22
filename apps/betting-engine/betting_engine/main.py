from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hola desde Betting Engine (Python 🐍)!"}

@app.get("/apuestas")
def get_apuestas():
    return {"apuestas": ["Real Madrid vs Barcelona", "Lakers vs Bulls"]}