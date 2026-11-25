/** "#REF Subject" for a ticket page's heading and document title. */
export function ticketPageTitle(ticket) {
    const reference = String(ticket?.reference ?? '').trim();
    const subject = String(ticket?.subject ?? '').trim();
    const ref = reference ? (reference.startsWith('#') ? reference : `#${reference}`) : '';
    return [ref, subject].filter(Boolean).join(' ');
}
