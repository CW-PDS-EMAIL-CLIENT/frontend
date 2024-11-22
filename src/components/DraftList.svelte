<script>
    import { drafts } from "./drafts.js";

    export let onSelectDraft; // Функция для открытия черновика

    function deleteDraft(id) {
        drafts.update((existingDrafts) => existingDrafts.filter((draft) => draft.id !== id));
    }
</script>

<div class="draft-list">
    <h2>Черновики</h2>
    {#each $drafts as draft}
        <div class="draft-item">
            <span class="subject" on:click={() => onSelectDraft(draft)}>{draft.subject || "Без темы"}</span>
            <button on:click={() => deleteDraft(draft.id)}>Удалить</button>
        </div>
    {/each}
</div>
