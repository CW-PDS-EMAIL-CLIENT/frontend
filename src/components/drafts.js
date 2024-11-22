import { writable } from "svelte/store";

// Получение черновиков из localStorage
const storedDrafts = JSON.parse(localStorage.getItem("drafts") || "[]");

// Хранилище черновиков
export const drafts = writable(storedDrafts);

// Синхронизация с localStorage
drafts.subscribe((value) => {
    localStorage.setItem("drafts", JSON.stringify(value));
});
