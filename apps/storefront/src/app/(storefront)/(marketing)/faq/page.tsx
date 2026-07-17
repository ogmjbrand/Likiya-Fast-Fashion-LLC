import type { Metadata } from "next";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@likiya/ui";
import { buildMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description: "Answers to common questions about ordering, shipping, returns, and sizing at Likiya.",
  path: "/faq",
});

const FAQS = [
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping arrives in 5–7 business days within the US, and 7–14 business days internationally. Orders over $150 ship free. Once your order leaves our warehouse you'll get a shipping confirmation email with tracking.",
  },
  {
    question: "What's your return policy?",
    answer:
      "You can return unworn items in original condition within 30 days of delivery for a full refund. Start a return from your account's Returns page and we'll email you a prepaid shipping label.",
  },
  {
    question: "How do I know what size to order?",
    answer:
      "Every product page lists available sizes with a fit note where relevant. If you're between sizes, our customer care team is happy to help — reach out via the Contact page with the specific product and we'll advise.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. Duties and import taxes, where applicable, are calculated at checkout so there are no surprise charges on delivery.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards via Stripe, plus Paystack and Flutterwave for customers in Africa — whichever is available at your checkout.",
  },
  {
    question: "Can I change or cancel my order after placing it?",
    answer:
      "We start preparing orders quickly, so we can't guarantee changes once an order is placed. Contact us as soon as possible and we'll do what we can before it ships.",
  },
  {
    question: "How do loyalty points work?",
    answer:
      "You earn points on every completed order automatically, visible in your account overview. We're working on ways to redeem them for future purchases — details are coming soon.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-luxury max-w-3xl py-16">
      <Reveal>
        <p className="eyebrow-pink">Support</p>
        <h1 className="text-display-2 mt-2 font-display font-black uppercase">Frequently Asked Questions</h1>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <Accordion type="single" collapsible>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="py-5 text-base font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </div>
  );
}
