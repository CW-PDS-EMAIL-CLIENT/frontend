<script>
    export let email;
    export let onClose;
</script>

<div class="email-view">
    <button class="back-button" on:click={onClose}>⬅</button>
    <h2>{email.sender}</h2>
    <p><strong>Тема:</strong> {email.subject}</p>
    <p><strong>Кому:</strong> {email.to}</p>
    <p><strong>Дата:</strong> {email.date}</p>
    <div class="email-content">
        <p>{@html email.body}</p>
    </div>
    {#if email.attachments && email.attachments.length > 0}
        <div class="attachments">
            <h3>Вложения:</h3>
            <ul>
                {#each email.attachments as attachment}
                    <li>{attachment}</li>
                {/each}
            </ul>
        </div>
    {/if}
</div>

<style>
    .email-view {
        padding: 20px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .email-view h2 {
        margin: 0;
        font-size: 1.5em;
        color: #333;
    }

    .email-content {
        margin-top: 20px;
        font-size: 1em;
        line-height: 1.5;
    }

    .back-button {
        background: none;
        border: none;
        width: 60px;
        font-size: 28px;
        cursor: pointer;
        border-radius: 15%;
    }

    .back-button:hover {
        background-color: #f5f5f5;
    }
</style>
