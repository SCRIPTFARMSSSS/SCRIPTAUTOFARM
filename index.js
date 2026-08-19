// Используем глобальный объект в памяти процесса Vercel
let globalStats = {
    total: 0,
    games: {}
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1530217450468147361/TzpmM1qBdSLKSIAtnXURf8-xUx2VCf0GEw-9fl0SYiZAuhueHvIFcxYrxUDjPHqw7qnE";

    try {
        let body = req.body || {};
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) {}
        }

        const scriptName = body.scriptName || "General Script";
        const playerName = body.playerName || "Unknown";
        const playerId = body.playerId || 0;
        const gameId = String(body.gameId || "0");
        const gameName = body.gameName || "Unknown Game";

        // Увеличиваем общие цифры
        globalStats.total += 1;
        if (!globalStats.games[gameId]) {
            globalStats.games[gameId] = 0;
        }
        globalStats.games[gameId] += 1;

        const currentGameLogs = globalStats.games[gameId];
        const totalLogs = globalStats.total;

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
            return res.status(500).json({ error: "Discord Error", details: errText });
        }

        return res.status(200).json({ success: true, gameLogs: currentGameLogs, totalLogs: totalLogs });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
