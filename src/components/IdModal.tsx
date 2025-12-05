import { createEffect, createSignal, For, Show } from "solid-js";
import { Transition } from "solid-transition-group";
import { useNavigate } from "@solidjs/router";

import { ShoppingList } from "~/models/ShoppingList";

import { ShoppingList as ShoppingListType } from "~/models/ShoppingList";
import { API_LISTS } from "../../consts/api";
import { QRCodeSVG, ErrorCorrectionLevel } from "solid-qr-code";

export default function IdModal(props: { 
  isOpenIdModal: boolean, 
  setIsOpenIdModal: (isOpen: boolean) => void, 
  setShoppingList: (list: ShoppingListType) => void,
  shoppingList: ShoppingListType | null 
}) {
  const isOpen = () => props.isOpenIdModal;  
  const navigate = useNavigate();
  const [inputValue, setInputValue] = createSignal("");
  const [inProgress, setInProgress] = createSignal(false);
  const [lastUsedIds, setLastUsedIds] = createSignal<{shareId: string, name: string}[]>([]);
  const [currentId, setCurrentId] = createSignal<string | null>('');
  const [idError, setIdError] = createSignal<string | null>(null);

createEffect(() => {
    const storedIds = localStorage.getItem("shoppingListLastUsedIds");
    if (isOpen() && storedIds) {
      setLastUsedIds(JSON.parse(storedIds));
    }
    // Ustaw currentId na podstawie aktualnej listy (jeśli istnieje) zamiast localStorage
    if (props.shoppingList) {
      setCurrentId(props.shoppingList.shareId);
    } else {
      setCurrentId(null);
    }
  });

  const handleModalSubmit = async (id?: string) => {
    setInProgress(true);
    setIdError(null);
    const listId = id || inputValue();
    await fetch(`${API_LISTS}/${listId}`, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          props.setShoppingList(new ShoppingListType(data));
          localStorage.setItem("shoppingListShareId", data.shareId);
          const lastUsedIds = localStorage.getItem("shoppingListLastUsedIds");
          const parsedLastUsedIds = lastUsedIds ? JSON.parse(lastUsedIds) : [];
          const existingList = parsedLastUsedIds.find((list: any) => list.shareId === data.shareId);
          if (!existingList) {
            parsedLastUsedIds.push({ shareId: data.shareId, name: data.name });
            localStorage.setItem("shoppingListLastUsedIds", JSON.stringify(parsedLastUsedIds));
          }
          setInputValue("");
          // Wyczyść parametr URL jeśli istnieje
          navigate("/", { replace: true });
          props.setIsOpenIdModal(false);
        } else {
          setIdError("Nie znaleziono listy o podanym ID. Sprawdź pisownię lub wybierz inną.");
          // Jeśli był to wybór z historii (parametr id), usuń go z localStorage
          if (id) {
            const lastUsedIds = localStorage.getItem("shoppingListLastUsedIds");
            if (lastUsedIds) {
              const parsedLastUsedIds = JSON.parse(lastUsedIds);
              const filteredIds = parsedLastUsedIds.filter((list: any) => list.shareId !== id);
              localStorage.setItem("shoppingListLastUsedIds", JSON.stringify(filteredIds));
              setLastUsedIds(filteredIds);
            }
          }
        }
      })
      .catch((error) => {
        setIdError("Błąd sieci. Spróbuj ponownie później.");
        console.error("Error fetching the shopping list:", error);
      });
    setInProgress(false);
  };

  return (
    <Transition
        onEnter={(el, done) => {
          el.animate(
            [{ opacity: 0, transform: "scale(0.95)" }, { opacity: 1, transform: "scale(1)" }],
            { duration: 200, easing: "ease-out" }
          ).finished.then(done);
        }}
        onExit={(el, done) => {
          el.animate(
            [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.95)" }],
            { duration: 150, easing: "ease-in" }
          ).finished.then(done);
        }}
      >
        <Show when={isOpen()}>
          <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-96 p-6 relative">
              {/* Ikonka zamknięcia */}
              <button
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => props.setIsOpenIdModal(false)}
              >
                ✕
              </button>

              <h2 class="text-xl font-semibold mb-4">Podaj ID</h2>
              <input
                type="text"
                value={inputValue()}
                onInput={(e) => {
                  setInputValue(e.currentTarget.value);
                  setIdError(null);
                }}
                onFocus={() => setIdError(null)}
                placeholder="Wpisz ID..."
                class="w-full px-3 py-2 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Show when={!!idError()}>
                <div class="text-red-500 mb-2 text-sm text-center animate-fadeIn">{idError()}</div>
              </Show>

              <button
                disabled={inProgress()}
                onClick={() => handleModalSubmit()}
                class={`w-full py-2 rounded-xl text-white transition 
                ${inProgress() ? "bg-blue-400 animate-pulse cursor-wait" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {inProgress() ? "Ładowanie..." : "Zatwierdź"}
              </button>
              <Show when={lastUsedIds().length > 0}>
                <div class="h-max-10 mt-8 p-3 border rounded-lg bg-gray-50">
                  <h3 class="text-lg font-semibold mb-1">Ostatnio używane ID:</h3>
                  <ul class="list-none space-y-2 max-h-40 overflow-y-auto">
                    <For each={lastUsedIds().slice(-10).reverse()}>
                      {(list) => (
                        <li>
                          <button
                            class="text-white ml-auto mr-auto max-w-60 w-full bg-blue-500 cursor-pointer hover:bg-blue-600 px-3 py-1 rounded-lg transition disabled:opacity-20 disabled:bg-gray-500 disabled:cursor-default flex flex-col"
                            onClick={() => handleModalSubmit(list.shareId)}
                            disabled={inProgress() || list.shareId === currentId()}
                          >
                            {list.shareId} <span class="text-gray-100 text-xs block">({list.name || "Lista zakupów"})</span>
                          </button>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              </Show>
            </div>
          </div>
        </Show>
      </Transition>
  );
}
