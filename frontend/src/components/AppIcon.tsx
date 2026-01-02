// Иконка приложения Task Manager - креативный дизайн с доской задач
export const AppIcon = ({ size = 32, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="appGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <linearGradient id="cardGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f0f0f0" />
      </linearGradient>
      <linearGradient id="cardGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e8f4f8" />
        <stop offset="100%" stopColor="#d0e8f0" />
      </linearGradient>
    </defs>
    
    {/* Фон - доска */}
    <rect width="64" height="64" rx="12" fill="url(#appGradient)" />
    
    {/* Колонки доски Kanban без надписей */}
    {/* Колонка 1 */}
    <rect x="8" y="12" width="14" height="40" rx="2" fill="rgba(255,255,255,0.2)" />
    
    {/* Карточка задачи 1 */}
    <rect x="10" y="20" width="10" height="8" rx="1" fill="url(#cardGradient1)" />
    <circle cx="12" cy="22" r="1.2" fill="#667eea" />
    <line x1="14" y1="22" x2="18" y2="22" stroke="#333" strokeWidth="0.6" />
    <line x1="12" y1="24" x2="18" y2="24" stroke="#666" strokeWidth="0.5" />
    
    {/* Карточка задачи 2 */}
    <rect x="10" y="30" width="10" height="8" rx="1" fill="url(#cardGradient1)" />
    <circle cx="12" cy="32" r="1.2" fill="#764ba2" />
    <line x1="14" y1="32" x2="18" y2="32" stroke="#333" strokeWidth="0.6" />
    
    {/* Колонка 2 */}
    <rect x="25" y="12" width="14" height="40" rx="2" fill="rgba(255,255,255,0.2)" />
    
    {/* Карточка задачи 3 */}
    <rect x="27" y="20" width="10" height="8" rx="1" fill="url(#cardGradient2)" />
    <circle cx="29" cy="22" r="1.2" fill="#667eea" />
    <line x1="31" y1="22" x2="35" y2="22" stroke="#333" strokeWidth="0.6" />
    <line x1="29" y1="24" x2="35" y2="24" stroke="#666" strokeWidth="0.5" />
    
    {/* Колонка 3 */}
    <rect x="42" y="12" width="14" height="40" rx="2" fill="rgba(255,255,255,0.2)" />
    
    {/* Карточка задачи 4 - с галочкой */}
    <rect x="44" y="20" width="10" height="8" rx="1" fill="url(#cardGradient1)" />
    <circle cx="46" cy="22" r="1.2" fill="#4caf50" />
    <path d="M45.3 22 L46.3 23 L48.3 21" stroke="#4caf50" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="50" y1="22" x2="52" y2="22" stroke="#333" strokeWidth="0.6" />
    <line x1="46" y1="24" x2="52" y2="24" stroke="#666" strokeWidth="0.5" />
    
    {/* Декоративные элементы - точки */}
    <circle cx="16" cy="54" r="1.5" fill="white" opacity="0.6" />
    <circle cx="32" cy="54" r="1.5" fill="white" opacity="0.6" />
    <circle cx="48" cy="54" r="1.5" fill="white" opacity="0.6" />
  </svg>
);

// Упрощенная версия для маленьких размеров
export const AppIconSmall = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="appGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    
    <rect width="32" height="32" rx="6" fill="url(#appGradientSmall)" />
    
    {/* Упрощенная доска без надписей */}
    <rect x="4" y="6" width="7" height="20" rx="1" fill="rgba(255,255,255,0.3)" />
    <rect x="5" y="9" width="5" height="4" rx="0.5" fill="white" opacity="0.9" />
    <rect x="5" y="15" width="5" height="4" rx="0.5" fill="white" opacity="0.7" />
    
    <rect x="13" y="6" width="7" height="20" rx="1" fill="rgba(255,255,255,0.3)" />
    <rect x="14" y="9" width="5" height="4" rx="0.5" fill="white" opacity="0.8" />
    
    <rect x="22" y="6" width="7" height="20" rx="1" fill="rgba(255,255,255,0.3)" />
    <rect x="23" y="9" width="5" height="4" rx="0.5" fill="white" opacity="0.9" />
    <circle cx="25" cy="11" r="1" fill="#4caf50" />
  </svg>
);

