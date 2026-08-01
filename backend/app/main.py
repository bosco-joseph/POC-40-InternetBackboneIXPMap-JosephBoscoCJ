from fastapi import FastAPI

app = FastAPI(
    title="Internet Backbone & IXP Map API"
)

@app.get("/")
def root():
    return {
        "message": "Internet Backbone & IXP Map API is running"
    }