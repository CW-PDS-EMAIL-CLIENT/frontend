<script>
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import EmailList from "./components/EmailList.svelte";
    import EmailView from "./components/EmailView.svelte";
    import ComposeEmail from "./components/ComposeEmail.svelte";
    import DraftList from "./components/DraftList.svelte";

    export let isOpen = true;

    let selectedEmail = null;
    let isComposing = false;
    let isDraftsView = false; // Флаг для отображения черновиков
    let draftId = null; // ID текущего редактируемого черновика

    const emails = writable([]); // Хранилище для списка писем

    onMount(async () => {
        await loadEmails(); // Загружаем письма при инициализации
    });

    async function loadEmails() {
        const response = await fetch("http://localhost:8000/emails/");
        const data = await response.json();
        emails.set(data.emailsList); // Обновляем список писем
    }

    async function openEmail(email) {
        const response = await fetch(`http://localhost:8000/emails/${email.id}`);
        selectedEmail = await response.json(); // Загружаем подробности по письму
    }

    function closeEmail() {
        selectedEmail = null;
    }

    function openCompose() {
        isComposing = true;
        isDraftsView = false;
        draftId = null; // Создаётся новый черновик
    }

    function closeCompose() {
        isComposing = false;
        draftId = null;
    }

    function showInbox() {
        selectedEmail = null;
        isComposing = false;
        isDraftsView = false;
        draftId = null;
    }

    function showDrafts() {
        selectedEmail = null;
        isComposing = false;
        isDraftsView = true;
        draftId = null;
    }

    function openDraft(draft) {
        draftId = draft.id; // Передаём id черновика
        isComposing = true;
        isDraftsView = false; // Закрываем список черновиков
    }
</script>

<main>
    <!-- Боковое меню -->
    <div class="sidebar {isOpen ? 'open' : 'closed'}">
        <button class="toggle-button" on:click={() => isOpen = !isOpen}>☰</button>
        <div class="menu-item" on:click={openCompose}>
            <span class="icon">✏️</span>
            {#if isOpen}
                <span class="text">Написать</span>
            {/if}
        </div>
        <div class="menu-item" on:click={showInbox}>
            <span class="icon">📥</span>
            {#if isOpen}
                <span class="text">Входящие</span>
            {/if}
        </div>

        <!-- Помеченные -->
        <div class="menu-item">
            <span class="icon">⭐</span>
            {#if isOpen}
                <span class="text">Помеченные</span>
            {/if}
        </div>

        <!-- Черновики -->
        <div class="menu-item" on:click={showDrafts}>
            <span class="icon">📝</span>
            {#if isOpen}
                <span class="text">Черновики</span>
            {/if}
        </div>

        <!-- Пункт меню "Шифрование" -->
        <div class="menu-item">
            <span class="icon">🔒</span>
            {#if isOpen}
                <span class="text">Шифрование</span>
            {/if}
        </div>

        <!-- Корзина -->
        <div class="menu-item">
            <span class="icon">🗑️</span>
            {#if isOpen}
                <span class="text">Корзина</span>
            {/if}
        </div>
    </div>

    <!-- Основное содержимое -->
    <div class="content" style="margin-left: {isOpen ? '160px' : '45px'};">
        {#if isDraftsView}
            <!-- Список черновиков -->
            <DraftList onSelectDraft={openDraft} />
        {:else if selectedEmail}
            <!-- Просмотр письма -->
            <EmailView email={selectedEmail} onClose={closeEmail} />
        {:else}
            <!-- Список писем -->
            <EmailList {emails} onEmailSelect={openEmail} />
        {/if}    
    </div>    

    {#if isComposing}
        <!-- Передаём draftId в компонент -->
        <ComposeEmail id={draftId} on:close={closeCompose} />
    {/if}
</main>

<style>
    /* Стили для бокового меню */
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 160px;
        height: 100%;
        background-color: #f2f3f5;
        color: #333;
        padding: 10px;
        transition: width 0.3s;
        overflow: hidden;
    }

    .sidebar.closed {
        width: 45px;
    }

    .toggle-button {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        margin-bottom: 20px;
        color: #333;
        padding: 10px;
    }

    .toggle-button:hover {
        background-color: #e0e0e0;
    }

    .menu-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        cursor: pointer;
        transition: background 0.3s;
        border-radius: 5%;
    }

    .menu-item:hover {
        background-color: #e0e0e0;
    }

    .icon {
        font-size: 24px;
        margin-right: 10px;
        padding-left: 5px;
    }

    .sidebar.closed .text {
        display: none;
    }

    .sidebar.closed .icon {
        margin: 0;
    }

    .text {
        font-size: 16px;
    }

    .content {
        padding: 20px;
        transition: margin-left 0.3s;
    }

    /* Стили для окна "Написать" */
    .compose-window {
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 400px;
        height: 300px;
        background-color: #ffffff;
        border: 1px solid #ccc;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 10px;
        transition: all 0.3s ease;
        z-index: 10;
    }

    .compose-window.expanded {
        width: 80%;
        height: 80%;
        bottom: 10%;
        right: 10%;
    }

    .expand-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: #007bff;
    }
</style>
