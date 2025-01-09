<script>
    import { drafts } from "./drafts.js";

    export let onSelectDraft; // Функция для открытия черновика

    function deleteDraft(id) {
        drafts.update((existingDrafts) => existingDrafts.filter((draft) => draft.id !== id));
    }
</script>

<div class="draft-list">
    <h2>Черновики</h2>
    {#if $drafts.length > 0}
        {#each $drafts as draft}
            <div class="draft-item">
                <span class="draft-subject" on:click={() => onSelectDraft(draft)}>
                    {draft.subject || "Без темы"}
                </span>
                <button class="delete-button" on:click={() => deleteDraft(draft.id)}>Удалить</button>
            </div>
        {/each}
    {:else}
        <p class="no-drafts">Нет черновиков</p>
    {/if}
</div>

<style>
    .draft-list {
        padding: 20px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
    }

    .draft-list h2 {
        margin-bottom: 15px;
        font-size: 1.5em;
        color: #333;
    }

    .draft-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin-bottom: 10px;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 5px;
        transition: box-shadow 0.2s ease;
    }

    .draft-item:hover {
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .draft-subject {
        cursor: pointer;
        color: #007bff;
        text-decoration: underline;
    }

    .draft-subject:hover {
        color: #0056b3;
    }

    .delete-button {
        background-color: #ff4d4f;
        color: #fff;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .delete-button:hover {
        background-color: #d9363e;
    }

    .no-drafts {
        font-size: 1em;
        color: #999;
        text-align: center;
    }
</style>
