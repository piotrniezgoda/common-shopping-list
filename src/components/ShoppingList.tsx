import { Show, Accessor, createSignal, For, createEffect, onMount } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import { Pencil } from "lucide-solid";
import { Transition } from "solid-transition-group";


import { ShoppingList as ShoppingListModel } from "~/models/ShoppingList";
import { API_LISTS } from "../../consts/api";

export default function ShoppingList(props: {
  shoppingList: Accessor<ShoppingListModel | null>;
  setShoppingList: (list: ShoppingListModel) => void;
  onToggle?: (id: string) => void;
  onAddItem?: (name: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onDeleteItem?: (id: string) => void;
  onDeleteList?: () => void; // <--- DODAJ
}) {
  const [newItemName, setNewItemName] = createSignal("");
  const [animatingId, setAnimatingId] = createSignal<string | null>(null);
  const [isEditing, setIsEditing] = createSignal(false);
  const [newName, setNewName] = createSignal(props.shoppingList()?.name || "Lista zakupów");

  const handleAddItem = () => {
    const name = newItemName().trim();
    if (!name) return;
    props.onAddItem?.(name);
    setNewItemName("");
  };

  const handleQuantityChange = (id: string, newQty: number) => {
    setAnimatingId(id);
    props.onUpdateQuantity?.(id, newQty);
    setTimeout(() => setAnimatingId(null), 200); // reset animacji
  };

  const onSave = async () => {
    const shareId = props.shoppingList()?.shareId;
    if (!shareId) return;

    try {
      const res = await fetch(`${API_LISTS}/${shareId}/name`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newName() })
      });

      if (!res.ok) throw new Error("Failed to update list name");

      const updated = await res.json();
      props.setShoppingList(updated);

    const lastUsedIds = localStorage.getItem("shoppingListLastUsedIds");
    const parsedLastUsedIds = lastUsedIds ? JSON.parse(lastUsedIds) : [];

    const existingIndex = parsedLastUsedIds.findIndex((item: any) => item.shareId === shareId);
    if (existingIndex !== -1) {
      parsedLastUsedIds[existingIndex].name = newName();
    } else {
      parsedLastUsedIds.push({ shareId, name: newName() });
    }
    localStorage.setItem("shoppingListLastUsedIds", JSON.stringify(parsedLastUsedIds));

      setIsEditing(false);
    } catch (err) {
      console.error("❌ Błąd aktualizacji nazwy listy:", err);
    }
  };

  let inputRef: HTMLInputElement | undefined;


  createEffect(() => {
    setIsEditing(false);
    setNewName(props.shoppingList()?.name || "Lista zakupów");
  }, [props.shoppingList]);


  createEffect(() => {
    if (isEditing() && inputRef) {
      inputRef.focus();
      inputRef.select();
    }
  });

  return (
    <Show when={props.shoppingList()}>
      {list => (
        <div class="mb-auto mt-auto">
          <div class="max-w-md mx-auto mt-8 bg-white shadow-md rounded-2xl p-6">
            <div class="flex items-center gap-2 mb-4 min-h-[40px]">
              <Show
                when={isEditing()}
                fallback={
                  <div class="flex items-center justify-center gap-2 w-full">
                    <h2 class="text-xl font-semibold">
                      {props.shoppingList()?.name || "Lista zakupów"}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      class="text-gray-500 hover:text-gray-700 cursor-pointer"
                      title="Edytuj nazwę"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        class="h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                  </div>
                }
              >
                <div class="flex items-center gap-2 animate-fadeIn relative w-full">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newName()}
                    onInput={(e) => setNewName(e.currentTarget.value)}
                    class="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={onSave}
                    class="bg-blue-500 text-white text-sm px-3 py-1 rounded-lg cursor-pointer hover:bg-blue-600"
                  >
                    Zapisz
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    class="text-gray-500 cursor-pointer text-sm hover:text-gray-700"
                  >
                    Anuluj
                  </button>
                  {/* Usuwanie listy pozycjonowane absolutnie w prawym górnym rogu */}
                  <button
                    onClick={() => props.onDeleteList && props.onDeleteList()}
                    class="absolute right-2 cursor-pointer p-1 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
                    aria-label="Usuń tę listę zakupów"
                    title="Usuń tę listę zakupów"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" width="22" height="22">
                      <path d="M20.5001 6H3.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path>
                      <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path>
                      <path d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="#ffffff" stroke-width="1.5"></path>
                    </svg>
                  </button>
                </div>
              </Show>
            </div>

            {/* input do dodawania nowych rzeczy */}
            <div class="flex gap-2 mb-4">
              <input
                type="text"
                value={newItemName()}
                onInput={e => setNewItemName(e.currentTarget.value)}
                onKeyDown={e => e.key === "Enter" && handleAddItem()}
                placeholder="Dodaj produkt..."
                class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-emerald-300"
              />
              <button
                onClick={handleAddItem}
                class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
              >
                Dodaj
              </button>
            </div>

            {/* <TransitionGroup
              onEnter={(el, done) => {
                el.animate(
                  [
                    { opacity: 0, transform: "translateY(-8px)" },
                    { opacity: 1, transform: "translateY(0)" }
                  ],
                  { duration: 200, easing: "ease-out" }
                ).finished.then(done);
              }}
              onExit={(el, done) => {
                el.animate(
                  [
                    { opacity: 1, transform: "translateY(0)" },
                    { opacity: 0, transform: "translateY(8px)" }
                  ],
                  { duration: 150, easing: "ease-in" }
                ).finished.then(done);
              }}
            > */}
              <ul class="h-max-full overflow-y-auto max-h-[400px]">
                <For each={list().items.slice().sort((a, b) => a.order - b.order)}>
                  {item => (
                    <li class="flex items-center justify-between py-2 border-b last:border-none">
                      {/* Checkbox i nazwa */}
                      <div class="flex items-center cursor-pointer group" onClick={() => props.onToggle?.(item.id)}>
                        <div
                          class={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors ${
                            item.checked
                              ? "bg-green-500 border-green-500"
                              : "border-gray-400 group-hover:border-green-400"
                          }`}
                        >
                          {item.checked && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span
                          class={`ml-3 text-lg transition ${
                            item.checked
                              ? "line-through text-gray-400"
                              : "text-gray-800"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>

                      {/* Quantity i kosz */}
                      <div class="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                          class="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition cursor-pointer"
                        >
                          <span class="font-bold">−</span>
                        </button>

                        <span
                          class={`w-6 h-6 flex items-center justify-center text-center font-medium transition-transform duration-200 transform-gpu ${
                            animatingId() === item.id ? "scale-125" : "scale-100"
                          }`}
                        >
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          class="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition cursor-pointer"
                        >
                          <span class="font-bold">+</span>
                        </button>

                        <button
                          onClick={() => props.onDeleteItem?.(item.id)}
                          class="ml-2 text-red-500 hover:text-red-700 cursor-pointer transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 100 2h12a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM5 6a1 1 0 011 1v9a2 2 0 002 2h4a2 2 0 002-2V7a1 1 0 112 0v9a4 4 0 01-4 4H8a4 4 0 01-4-4V7a1 1 0 011-1z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
            {/* </TransitionGroup> */}
          </div>
        </div>
      )}
    </Show>
  );
}
