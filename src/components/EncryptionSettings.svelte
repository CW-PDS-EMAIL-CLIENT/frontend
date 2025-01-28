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
    <div class="header-section">
        <label class="encryption-toggle">
            <span>Enable Encryption:</span>
            <input type="checkbox" bind:checked={$userEncrypt} />
            <span>{$userEncrypt ? "On" : "Off"}</span>
        </label>
    </div>

    <div class="actions-section">
        <button class="export-button" on:click={exportKeys}>Export Keys</button>
        <label class="import-button">
            Import Keys
            <input type="file" accept=".json" on:change={importKeys} />
        </label>
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
        margin-left: 30px;
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .header-section {
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #fff;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #ddd;
    }

    .encryption-toggle {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .actions-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .export-button, .import-button {
        background-color: #007bff;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .export-button:hover, .import-button:hover {
        background-color: #0056b3;
    }

    .import-button input {
        display: none;
    }

    .keys-table {
        width: 100%;
        border-collapse: collapse;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
    }

    .keys-table th, .keys-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    .keys-table th {
        background-color: #f1f1f1;
        font-weight: bold;
    }

    .sync-button, .generate-button {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
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
</style>
