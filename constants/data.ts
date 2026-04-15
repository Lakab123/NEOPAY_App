export type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  category: "shopping" | "food" | "transport" | "health" | "entertainment" | "transfer" | "income";
  icon: string;
};

export type Card = {
  id: string;
  type: "visa" | "mastercard";
  lastFour: string;
  holder: string;
  expiry: string;
  balance: number;
  color: string[];
};

export type Contact = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export const CARDS: Card[] = [
  {
    id: "1",
    type: "visa",
    lastFour: "4821",
    holder: "Alex Morgan",
    expiry: "09/27",
    balance: 12480.50,
    color: ["#0A0F1E", "#1A2A4A"],
  },
  {
    id: "2",
    type: "mastercard",
    lastFour: "7634",
    holder: "Alex Morgan",
    expiry: "03/26",
    balance: 3250.00,
    color: ["#1A1035", "#3D1A6E"],
  },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    title: "Apple Store",
    subtitle: "Electronics",
    amount: -299.99,
    date: "Today, 2:34 PM",
    category: "shopping",
    icon: "shopping-bag",
  },
  {
    id: "2",
    title: "Salary Deposit",
    subtitle: "Monthly Paycheck",
    amount: 4500.00,
    date: "Today, 9:00 AM",
    category: "income",
    icon: "trending-up",
  },
  {
    id: "3",
    title: "Starbucks",
    subtitle: "Coffee & Snacks",
    amount: -12.50,
    date: "Yesterday, 8:15 AM",
    category: "food",
    icon: "coffee",
  },
  {
    id: "4",
    title: "Uber",
    subtitle: "Transportation",
    amount: -18.75,
    date: "Yesterday, 6:30 PM",
    category: "transport",
    icon: "navigation",
  },
  {
    id: "5",
    title: "Netflix",
    subtitle: "Subscription",
    amount: -15.99,
    date: "Apr 6, 2026",
    category: "entertainment",
    icon: "play",
  },
  {
    id: "6",
    title: "Transfer to Sarah",
    subtitle: "Personal Transfer",
    amount: -200.00,
    date: "Apr 5, 2026",
    category: "transfer",
    icon: "send",
  },
  {
    id: "7",
    title: "Whole Foods",
    subtitle: "Groceries",
    amount: -87.30,
    date: "Apr 5, 2026",
    category: "food",
    icon: "shopping-cart",
  },
  {
    id: "8",
    title: "Gym Membership",
    subtitle: "Fitness",
    amount: -49.99,
    date: "Apr 4, 2026",
    category: "health",
    icon: "activity",
  },
  {
    id: "9",
    title: "Freelance Payment",
    subtitle: "Design Project",
    amount: 850.00,
    date: "Apr 3, 2026",
    category: "income",
    icon: "trending-up",
  },
  {
    id: "10",
    title: "Amazon",
    subtitle: "Online Shopping",
    amount: -124.99,
    date: "Apr 2, 2026",
    category: "shopping",
    icon: "package",
  },
];

export const CONTACTS: Contact[] = [
  { id: "1", name: "Sarah", initials: "S", color: "#FF6B9D" },
  { id: "2", name: "James", initials: "J", color: "#00D4AA" },
  { id: "3", name: "Emma", initials: "E", color: "#7B61FF" },
  { id: "4", name: "Mike", initials: "M", color: "#FF9F43" },
  { id: "5", name: "Lisa", initials: "L", color: "#54A0FF" },
];
