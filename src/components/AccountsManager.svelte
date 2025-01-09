<script>
    import { onMount } from "svelte";

    let accounts = []; // Список аккаунтов
    let newEmail = "";
    let newPassword = "";
    let selectedAccount = null; // Активный аккаунт

    onMount(async () => {
        const storedAccounts = localStorage.getItem("emailAccounts");
        accounts = storedAccounts ? JSON.parse(storedAccounts) : [];

        try {
            const response = await fetch("http://127.0.0.1:8000/current_imap_account/");
            const currentAccount = await response.json();

            if (response.ok && currentAccount.email_user) {
                selectedAccount = accounts.find(acc => acc.email === currentAccount.email_user);
                if (!selectedAccount) {
                    selectedAccount = { email: currentAccount.email_user, password: "??????", showPassword: false };
                    saveAccounts();
                }
            }
        } catch (error) {
            alert("Ошибка при получении данных о текущем аккаунте: " + error.message);
        }
    });

    function saveAccounts() {
        localStorage.setItem("emailAccounts", JSON.stringify(accounts));
    }

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
            } else {
                alert("Ошибка авторизации: " + JSON.stringify(result, null, 2));
            }
        } catch (error) {
            alert("Ошибка при добавлении аккаунта: " + error.message);
        }
    }

    function removeAccount(index) {
        accounts.splice(index, 1);
        saveAccounts();
    }

    function togglePasswordVisibility(account) {
        const targetAccount = accounts.find(acc => acc.email === account.email);
        if (targetAccount) {
            targetAccount.showPassword = !targetAccount.showPassword;
        }
    }

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
            } else {
                alert("Ошибка при смене аккаунта: " + JSON.stringify(result, null, 2));
            }
        } catch (error) {
            alert("Ошибка при смене аккаунта: " + error.message);
        }
    }
</script>

<style>
    body {
        font-family: Arial, sans-serif;
        color: #333;
    }

    h2 {
        text-align: center;
        color: #444;
    }

    .form-container {
        display: flex;
        gap: 15px;
        margin: 20px auto;
        justify-content: center;
    }

    input {
        padding: 10px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 5px;
        width: 250px;
        outline: none;
    }

    input:focus {
        border-color: #007bff;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    }

    button {
        padding: 10px 20px;
        font-size: 14px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button {
        background-color: #28a745;
        color: white;
    }

    button:hover {
        background-color: #218838;
    }

    .delete-button {
        background-color: #dc3545;
    }

    .delete-button:hover {
        background-color: #c82333;
    }

    table {
        margin: 0 auto;
        border-collapse: collapse;
        width: 80%;
        max-width: 1200px;
    }

    th, td {
        padding: 12px 15px;
        border: 1px solid #ddd;
        text-align: center;
    }

    th {
        background-color: #f8f9fa;
        color: #555;
        font-weight: bold;
    }

    tr:hover {
        background-color: #f1f1f1;
    }

    .active-account {
        border-left: 4px solid #007bff;
        background-color: #e9f5ff;
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
