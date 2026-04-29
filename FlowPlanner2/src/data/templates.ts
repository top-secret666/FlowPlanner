export type Template = {
  id: string;
  label: string;
  emoji: string;
  titleTemplate: string;
  bodyTemplate: string;
};

export const TEMPLATES: Template[] = [
  {
    id: 'daily',
    label: 'Daily Report',
    emoji: '☕',
    titleTemplate: 'Daily Report – {{date}}',
    bodyTemplate: `---
type: daily-report
report_date: {{date}}
focus: java-theory
english_day: no
project_update: no
score: 0
tags: [daily, report]
---

## 📌 Фокус дня
- Java topic: 
- Requirement / lesson: 
- English today: yes / no
- Project result: 

## ☕ Java (каждый день)
- [ ] 1 тема изучена
- [ ] 1 мини-конспект написан
- [ ] 1 вопрос из backlog повторен

## 🇬🇧 English (только 3×/нед)
- [ ] Flashcards / vocab review
- [ ] 5-10 предложений
- [ ] 5-10 min listening

## 🗂️ Project update
- [ ] Small commit / README update
- Link: 
- Result: 

## 📝 Итог дня
- Что изучила: 
- Что повторила: 
- Что осталось непонятным: 
- Ошибка / вывод дня: 

score:: 0`,
  },
  {
    id: 'weekly',
    label: 'Weekly Review',
    emoji: '📊',
    titleTemplate: 'Weekly Review – {{date}}',
    bodyTemplate: `---
type: weekly-review
week: {{date}}
english_score: 0
java_score: 0
projects_score: 0
total_score: 0
tags: [weekly, review]
---

## ✅ Что получилось
- 

## 🚧 Что мешало
- 

## ☕ Java
- Темы: 
- Что повторить: 
- Лучшая тема недели: 

## 🇬🇧 English
- Дни повторения: 
- Что было легко: 
- Что надо закрепить: 

## 🗂️ Projects
- Что сделала: 
- Что осталось: 
- Ссылка на лучший результат: 

## 📝 План на следующую неделю
1. 
2. 
3. 

## 🏆 Scores
- English: 0
- Java: 0
- Projects: 0
- Total: 0`,
  },
  {
    id: 'lesson',
    label: 'Lesson',
    emoji: '📖',
    titleTemplate: 'Lesson – ',
    bodyTemplate: `---
type: lesson
created: {{date}}
status: draft
tags: [lesson]
---

# <Название урока>

## ✨ Краткое описание
<1-2 предложения о теме урока>

## 🧠 Теория
- 

## 💻 Практика
- 

## ❓ Вопросы для самопроверки
- 

## 🔗 Связанные материалы
- `,
  },
  {
    id: 'note',
    label: 'Note',
    emoji: '📝',
    titleTemplate: 'Note – ',
    bodyTemplate: `---
type: note
created: {{date}}
status: draft
tags: [note]
---

## ✨ Краткое описание
<1-2 предложения>

## 🧠 Ключевые идеи
- 

## 📝 Заметки
- 

## ❓ Вопросы / действия
- 

## 🔗 Связанные материалы
- `,
  },
  {
    id: 'checklist',
    label: 'Checklist',
    emoji: '✅',
    titleTemplate: 'Checklist – ',
    bodyTemplate: `---
type: checklist
created: {{date}}
status: draft
tags: [checklist]
---

## 📋 Основные пункты
- [ ] 
- [ ] 
- [ ] 

## 📝 Заметки
- `,
  },
  {
    id: 'project',
    label: 'Project',
    emoji: '🛠️',
    titleTemplate: 'Project – ',
    bodyTemplate: `---
type: project
created: {{date}}
status: draft
tags: [project]
---

## ✨ Описание проекта
<1-2 предложения о целях>

## 📋 Основные задачи
- [ ] Задача 1
- [ ] Задача 2
- [ ] Задача 3

## 🧠 Архитектура и технологии
- 

## ⚠️ Риски и решения
- 

## 🔗 Связанные материалы
- `,
  },
];