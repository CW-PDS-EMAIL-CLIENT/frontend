<script>
    import { createEventDispatcher } from "svelte";
    import { writable } from "svelte/store";

    const dispatch = createEventDispatcher();
    let to = "";
    let subject = "";
    let message = "";
    let attachments = [];
    let isExpanded = writable(false); // Управление состоянием окна

    function sendEmail() {
        alert(`Письмо отправлено!\nКому: ${to}\nТема: ${subject}\nСообщение: ${message}\nПрикреплено файлов: ${attachments.length}`);
        dispatch("close"); // Закрываем окно после отправки
    }

    function handleFileChange(event) {
        attachments = [...attachments, ...event.target.files];
    }

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
        {#each attachments as file}
            <li>{file.name} ({Math.round(file.size / 1024)} KB)</li>
        {/each}
    </ul>
    <button on:click={sendEmail}>Отправить</button>
</div>

<style>
    .compose-email {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
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
</style>
