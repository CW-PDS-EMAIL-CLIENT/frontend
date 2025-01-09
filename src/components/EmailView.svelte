<script>
    export let idEmail;  // ID письма, которое нужно отобразить
    export let folderEmail;

    export let onClose;  // Функция для возвращения к списку писем

    let email = null; // Для хранения информации о письме

    async function loadEmailDetails() {
        email = null;
        try {
            const response = await fetch('http://localhost:8000/emails/info/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email_id: idEmail, folder_name: folderEmail }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                alert(`Не удалось загрузить детали письма: ${JSON.stringify(errorData)}`);
                return;
            }

            const data = await response.json();
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                alert('Некорректный формат данных от API.');
                return;
            }

            email = data;
        } catch (error) {
            console.error('Ошибка при загрузке деталей письма:', error);
            alert('Произошла ошибка при подключении к серверу. Проверьте соединение и попробуйте снова.');
        }
    }

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
            alert(`Ошибка загрузки файла ${filename}:`, error)
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date);
    }

    $: if (idEmail) {
        loadEmailDetails();
    }

</script>

<div class="email-view">
    <button class="back-button" on:click={onClose}>⬅ Назад</button>
    {#if email}
        <div class="email-header">
            <h2>{email.sender}</h2>
            <p class="subject"><strong>Тема:</strong> {email.subject}</p>
        </div>
        <div class="email-meta">
            <p><strong>Кому:</strong> {email.to}</p>
            <p><strong>Дата:</strong> {formatDate(email.date)}</p>
        </div>
        <div class="email-content">
            <p>{@html email.body}</p>
        </div>
        {#if email.attachments && email.attachments.length > 0}
            <div class="attachments">
                <h3>Вложения:</h3>
                <ul>
                    {#each email.attachments as attachment}
                        <li>
                            <span>{attachment}</span>
                            <button class="download-button" on:click={() => downloadFile(attachment)}>Скачать</button>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    {:else}
        <div class="loading">Загрузка...</div>
    {/if}
</div>

<style>
    .email-view {
        padding: 20px;
        background: linear-gradient(to bottom right, #f9f9f9, #ffffff);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        font-family: Arial, sans-serif;
        color: #333;
    }

    .back-button {
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .back-button:hover {
        background-color: #0056b3;
    }

    .email-header {
        margin-bottom: 20px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }

    .email-header h2 {
        margin: 0;
        font-size: 1.8em;
        color: #444;
    }

    .email-meta {
        margin-bottom: 20px;
        font-size: 0.9em;
        color: #666;
    }

    .email-content {
        margin-top: 20px;
        font-size: 1em;
        line-height: 1.6;
    }

    .attachments {
        margin-top: 20px;
        background: #f8f9fa;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .attachments ul {
        list-style: none;
        padding: 0;
    }

    .attachments li {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .attachments span {
        flex: 1;
    }

    .download-button {
        background: #28a745;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .download-button:hover {
        background: #218838;
    }

    .loading {
        font-size: 1.2em;
        color: #777;
        text-align: center;
        padding: 20px;
    }
</style>
