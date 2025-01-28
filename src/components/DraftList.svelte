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
                <button class="delete-button" on:click={() => deleteDraft(draft.id)} aria-label="Удалить черновик">
                    ✖
                </button>
            </div>
        {/each}
    {:else}
        <p class="no-drafts">Нет черновиков</p>
    {/if}
</div>

<style>
    .draft-list {
        margin-left: 30px;
        padding: 20px;
        background-color: #f9faff;
        border: 1px solid #d1d8e0;
        border-radius: 16px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .draft-list h2 {
        margin-bottom: 16px;
        font-size: 1.25rem;
        font-weight: bold;
        color: #4a4e69;
        text-align: center;
    }

    .draft-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        margin-bottom: 10px;
        background-color: #ffffff;
        border: 1px solid #ced4da;
        border-radius: 12px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
    }

    .draft-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .draft-subject {
        font-size: 1rem;
        color: #495057;
        font-weight: 500;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 80%;
    }

    .draft-subject:hover {
        color: #007bff;
    }

    .delete-button {
        background-color: #ff4d4f;
        color: #ffffff;
        border: none;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .delete-button:hover {
        background-color: #d9363e;
    }

    .no-drafts {
        font-size: 1rem;
        color: #6c757d;
        text-align: center;
        margin-top: 20px;
    }
</style>
