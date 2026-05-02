export const APP_CONFIG = {
  appName: 'BetterStep by Dr. Hewage',
  doctorName: 'Dr. Hewage',
  clinicName: 'Pause Sleep & Weight Management',
  bookingUrl: 'https://www.pausesleep.com.au',
  bookingButtonText: 'Book GP Review',
  defaultReviewIntervalWeeks: 4,
  prescriptionReminderDays: [10, 7, 3, 0],
  emergencyNumber: '000',
  supportEmail: 'info@pausesleep.com.au',
  disclaimer: 'BetterStep by Dr. Hewage supports monitoring and preparation for GP review. It does not replace medical advice, diagnosis, prescribing decisions, or emergency care. If you are seriously unwell, call 000 or attend your nearest emergency department.',
  medicationDisclaimer: 'Medication changes must be discussed with your GP. Do not increase, stop, or restart medication without medical advice.',
} as const;

export const RED_FLAG_SIDE_EFFECTS: string[] = [
  'severe abdominal pain',
  'abdominal pain',
  'vomiting',
  'mood changes',
];
