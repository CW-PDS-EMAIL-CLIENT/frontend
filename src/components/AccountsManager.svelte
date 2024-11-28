<script>
    import { onMount } from "svelte";

    let accounts = []; // Список аккаунтов
    let newEmail = "";
    let newPassword = "";
    let selectedAccount = null; // Активный аккаунт

    // Загрузка аккаунтов из LocalStorage при загрузке компонента
    onMount(async () => {
        const storedAccounts = localStorage.getItem("emailAccounts");
        accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
        
        // Получаем текущий активный аккаунт через API
        try {
            const response = await fetch("http://127.0.0.1:8000/current_imap_account/");
            const currentAccount = await response.json();
            
            if (response.ok && currentAccount.email_user) {
                selectedAccount = accounts.find(acc => acc.email === currentAccount.email_user);
                if (!selectedAccount) {
                    // Добавляем текущий аккаунт, если его нет
                    selectedAccount = { email: currentAccount.email_user, password: "??????", showPassword: false };
                    //accounts.push(selectedAccount);
                    saveAccounts();
                }
            }
        } catch (error) {
            alert("Ошибка при получении данных о текущем аккаунте: " + error.message);
        }
    });

    // Сохранение аккаунтов в LocalStorage
    function saveAccounts() {
        localStorage.setItem("emailAccounts", JSON.stringify(accounts));
    }

    // Добавление нового аккаунта
    async function addAccount() {
        if (!newEmail || !newPassword) {
            alert("Введите email и пароль.");
            return;
        }
        try {
            const response = await fetch("http://127.0.0.1:8000/authorize_account/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email_user: newEmail,
                    email_pass: newPassword,
                }),
            });
            const result = await response.json();

            if (response.ok) {
                const newAccount = { email: newEmail, password: newPassword, showPassword: false };
                accounts.push(newAccount);
                saveAccounts();
                newEmail = "";
                newPassword = "";
                //alert("Аккаунт успешно добавлен.");
            } else {
                alert("Ошибка авторизации: " + JSON.stringify(result, null, 2));
            }
        } catch (error) {
            alert("Ошибка при добавлении аккаунта: " + error.message);
        }
    }

    // Удаление аккаунта
    function removeAccount(index) {
        accounts.splice(index, 1);
        saveAccounts();
    }

    // Переключение отображения пароля
    function togglePasswordVisibility(account) {
        const targetAccount = accounts.find(acc => acc.email === account.email);
        if (targetAccount) {
            targetAccount.showPassword = !targetAccount.showPassword;
        }
    }

    // Смена активного аккаунта
    async function changeAccount(account) {
        try {
            const response = await fetch("http://127.0.0.1:8000/authorize_account/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email_user: account.email,
                    email_pass: account.password,
                }),
            });
            const result = await response.json();

            if (response.ok) {
                selectedAccount = account;
                //alert(`Аккаунт ${account.email} был успешно выбран.`);
            } else {
                alert("Ошибка при смене аккаунта: " + JSON.stringify(result, null, 2));
            }
        } catch (error) {
            alert("Ошибка при смене аккаунта: " + error.message);
        }
    }
</script>

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
    }

    th {
        background-color: #f2f3f5;
        text-align: left;
    }

    .form-container {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }

    input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    button {
        padding: 8px 12px;
        border: none;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        border-radius: 4px;
    }

    button:hover {
        background-color: #0056b3;
    }

    .delete-button {
        background-color: #dc3545;
    }

    .delete-button:hover {
        background-color: #b02a37;
    }

    .active-account {
        border-left: 4px solid #007bff;
        background-color: #f0f8ff;
    }
</style>

<div>
    <h2>Управление аккаунтами</h2>
    <div class="form-container">
        <input type="email" placeholder="Email" bind:value={newEmail} />
        <input type="password" placeholder="Пароль" bind:value={newPassword} />
        <button on:click={addAccount}>Добавить</button>
    </div>
    <table>
        <thead>
            <tr>
                <th>Email</th>
                <th>Пароль</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
            {#each accounts as account, index}
                <tr class="{selectedAccount?.email === account.email ? 'active-account' : ''}">
                    <td>{account.email}</td>
                    <td>
                        {#if account.showPassword}
                            {account.password}
                        {:else}
                            ••••••••
                        {/if}
                        <button on:click={() => togglePasswordVisibility(account)}>
                            {account.showPassword ? "Скрыть" : "Показать"}
                        </button>
                    </td>
                    <td>
                        <button on:click={() => changeAccount(account)}>
                            Выбрать
                        </button>
                        <button class="delete-button" on:click={() => removeAccount(index)}>
                            Удалить
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
