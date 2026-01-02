// Иконка Yandex - креативный дизайн с буквой "Я"
export const YandexIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Основной круг с градиентом */}
    <defs>
      <linearGradient id="yandexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FC3F1D" />
        <stop offset="100%" stopColor="#E6392A" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="11" fill="url(#yandexGradient)" />
    
    {/* Стилизованная буква "Я" - более современный дизайн */}
    <path
      d="M7.5 6.5V17.5H6V6.5H7.5Z"
      fill="white"
    />
    <path
      d="M9.5 6.5V8.5H12C12.8284 8.5 13.5 9.17157 13.5 10C13.5 10.8284 12.8284 11.5 12 11.5H9.5V17.5H7.5V6.5H9.5Z"
      fill="white"
    />
    <path
      d="M12 10H9.5V11.5H12C12.2761 11.5 12.5 11.2761 12.5 11C12.5 10.7239 12.2761 10.5 12 10.5V10Z"
      fill="url(#yandexGradient)"
    />
    
    {/* Декоративные элементы - стилизованные точки как часть бренда */}
    <circle cx="16.5" cy="8.5" r="1.2" fill="white" opacity="0.9" />
    <circle cx="17.8" cy="10.2" r="0.8" fill="white" opacity="0.7" />
    
    {/* Дополнительный декоративный элемент - маленькая точка */}
    <circle cx="18.5" cy="12.5" r="0.5" fill="white" opacity="0.5" />
  </svg>
);

// Иконка Google
export const GoogleIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

