// store.js
import { writable } from 'svelte/store';

// Функция для создания хранилища с сохранением в localStorage
function createPersistentStore(key, initialValue) {
  // Загружаем значение из localStorage или используем значение по умолчанию
  const savedValue = localStorage.getItem(key);
  const parsedValue = savedValue !== null ? JSON.parse(savedValue) : initialValue;

  // Создаем Svelte-хранилище
  const store = writable(parsedValue);

  // Подписываемся на изменения и сохраняем в localStorage
  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return store;
}

// Экспортируем хранилище с ключом "userEncrypt" и значением по умолчанию true
export const userEncrypt = createPersistentStore('userEncrypt', true);
