# Focus - Disciplina y Enfoque

Aplicación web de forja de disciplina personal, juramentos diarios, temporizador de enfoque profundo, check-in de respeto propio frente al espejo y diario de victorias con sistema de niveles y logros por XP.

## Características

- **Hoy**: Vista diaria con saludo según la hora, nivel actual, progreso de XP hacia el siguiente rango, estadísticas rápidas de racha y hábitos cumplidos, afirmación diaria inspiradora, checklist de juramentos de hoy y recordatorios de identidad.
- **Disciplina**: Registro de juramentos diarios, visualizador de consistencia de los últimos 7 días con días perfectos, creación rápida de hábitos con sugerencias y gestión de juramentos.
- **Enfoque (Modo Bestia)**: Temporizador circular con efecto de brillo radiante para sesiones de trabajo profundo con presets (Sprint 15m, Clásico 25m, Profundo 50m, Monje 90m), pausa/reanudación, cálculo de XP ganado e historial de sesiones recientes.
- **Ego (Frente al espejo)**: Afirmaciones rotativas diarias, check-in de respeto personal (escala 1 al 10 con notas de reflexión personal y XP), gráfica de barras de confianza semanal y Diario de Pruebas con categorías (Victoria, Gratitud, Lección).
- **Perfil**: Medalla de nivel, títulos honoríficos (Aprendiz, Constante, Firme, Implacable, Élite, Leyenda), resumen de rachas y métricas totales, gráfico de minutos de enfoque de la semana y colección de 10 logros desbloqueables.
- **Persistencia**: Almacenamiento local seguro (`localStorage`) con soporte offline total.
- **Efectos**: Síntesis de sonido Web Audio nativa y celebraciones con confeti al subir de nivel o completar juramentos.

## Compilación a archivo .ipa (iOS / iPhone)

Esta app incluye un flujo de trabajo de GitHub Actions (`.github/workflows/build-ipa.yml`) para compilar automáticamente un archivo ejecutable **`.ipa`** para iPhone:

1. Sube tu código al repositorio en GitHub.
2. Ve a la pestaña **Actions** en GitHub.
3. Ejecuta el workflow **"Build iOS IPA"**.
4. Al finalizar la compilación en el runner macOS, descarga el binario **`Focus.ipa`** desde la sección **Artifacts**.
5. Instálalo en tu iPhone mediante Sideloadly, AltStore, TrollStore o tu cuenta de desarrollador. Consulta `IOS_IPA_GUIDE.md` para ver la guía paso a paso.

## Desarrollo

- Iniciar servidor de desarrollo: `npm run dev` (corre en el puerto 3000)
- Construir para producción: `npm run build`
- Validar tipos: `npm run lint`
