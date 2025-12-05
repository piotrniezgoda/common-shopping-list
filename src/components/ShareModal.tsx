import { createSignal, Show } from "solid-js";
import { Transition } from "solid-transition-group";

import { ShoppingList } from "~/models/ShoppingList";
import { QRCodeSVG, ErrorCorrectionLevel } from "solid-qr-code";

export default function IdModal(props: { isShareModalOpen: boolean, setIsShareModalOpen: (isOpen: boolean) => void, shoppingList: ShoppingList }) {
  const isOpen = () => props.isShareModalOpen;  

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
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => props.setIsShareModalOpen(false)}
              >
                ✕
              </button>

              <h2 class="text-xl font-semibold mb-4">ID Twojej listy zakupów:</h2>
              <p class="mb-4 p-4 bg-gray-100 rounded-lg break-all select-all">{props.shoppingList.shareId}</p>
              {/* Kod QR do udostępniania aktywnej listy */}
              <div class="flex flex-col items-center mb-4">
                <QRCodeSVG
                  value={`${window.location.origin}/?list=${props.shoppingList.shareId}`}
                  width={192}
                  height={192}
                  level={ErrorCorrectionLevel.LOW}
                  backgroundColor="#fff"
                  backgroundAlpha={1}
                  foregroundColor="#000"
                  foregroundAlpha={1}
                />
                <span class="mt-2 text-xs text-gray-600 select-all break-all">{`${window.location.origin}/?list=${props.shoppingList.shareId}`}</span>
                <span class="text-xs text-gray-400">Zeskanuj kod, aby udostępnić listę na innym urządzeniu.</span>
              </div>
              <p class="mb-6 text-sm text-gray-500">Podając ten ID ponownie na stronie lub w aplikacji mobilnej, masz stały dostęp do swojej listy zakupów, którą możesz również udostępnić innym osobom.</p>
            </div>
          </div>
        </Show>
      </Transition>
  );
}
