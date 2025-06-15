import os
import pandas as pd
import joblib
import psycopg2
from sklearn.metrics import mean_absolute_error

# Cargar modelo
model, cols = joblib.load('public/model.joblib')

# Conectar a la base de datos
conn = psycopg2.connect(os.getenv("DATABASE_URL"))

# Cargar datos
df = pd.read_sql('SELECT commune, area_m2, bedrooms, bathrooms, rent_clp FROM "Listing"', conn)

# Preparar features para el modelo
X = df[['commune', 'area_m2', 'bedrooms', 'bathrooms']]
X = pd.get_dummies(X, columns=['commune'])
y = df['rent_clp']

# Predicciones del modelo
y_pred_model = model.predict(X)

# Calcular MAE del modelo
mae_model = mean_absolute_error(y, y_pred_model)

# Calcular MAE del método de percentiles
y_pred_percentile = df.groupby('commune')['rent_clp'].transform('median')
mae_percentile = mean_absolute_error(y, y_pred_percentile)

print(f"MAE del modelo RandomForest: {mae_model:,.0f} CLP")
print(f"MAE del método de percentiles: {mae_percentile:,.0f} CLP")
print(f"Mejora: {(mae_percentile - mae_model) / mae_percentile * 100:.1f}%") 