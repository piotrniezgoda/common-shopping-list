import { Accessor } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { ShoppingList } from "~/models/ShoppingList";

function EmptyButtons(props: { onCreate: () => void; onOpen: () => void }) {
  return (
    <div class="flex-1 flex items-center justify-center bg-black">
      <div class="flex flex-col gap-3 w-[200px] sm:w-[240px] md:w-[280px]">
        <button
          onClick={props.onCreate}
          class="w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
        >
          Utwórz nową listę
        </button>
        <p class="text-center text-gray-300">lub</p>
        <button
          onClick={props.onOpen}
          class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Otwórz istniejącą listę
        </button>
      </div>
    </div>
  );
}

function FilledButtons(props: { onCreate: () => void; onOpen: () => void; onShare: () => void }) {
  return (
    <div class="flex items-center justify-end bg-black py-3">
      <div class="flex flex-col sm:flex-row gap-3 w-full px-4">
        <button
          onClick={props.onShare}
          class="w-full cursor-pointer px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 sm:max-w-50 sm:mr-auto"
        >
          Udostępnij listę
        </button>
        <button
          onClick={props.onCreate}
          class="w-full cursor-pointer px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 sm:max-w-50"
        >
          Utwórz nową listę
        </button>
        <button
          onClick={props.onOpen}
          class="w-full cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 sm:max-w-80"
        >
          Otwórz inną istniejącą listę
        </button>
      </div>
    </div>
  );
}

export default function HomeButtons(props: {
  shoppingList: Accessor<ShoppingList | null>;
  setIsOpenIdModal: (isOpen: boolean) => void;
  onCreateNewList: () => void;
  onShareCurrentList: () => void;
}) {
  const onCreateNewList = () => props.onCreateNewList();
  const onOpenExistingList = () => props.setIsOpenIdModal(true);
  const onShareCurrentList = () => props.onShareCurrentList();

  return (
    <Dynamic
      component={props.shoppingList() ? FilledButtons : EmptyButtons}
      onCreate={onCreateNewList}
      onOpen={onOpenExistingList}
      onShare={onShareCurrentList}
    />
  );
}