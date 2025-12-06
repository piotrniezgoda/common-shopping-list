import { createSignal, Show } from "solid-js";
import { Transition } from "solid-transition-group";

import { ShoppingList } from "~/models/ShoppingList";
import { QRCodeSVG, ErrorCorrectionLevel } from "solid-qr-code";

import copyIcon from "/assets/icons/copy.svg";
import doneIcon from "/assets/icons/done.svg";

export default function IdModal(props: { isShareModalOpen: boolean, setIsShareModalOpen: (isOpen: boolean) => void, shoppingList: ShoppingList }) {
  const isOpen = () => props.isShareModalOpen;  
  const [isCopied, setIsCopied] = createSignal(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(props.shoppingList.shareId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => props.setIsShareModalOpen(false)}
              >
                ✕
              </button>

              <h2 class="text-xl font-semibold mb-4">Kod Twojej listy zakupów:</h2>
              <div class="flex p-3 bg-gray-100 rounded-lg items-center gap-2 mb-4 relative">
                <p class="flex-1 break-all select-all">{props.shoppingList.shareId}</p>
                <button
                  onClick={copyToClipboard}
                  class="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors flex-shrink-0 absolute right-2 top-1.5"
                  aria-label="Kopiuj kod"
                >
                  <img 
                    src={isCopied() ? doneIcon : copyIcon} 
                    alt={isCopied() ? "Skopiowano" : "Kopiuj"} 
                    class="w-5 h-5"
                  />
                </button>
              </div>
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
                <span class="mt-4 text-xs text-gray-600 select-all break-all mb-2">{`${window.location.origin}/?list=${props.shoppingList.shareId}`}</span>
                <span class="text-xs text-gray-400">Zeskanuj kod, aby udostępnić listę na innym urządzeniu.</span>
              </div>
              <p class="mb-6 text-sm text-gray-500">Podając ten ID ponownie na stronie lub w aplikacji mobilnej, masz stały dostęp do swojej listy zakupów, którą możesz również udostępnić innym osobom.</p>
            </div>
          </div>
        </Show>
      </Transition>
  );
}
