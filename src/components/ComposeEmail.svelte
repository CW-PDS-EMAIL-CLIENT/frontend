<script>
    import { createEventDispatcher } from "svelte";
    import { writable } from "svelte/store";
    import { drafts } from "./drafts.js";
    import { userEncrypt } from "./store.js";

    export let id = null; // Переданный id черновика

    const dispatch = createEventDispatcher();

    let to = "";
    let subject = "";
    let message = "";
    let attachments = []; // Хранилище выбранных файлов
    let isExpanded = writable(false); // Управление состоянием окна

    // Инициализация черновика при монтировании
    $: {
        if (id !== null) {
            const existingDraft = $drafts.find((draft) => draft.id === id);
            if (existingDraft) {
                openDraft(existingDraft);
            }
        }
    }

    // Функция для применения форматирования (HTML теги)
    function formatText(command) {
        document.execCommand(command, false, null);
    }

    // Функция для добавления ссылки
    function addLink() {
        const url = prompt('Введите URL ссылки:');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    }

    // Отправка письма через API
    async function sendEmail() {
        const formData = new FormData();
        formData.append("to_email", to);
        formData.append("subject", subject);
        formData.append("body", message);
        formData.append("from_name", "Your Name");
        formData.append("to_name", "Recipient Name");

        // Добавляем файлы в FormData
        attachments.forEach((file) => formData.append("attachments", file));

        // Добавляем глобальную переменную userEncrypt
        formData.append("use_encrypt", $userEncrypt);

        try {
            const response = await fetch("http://127.0.0.1:8000/emails/sent/", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Письмо успешно отправлено!");
                clearForm();
                dispatch("close");
            } else {
                const errorData = await response.json();
                alert(`Ошибка отправки: ${errorData.detail}`);
            }
        } catch (error) {
            alert(`Произошла ошибка: ${error.message}`);
        }
    }

    function handleFileChange(event) {
        // Добавляем выбранные файлы в массив вложений
        Array.from(event.target.files).forEach(file => {
            attachments = [...attachments, file];
        });
    }

    // Удаление файла из списка
    function removeAttachment(index) {
        attachments = attachments.filter((_, i) => i !== index);
    }

    // Расширение/сворачивание окна
    function toggleExpand() {
        isExpanded.update(value => !value);
    }

    // Сохранение черновика
    function saveDraft() {
        if (to.length === 0 && subject.length === 0 && message.length === 0 && attachments.length === 0) return;

        drafts.update((existingDrafts) => {
            if (id !== null) {
                // Обновление существующего черновика
                const draftIndex = existingDrafts.findIndex((d) => d.id === id);
                if (draftIndex !== -1) {
                    existingDrafts[draftIndex] = { id, to, subject, message, attachments };
                }
            } else {
                // Создание нового черновика
                id = Date.now();
                existingDrafts.push({ id, to, subject, message, attachments });
            }
            return existingDrafts;
        });
    }

    // Открытие существующего черновика
    function openDraft(draft) {
        to = draft.to || "";
        subject = draft.subject || "";
        message = draft.message || "";
        attachments = draft.attachments || [];
    }

    // Удаление черновика
    function deleteDraft() {
        drafts.update((existingDrafts) => existingDrafts.filter((d) => d.id !== id));
        clearForm();
    }

    // Очистка формы
    function clearForm() {
        to = "";
        subject = "";
        message = "";
        attachments = [];
        id = null;
    }

    // Автосохранение при изменении полей
    $: {
        if (to || subject || message || attachments.length > 0) {
            saveDraft();
        }
    }
</script>

<div class="compose-email" class:is-expanded={$isExpanded}>
    <div class="header">
        <h2>{id ? "Редактировать черновик" : "Написать письмо"}</h2>
        <button on:click={toggleExpand}>{$isExpanded ? "Свернуть" : "Развернуть"}</button>
        <button on:click={() => dispatch("close")}>Закрыть</button>
    </div>

    <!-- Панель инструментов для форматирования -->
    <div class="toolbar">
        <button on:click={() => formatText('bold')} title="Жирный текст">
            <span role="img" aria-label="Bold">💪</span> <!-- Эмодзи для жирного текста -->
        </button>
        <button on:click={() => formatText('italic')} title="Курсив">
            <span role="img" aria-label="Italic">✍️</span> <!-- Эмодзи для курсивного текста -->
        </button>
        <button on:click={() => formatText('underline')} title="Подчеркнутый текст">
            <span role="img" aria-label="Underline">❗</span> <!-- Эмодзи для подчеркнутого текста -->
        </button>
        <button on:click={() => formatText('strikeThrough')} title="Зачеркнутый текст">
            <span role="img" aria-label="Strike-through">❌</span> <!-- Эмодзи для зачеркнутого текста -->
        </button>
        <button on:click={() => formatText('justifyLeft')} title="Выравнивание влево">
            <span role="img" aria-label="Left Align">⬅️</span> <!-- Эмодзи для выравнивания текста влево -->
        </button>
        <button on:click={() => formatText('justifyCenter')} title="Выравнивание по центру">
            <span role="img" aria-label="Center Align">⬇️</span> <!-- Эмодзи для выравнивания текста по центру -->
        </button>
        <button on:click={() => formatText('justifyRight')} title="Выравнивание вправо">
            <span role="img" aria-label="Right Align">➡️</span> <!-- Эмодзи для выравнивания текста вправо -->
        </button>
        <button on:click={addLink} title="Добавить ссылку">
            <span role="img" aria-label="Add Link">🔗</span> <!-- Эмодзи для добавления ссылки -->
        </button>
    </div>

    <label>
        Кому:
        <input type="email" bind:value={to} placeholder="Введите email" />
    </label>
    <label>
        Тема:
        <input type="text" bind:value={subject} placeholder="Введите тему" />
    </label>
    
    <!-- Используем div с contenteditable вместо textarea -->
    <label>
        Сообщение:
        <div
            contenteditable="true"
            bind:innerHTML={message}
            class="editable-message"
            placeholder="Введите сообщение"
        ></div>
    </label>

    <label>
        Прикрепить файлы:
        <input type="file" multiple on:change={handleFileChange} />
    </label>

    <ul>
        {#each attachments as file, index}
            <li>
                {file.name} ({Math.round(file.size / 1024)} KB)
                <button on:click={() => removeAttachment(index)}>Удалить</button>
            </li>
        {/each}
    </ul>
    <button on:click={sendEmail}>Отправить</button>
</div>

<style>
    .compose-email {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        padding: 20px;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: width 0.3s, height 0.3s, bottom 0.3s, right 0.3s;
        max-height: 400px;
        overflow: auto;
    }

    .compose-email.is-expanded {
        width: 80%;
        height: 80%;
        bottom: 10%;
        right: 10%;
        max-height: none;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .toolbar {
        display: flex;
        justify-content: space-around;
        margin-bottom: 10px;
    }

    .toolbar button {
        background: none;
        border: none;
        cursor: pointer;
    }

    .toolbar img {
        width: 20px;
        height: 20px;
    }

    label {
        display: block;
        margin-top: 10px;
    }

    input {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        box-sizing: border-box;
    }

    .editable-message {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        box-sizing: border-box;
        min-height: 100px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .editable-message {
        min-height: 150px;
    }

    button {
        margin-top: 15px;
        padding: 10px 15px;
        cursor: pointer;
    }

    ul {
        list-style-type: none;
        padding: 0;
        margin-top: 10px;
    }

    li {
        font-size: 0.9em;
        color: #555;
    }

    li button {
        margin-left: 10px;
        color: red;
        cursor: pointer;
    }
</style>
