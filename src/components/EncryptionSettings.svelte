<script>
    import { onMount } from "svelte";
    import { userEncrypt } from "./store";

    let keysData = []; // Data for the keys table

    // Load data from API
    async function fetchKeysData() {
        try {
            const response = await fetch("http://127.0.0.1:8000/keys/related-dates/");
            keysData = await response.json();
        } catch (error) {
            alert("Failed to load data: " + error.message);
        }
    }

    // Synchronize public keys for a specific email
    async function syncPublicKeys(email) {
        try {
            const response = await fetch("http://127.0.0.1:8000/sync-public-keys/?recipient_email=" + email, {
                method: "PUT"
            });
            const result = await response.json();
            alert("Synchronization completed: " + JSON.stringify(result, null, 2));
        } catch (error) {
            alert("Synchronization error: " + error.message);
        }
    }

    // Generate and send private keys for a specific email
    async function generateKeys(email) {
        try {
            const formData = new FormData();
            formData.append("sender_email", email);

            const response = await fetch("http://127.0.0.1:8000/generate-keys/", {
                method: "POST",
                body: formData
            });
            const result = await response.json();
            alert("Private keys generated: " + JSON.stringify(result, null, 2));
        } catch (error) {
            alert("Key generation error: " + error.message);
        }
    }

    // Export public keys
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
                alert("Keys exported");
            } else {
                alert("Export error");
            }
        } catch (error) {
            alert("Export failed: " + error.message);
        }
    }

    // Import public keys
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
            alert("Import completed: " + JSON.stringify(result, null, 2));
        } catch (error) {
            alert("Import failed: " + error.message);
        }
    }

    onMount(fetchKeysData);
</script>

<div class="encryption-settings">
    <header class="settings-header">
        <label>
            Enable Encryption
            <input type="checkbox" bind:checked={$userEncrypt} />
            <span>{$userEncrypt ? "On" : "Off"}</span>
        </label>
    </header>

    <div class="actions">
        <button class="export-button" on:click={exportKeys}>Export Keys</button>
        <input type="file" accept=".json" on:change={importKeys} class="import-input" />
    </div>

    <table class="keys-table">
        <thead>
            <tr>
                <th>Email</th>
                <th>Public Key Date</th>
                <th>Private Key Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each keysData as key}
                <tr>
                    <td>{key.related_email}</td>
                    <td>{key.last_public_key_date || "No Data"}</td>
                    <td>{key.last_private_key_date || "No Data"}</td>
                    <td>
                        <button class="sync-button" on:click={() => syncPublicKeys(key.related_email)}>
                            Sync Public Keys
                        </button>
                        <button class="generate-button" on:click={() => generateKeys(key.related_email)}>
                            Update Private Keys
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
        font-family: Arial, sans-serif;
    }

    .settings-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
    }

    .keys-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #ccc;
    }

    .keys-table th, .keys-table td {
        padding: 10px;
        border: 1px solid #ccc;
        text-align: left;
    }

    .keys-table th {
        background-color: #f9f9f9;
        font-weight: bold;
    }

    .export-button, .sync-button, .generate-button {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .export-button {
        background-color: #007bff;
        color: #fff;
    }

    .export-button:hover {
        background-color: #0056b3;
    }

    .sync-button {
        background-color: #28a745;
        color: #fff;
    }

    .sync-button:hover {
        background-color: #218838;
    }

    .generate-button {
        background-color: #ffc107;
        color: #212529;
    }

    .generate-button:hover {
        background-color: #e0a800;
    }

    .import-input {
        display: none;
    }
</style>
