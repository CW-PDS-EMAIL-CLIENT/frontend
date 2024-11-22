<script>
    export let email;
    export let onClose;

    // Функция для форматирования даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    // Функция для загрузки файла
    async function downloadFile(filename) {
        try {
            const response = await fetch(`http://localhost:8000/attachments/${filename}`);
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Ошибка загрузки файла ${filename}:`, error);
        }
    }
</script>

<div class="email-view">
    <button class="back-button" on:click={onClose}>⬅</button>
    <h2>{email.sender}</h2>
    <p><strong>Тема:</strong> {email.subject}</p>
    <p><strong>Кому:</strong> {email.to}</p>
    <p><strong>Дата:</strong> {formatDate(email.date)}</p>
    <div class="email-content">
        <p>{@html email.body}</p>
    </div>
    {#if email.attachments && email.attachments.length > 0}
        <div class="attachments">
            <h3>Вложения:</h3>
            <ul>
                {#each email.attachments as attachment}
                    <li>
                        {attachment}
                        <button class="download-button" on:click={() => downloadFile(attachment)}>Скачать</button>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>

<style>
    .email-view {
        padding: 20px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .email-view h2 {
        margin: 0;
        font-size: 1.5em;
        color: #333;
    }

    .email-content {
        margin-top: 20px;
        font-size: 1em;
        line-height: 1.5;
    }

    .back-button {
        background: none;
        border: none;
        width: 60px;
        font-size: 28px;
        cursor: pointer;
        border-radius: 15%;
    }

    .back-button:hover {
        background-color: #f5f5f5;
    }

    .attachments {
        margin-top: 20px;
    }

    .download-button {
        margin-left: 10px;
        padding: 5px 10px;
        font-size: 0.9em;
        cursor: pointer;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
    }

    .download-button:hover {
        background-color: #0056b3;
    }
</style>
