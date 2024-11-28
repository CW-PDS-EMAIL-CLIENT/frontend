<script>
    import { onMount } from "svelte";
    import { userEncrypt } from "./store"
    import { loop_guard } from "svelte/internal";

    let keysData = []; // Данные таблицы с ключами

    // Загрузка данных с API
    async function fetchKeysData() {
        try {
            const response = await fetch("http://127.0.0.1:8000/keys/related-dates/");
            keysData = await response.json();
            //alert("Данные загружены: " + JSON.stringify(keysData, null, 2));
        } catch (error) {
            alert("Ошибка загрузки данных: " + error.message);
        }
    }

    // Синхронизация публичных ключей для конкретного email
    async function syncPublicKeys(email) {
        try {
            const response = await fetch("http://127.0.0.1:8000/sync-public-keys/?recipient_email=" + email, {
                method: "PUT"
            });
            const result = await response.json();
            alert("Синхронизация выполнена: " + JSON.stringify(result, null, 2));
        } catch (error) {
            alert("Ошибка синхронизации: " + error.message);
        }
    }

    // Генерация и отправка приватных ключей для конкретного email
    async function generateKeys(email) {
        try {
            const formData = new FormData();
            formData.append("sender_email", email);

            const response = await fetch("http://127.0.0.1:8000/generate-keys/", {
                method: "POST",
                body: formData
            });
            const result = await response.json();
            alert("Приватные ключи сгенерированы: " + JSON.stringify(result, null, 2));
        } catch (error) {
            alert("Ошибка генерации ключей: " + error.message);
        }
    }

    // Экспорт публичных ключей
    async function exportKeys() {
        try {
            const response = await fetch("http://127.0.0.1:8000/keys/export/");
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "public_keys.json";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert("Ключи экспортированы");
            } else {
                alert("Ошибка экспорта ключей");
            }
        } catch (error) {
            alert("Ошибка экспорта: " + error.message);
        }
    }

    // Импорт публичных ключей
    async function importKeys(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("http://127.0.0.1:8000/keys/import/", {
                method: "POST",
                body: formData
            });
            const result = await response.json();
            alert("Импорт выполнен: " + JSON.stringify(result, null, 2));
        } catch (error) {
            alert("Ошибка импорта: " + error.message);
        }
    }

    onMount(fetchKeysData);
</script>

<div class="encryption-settings">
    <div class="actions">
        <label>
            Использовать шифрование
            <input type="checkbox" bind:checked={$userEncrypt}/>
            {$userEncrypt ? "Да" : "Нет"}
        </label>

        <button on:click={exportKeys}>Экспортировать ключи</button>
        <input type="file" accept=".json" on:change={importKeys} />
    </div>

    <table>
        <thead>
            <tr>
                <th>Email</th>
                <th>Дата пуб. ключа</th>
                <th>Дата прив. ключа</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
            {#each keysData as key}
                <tr>
                    <td>{key.related_email}</td>
                    <td>{key.last_public_key_date || "Нет данных"}</td>
                    <td>{key.last_private_key_date || "Нет данных"}</td>
                    <td>
                        <button on:click={() => syncPublicKeys(key.related_email)}>
                            Синхронизировать публичные ключи
                        </button>
                        <button on:click={() => generateKeys(key.related_email)}>
                            Обновить приватные ключи
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .encryption-settings {
        padding: 20px;
    }

    .actions {
        margin-bottom: 20px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #f4f4f4;
    }

    button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 4px;
        margin-right: 5px;
    }

    button:hover {
        background-color: #0056b3;
    }

    input[type="file"] {
        margin-left: 10px;
    }
</style>
