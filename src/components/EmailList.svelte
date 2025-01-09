<script>
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import EmailView from './EmailView.svelte'; // Импорт компонента для просмотра письма

    export let toSearchFolderName = "Inbox"; // Папка для отображения

    let emails = writable([]);  // Храним список писем
    let selectedEmailId = null;  // Храним ID выбранного письма
    let showEmailsList = true;   // Флаг для переключения между списком писем и отображением письма

    // Загрузка писем с API
    async function loadEmails() {
        emails = writable([]);
        try {
            const response = await fetch('http://localhost:8000/emails/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ folder_name: toSearchFolderName, limit: 200 }),  // Пример параметров запроса
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                alert(`Не удалось загрузить детали письма: ${JSON.stringify(errorData)}`);
                return;
            }

            const data = await response.json();
            if (!data || !Array.isArray(data.emailsList)) {
                alert('Некорректный формат данных от API.');
                return;
            }

            selectedEmailId = null;
            showEmailsList = true;
            emails.set(data.emailsList);
        } catch (error) {
            console.error('Ошибка при загрузке писем:', error);
            alert('Произошла ошибка при подключении к серверу. Проверьте соединение и попробуйте снова.');
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    }

    async function deleteEmail(emailId) {
        const confirmed = confirm("Вы уверены, что хотите удалить это письмо?");
        if (!confirmed) return;

        try {
            const response = await fetch("http://localhost:8000/email/move_to_trash_or_delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email_id: emailId, folder_name: toSearchFolderName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Ошибка при удалении письма: ${errorData.detail}`);
                return;
            }

            const result = await response.json();
            alert(result.message);

            emails.update((currentEmails) =>
                currentEmails.filter((email) => email.id !== emailId)
            );

        } catch (error) {
            console.error("Ошибка при удалении письма:", error);
            alert("Произошла ошибка при удалении письма.");
        }
    }

    function onEmailSelect(emailId) {
        selectedEmailId = emailId;
        showEmailsList = false;
    }

    $: toSearchFolderName, loadEmails();

    function closeEmailView() {
        showEmailsList = true;
        selectedEmailId = null;
    }

    onMount(loadEmails);
</script>

<div class="email-list">
    {#if showEmailsList}
        {#if $emails.length > 0}
            {#each $emails as email}
                <div class="email-item" on:click={() => onEmailSelect(email.id)}>
                    <div class="email-info">
                        <span class="sender">{email.sender}</span>
                        <span class="subject">{email.subject}</span>
                    </div>
                    <div class="email-actions">
                        <span class="date">{formatDate(email.date)}</span>
                        <button class="delete-button" on:click|stopPropagation={() => deleteEmail(email.id)} title="Удалить">✖</button>
                    </div>
                </div>
            {/each}
        {:else}
            <p>Загрузка...</p>
        {/if}
    {:else}
        <EmailView idEmail={selectedEmailId} folderEmail={toSearchFolderName} onClose={closeEmailView} />
    {/if}
</div>

<style>
    .email-list {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        background-color: #f9f9f9;
        padding: 20px;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .email-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
    }

    .email-item:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .email-info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .sender {
        font-size: 16px;
        font-weight: bold;
        color: #333;
    }

    .subject {
        font-size: 14px;
        color: #666;
        margin-top: 5px;
    }

    .email-actions {
        display: flex;
        align-items: center;
    }

    .date {
        font-size: 12px;
        color: #999;
        margin-right: 15px;
    }

    .delete-button {
        background: none;
        border: none;
        color: #ff4d4f;
        font-size: 16px;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }

    .delete-button:hover {
        background-color: rgba(255, 77, 79, 0.1);
    }
</style>
