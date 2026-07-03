import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.js';
import { useSeo } from '../hooks/useSeo.js';

export function PrivacyPage() {
  useSeo({
    title: 'Privacy Policy',
    description:
      'How WishesDream handles your data — what we collect for gift registries, guest privacy, and your rights.',
    path: '/privacy',
  });

  return (
    <Layout>
      <article className="content-page">
        <p className="eyebrow">Privacy</p>
        <h1>Your data, handled with care</h1>
        <p className="content-lead">
          WishesDream is built for private gifting. We collect only what&apos;s needed to run your
          registry and never sell guest information.
        </p>

        <section className="content-section">
          <h2>What we collect</h2>
          <ul className="content-list">
            <li>
              <strong>Hosts:</strong> name, email, and password (hashed) when you create an account.
            </li>
            <li>
              <strong>Guests:</strong> first name when claiming a gift, plus an anonymous browser
              token so you can unclaim your own selection.
            </li>
            <li>
              <strong>Lists:</strong> gift titles, links, images, prices, and claim status.
            </li>
          </ul>
        </section>

        <section className="content-section">
          <h2>What guests can see</h2>
          <p>
            On the public list, guests see whether each item is available or already selected. They
            do not see who claimed an item or when it was claimed. Only the list host sees claimer
            names and timestamps.
          </p>
        </section>

        <section className="content-section">
          <h2>Product links</h2>
          <p>
            When you paste a product URL, our server fetches public product metadata (title, image,
            price) to populate your list. We do not store your shopping credentials or purchase
            history.
          </p>
        </section>

        <section className="content-section">
          <h2>Data retention</h2>
          <p>
            Your lists and claims remain until you delete them or close your account. Guest tokens
            are stored in the browser&apos;s local storage on the guest&apos;s device.
          </p>
        </section>

        <section className="content-section">
          <h2>Questions</h2>
          <p>
            For privacy questions about your registry, contact the host who shared the list with
            you. Hosts manage their own gift lists and exported reports. See also our{' '}
            <Link to="/cookies">Cookie Policy</Link>.
          </p>
        </section>
      </article>
    </Layout>
  );
}
