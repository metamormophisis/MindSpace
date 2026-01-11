
export enum Emotion {
  Sad = 'Sad',
  Joyful = 'Joyful',
  Confused = 'Confused',
  Bored = 'Bored',
  Stressed = 'Stressed',
  Angry = 'Angry',
}

export const EmotionColors: Record<Emotion, string> = {
  [Emotion.Sad]: '#6BC5F8',    // Sky Blue
  [Emotion.Joyful]: '#FF7EB6',     // Hot Pink
  [Emotion.Confused]: '#2563EB',   // Royal Blue
  [Emotion.Bored]: '#10B981',      // Green
  [Emotion.Stressed]: '#22C55E',   // Bright Green
  [Emotion.Angry]: '#FB5607',      // Orange Red
};

export const EmotionTextColors: Record<Emotion, string> = {
    [Emotion.Sad]: '#0C4A6E',
    [Emotion.Joyful]: '#831843',
    [Emotion.Confused]: '#1E3A8A',
    [Emotion.Bored]: '#064E3B',
    [Emotion.Stressed]: '#14532D',
    [Emotion.Angry]: '#7C2D12',
};

export interface UserState {
  isLoggedIn: boolean;
  name: string;
  email: string;
  uid: string;
  streak: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  emotion: Emotion;
  intensity: number;
  answers: Record<string, string>;
  text: string;
  aiResponse?: string;
}
