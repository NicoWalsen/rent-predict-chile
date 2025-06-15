import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
import psycopg2

# Conectar a la base de datos
conn = psycopg2.connect(os.getenv("DATABASE_URL"))

# Cargar datos
df = pd.read_sql('SELECT commune, area_m2, bedrooms, bathrooms, rent_clp FROM "Listing"', conn)

# Preparar features
X = df[['commune', 'area_m2', 'bedrooms', 'bathrooms']]
X = pd.get_dummies(X, columns=['commune'])
y = df['rent_clp']

# Entrenar modelo
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X, y)

# Guardar modelo y columnas
joblib.dump((model, list(X.columns)), 'public/model.joblib')

print("Modelo entrenado y guardado exitosamente!")
print(f"Features: {list(X.columns)}")
print(f"R² score: {model.score(X, y):.3f}") 