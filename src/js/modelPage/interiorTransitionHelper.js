const transitionAttributeName = "data-interior-transition";
const textChangeAttributeName = "data-interior-text-changed";

export class InteriorTransitionHelper {
  constructor(button) {
    this.button = button;
  }

  startTransition() {
    this.button.setAttribute(transitionAttributeName, 'Y');
  }

  // При переходе из модели В салон или наоборот - нужно менять вид кнопки и ее текст
  // Обработчик смены текста - независимый от обработчика перехода(что неверно, ненадежно и нужно исправить)
  // Сейчас при смене текста вешаем атрибут, чтобы не менять второй раз, аналогично тому, как блокируем обработчики смены если есть атрибут transitionAttributeName
  onTextChange() {
    this.button.setAttribute(textChangeAttributeName, 'Y');
  }

  endTransition() {
    this.button.removeAttribute(transitionAttributeName);
    this.button.removeAttribute(textChangeAttributeName);
  }

  isTransition() {
    return this.button.hasAttribute(transitionAttributeName);
  }
  isTextChangedOnTransition() {
    return this.button.hasAttribute(textChangeAttributeName);
  }
}