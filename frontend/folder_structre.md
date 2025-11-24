project/
│
├── public/                     # static assets (images, fonts…)
│
├── src/
│   ├── app/                    # App Router (bắt buộc)
│   │   ├── layout.tsx          # layout gốc
│   │   ├── page.tsx            # trang home
│   │   ├── api/                # route handlers (serverless API)
│   │   │   └── auth/
│   │   │       └── route.ts
│   │   ├── (routes)/           # group routes (không ảnh hưởng URL)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── ...
│   │
│   ├── components/             # components tái sử dụng (UI)
│   │   └── ui/                 # shadcn-ui, shared ui
│   │   └── navigation/
│   │
│   ├── features/               # cấu trúc theo feature (BEST PRACTICE)
│   │   └── auth/
│   │       ├── components/
│   │       ├── services/
│   │       ├── hooks/
│   │       └── types.ts
│   │
│   ├── lib/                    # server utilities, config, helpers chạy server
│   │   ├── prisma/
│   │   ├── auth.ts
│   │   └── validate.ts
│   │
│   ├── services/               # API client side (fetch)
│   │   └── user.service.ts
│   │
│   ├── hooks/                  # client side hooks
│   │   └── useUser.ts
│   │
│   ├── store/                  # Zustand/Recoil store
│   │   └── user.store.ts
│   │
│   ├── utils/                  # helper functions
│   │   └── format.ts
│   │
│   ├── types/                  # global types/interfaces
│   │   └── next-auth.d.ts
│   │
│   ├── styles/                 # globals.css, tailwind, theme
│   │   └── globals.css
│   │
│   └── config/                 # env keys, constants
│       └── site.ts
│
├── .env
├── package.json
└── next.config.js
