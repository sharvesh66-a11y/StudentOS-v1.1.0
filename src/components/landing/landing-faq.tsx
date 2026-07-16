'use client';

/**
 * Landing FAQ Section
 *
 * Accordion-style FAQ with common student questions.
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { APP_NAME, CORE_AI_NAME } from '@/lib/constants';

const FAQS = [
  {
    q: `Is ${APP_NAME} really free?`,
    a: `Yes! The Free plan is free forever — no credit card required. You get limited daily AI messages, up to 50 notes, and 5 quizzes per month. Upgrade to Pro only when you need more.`,
  },
  {
    q: `How does ${CORE_AI_NAME} work?`,
    a: `${CORE_AI_NAME} is StudentOS's built-in AI teacher. It uses state-of-the-art language models to generate notes, quizzes, and personalized study plans. It remembers your weak spots and adapts to your learning style over time.`,
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. StudentOS is a web app that works in any modern browser — desktop or mobile. Just sign up and start studying. Native mobile apps are on our roadmap.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Absolutely. Your data is stored in Firebase with per-user security rules — no other user can access your notes, quizzes, or profile. We never sell your data. You can delete your account and all associated data at any time.',
  },
  {
    q: 'Can I use my own AI provider?',
    a: `Yes! StudentOS supports 8 AI providers including OpenAI, Claude, Gemini, DeepSeek, GLM, and local models via Ollama. Visit the Providers page after signing up to connect your own API keys.`,
  },
  {
    q: 'What subjects does StudentOS support?',
    a: "All of them. The AI adapts to whatever subject you're studying — from math and science to languages and history. You can customize your subjects during onboarding or in Settings.",
  },
  {
    q: 'Can I study with friends?',
    a: 'Yes! Study Groups let you chat in real-time, share files, and run study sessions together. The Community feed lets you post, react, and follow other students.',
  },
  {
    q: 'What if I need help?',
    a: 'Free plan users get community support. Pro and Premium users get priority email support. Check the Help Center (coming soon) or reach out via the Contact page.',
  },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">FAQ</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Everything you need to know about {APP_NAME}.
          </p>
        </div>

        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-border/50 bg-card/30 [&[data-state=open]]:bg-card/50 rounded-lg border px-4 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
