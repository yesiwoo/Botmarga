# TODO - Sistema de Margapoints para Discord Bot

## ✅ SISTEMA COMPLETADO CON MIGRACIÓN AUTOMÁTICA

### 1. Sistema de Margapoints Base
- [x] ✅ Crear función para calcular Margapoints: `ELO + (wins * 5) + (goals * 2) + (assists * 2) + (cleanSheets * 3)`
- [x] ✅ Función para actualizar Margapoints automáticamente
- [x] ✅ Almacenar Margapoints en Firebase bajo perfil de usuario

### 2. Comandos Básicos
- [x] ✅ `!margapoints` - Ver balance actual del usuario
- [x] ✅ `!top` - Top 10 jugadores con más Margapoints
- [x] ✅ `!daily` - Bonus diario (50-100 Margapoints aleatorio)

### 3. Sistema de Apuestas/Minijuegos
- [x] ✅ `!duelo <@oponente>` - Piedra, papel o tijera (cuesta 10 Margapoints)
- [x] ✅ `!flipcoin <@oponente> <cantidad>` - Combate de cara o cruz contra otros jugadores
- [x] ✅ `!secuencia <@oponente>` - Juego de memoria y reacción con emojis (15 Margapoints)
- [x] ✅ `!robar <@oponente> <cantidad>` - Sistema de apuestas basado en estadísticas
- [x] ✅ `!reaccion` - Test de velocidad individual
- [x] ✅ `!aceptar` / `!rechazar` - Responder a desafíos
- [x] ✅ Sistema automático para determinar ganadores

### 4. Tienda Simple
- [x] ✅ `!tienda` - Mostrar items disponibles
- [x] ✅ `!comprar <item>` - Comprar títulos, colores, badges
- [x] ✅ `!inventario` - Ver items comprados
- [x] ✅ Sistema de inventario para items comprados

### 5. Integración con Sistema Existente
- [x] ✅ Actualizar comando de vinculación para calcular Margapoints iniciales
- [x] ✅ Modificar !margastats para mostrar Margapoints
- [x] ✅ Asegurar compatibilidad con sistema de rangos actual
- [x] ✅ Estructura modular del código en múltiples archivos

### 6. 🔄 MIGRACIÓN AUTOMÁTICA PARA USUARIOS EXISTENTES
- [x] ✅ Sistema de migración automática al iniciar bot
- [x] ✅ Detectar usuarios vinculados sin Margapoints
- [x] ✅ Calcular y asignar Margapoints basados en stats actuales
- [x] ✅ Comando manual `!migrar` para administradores
- [x] ✅ Prevenir duplicación de migración
- [x] ✅ Logging completo del proceso de migración

### 7. 🎮 JUEGOS COMUNITARIOS AUTOMÁTICOS
- [x] ✅ Trivia automática cada 12 minutos
- [x] ✅ Matemáticas cada 15 minutos
- [x] ✅ Memoria cada 18 minutos
- [x] ✅ Palabras cada 21 minutos
- [x] ✅ Máximo 3 ganadores por ronda
- [x] ✅ Solo en canal general automáticamente
- [x] ✅ Cooldown de 3 minutos entre participaciones por usuario

### 8. 🧹 LIMPIEZA DE CÓDIGO
- [x] ✅ Eliminados archivos de juegos individuales innecesarios
- [x] ✅ Solo mantener: duel.js, flipcoin.js, reaction.js
- [x] ✅ Juegos comunitarios con funciones propias en communityGames.js
- [x] ✅ Código optimizado y sin conflictos

### 9. Arquitectura del Proyecto
- [x] ✅ `src/config/margapoints.js` - Configuración del sistema
- [x] ✅ `src/utils/margapoints.js` - Funciones utilitarias
- [x] ✅ `src/utils/migration.js` - Sistema de migración
- [x] ✅ `src/commands/` - Comandos individuales organizados
- [x] ✅ `src/games/` - Minijuegos (duelo, flipcoin, reaction)
- [x] ✅ `src/systems/` - Sistemas automáticos (eventos, juegos comunitarios)
- [x] ✅ `src/handlers/` - Manejadores de eventos
- [x] ✅ `bot.js` - Archivo principal limpio y organizado

## Estado: ✅ COMPLETADO Y LISTO PARA USAR

### 🚀 Comandos Disponibles:
- `!margapoints` - Ver tu balance de Margapoints
- `!top` - Ranking de jugadores por Margapoints
- `!daily` - Reclamar bonus diario (50-100 MP)
- `!duelo @usuario` - Desafío de piedra, papel o tijera (10 MP)
- `!flipcoin @usuario <cantidad>` - Desafío de cara o cruz
- `!secuencia @usuario` - Juego de memoria y reacción con emojis (15 MP)
- `!robar @usuario <cantidad>` - Sistema de apuestas basado en estadísticas
- `!reaccion` - Test de velocidad individual
- `!tienda` - Ver items disponibles para comprar
- `!comprar <ITEM_KEY>` - Comprar items con Margapoints
- `!inventario` - Ver tus items comprados
- `!aceptar` / `!rechazar` - Responder a desafíos
- `!margastats` - Estadísticas mejoradas con Margapoints
- `!migrar` - Migración manual (solo administradores)

### 🎯 Características Implementadas:
✅ **Margapoints no transferibles** - Solo se ganan jugando
✅ **Migración automática** - Usuarios existentes obtienen Margapoints al iniciar
✅ **Juegos comunitarios automáticos** - Actividad constante en el servidor
✅ **Minijuegos competitivos** - duelo, flipcoin, reaccion
✅ **Sistema de tienda** - títulos, colores y badges
✅ **Bonus diario** - con cooldown de 24 horas
✅ **Integración completa** - con sistema de vinculación existente
✅ **Arquitectura modular** - código organizado y escalable
✅ **Logging de transacciones** - en Firebase
✅ **Validaciones de seguridad** - manejo de errores

### 🔒 Sistema de Seguridad Anti-Abuso:
✅ **Verificación de stats mínimas:** Requiere 5 partidas y 5 minutos de tiempo jugado
✅ **Cooldown de desvinculación:** 24 horas obligatorias antes de re-vincular
✅ **Límite diario:** Máximo 1 vinculación por día por usuario Discord
✅ **Detección de patrones sospechosos:** Múltiples vinculaciones/desvinculaciones
✅ **Registro de auditoría:** Historial completo de vinculaciones en Firebase
✅ **Prevención de farming:** Imposible explotar el sistema re-vinculando cuentas
✅ **Mensajes informativos:** Usuarios informados sobre restricciones y tiempos de espera

### 🎮 Juegos Comunitarios Automáticos:
- **🧠 Trivia** - Cada 12 minutos con preguntas variadas
- **🔢 Matemáticas** - Cada 15 minutos con problemas aleatorios
- **🧩 Memoria** - Cada 18 minutos con secuencias de emojis
- **📝 Palabras** - Cada 21 minutos con palabras desordenadas
- **Recompensas:** 15-50 Margapoints por respuesta correcta
- **Límite:** Máximo 3 ganadores por ronda
- **Cooldown:** 3 minutos entre participaciones por usuario

### 📁 Archivos del Sistema:
- `bot.js` - Archivo principal con migración automática
- `src/margapointsBot.js` - Manejador principal de comandos
- `src/utils/migration.js` - Sistema completo de migración
- `src/systems/communityGames.js` - Juegos automáticos
- `src/security/antiAbuse.js` - Prevención de abuso
- `src/games/` - Juegos individuales (duel, flipcoin, reaction)
- `src/commands/` - Comandos organizados por función
- `src/utils/margapoints.js` - Funciones utilitarias

### 🔄 Proceso de Migración:
1. **Al iniciar el bot:** Verifica si la migración ya se completó
2. **Si no está completada:** Busca usuarios con `discordId` pero sin `margapoints`
3. **Para cada usuario:** Calcula Margapoints basado en sus stats actuales
4. **Actualiza perfil:** Asigna Margapoints, inventario vacío, permite daily
5. **Marca como completada:** Evita duplicación en futuros reinicios
6. **Logging:** Muestra progreso y resultados en consola

¡El sistema está completamente funcional y listo para crear una comunidad activa y competitiva!
