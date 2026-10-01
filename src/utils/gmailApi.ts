export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  unread: boolean;
  bodyText?: string;
}

export async function fetchRecentEmails(
  accessToken: string,
  maxResults = 12
): Promise<EmailMessage[]> {
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=in:inbox`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!listRes.ok) {
    throw new Error(`Erro ao listar emails: ${listRes.statusText}`);
  }

  const listData = await listRes.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch details in parallel
  const detailPromises = listData.messages.map(async (msg: { id: string }) => {
    try {
      const itemRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!itemRes.ok) return null;
      const data = await itemRes.json();

      const headers = data.payload?.headers || [];
      const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject');
      const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from');
      const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date');

      const isUnread = (data.labelIds || []).includes('UNREAD');

      // Extract body text if present
      let bodyText = data.snippet || '';
      if (data.payload?.parts) {
        const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          try {
            bodyText = decodeBase64Url(textPart.body.data);
          } catch (_) {}
        }
      }

      return {
        id: data.id,
        threadId: data.threadId,
        snippet: data.snippet || '',
        subject: subjectHeader?.value || '(Sem Assunto)',
        from: fromHeader?.value || 'Desconhecido',
        date: dateHeader?.value
          ? new Date(dateHeader.value).toLocaleString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '',
        unread: isUnread,
        bodyText
      } as EmailMessage;
    } catch (e) {
      return null;
    }
  });

  const results = await Promise.all(detailPromises);
  return results.filter((r): r is EmailMessage => r !== null);
}

export async function sendEmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<{ id: string }> {
  // Build RFC 2822 email format
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    body
  ];
  const rawEmail = emailLines.join('\r\n');
  const encodedEmail = encodeBase64Url(rawEmail);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encodedEmail })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Falha ao enviar email (${res.status})`);
  }

  return await res.json();
}

function encodeBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeBase64Url(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(base64)));
}
