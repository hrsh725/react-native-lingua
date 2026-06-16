import { Lesson } from '../types/learning';

export const lessons: Lesson[] = [
  // ==========================================
  // SPANISH LESSONS (Unit 1: Basics & Greetings)
  // ==========================================
  {
    id: 'es-u1-l1',
    unitId: 'es-unit-1',
    title: 'Meeting & Greeting',
    description: 'Learn simple greetings, introductions, and essential words.',
    order: 1,
    xp: 10,
    type: 'vocabulary',
    goals: [
      {
        id: 'es-goal-1',
        description: 'Greet people at different times of the day',
        targetSkill: 'vocabulary',
      },
      {
        id: 'es-goal-2',
        description: 'Politely say hello and goodbye',
        targetSkill: 'vocabulary',
      },
    ],
    vocabList: [
      {
        id: 'es-v-1',
        word: 'Hola',
        translation: 'Hello',
        pronunciation: 'OH-lah',
        partOfSpeech: 'interjection',
        exampleSentence: 'Hola, ¿cómo estás?',
        exampleTranslation: 'Hello, how are you?',
      },
      {
        id: 'es-v-2',
        word: 'Adiós',
        translation: 'Goodbye',
        pronunciation: 'ah-DYOHS',
        partOfSpeech: 'interjection',
        exampleSentence: 'Adiós, nos vemos mañana.',
        exampleTranslation: 'Goodbye, see you tomorrow.',
      },
      {
        id: 'es-v-3',
        word: 'Buenos días',
        translation: 'Good morning',
        pronunciation: 'BWEH-nos DEE-ahs',
        partOfSpeech: 'phrase',
        exampleSentence: 'Buenos días, mamá.',
        exampleTranslation: 'Good morning, mom.',
      },
    ],
    phrases: [
      {
        id: 'es-p-1',
        text: '¿Cómo estás?',
        translation: 'How are you?',
        pronunciation: 'KO-mo ehs-TAHS',
        context: 'A friendly greeting to ask about someone\'s well-being.',
      },
    ],
    aiPrompt: {
      teacherName: 'Sofía',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      systemPrompt: "You're Sofía, a super energetic and warm Spanish teacher. You're so excited to meet a new student! Keep your energy high, use lots of positive reinforcement, and focus strictly on basic greetings like 'Hola' and 'Adiós'.",
      initialMessage: "¡Hola! I'm Sofía, and I'm thrilled to help you start your Spanish journey! Ready to learn some friendly greetings? ¿Estás listo?",
      scenarioDescription: 'Practice basic greetings and saying hello/goodbye with Sofía.',
    },
    activities: [
      {
        id: 'es-act-1',
        type: 'multiple_choice',
        prompt: 'Select the correct translation for "Hola"',
        options: ['Goodbye', 'Please', 'Hello', 'Thank you'],
        correctAnswer: 'Hello',
        tip: 'The "H" in Spanish is silent! It is pronounced like "OH-lah".',
      },
      {
        id: 'es-act-2',
        type: 'fill_blank',
        prompt: 'Fill in the blank to say "Good morning"',
        questionText: 'Buenos ______',
        options: ['noches', 'tardes', 'días', 'gusto'],
        correctAnswer: 'días',
      },
    ],
  },
  {
    id: 'es-u1-l2',
    unitId: 'es-unit-1',
    title: 'Order Coffee at a Cafe',
    description: 'Practice ordering items at a local cafe using AI-driven chat.',
    order: 2,
    xp: 15,
    type: 'chat',
    goals: [
      {
        id: 'es-goal-3',
        description: 'Order drinks and pastries in Spanish',
        targetSkill: 'speaking',
      },
    ],
    aiPrompt: {
      teacherName: 'Sofía',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      voiceId: 'es-ES-Neural2-F',
      systemPrompt: "You're Sofía, a super warm and energetic barista in Madrid. You love meeting new students! Help them order a drink in Spanish with lots of gentle encouragement and natural conversational flow. Stick to cafe vocabulary.",
      initialMessage: '¡Hola! Bienvenidos! I am so happy to see you today! What can I get for you? ¿Qué te pongo hoy?',
      scenarioDescription: 'Practice ordering a coffee from the friendly Sofía.',
    },
    activities: [
      {
        id: 'es-act-6',
        type: 'multiple_choice',
        prompt: 'Which phrase is the most natural way to ask for the bill?',
        options: ['Hola señor', 'La cuenta, por favor', '¿Dónde está el café?', 'Mucho gusto'],
        correctAnswer: 'La cuenta, por favor',
      },
    ],
  },
  {
    id: 'es-u1-l3',
    unitId: 'es-unit-1',
    title: 'At the Café',
    description: 'Master coffee shop conversations and vocabulary.',
    order: 3,
    xp: 20,
    type: 'video',
    goals: [
      {
        id: 'es-goal-5',
        description: 'Master cafe ordering and interactions',
        targetSkill: 'speaking',
      },
    ],
    aiPrompt: {
      teacherName: 'Sofía',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      systemPrompt: "You're Sofía, an energetic barista in a sun-drenched Madrid plaza. You're warm, helpful, and love it when students try to order in Spanish. Keep your sentences short and encouraging!",
      initialMessage: "¡Buenos días! Welcome to my cafe. I'm Sofía! Ready to practice ordering your favorite drink? ¿Qué quieres tomar?",
      scenarioDescription: 'Master the art of cafe conversation with Sofía in Madrid.',
    },
    activities: [
      {
        id: 'es-act-7',
        type: 'multiple_choice',
        prompt: 'How do you say "Un café, por favor" in English?',
        options: ['A coffee, please', 'A tea, please', 'Thank you', 'Goodbye'],
        correctAnswer: 'A coffee, please',
      },
    ],
  },
  {
    id: 'es-u1-l4',
    unitId: 'es-unit-1',
    title: 'Travel & Directions',
    description: 'Learn how to ask for and understand simple directions.',
    order: 4,
    xp: 15,
    type: 'audio',
    goals: [
      {
        id: 'es-goal-14',
        description: 'Understand left, right, and straight directions',
        targetSkill: 'listening',
      },
    ],
    aiPrompt: {
      teacherName: 'Mateo',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      systemPrompt: "You're Mateo, a friendly and high-energy local guide in Barcelona. You're passionate about helping students navigate your city! Focus strictly on 'izquierda', 'derecha', and 'recto'.",
      initialMessage: "¡Hola! I'm Mateo. I'm so excited to help you find your way around! Ready to learn some simple directions? ¿Estás listo?",
      scenarioDescription: 'Learn to navigate the streets of Barcelona with Mateo.',
    },
    activities: [
      {
        id: 'es-act-14',
        type: 'multiple_choice',
        prompt: 'What is the Spanish word for "Left"?',
        options: ['Derecha', 'Izquierda', 'Derecho', 'Girar'],
        correctAnswer: 'Izquierda',
      },
    ],
  },

  // ==========================================
  // FRENCH LESSONS (Unit 1: Introduction & Essentials)
  // ==========================================
  {
    id: 'fr-u1-l1',
    unitId: 'fr-unit-1',
    title: 'First French Words',
    description: 'Learn foundational greetings and expressions in French.',
    order: 1,
    xp: 10,
    type: 'vocabulary',
    goals: [
      {
        id: 'fr-goal-1',
        description: 'Understand the basic greetings in French',
        targetSkill: 'vocabulary',
      },
    ],
    vocabList: [
      {
        id: 'fr-v-1',
        word: 'Bonjour',
        translation: 'Hello / Good morning',
        pronunciation: 'bohn-ZHOOR',
        partOfSpeech: 'interjection',
        exampleSentence: 'Bonjour, comment allez-vous?',
        exampleTranslation: 'Hello, how are you?',
      },
    ],
    aiPrompt: {
      teacherName: 'Chloé',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      systemPrompt: "You're Chloé, a warm and very energetic French teacher. You're thrilled to welcome a new student to the world of French! Keep it bright, encouraging, and focused on 'Bonjour' and 'Salut'.",
      initialMessage: "Bonjour! I'm Chloé, and I'm so happy to be your teacher today! Ready to learn your very first French words? On y va ?",
      scenarioDescription: 'Begin your French journey with foundational greetings from Chloé.',
    },
    activities: [
      {
        id: 'fr-act-1',
        type: 'multiple_choice',
        prompt: 'Select the correct translation for "Bonjour"',
        options: ['Goodbye', 'Thank you', 'Please', 'Hello'],
        correctAnswer: 'Hello',
      },
    ],
  },
  {
    id: 'fr-u1-l3',
    unitId: 'fr-unit-1',
    title: 'At the Café',
    description: 'Practice ordering croissants and café au lait in Paris.',
    order: 3,
    xp: 20,
    type: 'chat',
    goals: [
      {
        id: 'fr-goal-3',
        description: 'Order food and drinks at a café',
        targetSkill: 'chat',
      },
    ],
    aiPrompt: {
      teacherName: 'Chloé',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      systemPrompt: "You're Chloé, a warm and welcoming Parisian barista. You're energetic and love teaching others how to order in your beautiful city! Use contractions and lots of praise. Focus on cafe items.",
      initialMessage: "Bonjour! Bienvenue. I'm Chloé, and I'm so excited to help you practice! What can I serve you today? Qu'est-ce que je vous sers ?",
      scenarioDescription: 'Order coffee and a pastry at a beautiful Parisian café with Chloé.',
    },
    activities: [
      {
        id: 'fr-act-3',
        type: 'multiple_choice',
        prompt: 'What does "S\'il vous plaît" mean?',
        options: ['Thank you', 'Please', 'Excuse me', 'Hello'],
        correctAnswer: 'Please',
      },
    ],
  },

  // ==========================================
  // JAPANESE LESSONS (Unit 1: Hiragana & Greetings)
  // ==========================================
  {
    id: 'ja-u1-l1',
    unitId: 'ja-unit-1',
    title: 'Hiragana Greetings',
    description: 'Learn the primary Japanese greetings written in Hiragana.',
    order: 1,
    xp: 10,
    type: 'vocabulary',
    goals: [
      {
        id: 'ja-goal-1',
        description: 'Read and understand basic greetings',
        targetSkill: 'vocabulary',
      },
    ],
    aiPrompt: {
      teacherName: 'Kenji',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      systemPrompt: "You're Kenji, a super energetic and helpful Japanese teacher. You love meeting new students! Be patient, use a warm tone, and focus strictly on greetings like 'Konnichiwa' and 'Arigatou'.",
      initialMessage: "Konnichiwa! I'm Kenji, and I'm so excited to help you learn Japanese! Ready to start with some friendly greetings? Hajimemashou!",
      scenarioDescription: 'Learn essential Japanese greetings with the enthusiastic Kenji.',
    },
    activities: [
      {
        id: 'ja-act-1',
        type: 'multiple_choice',
        prompt: 'Select the translation for "こんにちは (Konnichiwa)"',
        options: ['Goodbye', 'Hello', 'Thank you', 'Excuse me'],
        correctAnswer: 'Hello',
      },
    ],
  },
  {
    id: 'ja-u1-l3',
    unitId: 'ja-unit-1',
    title: 'At the Café',
    description: 'Practice ordering green tea and delicious desserts in Kyoto.',
    order: 3,
    xp: 20,
    type: 'chat',
    goals: [
      {
        id: 'ja-goal-3',
        description: 'Order food politely',
        targetSkill: 'chat',
      },
    ],
    aiPrompt: {
      teacherName: 'Kenji',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      systemPrompt: "You're Kenji, an energetic and incredibly patient server in Kyoto. You love it when students try to speak Japanese! Guide them through ordering tea with a warm, high-energy vibe. Stick to tea house vocabulary.",
      initialMessage: 'Irasshaimase! いらっしゃいませ！ Welcome to our tea house! I am so happy you are here. Have you decided on your order? ご注文はお決まりですか？',
      scenarioDescription: 'Order a cup of green tea (ocha) in Japanese with Kenji.',
    },
    activities: [
      {
        id: 'ja-act-3',
        type: 'multiple_choice',
        prompt: 'How do you say "Please give me water"?',
        options: ['お水をください (Omizu o kudasai)', 'こんにちは (Konnichiwa)', 'ありがとう (Arigatou)', 'さようなら (Sayounara)'],
        correctAnswer: 'お水をください (Omizu o kudasai)',
      },
    ],
  },

  // ==========================================
  // KOREAN LESSONS (Unit 1: Hangul & Greetings)
  // ==========================================
  {
    id: 'ko-u1-l1',
    unitId: 'ko-unit-1',
    title: 'Reading Hangul',
    description: 'Learn simple Korean greetings written in Hangul.',
    order: 1,
    xp: 10,
    type: 'vocabulary',
    goals: [
      {
        id: 'ko-goal-1',
        description: 'Politely say hello and thank you in Korean',
        targetSkill: 'vocabulary',
      },
    ],
    aiPrompt: {
      teacherName: 'Minjun',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      systemPrompt: "You're Minjun, a high-energy and very encouraging Korean teacher. You're so excited to help a new student! Be patient, warm, and highly supportive. Focus on 'Annyeonghaseyo' and 'Gamsahabnida'.",
      initialMessage: "Annyeonghaseyo! I'm Minjun, and I'm thrilled to be your teacher today! Ready to learn your first Korean greetings? Shijak-haebolkayo?",
      scenarioDescription: 'Learn foundational Korean greetings with the energetic Minjun.',
    },
    activities: [
      {
        id: 'ko-act-1',
        type: 'multiple_choice',
        prompt: 'Select the correct translation for "안녕하세요 (Annyeonghaseyo)"',
        options: ['Goodbye', 'Thank you', 'Hello', 'Please'],
        correctAnswer: 'Hello',
      },
    ],
  },
  {
    id: 'ko-u1-l3',
    unitId: 'ko-unit-1',
    title: 'At the Café',
    description: 'Practice ordering standard treats like iced americano in Seoul.',
    order: 3,
    xp: 20,
    type: 'chat',
    goals: [
      {
        id: 'ko-goal-3',
        description: 'Order drinks at a coffee shop',
        targetSkill: 'chat',
      },
    ],
    aiPrompt: {
      teacherName: 'Minjun',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      systemPrompt: "You're Minjun, a high-energy and very encouraging barista in a trendy Seoul cafe. You make learning Korean feel fun and easy! Be patient, warm, and highly supportive. Stick to cafe items.",
      initialMessage: "Eoseo oseyo! 어서 오세요! Welcome to our cafe! I'm Minjun, and I'm so excited to help you order! What would you like? 어떤 걸로 주문하시겠어요?",
      scenarioDescription: 'Order an iced americano (아아) in Korean with the friendly Minjun.',
    },
    activities: [
      {
        id: 'ko-act-3',
        type: 'multiple_choice',
        prompt: 'How do you say "Iced Americano, please"?',
        options: ['아이스 아메리카노 주세요 (Aiseu amerikanoh juseyo)', '물 주세요 (Mul juseyo)', '안녕하세요 (Annyeonghaseyo)', '감사합니다 (Gamsahabnida)'],
        correctAnswer: '아이스 아메리카노 주세요 (Aiseu amerikanoh juseyo)',
      },
    ],
  },

  // ==========================================
  // GERMAN LESSONS (Unit 1: German Basics)
  // ==========================================
  {
    id: 'de-u1-l1',
    unitId: 'de-unit-1',
    title: 'German Greetings',
    description: 'Learn the most common German greetings.',
    order: 1,
    xp: 10,
    type: 'vocabulary',
    goals: [
      {
        id: 'de-goal-1',
        description: 'Understand everyday German greetings',
        targetSkill: 'vocabulary',
      },
    ],
    aiPrompt: {
      teacherName: 'Emma',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      systemPrompt: "You're Emma, a warm and very energetic German teacher. You're so happy to see a new student starting German! Keep it bright, encouraging, and focused strictly on 'Hallo' and 'Guten Tag'.",
      initialMessage: "Hallo! I'm Emma, and I'm so excited to help you start your German journey! Ready to learn some friendly greetings? Los geht's!",
      scenarioDescription: 'Practice basic German greetings with the enthusiastic Emma.',
    },
    activities: [
      {
        id: 'de-act-1',
        type: 'multiple_choice',
        prompt: 'Select the correct translation for "Hallo"',
        options: ['Goodbye', 'Please', 'Hello', 'Yes'],
        correctAnswer: 'Hello',
      },
    ],
  },

  // ==========================================
  // CHINESE LESSONS (Unit 1: Pinyin & Tones)
  // ==========================================
  {
    id: 'zh-u1-l1',
    unitId: 'zh-unit-1',
    title: 'First Tones & Hello',
    description: 'Learn basic Chinese greetings and their tones.',
    order: 1,
    xp: 10,
    type: 'vocabulary',
    goals: [
      {
        id: 'zh-goal-1',
        description: 'Understand first and third tones in greetings',
        targetSkill: 'vocabulary',
      },
    ],
    aiPrompt: {
      teacherName: 'Mei',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      systemPrompt: "You're Mei, a warm, energetic, and patient Chinese teacher. You love sharing your culture and teaching Chinese! Be very encouraging and focused strictly on 'Nǐ hǎo'.",
      initialMessage: "Nǐ hǎo! I'm Mei, and I'm so happy to help you start learning Chinese! Ready to practice your very first greeting? Wǒmen kāishǐ ba!",
      scenarioDescription: 'Begin your Chinese journey with essential greetings from the friendly Mei.',
    },
    activities: [
      {
        id: 'zh-act-1',
        type: 'multiple_choice',
        prompt: 'Select the translation for "你好 (Nǐ hǎo)"',
        options: ['Thank you', 'Hello', 'Goodbye', 'Excuse me'],
        correctAnswer: 'Hello',
      },
    ],
  },
];
