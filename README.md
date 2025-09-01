# 🌊 Margarita X4 - Sistema de Margapoints

Sistema completo de Margapoints para el bot de Discord de Margarita X4, diseñado para crear competitividad y actividad en el servidor.

## 🚀 Características Principales

### 💰 Sistema de Margapoints
- **No transferible**: Los Margapoints solo se ganan jugando y mejorando estadísticas
- **Cálculo automático**: `ELO + (wins × 5) + (goals × 2) + (assists × 2) + (cleanSheets × 3)`
- **Actualización en tiempo real**: Se actualizan automáticamente al consultar comandos

### 🎮 Minijuegos Competitivos
- **Duelos**: Piedra, papel o tijera (cuesta 10 MP)
- **Flipcoin**: Cara o cruz con apuestas personalizadas
- **Sistema de desafíos**: Acepta o rechaza desafíos de otros jugadores

### 🛒 Sistema de Tienda
- **Títulos especiales**: Aparecen en tu perfil (100-500 MP)
- **Colores personalizados**: Para tus embeds (200 MP)
- **Badges de prestigio**: Insignias especiales (300-1000 MP)

### 🎁 Bonus y Recompensas
- **Bonus diario**: 50-100 Margapoints aleatorios cada 24 horas
- **Integración con stats**: Más victorias = más Margapoints

## 📋 Comandos Disponibles

### Comandos Básicos
```
!margapoints          - Ver tu balance actual
!top                  - Ranking top 10 jugadores
!daily                - Reclamar bonus diario
!margastats           - Estadísticas mejoradas con Margapoints
```

### Minijuegos
```
!duelo @usuario       - Desafío de piedra, papel o tijera
!flipcoin @usuario <cantidad> - Desafío de cara o cruz
!aceptar              - Aceptar desafío pendiente
!rechazar             - Rechazar desafío pendiente
```

### Tienda e Inventario
```
!tienda               - Ver items disponibles
!comprar <ITEM_KEY>   - Comprar item específico
!inventario           - Ver tus items comprados
```

### Items Disponibles
```
TITLE_LEGEND    - 🏆 Leyenda (500 MP)
TITLE_MASTER    - ⚡ Maestro (300 MP)
COLOR_GOLD      - Color Dorado (200 MP)
COLOR_PURPLE    - Color Púrpura (200 MP)
BADGE_ELITE     - 💎 Elite (1000 MP)
```

## 🏗️ Arquitectura del Proyecto

```
├── bot.js                          # Archivo principal del bot
├── src/
│   ├── config/
│   │   └── margapoints.js         # Configuración del sistema
│   ├── utils/
│   │   └── margapoints.js         # Funciones utilitarias
│   ├── commands/
│   │   ├── margapoints.js         # Comando !margapoints
│   │   ├── leaderboard.js         # Comando !top
│   │   ├── daily.js               # Comando !daily
│   │   └── shop.js                # Comandos de tienda
│   ├── games/
│   │   ├── duel.js                # Minijuego de duelos
│   │   └── flipcoin.js            # Minijuego de flipcoin
│   ├── handlers/
│   │   └── gameHandler.js         # Manejador de aceptar/rechazar
│   └── margapointsBot.js          # Integrador principal
└── README.md
```

## 🔧 Instalación y Uso

### Prerrequisitos
- Node.js 16+
- Firebase configurado
- Discord.js v14

### Ejecutar el Bot
```bash
# Usar el nuevo archivo principal
node bot.js

# O el archivo original (no recomendado)
node fIREBASEDISCORDBOT.js
```

### Configuración
El sistema se integra automáticamente con:
- Sistema de vinculación existente
- Base de datos Firebase
- Sistema de rangos por ELO
- Estadísticas de jugadores

## 📊 Base de Datos

### Estructura en Firebase
```json
{
  "users": {
    "auth_id": {
      "discordId": "discord_user_id",
      "name": "PlayerName",
      "margapoints": 150,
      "inventory": {
        "TITLE_LEGEND": {
          "name": "Título: Leyenda",
          "type": "title",
          "value": "🏆 Leyenda",
          "purchaseDate": 1234567890
        }
      },
      "lastDaily": 1234567890,
      "achievements": []
    }
  },
  "transactions": {
    "auth_id": {
      "timestamp": {
        "amount": 50,
        "reason": "Bonus diario",
        "newBalance": 200
      }
    }
  }
}
```

## 🎯 Objetivos Cumplidos

✅ **Competitividad**: Sistema de ranking y desafíos entre jugadores
✅ **Actividad**: Bonus diarios y minijuegos mantienen a los usuarios activos
✅ **No transferible**: Evita farming y mantiene la integridad del sistema
✅ **Intuitivo**: Comandos simples y claros
✅ **Escalable**: Arquitectura modular permite agregar nuevas características
✅ **Integrado**: Funciona perfectamente con el sistema existente

## 🔮 Futuras Expansiones

- Sistema de logros automáticos
- Torneos semanales con premios
- Más minijuegos (adivinanzas, trivia)
- Items especiales por temporadas
- Sistema de apuestas en partidas reales

---

**Desarrollado para Margarita X4** 🌊
*Sistema de Margapoints - Mantén tu Discord activo y competitivo*
