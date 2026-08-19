// index.js (Node.js / Vercel Serverless Function)
export default async function handler(req, res) {
    // Разрешаем запросы только методом POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Твой реальный вебхук Discord (вшит на сервере, в Роблоксе его не увидят)
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1527650269783916736/Hwe5LnJD26DtG9E2tKlX6Djeo-YeA_9999RhP3weZQyUJ1Yariyyujev801GFQ3LaFek";

    try {
        const body = req.body;
        const scriptName = body.scriptName || "General Script";
        const playerName = body.playerName || "Unknown";
        const playerId = body.playerId || 0;
        const gameId = body.gameId || 0;
        const gameName = body.gameName || "Unknown Game";

        // Простейший механизм подсчета (можно привязать базу данных, 
        // но для теста пока сделаем инкремент в памяти или передачу счетчиков)
        // Для стабильности счетчиков на постоянку лучше использовать KV-хранилище Vercel,
        // но пока проверим саму связку.
        
        // Формируем красивый Embed для отправки в твой Discord канал
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
                        value: `📌 Логи в этой игре: **#1**\n📈 Всего логов (общие): **#1**`, 
                        inline: false 
                    },
                    { name: "🔗 Profile", value: `[Открыть профиль](https://www.roblox.com/users/${playerId}/profile)`, inline: false }
                ],
                footer: { text: `MacROS Logger • ${scriptName}` },
                timestamp: new Date().toISOString()
            }]
        };

        // Отправляем запрос в Discord
        const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        });

        if (!discordResponse.ok) {
            const errText = await discordResponse.text();
            return res.status(500).json({ error: "Discord API Error", details: errText });
        }

        return res.status(200).json({ success: true, message: "Log sent successfully!" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
