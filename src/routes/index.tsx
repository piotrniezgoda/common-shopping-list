import { createEffect, createSignal, Show, createMemo, onMount } from "solid-js";
import { query, createAsync, useSearchParams } from "@solidjs/router";

import HomeButtons from "~/components/HomeButtons";
import IdModal from "~/components/IdModal";
import ShoppingList from "~/components/ShoppingList";
import { ShoppingList as ShoppingListType } from "~/models/ShoppingList";
import ShareModal from "~/components/ShareModal";
import Loader from "~/components/Loader";

import { API_ITEMS, API_LISTS } from "../../consts/api";


export default function Home() {
  const [isOpenIdModal, setIsOpenIdModal] = createSignal(false);
  const [isShareModalOpen, setIsShareModalOpen] = createSignal(false);
  const [shoppingList, setShoppingList] = createSignal<ShoppingListType | null>(null);
  const [searchParams] = useSearchParams();
  const [listNotFoundError, setListNotFoundError] = createSignal(false);
  const [isMounted, setIsMounted] = createSignal(false);
  const [initialCheckDone, setInitialCheckDone] = createSignal(false);

  // Computed signal - pokaż loader jeśli:
  // Jesteśmy w przeglądarce I nie ma listy I jest ID do załadowania I sprawdzanie nie zostało jeszcze zakończone
  const shouldShowLoader = createMemo(() => {
    // Nie pokazuj loadera jeśli nie jesteśmy jeszcze w przeglądarce
    if (!isMounted()) return false;
    
    // Jeśli już jest lista lub błąd, nie pokazuj loadera
    if (shoppingList() || listNotFoundError()) return false;
    
    // Jeśli sprawdzenie zostało zakończone i nie ma listy, nie pokazuj loadera (pokaż przyciski)
    if (initialCheckDone()) return false;
    
    // W tym miejscu wiemy że: jesteśmy w przeglądarce, nie ma listy/błędu, sprawdzenie nie zakończone
    // Sprawdź czy jest coś do załadowania
    const qrIdRaw = searchParams["list"];
    const qrId = Array.isArray(qrIdRaw) ? qrIdRaw[0] ?? "" : qrIdRaw ?? "";
    const savedListId = typeof window !== "undefined" ? localStorage.getItem("shoppingListShareId") : null;
    
    // Jeśli jest ID do załadowania, pokaż loader
    return !!(qrId || savedListId);
  });

  onMount(() => {
    // Ustaw flagę że jesteśmy w przeglądarce
    setIsMounted(true);
  });

  createEffect(() => {
    // Zabezpieczenie przed SSR - localStorage dostępny tylko w przeglądarce
    if (typeof window === "undefined") return;
    
    let qrIdRaw = searchParams["list"];
    const qrId = Array.isArray(qrIdRaw) ? qrIdRaw[0] ?? "" : qrIdRaw ?? "";
    
    // Sprawdź czy trzeba załadować dane
    const savedListId = localStorage.getItem("shoppingListShareId");
    
    if (qrId) {
      fetch(`${API_LISTS}/${qrId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setListNotFoundError(true);
            setShoppingList(null);
            // Nie zapisuj błędnego ID do localStorage
            // Jeśli było tam wcześniej to samo błędne ID, usuń je
            if (localStorage.getItem("shoppingListShareId") === qrId) {
              localStorage.removeItem("shoppingListShareId");
            }
          } else {
            setShoppingList(new ShoppingListType(data));
            setListNotFoundError(false);
            // Zapisz ID tylko jeśli lista istnieje i jest poprawna
            if (qrId !== localStorage.getItem("shoppingListShareId")) {
              localStorage.setItem("shoppingListShareId", qrId);
            }
          }
        })
        .finally(() => {
          setInitialCheckDone(true);
        });
      return;
    }
    // Jeśli nie ma parametru list, ale jest save w localStorage, odśwież listę na podstawie tamtego ID:
    if (savedListId) {
      fetch(`${API_LISTS}/${savedListId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setListNotFoundError(true);
            setShoppingList(null);
            // Usuń błędne ID z localStorage
            localStorage.removeItem("shoppingListShareId");
          } else {
            setShoppingList(new ShoppingListType(data));
            setListNotFoundError(false);
          }
        })
        .finally(() => {
          setInitialCheckDone(true);
        });
    } else {
      // Nie ma nic do załadowania - wyłącz loader i pokaż przyciski
      setShoppingList(null);
      setListNotFoundError(false);
      setInitialCheckDone(true);
    }
  });

  let debounceTimer: number;
  let pendingUpdates: Record<string, number> = {};

  const onCreateNewList = async () => {
     await fetch(API_LISTS, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      })
      .then((res) => res.json())
      .then((data) => {
        setShoppingList(new ShoppingListType(data));
        localStorage.setItem("shoppingListShareId", data.shareId);
        setListNotFoundError(false);

        const lastUsedIds = localStorage.getItem("shoppingListLastUsedIds");
        const parsedLastUsedIds = lastUsedIds ? JSON.parse(lastUsedIds) : [];
        const existingList = parsedLastUsedIds.find((list: any) => list.shareId === data.shareId);

        if (!existingList) {
            parsedLastUsedIds.push({shareId: data.shareId, name: data.name});
            localStorage.setItem("shoppingListLastUsedIds", JSON.stringify(parsedLastUsedIds));
          }
      });
  };

  const onShareCurrentList = () => {
    setIsShareModalOpen(true);
  }

  const toggleChecked = async (id: string) => {
    const list = shoppingList();
    if (!list) return;

    const updatedItems = list.items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked, updatedAt: new Date() } : item
    );
 
    setShoppingList({ ...list, items: updatedItems, updatedAt: new Date() });

    const item = list.items.find(i => i.id === id);

    try {
        const res = await fetch(`${API_ITEMS}/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ checked: !item?.checked }),
        });
  
        if (!res.ok) {
          throw new Error("Failed to update list");
        }
      } catch (err) {
        console.error("❌ Błąd aktualizacji listy:", err);
      }
  };
  
  const onAddItem = async (name: string) => {
    const list = shoppingList();
    if (!list) return;

    const updatedItems = [
      ...list.items,
      {
        name,
        quantity: 1,
        order: list.items.length + 1,
        checked: false
      }
    ];

    await fetch(`${API_LISTS}/${shoppingList()?.shareId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ items: updatedItems }), 
      })
      .then((res) => res.json())
      .then((data) => {
        setShoppingList(new ShoppingListType(data));
      });
  };

  const onDeleteItem = async (id: string) => {
    const list = shoppingList();
    if (!list) return;
    setShoppingList({ ...list, items: list.items.filter(i => i.id !== id) });

    try {
        const res = await fetch(`${API_ITEMS}/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
        });
  
        if (!res.ok) {
          throw new Error("Failed to delete item");
        }
      } catch (err) {
        console.error("❌ Błąd usunięcia itemu:", err);
      }
  }

  const onUpdateQuantity = (id: string, qty: number) => {
  const list = shoppingList();
  if (!list) return;

  // 1️⃣ Lokalna aktualizacja stanu UI
  const updated = list.items.map(i =>
    i.id === id ? { ...i, quantity: Math.max(1, qty) } : i
  );
  setShoppingList({ ...list, items: updated });

  // 2️⃣ Zapisz zmiany do bufora
  pendingUpdates[id] = Math.max(1, qty);

  // 3️⃣ Resetuj debounce jeśli jest aktywny
  if (debounceTimer) clearTimeout(debounceTimer);

  // 4️⃣ Ustaw nowy debounce (2 sekundy ciszy => flush zmian)
  debounceTimer = setTimeout(async () => {
    // kopiujemy aktualny stan zmian i czyścimy bufor
    const updates = { ...pendingUpdates };
    pendingUpdates = {};

    // wykonujemy PATCH dla każdego itemu z bufora
    for (const [itemId, quantity] of Object.entries(updates)) {
      try {
        const res = await fetch(`${API_ITEMS}/${itemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ quantity }),
        });

        if (!res.ok) {
          throw new Error(`Failed to update item ${itemId}`);
        }

        const updatedItems = await res.json(); // backend zwraca całą tablicę
        setShoppingList(prev =>
          prev ? { ...prev, items: updatedItems } : prev
        );
      } catch (err) {
        console.error("❌ Błąd aktualizacji itemu:", err);
      }
    }
  }, 2000); // ⏱️ 2 sekundy
};

  const onDeleteList = async () => {
    const list = shoppingList();
    if (!list) return;
    const confirmDelete = window.confirm("Czy na pewno chcesz usunąć tę listę zakupów? Tego nie można cofnąć.");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`${API_LISTS}/${list.shareId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Nie udało się usunąć listy");
      setShoppingList(null);
      localStorage.removeItem("shoppingListShareId");
      // Usuń z historii ostatnich ID
      const lastUsedIds = localStorage.getItem("shoppingListLastUsedIds");
      if (lastUsedIds) {
        const arr = JSON.parse(lastUsedIds).filter((item: any) => item.shareId !== list.shareId);
        localStorage.setItem("shoppingListLastUsedIds", JSON.stringify(arr));
      }
    } catch (err) {
      alert("Wystąpił błąd przy usuwaniu listy");
      console.error(err);
    }
  };

  return (
    <main class="h-1 min-h-screen text-center mx-auto text-gray-700 p-4 flex flex-col">
      <Show when={isMounted() && !shouldShowLoader()} fallback={<Loader />}>
        <Show when={!listNotFoundError()} fallback={
          <div class="flex min-h-screen justify-center items-center">
            <div class="flex flex-col gap-4 items-center justify-center py-10 px-6 rounded-xl bg-white/95 shadow-xl">
              <div class="text-lg text-red-600 font-semibold">Nie znaleziono listy o podanym ID. Być może została usunięta.</div>
              <div class="flex gap-3">
                <button
                  class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  onClick={onCreateNewList}
                >
                  Utwórz nową listę
                </button>
                <button
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={() => { setIsOpenIdModal(true); setListNotFoundError(false); }}
                >
                  Otwórz istniejącą listę
                </button>
              </div>
            </div>
          </div>
        }>
          <HomeButtons 
          setIsOpenIdModal={setIsOpenIdModal} 
          shoppingList={shoppingList}
          onCreateNewList={onCreateNewList}
          onShareCurrentList={onShareCurrentList}
        />
        <ShoppingList 
          shoppingList={shoppingList} 
          onToggle={toggleChecked}
          onAddItem={onAddItem}
          onUpdateQuantity={(id, qty) => onUpdateQuantity(id, qty)}
          onDeleteItem={(id) => onDeleteItem(id)}
          setShoppingList={setShoppingList}
          onDeleteList={onDeleteList}
        />
        <IdModal 
          isOpenIdModal={isOpenIdModal()} 
          setIsOpenIdModal={setIsOpenIdModal} 
          setShoppingList={setShoppingList}
          shoppingList={shoppingList()}
        />
        <ShareModal 
          isShareModalOpen={isShareModalOpen()} 
          setIsShareModalOpen={setIsShareModalOpen} 
          shoppingList={shoppingList()!} 
        />
        </Show>
      </Show>
    </main>
  );
}
