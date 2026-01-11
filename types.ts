
export enum Emotion {
  Sad = 'Sad',
  Joyful = 'Joyful',
  Confused = 'Confused',
  Bored = 'Bored',
  Stressed = 'Stressed',
  Angry = 'Angry',
}

export const EmotionColors: Record<Emotion, string> = {
  [Emotion.Sad]: '#7B9FE9',      // Periwinkle Blue
  [Emotion.Joyful]: '#FFD93D',   // Sunny Yellow
  [Emotion.Confused]: '#B8A9C9', // Soft Purple
  [Emotion.Bored]: '#95E1D3',    // Minty Green
  [Emotion.Stressed]: '#FF8F5C', // Coral/Salmon
  [Emotion.Angry]: '#FF6B6B',    // Soft Red
};

export const EmotionTextColors: Record<Emotion, string> = {
    [Emotion.Sad]: '#1E3A8A',
    [Emotion.Joyful]: '#78350F',
    [Emotion.Confused]: '#4C1D95',
    [Emotion.Bored]: '#064E3B',
    [Emotion.Stressed]: '#7C2D12',
    [Emotion.Angry]: '#7F1D1D',
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
