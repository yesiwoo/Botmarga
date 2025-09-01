const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, update, remove, onValue } = require('firebase/database');

// Importar sistema de Margapoints
const { handleMargapointsCommands, integrateMargapointsInLinking } = require('./src/margapointsBot');
const { updateUserMargapoints } = require('./src/utils/margapoints');

// Importar sistema de seguridad anti-abuso
const { 
    canUserLink, 
    recordSuccessfulLink, 
    recordUnlink, 
    applyMargapointsProtection 
} = require('./src/security/antiAbuse');

// Importar el sistema expandido de juegos
const { 
    handleGameCommands, 
    handleGameAnswers, 
    handleGameReactions,
    showGameStats 
} = require('./src/expandedBot');

// Importar juego Flash
const { handleFlashButton, handleFlashAnswer } = require('./src/games/flash');

// Importar manejo de botones de secuencias
const { handleSequenceButton } = require('./src/games/sequence');

// Importar sistemas de eventos
const { 
    initializeEventSystem, 
    initializeWeeklyCommunityChallenge 
} = require('./src/systems/events');

// Importar juegos comunitarios automáticos - DESHABILITADO
// const { 
//     initializeCommunityGames, 
//     handleCommunityGameAnswer,
//     handleCommunityReactionAdd 
// } = require('./src/systems/communityGames');

// Importar sistema de migración
const { 
    migrateExistingUsers, 
    isMigrationCompleted, 
    handleMigrationCommand 
} = require('./src/utils/migration');

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDnly9TjRRAAtsa0XDu9wIz4prPIRrKav0",
    authDomain: "margarita-f5045.firebaseapp.com",
    databaseURL: "https://margarita-f5045-default-rtdb.firebaseio.com",
    projectId: "margarita-f5045",
    storageBucket: "margarita-f5045.firebasestorage.app",
    messagingSenderId: "798918950756",
    appId: "1:798918950756:web:5b5f378e0479abb6fec471",
    measurementId: "G-BB3QLBVWKY"
};

// Inicializar Firebase
console.log('Initializing Firebase...');
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Crear cliente de Discord
console.log('Creating Discord client...');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Sistema de rangos basado en ELO
const RANK_SYSTEM = {
    NEWBIE: { name: "ηєωвιє", icon: "🦠", minElo: 0, maxElo: 100, color: "#706F6E" },
    APPRENTICE: { name: "αρяєη∂ιz", icon: "🥨", minElo: 101, maxElo: 200, color: "#FF1493" },
    HIGHLIGHTED: { name: "∂єѕтα¢α∂σ", icon: "⏳", minElo: 201, maxElo: 300, color: "#B8B5FF" },
    OUTSTANDING: { name: "ѕσвяєѕαℓιєηтє", icon: "🌕", minElo: 301, maxElo: 400, color: "#EBEBEB" },
    SKILLED: { name: "ѕкιℓℓє∂", icon: "🌀", minElo: 401, maxElo: 500, color: "#F0E68C" },
    EXPERIENCED: { name: "єχρєяιмєηтα∂σ", icon: "✨", minElo: 501, maxElo: 600, color: "#B0E0E6" },
    RADIANT: { name: "яα∂ιαηтє", icon: "➰", minElo: 601, maxElo: 700, color: "#A6FFA9" },
    GAMER: { name: "gαмєя", icon: "🎮", minElo: 701, maxElo: 800, color: "#FFFACD" },
    PRO_SKILLED: { name: "ρяσ ѕкιℓℓє∂", icon: "👹", minElo: 801, maxElo: 900, color: "#EEE8AA" },
    SHOOTING_STAR: { name: "єѕтяєℓℓα ƒυgαz", icon: "🌟", minElo: 901, maxElo: 1000, color: "#FFDAB9" },
    NO_FEAR: { name: "ησ ƒєαя", icon: "🌌", minElo: 1001, maxElo: 1100, color: "#FFEBCD" },
    ASCENDANT: { name: "αѕ¢єη∂єηтє", icon: "🌈", minElo: 1101, maxElo: 1200, color: "#FFF8DC" },
    CRACKED: { name: "¢яα¢кє∂", icon: "⚡", minElo: 1201, maxElo: 1300, color: "#FF1966" },
    MASTERMIND: { name: "мαѕтєямιη∂", icon: "🏅", minElo: 1301, maxElo: 1400, color: "#FF4D0D" },
    PRODIGY: { name: "ρяσ∂ιgισ", icon: "🥇", minElo: 1401, maxElo: 1500, color: "#FF9A17" },
    CHALLENGER: { name: "Challenger", icon: "🏆", minElo: 1501, maxElo: 1600, color: "#DCEC4C" },
    SUPREME: { name: "Supreme", icon: "💮", minElo: 1601, maxElo: 1700, color: "#DFB241" },
    RAGNAROK: { name: "Ragnarok", icon: "☄️", minElo: 1701, maxElo: 2000, color: "#FF143" },
    SSL: { name: "Supersonic Legend", icon: "🏵️", minElo: 2001, maxElo: Infinity, color: "#FFD700" }
};

// Función para obtener rango desde ELO
function getRankFromElo(elo) {
    for (const rank of Object.values(RANK_SYSTEM)) {
        if (elo >= rank.minElo && elo <= rank.maxElo) {
            return rank;
        }
    }
    return RANK_SYSTEM.NEWBIE;
}

// Función para verificar si un usuario ya está vinculado
async function isUserAlreadyLinked(discordId, auth) {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);

    let isLinked = false;
    snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.discordId === discordId || user.auth === auth) {
            isLinked = true;
        }
    });

    return isLinked;
}

client.on('ready', async () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
    console.log('Bot is ready and connected to Discord.');
    
    // Establecer referencia global del cliente para otros módulos
    global.discordClient = client;
    
    // Inicializar sistemas de eventos
    initializeEventSystem();
    initializeWeeklyCommunityChallenge();
    console.log('Sistemas de eventos y desafíos comunitarios inicializados');
    
    // Inicializar juegos comunitarios automáticos - DESHABILITADO
    // initializeCommunityGames(client);
    // console.log('🎮 Juegos comunitarios automáticos inicializados');
    
    // 🔄 Verificar y ejecutar migración automática de usuarios existentes
    try {
        const migrationCompleted = await isMigrationCompleted(database);
        if (!migrationCompleted) {
            console.log('🔄 Ejecutando migración automática de usuarios existentes...');
            const result = await migrateExistingUsers(database);
            console.log(`✅ Migración automática completada: ${result.migrated} usuarios migrados, ${result.errors} errores`);
        } else {
            console.log('ℹ️ Migración ya completada anteriormente');
        }
    } catch (error) {
        console.error('❌ Error durante la migración automática:', error);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Intentar manejar comandos de Margapoints primero
    const margapointsHandled = await handleMargapointsCommands(message, database);
    if (margapointsHandled) return;

    // Intentar manejar comandos de juegos expandidos
    const gameCommandHandled = await handleGameCommands(message, database);
    if (gameCommandHandled) return;

    // Intentar manejar respuestas de juegos
    const gameAnswerHandled = await handleGameAnswers(message, database);
    if (gameAnswerHandled) return;

    // Manejar respuestas del juego Flash
    const flashAnswerHandled = await handleFlashAnswer(message, database);
    if (flashAnswerHandled) return;

    // Manejar respuestas de juegos comunitarios automáticos (solo en canal general) - DESHABILITADO
    // if (message.channel.id === '1187779164217028710') {
    //     const communityGameHandled = await handleCommunityGameAnswer(message, database);
    //     if (communityGameHandled) return;
    // }

    // Comando de vinculación
    if (message.content.startsWith('!vincular ')) {
        const code = message.content.split(' ')[1];

        try {
            const vinculationRef = ref(database, `vinculaciones/${code}`);
            const snapshot = await get(vinculationRef);

            if (snapshot.exists()) {
                const vinculationData = snapshot.val();

                // Verificar que el código no haya expirado
                if (Date.now() - vinculationData.createdAt > 10 * 60 * 1000) {
                    return message.reply('❌ El código de vinculación ha expirado. Genera uno nuevo en Haxball.');
                }

                // Verificar si ya está vinculado
                const alreadyLinked = await isUserAlreadyLinked(message.author.id, vinculationData.auth);
                if (alreadyLinked) {
                    return message.reply('❌ Esta cuenta ya está vinculada. No puedes vincular múltiples cuentas.');
                }

                // Recuperar las estadísticas del jugador
                const statsRef = ref(database, `playerStats/${vinculationData.auth}`);
                const statsSnapshot = await get(statsRef);

                let playerStats = {
                    wins: 0,
                    games: 0,
                    goals: 0,
                    assists: 0,
                    cleanSheets: 0,
                    elo: 0,
                    playtime: 0
                };
                if (statsSnapshot.exists()) {
                    playerStats = statsSnapshot.val();
                }

                // 🔒 VERIFICACIONES DE SEGURIDAD ANTI-ABUSO
                const linkPermission = await canUserLink(message.author.id, vinculationData.auth, playerStats, database);
                if (!linkPermission.allowed) {
                    return message.reply(linkPermission.reason);
                }

                const elo = playerStats.elo || 0;
                const rank = getRankFromElo(elo);

                // Actualizar la vinculación con el ID de Discord
                await update(vinculationRef, {
                    discordId: message.author.id,
                    discordName: message.author.username,
                    status: 'completed'
                });

                // Integrar datos de Margapoints
                const margapointsData = integrateMargapointsInLinking(playerStats);

                // Actualizar el usuario en la base de datos
                const userRef = ref(database, `users/${vinculationData.auth}`);
                await set(userRef, {
                    discordId: message.author.id,
                    discordName: message.author.username,
                    auth: vinculationData.auth,
                    name: vinculationData.playerName,
                    ...margapointsData
                });

                // 🔒 Registrar vinculación exitosa para seguridad
                await recordSuccessfulLink(message.author.id, vinculationData.auth, database);

                // 🔒 Aplicar protección de Margapoints (resetear si es re-vinculación)
                const margapointsReset = await applyMargapointsProtection(message.author.id, vinculationData.auth, database);
                
                let resetMessage = '';
                if (margapointsReset) {
                    resetMessage = '\n\n🔒 **PROTECCIÓN ANTI-ABUSO ACTIVADA**\n⚠️ Tus Margapoints han sido reseteados a 0 porque esta cuenta ya fue vinculada anteriormente.\n💡 Esta medida previene el abuso del sistema de puntos.';
                }

                // Crear un mensaje embed con las estadísticas
                const embed = new EmbedBuilder()
                    .setColor(rank.color)
                    .setTitle(`🎉 ¡Vinculación Exitosa!`)
                    .setDescription(`🔗 **${vinculationData.playerName}** se ha vinculado correctamente con **${message.author.username}**${resetMessage}`)
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
                    .addFields(
                        {
                            name: '🏆 Rango Actual',
                            value: `${rank.icon} **${rank.name}**`,
                            inline: true
                        },
                        {
                            name: '⚡ ELO (RR)',
                            value: `**${elo}** puntos`,
                            inline: true
                        },
                        {
                            name: '💰 Margapoints',
                            value: `**${margapointsData.margapoints}** MP`,
                            inline: true
                        },
                        {
                            name: '🎯 Winrate',
                            value: `**${playerStats.games > 0 ? ((playerStats.wins / playerStats.games) * 100).toFixed(1) : 0}%**`,
                            inline: true
                        },
                        {
                            name: '🏆 Victorias',
                            value: `**${playerStats.wins}**`,
                            inline: true
                        },
                        {
                            name: '🎮 Partidos',
                            value: `**${playerStats.games}**`,
                            inline: true
                        },
                        {
                            name: '⚽ Goles',
                            value: `**${playerStats.goals}**`,
                            inline: true
                        },
                        {
                            name: '🅰️ Asistencias',
                            value: `**${playerStats.assists}**`,
                            inline: true
                        },
                        {
                            name: '🥅 Cleansheets',
                            value: `**${playerStats.cleanSheets || playerStats.CS || 0}**`,
                            inline: true
                        }
                    )
                    .addFields(
                        {
                            name: '💡 Comandos Margapoints',
                            value: '`!margapoints` • `!daily` • `!duelo @user` • `!flipcoin @user <cantidad>` • `!secuencia @user` • `!tienda` • `!top`',
                            inline: false
                        }
                    )
                    .setFooter({ 
                        text: '🌊 Margarita X4 | Sistema de Estadísticas y Margapoints',  
                        iconURL: 'https://i.postimg.cc/44FKSXBX/Margarita-2.gif' 
                    })
                    .setTimestamp();

                await message.channel.send({ embeds: [embed] });
            } else {
                message.reply('❌ Código de vinculación no encontrado.');
            }
        } catch (error) {
            console.error(error);
            message.reply('❌ Ocurrió un error al procesar la vinculación.');
        }
    }

    // Comando de desvinculación
    if (message.content === '!desvincular') {
        try {
            const usersRef = ref(database, 'users');
            const usersSnapshot = await get(usersRef);

            let userData = null;
            let userKey = null;
            usersSnapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                if (user.discordId === message.author.id) {
                    userData = user;
                    userKey = childSnapshot.key;
                }
            });

            if (!userData) {
                return message.reply('❌ No tienes una cuenta vinculada.');
            }

            // 🔒 Registrar desvinculación para seguridad
            await recordUnlink(message.author.id, userData.auth, database);

            // 🗑️ ELIMINAR COMPLETAMENTE el usuario del Firebase
            const userRef = ref(database, `users/${userKey}`);
            await remove(userRef);

            // También limpiar cualquier código de vinculación pendiente
            const vinculationsRef = ref(database, 'vinculaciones');
            const vinculationsSnapshot = await get(vinculationsRef);
            
            if (vinculationsSnapshot.exists()) {
                const updates = {};
                vinculationsSnapshot.forEach((childSnapshot) => {
                    const vinculation = childSnapshot.val();
                    if (vinculation.discordId === message.author.id) {
                        updates[`vinculaciones/${childSnapshot.key}`] = null;
                    }
                });
                
                if (Object.keys(updates).length > 0) {
                    await update(ref(database), updates);
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🔓 Desvinculación Completada')
                .setDescription(`Tu cuenta **${userData.name || 'Usuario'}** ha sido completamente desvinculada del sistema.`)
                .addFields(
                    {
                        name: '⚠️ Importante',
                        value: 'Debes esperar **2 horas** antes de poder vincular otra cuenta.',
                        inline: false
                    },
                    {
                        name: '🔄 Para volver a vincular',
                        value: 'Usa el comando `!vincular <código>` en Haxball cuando generes un nuevo código.',
                        inline: false
                    }
                )
                .setFooter({ 
                    text: '🌊 Margarita X4 | Sistema de Vinculación',  
                    iconURL: 'https://i.postimg.cc/44FKSXBX/Margarita-2.gif' 
                })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error en desvinculación:', error);
            message.reply('❌ Ocurrió un error al desvincular tu cuenta.');
        }
    }

    // Comando de migración manual (solo administradores)
    if (message.content === '!migrar') {
        return await handleMigrationCommand(message, database);
    }

    // Comando especial de vinculación administrativa (solo para usuario específico)
    if (message.content.startsWith('!vincacc ')) {
        // Verificar que sea el usuario autorizado
        if (message.author.id !== '577779555289268235') {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        const mention = message.mentions.users.first();
        if (!mention) {
            return message.reply('❌ Debes mencionar a un usuario. Ejemplo: `!vincacc @usuario`');
        }

        try {
            // Buscar códigos de vinculación pendientes
            const vinculationsRef = ref(database, 'vinculaciones');
            const vinculationsSnapshot = await get(vinculationsRef);

            if (!vinculationsSnapshot.exists()) {
                return message.reply('❌ No hay códigos de vinculación pendientes.');
            }

            let availableVinculations = [];
            vinculationsSnapshot.forEach((childSnapshot) => {
                const vinculation = childSnapshot.val();
                // Buscar códigos sin Discord ID asignado y no expirados
                if (!vinculation.discordId && (Date.now() - vinculation.createdAt) <= 10 * 60 * 1000) {
                    availableVinculations.push({
                        code: childSnapshot.key,
                        ...vinculation
                    });
                }
            });

            if (availableVinculations.length === 0) {
                return message.reply('❌ No hay códigos de vinculación válidos disponibles.');
            }

            // Tomar el primer código disponible
            const vinculationData = availableVinculations[0];
            const vinculationRef = ref(database, `vinculaciones/${vinculationData.code}`);

            // Verificar si ya está vinculado
            const alreadyLinked = await isUserAlreadyLinked(mention.id, vinculationData.auth);
            if (alreadyLinked) {
                return message.reply(`❌ ${mention.username} ya tiene una cuenta vinculada.`);
            }

            // Recuperar las estadísticas del jugador
            const statsRef = ref(database, `playerStats/${vinculationData.auth}`);
            const statsSnapshot = await get(statsRef);

            let playerStats = {
                wins: 0,
                games: 0,
                goals: 0,
                assists: 0,
                cleanSheets: 0,
                elo: 0,
                playtime: 0
            };
            if (statsSnapshot.exists()) {
                playerStats = statsSnapshot.val();
            }

            const elo = playerStats.elo || 0;
            const rank = getRankFromElo(elo);

            // Actualizar la vinculación con el ID de Discord del usuario mencionado
            await update(vinculationRef, {
                discordId: mention.id,
                discordName: mention.username,
                status: 'completed'
            });

            // Integrar datos de Margapoints
            const margapointsData = integrateMargapointsInLinking(playerStats);

            // Actualizar el usuario en la base de datos
            const userRef = ref(database, `users/${vinculationData.auth}`);
            await set(userRef, {
                discordId: mention.id,
                discordName: mention.username,
                auth: vinculationData.auth,
                name: vinculationData.playerName,
                ...margapointsData
            });

            // 🔒 Registrar vinculación exitosa para seguridad
            await recordSuccessfulLink(mention.id, vinculationData.auth, database);

            // 🔒 Aplicar protección de Margapoints (resetear si es re-vinculación)
            const margapointsReset = await applyMargapointsProtection(mention.id, vinculationData.auth, database);
            
            let resetMessage = '';
            if (margapointsReset) {
                resetMessage = '\n\n🔒 **PROTECCIÓN ANTI-ABUSO ACTIVADA**\n⚠️ Los Margapoints han sido reseteados a 0 porque esta cuenta ya fue vinculada anteriormente.';
            }

            // Crear un mensaje embed con las estadísticas
            const embed = new EmbedBuilder()
                .setColor(rank.color)
                .setTitle(`🔧 ¡Vinculación Administrativa Exitosa!`)
                .setDescription(`🔗 **${vinculationData.playerName}** ha sido vinculado administrativamente con **${mention.username}**${resetMessage}`)
                .setThumbnail(mention.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    {
                        name: '👤 Usuario Vinculado',
                        value: `${mention.username} (${mention.id})`,
                        inline: true
                    },
                    {
                        name: '🏆 Rango Actual',
                        value: `${rank.icon} **${rank.name}**`,
                        inline: true
                    },
                    {
                        name: '⚡ ELO (RR)',
                        value: `**${elo}** puntos`,
                        inline: true
                    },
                    {
                        name: '💰 Margapoints',
                        value: `**${margapointsData.margapoints}** MP`,
                        inline: true
                    },
                    {
                        name: '🎯 Winrate',
                        value: `**${playerStats.games > 0 ? ((playerStats.wins / playerStats.games) * 100).toFixed(1) : 0}%**`,
                        inline: true
                    },
                    {
                        name: '🎮 Partidos',
                        value: `**${playerStats.games}**`,
                        inline: true
                    },
                    {
                        name: '🔧 Administrador',
                        value: `Vinculado por: ${message.author.username}`,
                        inline: false
                    }
                )
                .setFooter({ 
                    text: '🌊 Margarita X4 | Vinculación Administrativa',  
                    iconURL: 'https://i.postimg.cc/44FKSXBX/Margarita-2.gif' 
                })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

            // Notificar al usuario vinculado
            try {
                await mention.send(`🎉 ¡Tu cuenta de Discord ha sido vinculada administrativamente con **${vinculationData.playerName}** en Margarita X4!\n\n💡 Ya puedes usar todos los comandos de Margapoints: \`!margapoints\`, \`!daily\`, \`!duelo\`, etc.`);
            } catch (error) {
                // Si no se puede enviar DM, no es crítico
                console.log(`No se pudo enviar DM a ${mention.username}`);
            }

        } catch (error) {
            console.error('Error en vinculación administrativa:', error);
            message.reply('❌ Ocurrió un error al procesar la vinculación administrativa.');
        }
    }

    // Comando !margastats (mejorado con Margapoints)
    if (message.content === '!margastats') {
        try {
            const usersRef = ref(database, 'users');
            const usersSnapshot = await get(usersRef);

            let userData = null;
            usersSnapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                if (user.discordId === message.author.id) {
                    userData = user;
                }
            });

            if (!userData) {
                return message.reply('❌ No tienes una cuenta vinculada. Usa !vincular en Haxball primero.');
            }

            const statsRef = ref(database, `playerStats/${userData.auth}`);
            const statsSnapshot = await get(statsRef);

            let playerStats = {
                wins: 0,
                games: 0,
                goals: 0,
                assists: 0,
                cleanSheets: 0,
                ownGoals: 0,
                elo: 0
            };

            if (statsSnapshot.exists()) {
                const fetchedStats = statsSnapshot.val();
                playerStats = {
                    wins: fetchedStats.wins || 0,
                    games: fetchedStats.games || 0,
                    goals: fetchedStats.goals || 0,
                    assists: fetchedStats.assists || 0,
                    cleanSheets: fetchedStats.CS || fetchedStats.cleanSheets || 0,
                    ownGoals: fetchedStats.ownGoals || 0,
                    elo: fetchedStats.elo || 0
                };
            }

            const elo = playerStats.elo || 0;
            const rank = getRankFromElo(elo);

            // NO actualizar margapoints automáticamente - mostrar el balance actual
            const currentMargapoints = userData.margapoints || 0;

            const embed = new EmbedBuilder()
                .setColor(rank.color)
                .setTitle(`📊 Estadísticas de ${userData.name}`)
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
                .setDescription(`**🏆 Rango:** ${rank.icon} ${rank.name}\n**💰 Margapoints:** ${currentMargapoints}\n
\`\`\`

 ⚡ELO (RR)        : ${elo.toString().padStart(6, ' ')}           
 🏆 Victorias      : ${(playerStats.wins || 0).toString().padStart(6, ' ')}           
 🎮 Partidos       : ${(playerStats.games || 0).toString().padStart(6, ' ')}           
 ⚽ Goles          : ${(playerStats.goals || 0).toString().padStart(6, ' ')}           
 🅰️ Asistencias    :  ${(playerStats.assists || 0).toString().padStart(5, ' ')}           
 🥅 Cleansheets    :   ${(playerStats.cleanSheets || 0).toString().padStart(4, ' ')}           
 🔴 Goles en contra:    ${(playerStats.ownGoals || 0).toString().padStart(2, ' ')}           

\`\`\``)
                .addFields(
                    {
                        name: '💡 Comandos Margapoints',
                        value: '`!margapoints` • `!daily` • `!duelo @user` • `!flipcoin @user <cantidad>` • `!tienda`',
                        inline: false
                    }
                )
                .setFooter({ 
                    text: '🌊 Margarita X4 | Sistema de Estadísticas Avanzado',  
                    iconURL: 'https://i.postimg.cc/44FKSXBX/Margarita-2.gif' 
                })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ Ocurrió un error al recuperar tus estadísticas.');
        }
    }
});

// Manejar interacciones de botones
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    try {
        // Manejar botones de secuencias
        if (interaction.customId.startsWith('sequence_')) {
            const sequenceButtonHandled = await handleSequenceButton(interaction, database);
            if (sequenceButtonHandled) return;
        }

        // Manejar botones de duelos
        if (interaction.customId.startsWith('duel_')) {
            const { handleDuelButton } = require('./src/games/duel');
            const duelButtonHandled = await handleDuelButton(interaction, database);
            if (duelButtonHandled) return;
        }

        // Manejar botones de torres
        if (interaction.customId.startsWith('tower_')) {
            const { handleTowerButton } = require('./src/games/tower');
            const towerButtonHandled = await handleTowerButton(interaction, database);
            if (towerButtonHandled) return;
        }

        // Manejar botones de Flash
        if (interaction.customId.startsWith('flash_')) {
            const flashButtonHandled = await handleFlashButton(interaction, database);
            if (flashButtonHandled) return;
        }

        // Aquí se pueden agregar más manejadores de botones para otros juegos
        
    } catch (error) {
        console.error('Error handling button interaction:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Ocurrió un error al procesar la interacción.', ephemeral: true });
        }
    }
});

// Manejar reacciones para juegos de reacción
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    
    try {
        // Importar manejo de reacciones de duelos
        const { handleDuelReaction } = require('./src/games/duel');
        
        // Intentar manejar reacciones de duelos primero
        const duelHandled = await handleDuelReaction(reaction, user, database);
        if (duelHandled) return;
        
        // Intentar manejar reacciones de juegos individuales
        const individualGameHandled = await handleGameReactions(reaction, user, database);
        if (individualGameHandled) return;
        
        // Manejar reacciones de juegos comunitarios (solo en canal general) - DESHABILITADO
        // if (reaction.message.channel.id === '1187779164217028710') {
        //     await handleCommunityReactionAdd(reaction, user, database);
        // }
    } catch (error) {
        console.error('Error handling reaction:', error);
    }
});

// Iniciar el bot
client.login('MTEwMDU5MjA5MzM3NTc2NjU5OA.GK3uI7.hpu3GP5p810fbOpZtRSA7Zh8eEfi7IBdg9Tz6w');
