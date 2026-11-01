# Atalaya · Frontend (sitio + Suricata NIDS + agente de Telegram)

Interfaz en **React + Vite** del centro de detección de intrusos. En ec2-frontend además corren **Suricata** (NIDS)
y el **agente** que envía sus alertas al backend y publica todas en el grupo de Telegram.

## Pantallas

| Ruta | Para qué sirve en la presentación |
|---|---|
| `/` Centro de monitoreo | Totales por sensor, las 4 pruebas que se encienden al detectarse, estado de cada sensor, alertas por minuto |
| `/alertas` Alertas en vivo | Tabla en vivo + ficha de análisis: qué tráfico la provocó, qué regla la generó, por qué era esperable |
| `/sensores` Sensores y reglas | HOME_NET, interfaz, archivos, comandos de validación y anatomía de cada regla |
| `/demo` Demo en vivo | Guion con los comandos listos para copiar; cada paso se marca solo cuando llega su alerta |
| `/mi-sitio` | Portal del cliente del servicio: estado de su protección en lenguaje sencillo |
| `/servicio` | Página pública de la propuesta de servicio (Atalaya SOC) |
| `/auditoria` | Eventos de seguridad de la aplicación (solo admin) |

## Estructura

```
src/
  api/          httpClient + authService, auditService, idsService
  context/      AuthContext (sesión JWT) e IdsLiveContext (sondeo de alertas cada 2.5 s y avisos)
  components/   ui/, security/, data/, ids/ (tarjetas, tablero de pruebas, línea de tiempo, anatomía de reglas)
  constants/    security.js e ids.js (guion de la demo, significado de cada opción de regla)
  pages/        Login, Monitor, Alerts, Sensors, Demo, Audit, Forbidden, NotFound
ids/
  suricata/     reglas atalaya-*.rules y fragmento de suricata.yaml
  agente/       atalaya_agente.py (Python estándar), agente.env.example, atalaya-agente.service
  nginx/        bloqueo de /api/internal
  scripts/      evidencias-suricata.sh
```

## Ejecutar en local

```bash
npm install
npm run dev     # requiere el backend en http://localhost:3000; abrir http://localhost:5173
```

`npm run build` genera `dist/`, que Nginx publica en ec2-frontend. Despliegue completo: `GUIA_DESPLIEGUE_IDS.md`. Concepto de servicio: `SERVICIO.md`.
