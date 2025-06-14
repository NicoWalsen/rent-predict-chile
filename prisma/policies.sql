-- Habilitar RLS en la tabla Listing
ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Allow public read access"
ON "Listing"
FOR SELECT
TO public
USING (true);

-- Política para bloquear escrituras anónimas
CREATE POLICY "Block anonymous writes"
ON "Listing"
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Política para permitir escrituras solo a usuarios autenticados
CREATE POLICY "Allow authenticated writes"
ON "Listing"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true); 