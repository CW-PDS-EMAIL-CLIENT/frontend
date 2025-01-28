<script>
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import EmailView from './EmailView.svelte';

    export let toSearchFolderName = "Inbox";

    let emails = writable([]);
    let selectedEmailId = null;
    let showEmailsList = true;

    async function loadEmails() {
        emails = writable([]);
        try {
            const response = await fetch('http://localhost:8000/emails/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ folder_name: toSearchFolderName, limit: 200 }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                alert(`Error loading emails: ${JSON.stringify(errorData)}`);
                return;
            }

            const data = await response.json();
            if (!data || !Array.isArray(data.emailsList)) {
                alert('Invalid API response format.');
                return;
            }

            selectedEmailId = null;
            showEmailsList = true;
            emails.set(data.emailsList);
        } catch (error) {
            console.error('Error loading emails:', error);
            alert('Error connecting to the server.');
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    }

    async function deleteEmail(emailId) {
        const confirmed = confirm("Are you sure you want to delete this email?");
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
                alert(`Error deleting email: ${errorData.detail}`);
                return;
            }

            const result = await response.json();
            alert(result.message);

            emails.update((currentEmails) =>
                currentEmails.filter((email) => email.id !== emailId)
            );

        } catch (error) {
            console.error("Error deleting email:", error);
            alert("Error deleting email.");
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
                        <button class="delete-button" on:click|stopPropagation={() => deleteEmail(email.id)} title="Delete">✖</button>
                    </div>
                </div>
            {/each}
        {:else}
            <p>Loading emails...</p>
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
        background: linear-gradient(145deg, #0f2027, #203a43, #2c5364);
        padding: 20px;
        margin-left: 25px;
        border-radius: 12px;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
    }

    .email-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        margin-bottom: 15px;
        border-radius: 10px;
        background-color: #ffffff;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        border: 1px solid #dcdcdc;
    }

    .email-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
        background-color: #f5f5f5;
    }

    .email-info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .sender {
        font-size: 18px;
        font-weight: bold;
        color: #1e2022;
    }

    .subject {
        font-size: 14px;
        color: #6c757d;
        margin-top: 8px;
    }

    .email-actions {
        display: flex;
        align-items: center;
    }

    .date {
        font-size: 13px;
        font-weight: bold;
        color: #6c757d;
        margin-right: 15px;
    }

    .delete-button {
        background: none;
        border: none;
        color: #dc3545;
        font-size: 16px;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.2s;
    }

    .delete-button:hover {
        background-color: rgba(220, 53, 69, 0.1);
        transform: scale(1.1);
    }
</style>
