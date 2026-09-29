// O jsdom não implementa showModal/close do <dialog>. Este é o mínimo para testar o painel da
// metodologia como o navegador se comporta: abrir, fechar com evento "close", e Esc cancelando.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };

  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    const aberto = document.querySelector<HTMLDialogElement>('dialog[open]');
    if (!aberto) return;
    const cancelamento = new Event('cancel', { cancelable: true });
    aberto.dispatchEvent(cancelamento);
    if (!cancelamento.defaultPrevented) aberto.close();
  });
}
