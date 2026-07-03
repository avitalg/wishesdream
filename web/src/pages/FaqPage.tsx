import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.js';
import { faqItems } from '../content/faqItems.js';
import { useSeo } from '../hooks/useSeo.js';
import { buildFaqPageJsonLd } from '../lib/seoJsonLd.js';

export function FaqPage() {
  useSeo({
    title: 'FAQ',
    description:
      'Answers about WishesDream gift registries — guest privacy, product imports, unclaiming gifts, and sharing your list.',
    path: '/faq',
    jsonLd: buildFaqPageJsonLd(),
  });
  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">FAQ</p>
        <h1>Frequently asked questions</h1>
        <p className="content-lead">
          Quick answers about creating lists, sharing with guests, and keeping claims private.
        </p>

        <div className="faq-list">
          {faqItems.map((item) => (
            <section key={item.question} className="faq-item">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </section>
          ))}
        </div>

        <div className="content-actions">
          <Link to="/how-it-works" className="btn-outline">
            How It Works
          </Link>
          <Link to="/register" className="btn-primary">
            Create Your List
          </Link>
        </div>
      </article>
    </Layout>
  );
}
