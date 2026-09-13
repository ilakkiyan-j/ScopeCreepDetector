import { ChatMessage } from '../../../shared/types';

/**
 * Regex Patterns for Common Chat Formats
 */

// Format 1: [01/03/2026, 09:15:22] Sender: Message
const WHATSAPP_BRACKET_REGEX = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]\s*([^:]+):\s*(.*)$/i;

// Format 2: 01/03/2026, 09:15 - Sender: Message or 01/03/2026, 9:15 AM - Sender: Message
const WHATSAPP_DASH_REGEX = /^(\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\s*-\s*([^:]+):\s*(.*)$/i;

// Format 3: Sender (01/03/2026 09:15): Message
const SENDER_PAREN_REGEX = /^([^(]+)\s*\(([^)]+)\):\s*(.*)$/;

/**
 * Parses raw chat log text into normalized ChatMessage objects.
 * Handles multiline message continuation and standard export formats.
 */
export function parseConversation(rawText: string): ChatMessage[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const lines = rawText.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  let currentMsg: ChatMessage | null = null;
  let messageCounter = 1;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Match Format 1: [Timestamp] Sender: Content
    let match = trimmedLine.match(WHATSAPP_BRACKET_REGEX);
    if (match) {
      if (currentMsg) messages.push(currentMsg);
      currentMsg = {
        id: `msg_${String(messageCounter++).padStart(3, '0')}`,
        timestamp: match[1].trim(),
        sender: match[2].trim(),
        content: match[3].trim(),
      };
      continue;
    }

    // Match Format 2: Timestamp - Sender: Content
    match = trimmedLine.match(WHATSAPP_DASH_REGEX);
    if (match) {
      if (currentMsg) messages.push(currentMsg);
      currentMsg = {
        id: `msg_${String(messageCounter++).padStart(3, '0')}`,
        timestamp: match[1].trim(),
        sender: match[2].trim(),
        content: match[3].trim(),
      };
      continue;
    }

    // Match Format 3: Sender (Timestamp): Content
    match = trimmedLine.match(SENDER_PAREN_REGEX);
    if (match) {
      if (currentMsg) messages.push(currentMsg);
      currentMsg = {
        id: `msg_${String(messageCounter++).padStart(3, '0')}`,
        timestamp: match[2].trim(),
        sender: match[1].trim(),
        content: match[3].trim(),
      };
      continue;
    }

    // Fallback: If line does not match a new message header but currentMsg exists,
    // append this line as a continuation of currentMsg content.
    if (currentMsg) {
      currentMsg.content += `\n${trimmedLine}`;
    } else {
      // If conversation starts with unformatted text, treat line as first message
      currentMsg = {
        id: `msg_${String(messageCounter++).padStart(3, '0')}`,
        timestamp: 'Unknown Date',
        sender: 'User',
        content: trimmedLine,
      };
    }
  }

  if (currentMsg) {
    messages.push(currentMsg);
  }

  return messages;
}
