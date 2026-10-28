
(() => {
  const cfg = window.NGD_SUPABASE_CONFIG || {};

  const supabaseUrl = cfg.supabaseUrl;
  const supabaseKey = cfg.supabaseKey;

  const ready = Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseKey.includes('PASTE_') &&
    window.supabase
  );

  const client = ready
    ? window.supabase.createClient(supabaseUrl, supabaseKey)
    : null;

  window.NGDPortal = {
    ready,
    client,

    show(id, message, type = '') {
      const el = document.getElementById(id);
      if (!el) return;

      el.textContent = message;
      el.className = 'status' + (type ? ' ' + type : '');
      el.classList.remove('hidden');
    },

    hide(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    },

    esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[ch]);
    },

    async requireUser() {
      if (!this.ready || !this.client) {
        this.show(
          'global-status',
          'تعذر الاتصال بـ Supabase. راجع إعدادات الاتصال في config/supabase-config.js.',
          'error'
        );
        return null;
      }

      const { data, error } = await this.client.auth.getSession();

      if (error) {
        this.show('global-status', 'تعذر التحقق من جلسة الدخول.', 'error');
        return null;
      }

      if (!data.session?.user) {
        location.href = 'login.html';
        return null;
      }

      return data.session.user;
    },

    async signOut() {
      if (this.client) {
        await this.client.auth.signOut();
      }

      location.href = 'login.html';
    }
  };
})();
