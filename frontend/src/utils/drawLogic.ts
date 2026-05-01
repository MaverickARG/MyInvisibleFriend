export interface Participant {
  id: string;
  name: string;
  exclusions?: string[]; // IDs of participants they cannot give a gift to
}

export interface DrawResult {
  giver: Participant;
  receiver: Participant;
}

export const performDraw = (participants: Participant[]): DrawResult[] => {
  if (participants.length < 3) {
    throw new Error('Se necesitan al menos 3 participantes.');
  }

  let shuffled = [...participants];
  let valid = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 2000; // Prevent infinite loops if exclusions make draw impossible

  // Simple shuffle algorithm with validation
  while (!valid && attempts < MAX_ATTEMPTS) {
    attempts++;
    shuffled.sort(() => Math.random() - 0.5);
    valid = true;
    for (let i = 0; i < participants.length; i++) {
      const giver = participants[i];
      const receiver = shuffled[i];

      // Rule 1: Cannot give to themselves
      if (giver.id === receiver.id) {
        valid = false;
        break;
      }

      // Rule 2: Cannot give to excluded participants
      if (giver.exclusions && giver.exclusions.includes(receiver.id)) {
        valid = false;
        break;
      }
    }
  }

  if (!valid) {
    throw new Error('No se pudo encontrar una combinación válida. Revisa que no haya demasiadas excepciones que impidan el sorteo.');
  }

  const results: DrawResult[] = [];
  for (let i = 0; i < participants.length; i++) {
    results.push({
      giver: participants[i],
      receiver: shuffled[i],
    });
  }

  return results;
};
