export interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  image: any;
  color: string;
  questions: FAQItem[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}