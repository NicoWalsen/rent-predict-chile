# 🔒 Hacer el sitio "Seguro" en el navegador

## Opción 1: Método Rápido (Recomendado)

1. **Ve a la aplicación**: `https://192.168.100.145:3008`
2. **Verás "No es seguro"** - Haz clic en el candado 🔒
3. **Selecciona**: "Aceptar certificado" o "Proceder de todos modos"
4. **Marca**: "Recordar esta decisión para este sitio"
5. **¡Listo!** El navegador recordará que confías en este sitio

## Opción 2: Certificado Confiable (Avanzado)

### Para Windows:
1. **Ejecuta como ADMINISTRADOR**: `certs/install-ca.bat`
2. **Confirma** la instalación del certificado CA
3. **Reinicia** Chrome/Firefox
4. **Ve a**: `https://localhost:3008`
5. **¡Aparecerá el candado verde!** 🔒✅

### Verificación:
- Abre el navegador en modo incógnito
- Ve a `https://localhost:3008`
- Si ves el candado verde = ¡Certificado confiable instalado!

## ¿Por qué aparece "No es seguro"?

- Es normal en desarrollo local
- HTTPS está funcionando correctamente
- Solo falta la "confianza" del navegador
- En producción usarías certificados de Let's Encrypt

## URLs Seguras Disponibles:

- **Desktop**: `https://localhost:3008`
- **Móvil**: `https://192.168.100.145:3008`
- **Ambas** tendrán HTTPS completo después de aceptar el certificado

---

**💡 Tip**: Una vez aceptado, el sitio será completamente seguro y funcional.