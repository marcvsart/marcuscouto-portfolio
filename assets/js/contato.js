// Formulário de contato: envia pelo Web3Forms, que encaminha a mensagem por e-mail.
// Sem JavaScript, o formulário é enviado normalmente e o Web3Forms redireciona de volta.
(function () {
  'use strict';
  const form = document.getElementById('form-contato');
  if (!form) return;
  const status = document.getElementById('form-status');
  const button = form.querySelector('button[type="submit"]');

  function say(text, kind) {
    status.textContent = text;
    status.dataset.kind = kind || '';
  }

  // Volta do envio sem JavaScript (?enviado=1)
  if (new URLSearchParams(location.search).get('enviado') === '1') {
    say('Mensagem enviada. Obrigado — respondo em breve.', 'ok');
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;
    say('Enviando…');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message || response.status);
      form.reset();
      say('Mensagem enviada. Obrigado — respondo em breve.', 'ok');
    } catch {
      say('Não foi possível enviar agora. Tente de novo em alguns minutos ou me chame no Instagram.', 'erro');
    } finally {
      button.disabled = false;
    }
  });
})();
