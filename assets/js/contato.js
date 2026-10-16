// Formulário de contato: envia pelo Web3Forms, que encaminha a mensagem por e-mail.
// Sem JavaScript, o formulário é enviado normalmente e o Web3Forms redireciona de volta.
(function () {
  'use strict';
  const form = document.getElementById('form-contato');
  if (!form) return;
  const status = document.getElementById('form-status');
  const button = form.querySelector('button[type="submit"]');
  const EN = document.documentElement.lang === 'en';
  const T = EN
    ? { sent: 'Message sent. Thank you — I’ll reply soon.', sending: 'Sending…', error: 'Couldn’t send right now. Please try again in a few minutes or reach me on Instagram.' }
    : { sent: 'Mensagem enviada. Obrigado — respondo em breve.', sending: 'Enviando…', error: 'Não foi possível enviar agora. Tente de novo em alguns minutos ou me chame no Instagram.' };

  function say(text, kind) {
    status.textContent = text;
    status.dataset.kind = kind || '';
  }

  // Volta do envio sem JavaScript (?enviado=1)
  const params = new URLSearchParams(location.search);
  if (params.get('enviado') === '1' || params.get('sent') === '1') {
    say(T.sent, 'ok');
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;
    say(T.sending);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        // FormData (multipart) é um envio simples: dispensa a checagem prévia de CORS.
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message || response.status);
      form.reset();
      say(T.sent, 'ok');
    } catch {
      say(T.error, 'erro');
    } finally {
      button.disabled = false;
    }
  });
})();
