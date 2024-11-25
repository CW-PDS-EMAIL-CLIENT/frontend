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
    let isSentView = false; // Флаг для отображения отправленных писем

    let selectedFolder = "inbox";

    const emails = writable([]); // Хранилище для списка писем

    onMount(async () => {
        await loadEmails(); // Загружаем письма при инициализации
    });

    async function loadEmails() {
        let url = "http://localhost:8000/emails/";

        // Формируем тело запроса
        const body = JSON.stringify({ folder_name: selectedFolder });

        const response = await fetch(url, {
            method: 'POST', // Используем POST
            headers: {
                'Content-Type': 'application/json',
            },
            body: body, // Параметры передаем в теле запроса
        });

        if (!response.ok) {
            console.error("Error fetching emails:", response.status);
            return;
        }

        const data = await response.json();
        emails.set(data.emailsList);
    }

// Функция получения деталей письма
async function openEmail(emailId) {
        try {
            const url = "http://localhost:8000/emails/info/";

            // Формируем тело запроса
            const body = JSON.stringify({ email_id: emailId, folder_name: selectedFolder });

            const response = await fetch(url, {
                method: 'POST', // Используем POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body, // Параметры передаем в теле запроса
            });

            if (!response.ok) {
                const errorText = await response.text(); // Извлекаем текст ошибки
                alert(`Error fetching email details: ${response.status}\n${errorText}`);
                console.error(`Error fetching email details: ${response.status}`, errorText);
                return;
            }

            // Здесь тело ответа используется только один раз
            selectedEmail = await response.json(); // Загружаем информацию о письме
        } catch (error) {
            alert(`Failed to fetch email details: ${error.message}`);
            console.error("Failed to fetch email details:", error);
        }
    }


    function closeEmail() {
        selectedEmail = null;
    }

    function openCompose() {
        isComposing = true;
        isDraftsView = false;
        isSentView = false;
        draftId = null;
    }

    function closeCompose() {
        isComposing = false;
        draftId = null;
    }

    function showInbox() {
        selectedEmail = null;
        isComposing = false;
        isDraftsView = false;
        isSentView = false;
        selectedFolder = "Inbox";
        loadEmails();
    }

    function showDrafts() {
        selectedEmail = null;
        isComposing = false;
        isDraftsView = true;
        isSentView = false;
    }

    function showSent() {
        selectedEmail = null;
        isComposing = false;
        isDraftsView = false;
        isSentView = true;
        selectedFolder = "&BB4EQgQ,BEAEMAQyBDsENQQ9BD0ESwQ1-";
        loadEmails();
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
        <!-- <div class="menu-item">
            <span class="icon">⭐</span>
            {#if isOpen}
                <span class="text">Помеченные</span>
            {/if}
        </div> -->

        <div class="menu-item" on:click={showSent}>
            <span class="icon">📤</span>
            {#if isOpen}
                <span class="text">Отправленные</span>
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
        {:else if isSentView}
            <EmailList {emails} onEmailSelect={openEmail} />
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
