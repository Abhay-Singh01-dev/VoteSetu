import { useMemo, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useT } from "@/i18n/LanguageProvider";
import { getLocalizedFaqs } from "@/i18n/content";
import { useUser } from "@/context/UserContext";

const FAQ = () => {
  const { t, lang } = useT();
  const { setUser } = useUser();
  const faqs = useMemo(() => getLocalizedFaqs(lang), [lang]);

  useEffect(() => {
    setUser({ currentScreen: "faq" });
  }, [setUser]);
  return (
    <section id="faq" className="container py-20" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
        <div className="tricolor-bar mx-auto w-24 mb-5" aria-hidden />
        <h2 id="faq-heading" className="font-display text-3xl font-bold md:text-4xl">{t("faq.heading")}</h2>
        <p className="mt-3 text-muted-foreground">{t("faq.subtitle")}</p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-card p-2 shadow-soft">
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-0">
              <AccordionTrigger className="px-4 text-left font-display font-semibold hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
