from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Bakery API")

# Разрешаем запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PRODUCTS = [
    {"id": 1, "name": "Круассан с маслом", "description": "Классический французский круассан", "price": 120, "image": "🥐", "category": "Булочки"},
    {"id": 2, "name": "Пирог с вишней", "description": "Домашний пирог с сочной вишней", "price": 350, "image": "🥧", "category": "Пироги"},
    {"id": 3, "name": "Булочка с корицей", "description": "Мягкая булочка с ароматом корицы", "price": 90, "image": "🍞", "category": "Булочки"},
    {"id": 4, "name": "Кекс с шоколадом", "description": "Шоколадный кекс с кусочками шоколада", "price": 150, "image": "🧁", "category": "Кексы"},
    {"id": 5, "name": "Пирог с яблоками", "description": "Классический яблочный пирог с корицей", "price": 320, "image": "🍏", "category": "Пироги"},
    {"id": 6, "name": "Маффин с черникой", "description": "Нежный маффин с черникой", "price": 130, "image": "🫐", "category": "Кексы"},
    {"id": 7, "name": "Багет французский", "description": "Хрустящий багет из печи", "price": 80, "image": "🥖", "category": "Хлеб"},
    {"id": 8, "name": "Пончик с глазурью", "description": "Пышный пончик с розовой глазурью", "price": 110, "image": "🍩", "category": "Пончики"},
    {"id": 9, "name": "Эклер с кремом", "description": "Французский эклер с заварным кремом", "price": 170, "image": "🍫", "category": "Кексы"},
]

@app.get("/")
def root():
    return {"message": "Bakery API is running"}

@app.get("/api/products")
def get_products():
    return {"products": PRODUCTS}

@app.get("/api/health")
def health():
    return {"status": "ok"}
