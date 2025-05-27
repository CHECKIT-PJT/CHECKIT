from fastapi import FastAPI
from routers import readme, sequence_diagram, chat
app = FastAPI()
app_prefix = "/api"

app.include_router(readme.router, prefix=app_prefix)
app.include_router(sequence_diagram.router, prefix=app_prefix)
app.include_router(chat.router, prefix=app_prefix)

@app.get("/")
def root():
    return {"message": "LLM based Generator API"}
