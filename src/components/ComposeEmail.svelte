<script>
    import { createEventDispatcher } from "svelte";
    import { writable } from "svelte/store";
    import { drafts } from "./drafts.js";
    import { userEncrypt } from "./store.js";

    export let id = null;

    const dispatch = createEventDispatcher();

    let to = "";
    let subject = "";
    let message = "";
    let attachments = [];
    let isExpanded = writable(false);

    $: {
        if (id !== null) {
            const existingDraft = $drafts.find((draft) => draft.id === id);
            if (existingDraft) {
                openDraft(existingDraft);
            }
        }
    }

    function formatText(command) {
        document.execCommand(command, false, null);
    }

    function addLink() {
        const url = prompt('Введите URL ссылки:');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    }

    async function sendEmail() {
        const formData = new FormData();
        formData.append("to_email", to);
        formData.append("subject", subject);
        formData.append("body", message);
        formData.append("from_name", "Your Name");
        formData.append("to_name", "Recipient Name");

        attachments.forEach((file) => formData.append("attachments", file));

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
        Array.from(event.target.files).forEach(file => {
            attachments = [...attachments, file];
        });
    }

    function removeAttachment(index) {
        attachments = attachments.filter((_, i) => i !== index);
    }

    function toggleExpand() {
        isExpanded.update(value => !value);
    }

    function saveDraft() {
        if (to.length === 0 && subject.length === 0 && message.length === 0 && attachments.length === 0) return;

        drafts.update((existingDrafts) => {
            if (id !== null) {
                const draftIndex = existingDrafts.findIndex((d) => d.id === id);
                if (draftIndex !== -1) {
                    existingDrafts[draftIndex] = { id, to, subject, message, attachments };
                }
            } else {
                id = Date.now();
                existingDrafts.push({ id, to, subject, message, attachments });
            }
            return existingDrafts;
        });
    }

    function openDraft(draft) {
        to = draft.to || "";
        subject = draft.subject || "";
        message = draft.message || "";
        attachments = draft.attachments || [];
    }

    function deleteDraft() {
        drafts.update((existingDrafts) => existingDrafts.filter((d) => d.id !== id));
        clearForm();
    }

    function clearForm() {
        to = "";
        subject = "";
        message = "";
        attachments = [];
        id = null;
    }

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
        width: 380px;
        padding: 20px;
        background-color: #f9faff;
        border: 1px solid #d1d8e0;
        border-radius: 16px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        overflow-y: auto;
        max-height: 90%;
    }

    .compose-email.is-expanded {
        width: 75%;
        height: 85%;
        bottom: 5%;
        right: 12.5%;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header h2 {
        font-size: 1.25rem;
        font-weight: bold;
        color: #4a4e69;
    }

    .header button {
        background-color: #f44336;
        border: none;
        color: #ffffff;
        cursor: pointer;
        font-size: 0.875rem;
        padding: 8px 16px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .header button.expand-btn {
        background-color: #4caf50;
    }

    .header button:hover {
        background-color: #c62828;
    }

    .header button.expand-btn:hover {
        background-color: #388e3c;
    }

    .toolbar {
        display: flex;
        justify-content: space-evenly;
        background-color: #edf2f7;
        border-radius: 12px;
        padding: 8px;
        margin-bottom: 16px;
    }

    .toolbar button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .toolbar button:hover {
        background-color: #e9ecef;
    }

    .toolbar img {
        width: 18px;
        height: 18px;
    }

    label {
        font-size: 0.875rem;
        color: #495057;
        margin-bottom: 8px;
        display: block;
    }

    input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ced4da;
        border-radius: 8px;
        margin-top: 4px;
        font-size: 0.875rem;
    }

    .editable-message {
        width: 93%;
        padding: 12px;
        border: 1px solid #ced4da;
        border-radius: 8px;
        background-color: #ffffff;
        min-height: 150px;
        font-size: 0.875rem;
        line-height: 1.5;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 16px 0 0;
    }

    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background-color: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 8px;
        font-size: 0.875rem;
    }

    li button {
        background: none;
        border: none;
        color: #dc3545;
        cursor: pointer;
    }

    button {
        background-color: #007bff;
        color: #ffffff;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    button:hover {
        background-color: #0056b3;
    }
</style>
