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
      <div class="flex flex-row gap-3 w-full px-4">
        <button
          onClick={props.onShare}
          class="w-13 h-13 flex rounded-full justify-center items-center cursor-pointer px-2 py-2 bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <img src="/assets/icons/share.svg" alt="Udostępnij" class="inline-block w-4.5 h-4.5" />
        </button>
        <button
          onClick={props.onCreate}
          class="w-13 h-13 flex ml-auto rounded-full justify-center items-center cursor-pointer px-2 py-2 bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <img src="/assets/icons/create.svg" alt="Nowa lista" class="inline-block w-4.5 h-4.5" />
        </button>
        <button
          onClick={props.onOpen}
          class="w-13 h-13 flex rounded-full justify-center items-center cursor-pointer px-2 py-2 bg-blue-500 text-white hover:bg-blue-600"
        >
          <img src="/assets/icons/open.svg" alt="Otwórz" class="inline-block w-4.5 h-4.5" />
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