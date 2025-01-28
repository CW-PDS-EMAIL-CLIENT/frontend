<script>
    import { writable } from "svelte/store";
    import EmailList from "./components/EmailList.svelte";
    import EmailView from "./components/EmailView.svelte";
    import ComposeEmail from "./components/ComposeEmail.svelte";
    import DraftList from "./components/DraftList.svelte";
    import EncryptionSettings from "./components/EncryptionSettings.svelte";
    import AccountsManager from "./components/AccountsManager.svelte";

    // Состояние приложения
    export let isOpen = true;

    let isComposing = false;
    let isDraftsView = false;
    let isEncryptionView = false; // Для отображения настроек шифрования
    let isAccountsView = false;
    let draftId = null;
    let selectedFolder = "Inbox"; // По умолчанию папка "Входящие"

    // Открыть окно для написания письма
    function openCompose() {
        isComposing = true;
        isDraftsView = false;
        isEncryptionView = false;
        draftId = null;
    }

    function closeCompose() {
        isComposing = false;
        draftId = null;
    }

    // Отображение папки "Входящие"
    function showInbox() {
        selectedFolder = "Inbox";
        isDraftsView = false;
        isAccountsView = false;
        isEncryptionView = false;
    }

    // Отображение черновиков
    function showDrafts() {
        isComposing = false;
        isDraftsView = true;
        isAccountsView = false;
        isEncryptionView = false;
    }

    // Отображение папки "Отправленные"
    function showSent() {
        selectedFolder = "&BB4EQgQ,BEAEMAQyBDsENQQ9BD0ESwQ1-";
        isDraftsView = false;
        isEncryptionView = false;
    }

    // Отображение папки "Корзина"
    function showTrash() {
        selectedFolder = "Trash";
        isDraftsView = false;
        isAccountsView = false;
        isEncryptionView = false;
    }

    // Открытие черновика
    function openDraft(draft) {
        draftId = draft.id;
        isComposing = true;
        isDraftsView = false;
        isAccountsView = false;
        isEncryptionView = false;
    }

    // Открытие настроек шифрования
    function showEncryptionSettings() {
        isDraftsView = false;
        isEncryptionView = true;
    }
    
    function showAccounts() {
        isEncryptionView = false;
        isAccountsView = true;
    }

</script>

<main>
    <!-- Боковое меню -->
    <div class="sidebar {isOpen ? 'open' : 'closed'}">
        <button class="toggle-button" on:click={() => isOpen = !isOpen}>☰</button>

        <div class="menu-item" on:click={openCompose}>
            <img class="icon" src="icons/compose.svg" alt="✍️" />
            {#if isOpen}
                <span class="text">Создать</span>
            {/if}
        </div>

        <div class="menu-item" on:click={showInbox}>
            <img class="icon" src="icons/inbox.svg" alt="📩" />
            {#if isOpen}
                <span class="text">Входящие</span>
            {/if}
        </div>

        <div class="menu-item" on:click={showSent}>
            <img class="icon" src="icons/sent.svg" alt="📧" />
            {#if isOpen}
                <span class="text">Отправленные</span>
            {/if}
        </div>

        <div class="menu-item" on:click={showDrafts}>
            <img class="icon" src="icons/drafts.svg" alt="🗒️" />
            {#if isOpen}
                <span class="text">Черновики</span>
            {/if}
        </div>

        <!-- Пункт меню "Шифрование" -->
        <div class="menu-item" on:click={showEncryptionSettings}>
            <img class="icon" src="icons/encryption.svg" alt="🔐" />
            {#if isOpen}
                <span class="text">Шифрование</span>
            {/if}
        </div>

        <div class="menu-item" on:click={showAccounts}>
            <img class="icon" src="icons/accounts.svg" alt="👥" />
            {#if isOpen}
                <span class="text">Аккаунты</span>
            {/if}
        </div>

        <div class="menu-item" on:click={showTrash}>
            <img class="icon" src="icons/trash.svg" alt="🗑️" />
            {#if isOpen}
                <span class="text">Корзина</span>
            {/if}
        </div>
    </div>

    <!-- Основное содержимое -->
    <div class="content" style="margin-left: {isOpen ? '200px' : '60px'};">
        {#if isEncryptionView}
            <EncryptionSettings />
        {:else if isDraftsView}
            <DraftList onSelectDraft={openDraft} />
        {:else if isAccountsView}
            <AccountsManager />
        {:else}
            <EmailList key={selectedFolder} toSearchFolderName={selectedFolder} />
        {/if}
    </div>

    {#if isComposing}
        <ComposeEmail id={draftId} on:close={closeCompose} />
    {/if}
</main>

<style>
    /* Боковое меню */
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 200px;
        height: 100%;
        background-color: #2c3e50;
        color: #ecf0f1;
        padding: 20px;
        transition: width 0.3s ease;
        overflow: hidden;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
        font-family: 'Arial', sans-serif;
    }

    .sidebar img {
        width: 30px;
        height: 30px;
        transition: transform 0.3s ease;
    }

    .sidebar.closed {
        width: 60px;
    }

    .sidebar .icon:hover {
        transform: scale(1.1);
    }

    .toggle-button {
        background: none;
        border: none;
        font-size: 32px;
        cursor: pointer;
        margin-bottom: 25px;
        color: #ecf0f1;
        padding: 10px;
        transition: background-color 0.3s ease;
    }

    .toggle-button:hover {
        background-color: #34495e;
    }

    .menu-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        cursor: pointer;
        transition: background 0.3s ease, padding-left 0.3s ease;
        border-radius: 10px;
    }

    .menu-item:hover {
        background-color: #34495e;
        padding-left: 20px;
    }

    .icon {
        font-size: 26px;
        margin-right: 15px;
    }

    .sidebar.closed .text {
        display: none;
    }

    .sidebar.closed .icon {
        margin: 0;
    }

    .text {
        font-size: 18px;
        font-weight: 600;
        text-transform: capitalize;
    }

    /* Основное содержимое */
    .content {
        padding: 30px;
        transition: margin-left 0.3s ease;
        background-color: #ecf0f1;
        min-height: 100vh;
        font-family: 'Verdana', sans-serif;
    }

    /* Окно для написания письма */
    .compose-window {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 420px;
        height: 350px;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        padding: 20px;
        transition: all 0.3s ease;
        z-index: 10;
    }

    .compose-window.expanded {
        width: 85%;
        height: 80%;
        bottom: 5%;
        right: 5%;
    }

    .expand-button {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #3498db;
    }
</style>

