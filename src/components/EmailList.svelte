<script>
    export let emails = [];
    export let onEmailSelect;
</script>

<div class="email-list">
    {#each emails as email}
        <div class="email-item" on:click={() => onEmailSelect(email)}>
            <span class="sender">{email.sender}</span>
            <span class="subject">{email.subject}</span>
            <span class="icon">🗑️</span>
            <span class="date">{email.date}</span>
        </div>
    {/each}
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
