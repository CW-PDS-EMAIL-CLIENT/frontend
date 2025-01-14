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
        <button class="expand-btn" on:click={toggleExpand}>{$isExpanded ? "Свернуть" : "Развернуть"}</button>
        <button class="close-btn" on:click={() => dispatch("close")}>Закрыть</button>
    </div>

    <!-- Панель инструментов для форматирования -->
    <div class="toolbar">
        <button on:click={() => formatText('bold')} title="Жирный текст">
            <img src="/icons/bold-icon.svg" alt="Жирный текст" />
        </button>
        <button on:click={() => formatText('italic')} title="Курсив">
            <img src="/icons/italic-icon.svg" alt="Курсив" />
        </button>
        <button on:click={() => formatText('underline')} title="Подчеркнутый текст">
            <img src="/icons/underline-icon.svg" alt="Подчеркнутый текст" />
        </button>
        <button on:click={() => formatText('strikeThrough')} title="Зачеркнутый текст">
            <img src="/icons/strikethrough-icon.svg" alt="Зачеркнутый текст" />
        </button>
        <button on:click={() => formatText('justifyLeft')} title="Выравнивание влево">
            <img src="/icons/align-left-icon.svg" alt="Выравнивание влево" />
        </button>
        <button on:click={() => formatText('justifyCenter')} title="Выравнивание по центру">
            <img src="/icons/align-center-icon.svg" alt="Выравнивание по центру" />
        </button>
        <button on:click={() => formatText('justifyRight')} title="Выравнивание вправо">
            <img src="/icons/align-right-icon.svg" alt="Выравнивание вправо" />
        </button>
        <button on:click={addLink} title="Добавить ссылку">
            <img src="/icons/link-icon.svg" alt="Добавить ссылку" />
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

    .header button {
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 1em;
        border-radius: 5px;
        transition: transform 0.2s, background-color 0.3s;
    }

    .header button:hover {
        background-color: #f0f0f0;
        transform: scale(1.05);
    }

    .header button:active {
        background-color: #e0e0e0;
        transform: scale(0.95);
    }

    .expand-btn {
        color: #0066cc;
        background-color: #f9f9f9;
    }

    .close-btn {
        color: #cc0000;
        background-color: #fff5f5;
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
