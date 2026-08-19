// Глобальный объект для хранения счетчиков прямо в памяти сервера
const counters = {
    total: 0,
    games: {} // Ключ — ID игры, значение — количество запусков
};

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1530217450468147361/TzpmM1qBdSLKSIAtnXURf8-xUx2VCf0GEw-9fl0SYiZAuhueHvIFcxYrxUDjPHqw7qnE";

    try {
        let body = req.body;
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        const scriptName = body.scriptName || "General Script";
        const playerName = body.playerName || "Unknown";
        const playerId = body.playerId || 0;
        const gameId = String(body.gameId || "0");
        const gameName = body.gameName || "Unknown Game";

        // Увеличиваем общий счетчик и счетчик для конкретной игры
        counters.total += 1;
        if (!counters.games[gameId]) {
            counters.games[gameId] = 0;
        }
        counters.games[gameId] += 1;

        const currentGameLogs = counters.games[gameId];
        const totalLogs = counters.total;

        // Формируем эмбед с реальными инкрементируемыми цифрами
        const discordPayload = {
            embeds: [{
                title: "🌐 Script Launched Successfully!",
                description: `✨ Player successfully activated the script in **${scriptName}**`,
                type: "rich",
                color: 0x00A2FF,
                fields: [
                    { name: "👤 NickName", value: `\`${playerName}\``, inline: false },
                    { name: "🆔 User ID", value: `\`${playerId}\``, inline: false },
                    { name: "🎮 Game", value: `🌐 ${gameName}\n(\`${gameId}\`)`, inline: false },
                    { 
                        name: "📊 статистика логов", 
                        value: `📌 Логи в этой игре: **#${currentGameLogs}**\n📈 Всего логов (общие): **#${totalLogs}**`, 
                        inline: false 
                    },
                    { name: "🔗 Profile", value: `[Открыть профиль](https://www.roblox.com/users/${playerId}/profile)`, inline: false }
                ],
                footer: { text: `MacROS Logger • ${scriptName}` },
                timestamp: new Date().toISOString()
            }]
        };

        const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        });

        if (!discordResponse.ok) {
            const errText = await discordResponse.text();
            return res.status(500).json({ error: "Discord API Error", details: errText });
        }

        return res.status(200).json({ success: true, gameLogs: currentGameLogs, totalLogs: totalLogs });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
