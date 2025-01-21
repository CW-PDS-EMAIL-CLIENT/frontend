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
                <span class="text">Написать</span>
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
            {#if isOpen}<span class="text">Аккаунты</span>{/if}
        </div>

        <div class="menu-item" on:click={showTrash}>
            <img class="icon" src="icons/trash.svg" alt="🗑️" />
            {#if isOpen}
                <span class="text">Корзина</span>
            {/if}
        </div>
    </div>

    <!-- Основное содержимое -->
    <div class="content" style="margin-left: {isOpen ? '160px' : '45px'};">
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
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 160px;
        height: 100%;
        background-color: green;
        color: #fff;
        padding: 10px;
        transition: width 0.3s;
        overflow: hidden;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }

    .sidebar img {
        width: 35px;
        height: 35px;
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
        color: #fff;
        padding: 10px;
        transition: background-color 0.3s;
    }

    .toggle-button:hover {
        background-color: #333;
    }

    .menu-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        cursor: pointer;
        transition: background 0.3s;
        border-radius: 8px;
    }

    .menu-item:hover {
        background-color: #333;
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
        background-color: #f9f9f9;
        min-height: 100vh;
    }

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
