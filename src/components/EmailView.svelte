<script>
    export let email;
    export let onClose;
</script>

<div class="email-view">
    <button class="back-button" on:click={onClose}>⬅</button>
    <h2>{email.sender}</h2>
    <p>{email.subject}</p>
    <div class="email-content">
        <p>Содержимое письма отображается здесь...</p>
    </div>
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
