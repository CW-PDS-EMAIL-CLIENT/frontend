<script>
    import { createEventDispatcher } from "svelte";
    import { writable } from "svelte/store";

    const dispatch = createEventDispatcher();
    let to = "";
    let subject = "";
    let message = "";
    let attachments = []; // Хранилище выбранных файлов
    let isExpanded = writable(false); // Управление состоянием окна

    // Отправка письма через API
    async function sendEmail() {
        const formData = new FormData();
        formData.append("to_email", to);
        formData.append("subject", subject);
        formData.append("body", message);
        formData.append("from_name", "Your Name");
        formData.append("to_name", "Recipient Name");

        // Добавляем файлы в FormData
        attachments.forEach(file => formData.append("attachments", file));

        try {
            const response = await fetch("http://127.0.0.1:8000/emails/send", {
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

    // Очистка формы
    function clearForm() {
        to = "";
        subject = "";
        message = "";
        attachments = [];
    }

    // Расширение/сворачивание окна
    function toggleExpand() {
        isExpanded.update(value => !value);
    }
</script>

<div class="compose-email" class:is-expanded={$isExpanded}>
    <div class="header">
        <h2>Написать письмо</h2>
        <button on:click={toggleExpand}>{$isExpanded ? "Свернуть" : "Развернуть"}</button>
        <button on:click={() => dispatch("close")}>Закрыть</button>
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
        <textarea bind:value={message} placeholder="Введите сообщение"></textarea>
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

    label {
        display: block;
        margin-top: 10px;
    }

    input, textarea {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        box-sizing: border-box;
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
