<script>
    export let email;
    export let onClose;

    let manualSavePath = ''; // Переменная для хранения пути, введённого вручную

    // Функция для форматирования даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    // Функция для выбора директории через окно выбора
    async function selectDirectory() {
        try {
            const directoryHandle = await window.showDirectoryPicker();
            if (directoryHandle) {
                console.log("Выбрана директория:", directoryHandle);

                // Работа с файлами в директории
                for await (const [name, handle] of directoryHandle.entries()) {
                    console.log(`Элемент: ${name}, Тип: ${handle.kind}`);
                }

                alert(`Вы выбрали директорию: ${directoryHandle.name}`);

                // Если нужно передать её на сервер, используем имя
                const savePath = directoryHandle.name;

                const response = await fetch(`http://localhost:8000/emails/save_attachments`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ save_path: savePath }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(`Ошибка сервера: ${error.detail}`);
                }

                const message = await response.json();
                console.log("Ответ сервера:", message.message);
            }
        } catch (error) {
            console.error("Ошибка при выборе директории:", error);
        }
    }

    // Функция для отправки пути, введённого вручную
    async function saveToManualPath() {
        try {
            if (!manualSavePath) {
                alert("Введите путь для сохранения вложений.");
                return;
            }

            const response = await fetch(`http://localhost:8000/emails/save_attachments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ save_path: manualSavePath }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Ошибка сервера: ${error.detail}`);
            }

            const message = await response.json();
            alert(`Вложения успешно сохранены в: ${manualSavePath}`);
            console.log("Ответ сервера:", message.message);
        } catch (error) {
            console.error("Ошибка при сохранении вложений:", error);
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
            <div class="attachments_path">
                <input
                    type="text"
                    placeholder="Введите полный путь"
                    bind:value={manualSavePath}
                />
                <button class="save-button" on:click={saveToManualPath}>Сохранить файлы (введённый путь)</button>
            </div>
            <h3>Вложения:</h3>
            <ul>
                {#each email.attachments as attachment}
                    <li>{attachment}</li>
                {/each}
            </ul>
            <!-- <button class="save-button" on:click={selectDirectory}>Сохранить файлы (выбор директории)</button> -->
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

    .attachments_path {
        padding: 5px;
        border: 1px solid lightgray; /* Ширина: 2px, стиль: solid, цвет: черный */
        border-radius: 5px; /* Радиус закругления */
    }

    .save-button {
        margin-top: 10px;
        padding: 10px 20px;
        font-size: 1em;
        cursor: pointer;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
    }

    .save-button:hover {
        background-color: #0056b3;
    }

    input {
        margin-top: 10px;
        padding: 8px;
        font-size: 1em;
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
</style>
