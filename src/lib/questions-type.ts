export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  feedback: string;
}
