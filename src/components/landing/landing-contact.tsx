'use client';

/**
 * Landing Contact Section
 *
 * Simple contact section with links to email, GitHub, and social. No form
 * backend yet — links to signup for direct contact.
 */

import Link from 'next/link';
import { Mail, Github, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/constants';

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@studentos.app',
    href: 'mailto:hello@studentos.app',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/studentos',
    href: 'https://github.com',
  },
  {
    icon: Twitter,
    label: 'Twitter',
    value: '@studentos',
    href: 'https://twitter.com',
  },
  {
    icon: MessageCircle,
    label: 'Discord',
    value: 'Join our community',
    href: 'https://discord.com',
  },
];

export function LandingContact() {
  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            Contact
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Get in touch</h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Questions, feedback, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <a
                key={method.label}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group border-border/50 bg-card/40 hover:border-border hover:bg-card/60 rounded-2xl border p-6 text-center backdrop-blur-sm transition-all"
              >
                <div className="bg-primary/10 ring-primary/20 mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110">
                  <Icon className="text-primary h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{method.label}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{method.value}</p>
              </a>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link href="/signup">Try {APP_NAME} Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
