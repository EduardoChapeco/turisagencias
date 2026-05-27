import urllib.request
import json
import os

url = "https://raw.githubusercontent.com/jbrooksuk/JSON-Airports/master/airports.json"

print(f"Baixando aeroportos de {url}...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
data = json.loads(response.read().decode('utf-8'))

sql_lines = [
    "CREATE TABLE IF NOT EXISTS global_iatas (",
    "  iata_code VARCHAR(3) PRIMARY KEY,",
    "  icao_code VARCHAR(4),",
    "  airport_name TEXT NOT NULL,",
    "  city TEXT,",
    "  country TEXT,",
    "  latitude NUMERIC,",
    "  longitude NUMERIC",
    ");",
    "",
    "ALTER TABLE global_iatas ENABLE ROW LEVEL SECURITY;",
    "",
    "CREATE POLICY \"IATAs are publicly viewable\" ",
    "  ON global_iatas FOR SELECT ",
    "  USING (true);",
    "",
    "INSERT INTO global_iatas (iata_code, icao_code, airport_name, city, country, latitude, longitude) VALUES"
]

values = []
# Many airports don't have IATA, filter those out
filtered = [a for a in data if a.get('iata') and len(a.get('iata')) == 3]

print(f"Processando {len(filtered)} aeroportos válidos...")

for i, airport in enumerate(filtered):
    iata = airport.get('iata', '').replace("'", "''")
    icao = airport.get('icao', '').replace("'", "''")
    name = (airport.get('name') or '').replace("'", "''")
    city = (airport.get('city') or '').replace("'", "''")
    country = (airport.get('country') or '').replace("'", "''")
    lat = airport.get('lat')
    lon = airport.get('lon')
    
    # Se lat/lon nao existem, usa NULL
    lat_str = str(lat) if lat is not None and lat != "" else "NULL"
    lon_str = str(lon) if lon is not None and lon != "" else "NULL"

    value_str = f"('{iata}', '{icao}', '{name}', '{city}', '{country}', {lat_str}, {lon_str})"
    values.append(value_str)

# Join blocks of 500 inserts
for i in range(0, len(values), 500):
    chunk = values[i:i+500]
    if i > 0:
        sql_lines.append("INSERT INTO global_iatas (iata_code, icao_code, airport_name, city, country, latitude, longitude) VALUES")
    sql_lines.append(",\n".join(chunk) + "\nON CONFLICT (iata_code) DO NOTHING;")

migration_path = os.path.join(os.path.dirname(__file__), "..", "supabase", "migrations", "20260527140000_global_iatas.sql")

with open(migration_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"Migration gerada com sucesso em: {migration_path}")
