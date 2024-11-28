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

            // Проверяем, успешно ли выполнен запрос
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Защита от некорректного JSON
                alert(`Не удалось загрузить детали письма: ${JSON.stringify(errorData)}`);
                return;
            }

            // Обрабатываем успешный ответ
            const data = await response.json();
            if (!data || !Array.isArray(data.emailsList)) {
                alert('Некорректный формат данных от API.');
                return;
            }

            selectedEmailId = null;
            showEmailsList = true;
            emails.set(data.emailsList);  // Сохраняем полученные письма в store
        } catch (error) {
            // Ловим возможные сетевые ошибки
            console.error('Ошибка при загрузке писем:', error);
            alert('Произошла ошибка при подключении к серверу. Проверьте соединение и попробуйте снова.');
        }
    }

    // Форматирование даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    }

    // Обработчик выбора письма
    function onEmailSelect(emailId) {
        selectedEmailId = emailId;
        showEmailsList = false;  // Прячем список писем и показываем выбранное письмо
    }

    // Следим за изменениями toSearchFolderName
    $: toSearchFolderName, loadEmails(); // При изменении toSearchFolderNamez выполняется новый запрос

    // Функция для возвращения к списку писем
    function closeEmailView() {
        showEmailsList = true;  // Показываем список писем
        selectedEmailId = null; // Очищаем выбранный email
    }

    onMount(loadEmails); // При монтировании компонента загружаем письма
</script>

<div class="email-list">
    {#if showEmailsList}
        {#if $emails.length > 0}
            {#each $emails as email}
                <div class="email-item" on:click={() => onEmailSelect(email.id)}>
                    <span class="sender">{email.sender}</span>
                    <span class="subject">{email.subject}</span>
                    <span class="date">{formatDate(email.date)}</span>
                </div>
            {/each}
        {:else}
            <p>Загрузка...</p>
        {/if}
    {:else}
        <!-- Показываем компонент EmailView с подробным содержанием письма -->
        <EmailView idEmail={selectedEmailId} folderEmail={toSearchFolderName} onClose={closeEmailView} />
    {/if}
</div>

<style>
    .email-list {
        border-right: 1px solid #ddd;
        padding: 10px;
        background-color: #fff;
        transition: width 0.3s;
    }

    .email-item {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .email-item:hover {
        background-color: #f5f5f5;
    }

    .sender {
        font-weight: bold;
    }

    .subject {
        flex: 1;
        margin-left: 10px;
        color: #666;
    }

    .icon {
        margin-right: 10px;
    }

    .icon:hover {
        background-color: #999;
    }

    .date {
        color: #999;
        font-size: 0.9em;
    }
</style>
