# Atalaya · Frontend

Interfaz en **React + Vite** con arquitectura basada en componentes para el proyecto final de Arquitectura Zero Trust en AWS.

## Estructura

```
src/
  api/          Comunicación con el backend (httpClient + servicios)
  context/      Sesión: token, usuario, expiración y cierre automático
  hooks/        useAuth, useCountdown, useApiResource
  routes/       ProtectedRoute (sesión y roles)
  layouts/      AppLayout (menú lateral y barra superior)
  pages/        Login, Resumen, Inventario, Auditoría, Denegado, No encontrado
  components/   ui/ (botones, campos, alertas), security/, data/, brand/
  constants/    Roles, capas de defensa, tipos de eventos
  styles/       Tokens de diseño y estilos por sección
```

## Ejecutar en local

```bash
npm install
npm run dev
```

Requiere el backend corriendo en `http://localhost:3000`. Abrir `http://localhost:5173`.

## Compilar para AWS

`npm run build` genera `dist/`, que Nginx publica en el servidor frontend.
