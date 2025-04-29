export interface bookResultType {
  bookTitle: string;
  bookingId: string;
  performanceId: string;
  performanceDate: string;
  performanceTime: string;
  performanceLocation: string;
  selectedSeats: string[];
  purchaserInfo: {
    name: string;
    phone: string;
    email: string;
    userId: string;
  };
  totalPrice: number;
  paymentStatus: string;
  sellerId: string;
  purchasingInfo: {
    method: "bankTransfer" | "creditCard" | "mobilePayment";
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    amount: number;
  };
  dueDate: number;
}

export interface bookWithPerformance extends bookResultType {
  id?: string;
  performanceDetails: {
    address: string;
    category: string;
    detailAddress: string;
    poster: string;
    sellerTeam: string;
    title: string;
  };
}
